const express = require('express');
const {
  createAlert,
  propagateAlert,
  validateReception,
  cancelAlert,
  getBloodBankAlerts
} = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Médecins
router.post('/', authorize('doctor'), createAlert);

// Banques de sang
router.get('/bloodbank', authorize('bloodbank'), getBloodBankAlerts);
router.post('/:alertId/propagate', authorize('bloodbank'), propagateAlert);
router.patch('/:alertId/validate', authorize('bloodbank'), validateReception);
router.patch('/:alertId/cancel', authorize('bloodbank'), cancelAlert);

module.exports = router;