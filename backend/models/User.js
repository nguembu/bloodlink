const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: {
      values: ['doctor', 'donor'],
      message: 'Role must be either doctor or donor'
    },
    required: [true, 'Role is required']
  },
  name: {
    type: String,
    required: function() { return this.role === 'donor'; },
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  bloodType: {
    type: String,
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: 'Blood type must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-'
    },
    required: function() { return this.role === 'donor'; }
  },
  hospital: {
    type: String,
    required: function() { return this.role === 'doctor'; },
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
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
  fcmToken: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les recherches géospatiales
userSchema.index({ location: '2dsphere' });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ bloodType: 1 });

// Middleware de hachage du mot de passe
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', function(next) {
  if (this.isModified('location') && this.location.coordinates) {
    // S'assurer que les coordonnées sont dans le bon ordre [lng, lat]
    if (this.location.coordinates.length === 2) {
      this.location.type = 'Point';
    }
  }
  next();
});

// Méthodes d'instance
userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateLocation = function(latitude, longitude, address = '') {
  this.location = {
    type: 'Point',
    coordinates: [longitude, latitude],
    address
  };
  return this.save();
};

userSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Virtual pour les alertes créées (médecins)
userSchema.virtual('alerts', {
  ref: 'Alert',
  foreignField: 'doctor',
  localField: '_id'
});

// Virtual pour les réponses aux alertes (donneurs)
userSchema.virtual('responses', {
  ref: 'Alert',
  foreignField: 'responses.donor',
  localField: '_id'
});

// Méthode pour générer le token JWT
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

module.exports = mongoose.model('User', userSchema);