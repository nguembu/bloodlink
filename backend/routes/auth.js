const express = require('express');
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  updateLocation,
  updateFCMToken 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { 
  validateRegistration, 
  validateLogin, 
  validateLocation 
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

// Protected routes
router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/location', validateLocation, updateLocation);
router.patch('/fcm-token', updateFCMToken);

module.exports = router;