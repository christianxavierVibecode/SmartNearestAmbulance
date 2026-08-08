const ambulanceModel = require('../models/ambulanceModel');
const tripModel = require('../models/tripModel');
const sseManager = require('../utils/sseManager');
const { calculateDistance } = require('../utils/haversine');

const ALLOWED_STATUSES = ['available', 'on_mission', 'maintenance', 'offline'];
const STALE_THRESHOLD_MINUTES = 30; // 30 minutes threshold for staleness

/**
 * Handle GET /api/ambulances
 */
async function listAmbulances(req, res) {
  try {
    const ambulances = await ambulanceModel.getAll();
    return res.status(200).json({
      status: 'success',
      data: ambulances
    });
  } catch (error) {
    console.error('Error in ambulanceController.listAmbulances:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server'
    });
  }
}

/**
 * Handle GET /api/ambulance/me (Fetch assigned ambulance for logged-in driver)
 */
async function getMyAmbulance(req, res) {
  try {
    const driverId = req.user.id;
    const ambulance = await ambulanceModel.findByDriverId(driverId);
    if (!ambulance) {
      return res.status(404).json({
        message: 'Tidak ada ambulans yang terhubung dengan akun driver ini'
      });
    }
    return res.status(200).json({
      status: 'success',
      data: ambulance
    });
  } catch (error) {
    console.error('Error in ambulanceController.getMyAmbulance:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server'
    });
  }
}

/**
 * Handle GET /api/ambulance/nearest?lat=&lng=
 */
async function findNearest(req, res) {
  try {
    const { lat, lng } = req.query;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        message: 'Query parameter lat dan lng wajib diisi'
      });
    }

    const patientLat = parseFloat(lat);
    const patientLng = parseFloat(lng);

    if (isNaN(patientLat) || isNaN(patientLng)) {
      return res.status(400).json({
        message: 'Format lat atau lng tidak valid'
      });
    }

    // 1. Fetch available ambulances with last location
    const availableAmbulances = await ambulanceModel.getAvailableWithLastLocation();

    const now = new Date();

    // 2. Filter non-stale ambulances and calculate Haversine distance
    const candidateAmbulances = availableAmbulances
      .filter(amb => {
        if (!amb.last_seen_at || amb.latitude === null || amb.longitude === null) {
          return false;
        }
        const lastSeenDate = new Date(amb.last_seen_at);
        const minutesDiff = (now - lastSeenDate) / (1000 * 60);
        return minutesDiff <= STALE_THRESHOLD_MINUTES;
      })
      .map(amb => {
        const ambLat = parseFloat(amb.latitude);
        const ambLng = parseFloat(amb.longitude);
        const distance = calculateDistance(patientLat, patientLng, ambLat, ambLng);
        return {
          ...amb,
          latitude: ambLat,
          longitude: ambLng,
          distance_km: distance
        };
      })
      .sort((a, b) => a.distance_km - b.distance_km);

    // 3. Take top 3 nearest
    const top3 = candidateAmbulances.slice(0, 3);

    return res.status(200).json({
      status: 'success',
      count: top3.length,
      data: top3
    });
  } catch (error) {
    console.error('Error in ambulanceController.findNearest:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server'
    });
  }
}

/**
 * Handle PUT /api/ambulance/:id/status
 */
