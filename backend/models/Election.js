const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['national', 'state', 'district', 'local', 'municipal', 'panchayat'],
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'archived'],
      default: 'draft'
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    registrationDeadline: {
      type: Date,
      required: false
    },
    region: {
      name: String,
      state: String,
      district: String,
      constituencies: [String]
    },
    totalVoters: {
      type: Number,
      default: 0
    },
    votesCast: {
      type: Number,
      default: 0
    },
    candidates: [
      {
        id: String,
        name: String,
        party: String,
        symbol: String,
        color: String,
        description: String,
        manifesto: String,
        image: String
      }
    ],
    createdBy: {
      type: String,
      required: true
    },
    resultsPublished: {
      type: Boolean,
      default: false
    },
    resultsPublishedAt: {
      type: Date,
      default: null
    },
    settings: {
      allowEarlyVoting: Boolean,
      requireVoterVerification: Boolean,
      enableRealTimeResults: Boolean,
      allowProxyVoting: Boolean,
      enableBlockchain: Boolean,
      requireBiometric: Boolean
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'elections',
    timestamps: true
  }
);

// Index for faster queries
electionSchema.index({ status: 1, startDate: 1 });
electionSchema.index({ 'region.state': 1 });
electionSchema.index({ type: 1 });
electionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Election', electionSchema);
