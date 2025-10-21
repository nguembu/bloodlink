const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const PasswordResetToken = require('../models/PasswordResetToken');
const emailService = require('../utils/emailService');


const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);


module.exports = router;