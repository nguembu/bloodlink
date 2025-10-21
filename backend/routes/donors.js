const express = require('express');
const {
  notifyDonors,
  respondToAlert,
  getNearbyAlerts
} = require('../controllers/donorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Banques de sang
router.post('/notify', authorize('bloodbank'), notifyDonors);

// Donneurs
router.get('/nearby-alerts', authorize('donor'), getNearbyAlerts);
router.post('/alert/:alertId/respond', authorize('donor'), respondToAlert);

module.exports = router;