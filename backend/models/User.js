const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// === Définition du schéma utilisateur ===
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      message: 'Please provide a valid email address'
    }
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Ne jamais renvoyer le mot de passe
  },

  role: {
    type: String,
    enum: ['doctor', 'donor'],
    required: [true, 'Role is required']
  },

  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
    required: function () { return this.role === 'donor'; }
  },

  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: function () { return this.role === 'donor'; }
  },

  hospital: {
    type: String,
    trim: true,
    required: function () { return this.role === 'doctor'; }
  },

  phone: {
    type: String,
    trim: true,
    match: [/^\+?[0-9]{6,15}$/, 'Please provide a valid phone number']
  },

  // Géolocalisation
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: String
  },

  fcmToken: {
    type: String,
    trim: true
  },

  isActive: {
    type: Boolean,
    default: true
  },

  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// === Indexes pour recherche et performances ===
userSchema.index({ location: '2dsphere' });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ bloodType: 1 });

// === Middleware : hash du mot de passe avant save ===
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// === Correction automatique de la géolocalisation ===
userSchema.pre('save', function (next) {
  if (this.location && Array.isArray(this.location.coordinates) && this.location.coordinates.length === 2) {
    this.location.type = 'Point';
  }
  next();
});

// === Méthodes d’instance ===

// Vérifier le mot de passe
userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Mise à jour de la géolocalisation
userSchema.methods.updateLocation = async function (latitude, longitude, address = '') {
  this.location = {
    type: 'Point',
    coordinates: [longitude, latitude],
    address
  };
  return await this.save();
};

// Désactivation du compte
userSchema.methods.deactivate = async function () {
  this.isActive = false;
  return await this.save();
};

// Générer le token JWT
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// === Relations virtuelles (populate) ===

// Alertes créées (pour les docteurs)
userSchema.virtual('alerts', {
  ref: 'Alert',
  foreignField: 'doctor',
  localField: '_id'
});

// Réponses aux alertes (pour les donneurs)
userSchema.virtual('responses', {
  ref: 'Alert',
  foreignField: 'responses.donor',
  localField: '_id'
});

module.exports = mongoose.model('User', userSchema);
