const express = require('express');
const {
  updateInventory,
  getInventory,
  findNearbyBloodBanks
} = require('../controllers/bloodBankController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Banques de sang
router.patch('/inventory', authorize('bloodbank'), updateInventory);
router.get('/inventory', authorize('bloodbank'), getInventory);

// Public (médecins et donneurs)
router.get('/nearby', findNearbyBloodBanks);

module.exports = router;