async function updateAmbulanceStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: 'Status wajib diisi'
      });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status tidak valid. Status harus salah satu dari: ${ALLOWED_STATUSES.join(', ')}`
      });
    }

    const ambulance = await ambulanceModel.findById(id);
    if (!ambulance) {
      return res.status(404).json({
        message: 'Ambulans tidak ditemukan'
      });
    }

    const previousStatus = ambulance.status;

    await ambulanceModel.updateStatus(id, status);

    // Automatic trip tracking based on status transitions
    if (status === 'on_mission' && previousStatus !== 'on_mission') {
      await tripModel.startTrip(id);
    } else if (previousStatus === 'on_mission' && status !== 'on_mission') {
      await tripModel.endTrip(id);
    }

    const updatedAmbulance = await ambulanceModel.findById(id);

    // Broadcast SSE status_update event
    sseManager.broadcast('status_update', {
      ambulance_id: parseInt(id, 10),
      status: status
    });

    return res.status(200).json({
      message: 'Status ambulans berhasil diperbarui',
      data: updatedAmbulance
    });
  } catch (error) {
    console.error('Error in ambulanceController.updateAmbulanceStatus:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server'
    });
  }
}

/**
 * Helper to parse coordinates from Google Maps URLs or direct coordinate strings
 */
function extractCoordsFromText(text) {
  if (!text) return null;

  // Pattern 1: @lat,lng,zoom or @lat,lng
  const atMatch = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  }

  // Pattern 2: !3d-10.1772!4d123.5823
  const d3d4Match = text.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (d3d4Match) {
    return { lat: parseFloat(d3d4Match[1]), lng: parseFloat(d3d4Match[2]) };
  }

  // Pattern 3: ?q=lat,lng or ?q=lat+lng or ?ll=lat,lng or center=lat,lng
  const qMatch = text.match(/(?:q|ll|center|location)=(-?\d+\.\d+)(?:%2C|%20|[,\s]+)(-?\d+\.\d+)/i);
  if (qMatch) {
    return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  }

  // Pattern 4: direct coordinates "-10.177, 123.58"
  const directMatch = text.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
  if (directMatch) {
    return { lat: parseFloat(directMatch[1]), lng: parseFloat(directMatch[2]) };
  }

  return null;
}

/**
 * Handle POST /api/ambulance/parse-gmaps
 * Body: { url: "https://maps.app.goo.gl/..." }
 */
async function parseGmapsUrl(req, res) {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        message: 'URL atau string lokasi Google Maps wajib diisi'
      });
    }

    const trimmedInput = url.trim();

    // 1. Try parsing directly from input string
    let coords = extractCoordsFromText(trimmedInput);
    if (coords) {
      return res.status(200).json({
        status: 'success',
        data: coords
      });
    }

    // 2. If it's a URL (http:// or https://), follow redirects to expand short link
    if (trimmedInput.startsWith('http://') || trimmedInput.startsWith('https://')) {
      try {
        const response = await fetch(trimmedInput, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        const finalUrl = response.url;
        coords = extractCoordsFromText(finalUrl);

        if (!coords) {
          const bodyText = await response.text();
          coords = extractCoordsFromText(bodyText);
        }

        if (coords) {
          return res.status(200).json({
            status: 'success',
            data: coords,
            expanded_url: finalUrl
          });
        }
      } catch (fetchErr) {
        console.error('Error fetching Google Maps URL:', fetchErr);
      }
    }

    return res.status(400).json({
      message: 'Gagal mengekstrak koordinat dari link Google Maps yang diberikan. Pastikan link atau koordinat valid.'
    });
  } catch (error) {
    console.error('Error in ambulanceController.parseGmapsUrl:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan server saat mengonversi link Google Maps'
    });
  }
}

/**
 * Handle GET /api/ambulance/:id/history
 */
async function getAmbulanceHistory(req, res) {
  try {
    const { id } = req.params;
    const ambulanceId = parseInt(id, 10);

    if (isNaN(ambulanceId)) {
      return res.status(400).json({
        message: 'ID ambulans tidak valid'
      });
    }

    const ambulance = await ambulanceModel.findById(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({
        message: 'Ambulans tidak ditemukan'
      });
    }

    const trips = await tripModel.getHistoryByAmbulance(ambulanceId);

    return res.status(200).json({
      status: 'success',
      count: trips.length,
      data: trips
    });
  } catch (error) {
    console.error('Error in ambulanceController.getAmbulanceHistory:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server'
    });
  }
}

module.exports = {
  listAmbulances,
  getMyAmbulance,
  findNearest,
  updateAmbulanceStatus,
  getAmbulanceHistory,
  parseGmapsUrl
};
