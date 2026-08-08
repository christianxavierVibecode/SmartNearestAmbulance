const sosModel = require('../models/sosModel');
const sseManager = require('../utils/sseManager');

/**
 * Handle POST /api/sos
 * Driver triggers an SOS alert
 */
async function triggerSos(req, res) {
  try {
    const { ambulance_id, lat, lng } = req.body;

    if (!ambulance_id || lat === undefined || lng === undefined) {
      return res.status(400).json({
        message: 'ambulance_id, lat, dan lng wajib diisi'
      });
    }

    const ambulanceId = parseInt(ambulance_id, 10);
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(ambulanceId) || isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        message: 'Format data ambulance_id, lat, atau lng tidak valid'
      });
    }

    // 1. Insert SOS alert into database
    const alert = await sosModel.createAlert(ambulanceId, latitude, longitude);

    // 2. Broadcast sos_alert event to all connected SSE clients
    const eventPayload = {
      alert_id: alert.id,
      ambulance_id: ambulanceId,
      lat: latitude,
      lng: longitude,
      timestamp: alert.triggered_at
    };

    sseManager.broadcast('sos_alert', eventPayload);

    return res.status(201).json({
      status: 'success',
      message: 'Sinyal SOS berhasil dikirim',
      data: alert
    });
  } catch (error) {
    console.error('Error in sosController.triggerSos:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server'
    });
  }
}

/**
 * Handle PUT /api/sos/:id/resolve
 * Operator resolves an SOS alert
 */
async function resolveSos(req, res) {
  try {
    const { id } = req.params;
    const alertId = parseInt(id, 10);

    if (isNaN(alertId)) {
      return res.status(400).json({
        message: 'ID alert tidak valid'
      });
    }

    const alert = await sosModel.findById(alertId);
    if (!alert) {
      return res.status(404).json({
        message: 'SOS alert tidak ditemukan'
      });
    }

    if (alert.resolved) {
      return res.status(409).json({
        message: 'SOS alert ini sudah diselesaikan sebelumnya'
      });
    }

    const resolved = await sosModel.resolveAlert(alertId);

    if (!resolved) {
      return res.status(500).json({
        message: 'Gagal menyelesaikan SOS alert'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: `SOS alert ID ${alertId} berhasil diselesaikan`
    });
  } catch (error) {
    console.error('Error in sosController.resolveSos:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server'
    });
  }
}

module.exports = {
  triggerSos,
  resolveSos
};
