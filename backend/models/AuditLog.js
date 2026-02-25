const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['registration', 'login', 'logout', 'vote_cast', 'voter_id_upload', 'face_capture', 'otp_verify', 'admin_action', 'suspicious_activity', 'security_breach'],
    index: true
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  voterID: {
    type: String,
    required: false,
    uppercase: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  },
  deviceInfo: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'pending'],
    default: 'success'
  },
  errorMessage: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for audit queries
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ userEmail: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
