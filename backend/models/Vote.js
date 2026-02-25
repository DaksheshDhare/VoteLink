const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voterID: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  electionId: {
    type: String,
    required: false,
    index: true,
    default: 'default_election'
  },
  candidateId: {
    type: String,
    required: true
  },
  candidateName: {
    type: String,
    required: true
  },
  partyName: {
    type: String,
    required: true
  },
  region: {
    state: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    constituency: {
      type: String,
      required: true
    }
  },
  blockchainTxHash: {
    type: String,
    required: false,
    index: true
  },
  blockchainConfirmed: {
    type: Boolean,
    default: false
  },
  ipAddress: {
    type: String,
    required: false
  },
  deviceInfo: {
    type: String,
    required: false
  },
  votedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate votes per election
// Using email + electionId is more reliable than voterID (which might not be set)
voteSchema.index({ userEmail: 1, electionId: 1 }, { unique: true });

// Index for analytics
voteSchema.index({ 'region.constituency': 1, votedAt: -1 });
voteSchema.index({ candidateId: 1 });
voteSchema.index({ voterID: 1 });

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
