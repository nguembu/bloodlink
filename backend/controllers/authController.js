const User = require('../models/User');
const BloodBank = require('../models/BloodBank');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, ...additionalData } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà.'
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      ...additionalData
    });

    // Si c'est une banque de sang, créer le profil BloodBank
    let bloodBank = null;
    if (role === 'bloodbank') {
      bloodBank = await BloodBank.create({
        user: user._id,
        hospitalName: additionalData.hospitalName,
        location: additionalData.location,
        address: additionalData.address,
        phone: additionalData.phone || phone
      });
    }

    const token = signToken(user._id);

    // Ne pas renvoyer le mot de passe
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      token,
      data: {
        user,
        bloodBank
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe.'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Votre compte a été désactivé.'
      });
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id);

    let bloodBank = null;
    if (user.role === 'bloodbank') {
      bloodBank = await BloodBank.findOne({ user: user._id });
    }

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token,
      data: {
        user,
        bloodBank
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    let bloodBank = null;
    if (user.role === 'bloodbank') {
      bloodBank = await BloodBank.findOne({ user: user._id });
    }

    res.json({
      success: true,
      data: {
        user,
        bloodBank
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};