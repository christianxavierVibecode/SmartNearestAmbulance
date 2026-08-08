const locationModel = require('../models/locationModel');
const ambulanceModel = require('../models/ambulanceModel');
const sseManager = require('../utils/sseManager');

/**
 * Handle POST /api/location
 */
async function receiveLocation(req, res) {
  try {
    const { ambulance_id, lat, lng } = req.body;

    if (!ambulance_id || lat === undefined || lng === undefined) {
      return res.status(400).json({
        message: 'ambulance_id, lat, dan lng wajib diisi'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const ambulanceId = parseInt(ambulance_id, 10);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(ambulanceId)) {
      return res.status(400).json({
        message: 'Format data ambulance_id, lat, atau lng tidak valid'
      });
    }

    // 1. Insert into location_history
    const locationRecord = await locationModel.insertLocation(ambulanceId, latitude, longitude);

    // 2. Update last_seen_at in ambulances table
    await ambulanceModel.updateLastSeen(ambulanceId);

    // 3. Broadcast to SSE clients (location_update)
    const eventPayload = {
      ambulance_id: ambulanceId,
      lat: latitude,
      lng: longitude,
      timestamp: locationRecord.recorded_at
    };

    sseManager.broadcast('location_update', eventPayload);

    return res.status(200).json({
      status: 'success',
      message: 'Lokasi berhasil diperbarui',
      data: eventPayload
    });
  } catch (error) {
    console.error('Error in locationController.receiveLocation:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server'
    });
  }
}

module.exports = {
  receiveLocation
};
