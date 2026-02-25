const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  mobile: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true,
    index: true
  },
  voterID: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true,
    index: true
  },
  username: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    index: true
  },
  fullname: {
    type: String,
    required: false,
    trim: true
  },
  name: {
    type: String,
    required: false,
    trim: true
  },
  password: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    geolocation: {
      lat: { type: Number, default: 0.0 },
      lng: { type: Number, default: 0.0 }
    }
  },
  // Email OTP verification fields
  emailVerificationOTP: {
    type: String,
    required: false
  },
  emailVerificationOTPExpiry: {
    type: Date,
    required: false
  },
  emailVerificationOTPLastSent: {
    type: Date,
    required: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  // Refresh token for JWT auth
  refresh_token: {
    type: String,
    required: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['voter', 'admin'],
    default: 'voter'
  },
  hasVoted: {
    type: Boolean,
    default: false
  },
  votedAt: {
    type: Date,
    default: null
  },
  region: {
    state: String,
    district: String,
    constituency: String
  },
  isDisabledVoter: {
    type: Boolean,
    default: false
  },
  faceData: {
    descriptor: {
      type: [Number],
      required: false
    },
    image: {
      type: String,
      required: false
    },
    capturedAt: {
      type: Date,
      default: Date.now
    }
  },
  voterIDImage: {
    type: String,
    required: false
  },
  disabilityCertificate: {
    type: String,
    required: false
  },
  blockchainAddress: {
    type: String,
    required: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: false
  },
  deviceInfo: {
    type: String,
    required: false
  },
  securityBreach: {
    detected: {
      type: Boolean,
      default: false,
      index: true
    },
    reason: {
      type: String,
      required: false
    },
    detectedAt: {
      type: Date,
      required: false
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: false
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ voterID: 1, hasVoted: 1 });
userSchema.index({ 'region.constituency': 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  if (!this.password) return;
  // Skip hashing for temporary passwords
  if (this.password.startsWith('temp_password_')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.isPasswordCorrect = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

// Generate JWT access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.JWT_SECRET || 'vote-pro-secret-key',
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d',
    }
  );
};

// Generate JWT refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_SECRET || 'vote-pro-secret-key',
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '10d',
    }
  );
};

const User = mongoose.model('User', userSchema);

module.exports = User;
