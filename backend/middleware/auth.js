const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    
    // 1) Vérifier si le token existe
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Vous devez être connecté pour accéder à cette ressource'
      });
    }

    // 2) Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3) Vérifier si l'utilisateur existe toujours
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: "L'utilisateur associé à ce token n'existe plus"
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Votre compte a été désactivé'
      });
    }

    // 4) Ajouter l'utilisateur à la requête
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token invalide'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Votre session a expiré, veuillez vous reconnecter'
      });
    }

    res.status(401).json({
      status: 'error',
      message: 'Erreur d\'authentification'
    });
  }
};

// Restreindre l'accès à des rôles spécifiques
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'avez pas la permission d\'effectuer cette action'
      });
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo
};