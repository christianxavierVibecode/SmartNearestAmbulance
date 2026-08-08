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
  getAmbulanceHistory
};
