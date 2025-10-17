const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ================== Helper ==================
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const sendToken = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    message,
    token,
    data: { user }
  });
};

// ================== Register ==================
exports.register = async (req, res) => {
  try {
    const { email, password, role, name, bloodType, hospital, phone } = req.body;

    // Vérifier l'existence
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ status: 'error', message: 'Un utilisateur avec cet email existe déjà' });

    const user = await User.create({ email, password, role, name, bloodType, hospital, phone });

    sendToken(user, 201, res, 'Compte créé avec succès');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ status: 'error', message: error.message || 'Erreur lors de la création du compte' });
  }
};

// ================== Login ==================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ status: 'error', message: 'Email et mot de passe requis' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password)))
      return res.status(401).json({ status: 'error', message: 'Email ou mot de passe incorrect' });

    if (!user.isActive)
      return res.status(401).json({ status: 'error', message: 'Compte désactivé. Contactez le support.' });

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save();

    sendToken(user, 200, res, 'Connexion réussie');
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ status: 'error', message: 'Erreur lors de la connexion' });
  }
};

// ================== Get Profile ==================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(400).json({ status: 'error', message: 'Erreur lors de la récupération du profil' });
  }
};

// ================== Update Profile ==================
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'hospital'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ status: 'success', message: 'Profil mis à jour avec succès', data: { user } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ status: 'error', message: 'Erreur lors de la mise à jour du profil' });
  }
};

// ================== Update Location ==================
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    if (latitude === undefined || longitude === undefined)
      return res.status(400).json({ status: 'error', message: 'Latitude et longitude sont requis' });

    const user = await User.findById(req.user.id);
    await user.updateLocation(latitude, longitude, address);

    res.json({ status: 'success', message: 'Localisation mise à jour', data: { location: user.location } });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(400).json({ status: 'error', message: 'Erreur lors de la mise à jour de la localisation' });
  }
};

// ================== Update FCM Token ==================
exports.updateFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ status: 'error', message: 'Token FCM requis' });

    const user = await User.findByIdAndUpdate(req.user.id, { fcmToken }, { new: true });
    res.json({ status: 'success', message: 'Token FCM mis à jour', data: { fcmToken: user.fcmToken } });
  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(400).json({ status: 'error', message: 'Erreur lors de la mise à jour du token FCM' });
  }
};
