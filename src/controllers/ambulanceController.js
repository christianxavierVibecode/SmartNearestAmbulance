const ambulanceModel = require('../models/ambulanceModel');
const sseManager = require('../utils/sseManager');

const ALLOWED_STATUSES = ['available', 'on_mission', 'maintenance', 'offline'];

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

    await ambulanceModel.updateStatus(id, status);

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

module.exports = {
  listAmbulances,
  updateAmbulanceStatus
};
