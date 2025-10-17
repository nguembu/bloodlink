const { body, validationResult } = require('express-validator');

/**
 * Gestion des erreurs de validation
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Données de validation invalides',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Validation inscription
 */
const validateRegistration = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password')
    .isLength({ min: 6 }).withMessage('Mot de passe >= 6 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mot de passe doit contenir majuscule, minuscule et chiffre'),
  body('role').isIn(['doctor', 'donor']).withMessage('Rôle invalide'),

  body('name')
    .if(body('role').equals('donor'))
    .notEmpty().withMessage('Nom requis pour donneur')
    .isLength({ min: 2, max: 50 }).withMessage('Nom entre 2 et 50 caractères')
    .trim().escape(),

  body('bloodType')
    .if(body('role').equals('donor'))
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Type sanguin invalide'),

  body('hospital')
    .if(body('role').equals('doctor'))
    .notEmpty().withMessage('Hôpital requis')
    .isLength({ min: 2, max: 100 }).withMessage('Nom hôpital entre 2 et 100 caractères')
    .trim().escape(),

  body('phone').optional().trim().escape(),

  handleValidationErrors
];

/**
 * Validation login
 */
const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
  handleValidationErrors
];

/**
 * Validation localisation
 */
const validateLocation = [
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude invalide'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude invalide'),
  body('address').optional().isLength({ max: 200 }).trim().escape().withMessage('Adresse trop longue'),
  handleValidationErrors
];

/**
 * Validation création alerte
 */
const validateAlert = [
  body('bloodType')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Type sanguin invalide'),
  body('hospital')
    .notEmpty().withMessage('Hôpital requis')
    .isLength({ min: 2, max: 100 }).trim().escape(),
  body('location.latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude invalide'),
  body('location.longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude invalide'),
  body('urgency').optional().isIn(['low','medium','high','critical']).withMessage('Urgence invalide'),
  body('radius').optional().isInt({ min:1, max:50 }).withMessage('Rayon entre 1 et 50 km'),
  body('description').optional().isLength({ max:500 }).trim().escape(),
  handleValidationErrors
];

/**
 * Validation réponse alerte
 */
const validateAlertResponse = [
  body('status').isIn(['accepted','declined']).withMessage('Statut invalide'),
  body('message').optional().isLength({ max:200 }).trim().escape(),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateLocation,
  validateAlert,
  validateAlertResponse
};
