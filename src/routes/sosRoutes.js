const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');
const verifyAuthToken = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/roleMiddleware');

// POST /api/sos (protected: driver, operator)
router.post(
  '/sos',
  verifyAuthToken,
  allowRoles('driver', 'operator'),
  sosController.triggerSos
);

// PUT /api/sos/:id/resolve (protected: operator, management)
router.put(
  '/sos/:id/resolve',
  verifyAuthToken,
  allowRoles('operator', 'management'),
  sosController.resolveSos
);

module.exports = router;
