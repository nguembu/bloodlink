const express = require('express');
const {
  createAlert,
  getActiveAlerts,
  getMyAlerts,
  cancelAlert,
  fulfillAlert,
  getAlert
} = require('../controllers/alertController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateAlert } = require('../middleware/validation');

const router = express.Router();

// Toutes les routes protégées
router.use(protect);

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/active', getActiveAlerts);
router.get('/:id', getAlert);

// Routes réservées aux médecins
router.use(restrictTo('doctor'));

router.post('/', validateAlert, createAlert);
router.get('/my/alerts', getMyAlerts);
router.patch('/:id/cancel', cancelAlert);
router.patch('/:id/fulfill', fulfillAlert);

module.exports = router;