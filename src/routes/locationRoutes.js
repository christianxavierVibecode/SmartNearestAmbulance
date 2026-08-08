const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const streamController = require('../controllers/streamController');
const verifyAuthToken = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/roleMiddleware');

// GET /api/stream (SSE stream for operator dashboard)
router.get('/stream', streamController.subscribeStream);

// POST /api/location (protected: driver, operator)
router.post(
  '/location',
  verifyAuthToken,
  allowRoles('driver', 'operator'),
  locationController.receiveLocation
);

module.exports = router;
