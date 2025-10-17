const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware pour protéger les routes
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1) Récupérer le token
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
    if (!decoded) throw new Error('Token invalide');

    // 3) Vérifier si l'utilisateur existe
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Compte inexistant ou désactivé'
      });
    }

    // 4) Ajouter l'utilisateur à la requête
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ status: 'error', message: 'Token invalide' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'error', message: 'Session expirée' });
    }

    res.status(401).json({ status: 'error', message: 'Erreur d\'authentification' });
  }
};

/**
 * Middleware pour restreindre l'accès à certains rôles
 */
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

module.exports = { protect, restrictTo };
