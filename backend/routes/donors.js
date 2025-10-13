const express = require('express');
const {
  respondToAlert,
  getNearbyAlerts,
  getDonationHistory,
  getDonorStats
} = require('../controllers/donorController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateAlertResponse } = require('../middleware/validation');

const router = express.Router();

// 🔥 TOUTES les routes doivent être protégées et réservées aux donneurs
router.use(protect);
router.use(restrictTo('donor'));

router.get('/nearby-alerts', getNearbyAlerts);
router.get('/donation-history', getDonationHistory);
router.get('/stats', getDonorStats);
router.post('/alert/:alertId/respond', validateAlertResponse, respondToAlert);

module.exports = router;