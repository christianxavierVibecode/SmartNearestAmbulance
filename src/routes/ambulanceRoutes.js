const express = require('express');
const router = express.Router();
const ambulanceController = require('../controllers/ambulanceController');
const verifyAuthToken = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/roleMiddleware');

// GET /api/ambulances (protected: operator, management)
router.get(
  '/ambulances',
  verifyAuthToken,
  allowRoles('operator', 'management'),
  ambulanceController.listAmbulances
);

// GET /api/ambulance/nearest (protected: operator, management)
router.get(
  '/ambulance/nearest',
  verifyAuthToken,
  allowRoles('operator', 'management'),
  ambulanceController.findNearest
);

// PUT /api/ambulance/:id/status (protected: driver, operator, management)
router.put(
  '/ambulance/:id/status',
  verifyAuthToken,
  allowRoles('driver', 'operator', 'management'),
  ambulanceController.updateAmbulanceStatus
);

module.exports = router;
