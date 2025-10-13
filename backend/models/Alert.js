const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor reference is required']
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood type is required']
  },
  hospital: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true
  },
  hospitalLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  radius: {
    type: Number,
    default: 5, // 5km par défaut
    min: 1,
    max: 50
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'fulfilled', 'expired'],
    default: 'active'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Expire après 24 heures par défaut
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  },
  responses: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    respondedAt: {
      type: Date,
      default: Date.now
    },
    message: String
  }],
  stats: {
    totalNotified: { type: Number, default: 0 },
    totalAccepted: { type: Number, default: 0 },
    totalDeclined: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les recherches géospatiales
alertSchema.index({ hospitalLocation: '2dsphere' });
alertSchema.index({ status: 1 });
alertSchema.index({ bloodType: 1 });
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
alertSchema.index({ doctor: 1, createdAt: -1 });

// Middleware pour mettre à jour les stats
alertSchema.pre('save', function(next) {
  if (this.isModified('responses')) {
    this.stats.totalNotified = this.responses.length;
    this.stats.totalAccepted = this.responses.filter(r => r.status === 'accepted').length;
    this.stats.totalDeclined = this.responses.filter(r => r.status === 'declined').length;
  }
  next();
});

// Méthodes d'instance
alertSchema.methods.addResponse = function(donorId, status, message = '') {
  const existingResponse = this.responses.find(r => r.donor.toString() === donorId.toString());
  
  if (existingResponse) {
    existingResponse.status = status;
    existingResponse.message = message;
    existingResponse.respondedAt = new Date();
  } else {
    this.responses.push({
      donor: donorId,
      status,
      message,
      respondedAt: new Date()
    });
  }
  
  return this.save();
};

alertSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

alertSchema.methods.fulfill = function() {
  this.status = 'fulfilled';
  return this.save();
};

// Virtual pour les donneurs ayant accepté
alertSchema.virtual('acceptedDonors', {
  ref: 'User',
  localField: 'responses.donor',
  foreignField: '_id',
  match: { 'responses.status': 'accepted' }
});

// Méthode statique pour trouver les alertes actives près d'une localisation
alertSchema.statics.findActiveNearLocation = function(longitude, latitude, maxDistance = 5000) {
  return this.find({
    status: 'active',
    expiresAt: { $gt: new Date() },
    hospitalLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // en mètres
      }
    }
  }).populate('doctor', 'name hospital');
};

module.exports = mongoose.model('Alert', alertSchema);