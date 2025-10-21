const mongoose = require('mongoose');

const bloodBankSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospitalName: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  bloodInventory: {
    'A+': { type: Number, default: 0 },
    'A-': { type: Number, default: 0 },
    'B+': { type: Number, default: 0 },
    'B-': { type: Number, default: 0 },
    'AB+': { type: Number, default: 0 },
    'AB-': { type: Number, default: 0 },
    'O+': { type: Number, default: 0 },
    'O-': { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

bloodBankSchema.index({ location: '2dsphere' });

// Méthode pour vérifier la disponibilité du sang
bloodBankSchema.methods.hasBloodAvailable = function(bloodType, quantity = 1) {
  return this.bloodInventory[bloodType] >= quantity;
};

// Méthode pour mettre à jour l'inventaire
bloodBankSchema.methods.updateInventory = function(bloodType, quantity) {
  this.bloodInventory[bloodType] += quantity;
  return this.save();
};

module.exports = mongoose.model('BloodBank', bloodBankSchema);