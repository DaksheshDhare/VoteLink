const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  voterID: {
    type: String,
    required: false,
    uppercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  ipAddress: {
    type: String,
    required: false
  },
  deviceInfo: {
    type: String,
    required: false
  },
  loginAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  logoutAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Auto-delete expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for active session queries
sessionSchema.index({ email: 1, isActive: 1 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
