const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Inscription
exports.register = async (req, res) => {
  try {
    const { email, password, role, name, bloodType, hospital, phone } = req.body;
    console.log('Registration data:', { email, role, name, bloodType, hospital, phone });

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      email,
      password,
      role,
      name,
      bloodType,
      hospital,
      phone
    });

    // Générer le token JWT
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Ne pas renvoyer le mot de passe
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      message: 'Compte créé avec succès',
      token,
      data: { user }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Erreur lors de la création du compte'
    });
  }
};

// Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier l'email et le mot de passe
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Votre compte a été désactivé. Contactez le support.'
      });
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // Générer le token JWT
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Ne pas renvoyer le mot de passe
    user.password = undefined;
    console.log('User logged in:', user);

    res.status(201).json({
      status: 'success',
      message: 'Connexion réussie',
      token,
      data: { user }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de la connexion'
    });
  }
};

// Profil utilisateur
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de la récupération du profil'
    });
  }
};

// Mettre à jour le profil
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, hospital } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (hospital) updates.hospital = hospital;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      message: 'Profil mis à jour avec succès',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
};

// Mettre à jour la localisation
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Mettre à jour la localisation
    user.location = {
      type: 'Point',
      coordinates: [longitude, latitude],
      address
    };
    
    await user.save();

    res.json({
      status: 'success',
      message: 'Localisation mise à jour avec succès',
      data: { 
        location: user.location 
      }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour de la localisation'
    });
  }
};

// Mettre à jour le token FCM
exports.updateFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    
    await User.findByIdAndUpdate(req.user.id, { fcmToken });

    res.json({
      status: 'success',
      message: 'Token FCM mis à jour avec succès'
    });
  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour du token FCM'
    });
  }
};