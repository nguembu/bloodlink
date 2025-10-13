const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert',
    required: false
  },
  type: {
    type: String,
    required: true,
    enum: ['NEW_ALERT', 'ALERT_CANCELLED', 'DONATION_CONFIRMED', 'DONOR_ACCEPTED']
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'pending'
  },
  read: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Index pour les recherches fréquentes
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ alert: 1 });
notificationSchema.index({ read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);