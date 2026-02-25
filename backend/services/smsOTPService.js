/**
 * SMS OTP Service - Fast2SMS Integration (Production Only)
 * Single authentication method, no demo mode, no multiple requests
 */

console.log(
  'FAST2SMS_API_KEY loaded:',
  process.env.FAST2SMS_API_KEY?.length
);

const axios = require('axios');

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const OTP_EXPIRY_MINUTES = 5;
const OTP_LENGTH = 6;
const USE_MOCK_OTP = process.env.NODE_ENV === 'development'; // Use mock OTP in development

// In-memory OTP store (use Redis in production)
const otpStore = new Map();
const requestCache = new Map(); // Prevent duplicate requests within 5 seconds

console.log(`🔧 OTP Mode: ${USE_MOCK_OTP ? '📱 MOCK/DEVELOPMENT' : '🚀 PRODUCTION (Fast2SMS)'}`);

/**
 * Verify Fast2SMS API key is configured
 */
function validateFast2SMSConfig() {
  if (!FAST2SMS_API_KEY) {
    const error = new Error(
      'Fast2SMS API key is not configured. Please set FAST2SMS_API_KEY environment variable.'
    );
    console.error('❌', error.message);
    throw error;
  }
}

/**
 * Generate a random 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via Fast2SMS - CORRECT API FORMAT
 * Fast2SMS v1 API uses form-data with Authorization header
 * @param {string} mobileNumber - User's mobile number
 * @param {string} otp - OTP to send
 * @returns {Promise<object>}
 */
async function sendOTPViaSMS(mobileNumber, otp) {
  try {
    const cleanNumber = mobileNumber.replace(/\D/g, '');
    
    if (!cleanNumber || cleanNumber.length < 10) {
      throw new Error('Invalid mobile number format');
    }

    // If in development mode, skip actual SMS sending
    if (USE_MOCK_OTP) {
      console.log(`📱 [MOCK MODE] OTP for ${cleanNumber}: ${otp}`);
      console.log(`   (In development, check backend logs for OTP)`);
      return {
        success: true,
        message: 'OTP generated (mock mode)',
        data: { message: `Mock OTP: ${otp}` }
      };
    }

    // Production: Use Fast2SMS API
    validateFast2SMSConfig();

    // Fast2SMS requires country code
    const formattedNumber = cleanNumber.startsWith('91') 
      ? cleanNumber 
      : '91' + cleanNumber;

    // Prevent duplicate requests for same number within 5 seconds
    const cacheKey = `${formattedNumber}_${otp}`;
    if (requestCache.has(cacheKey)) {
      console.warn(`⚠️ Duplicate OTP request detected for ${formattedNumber}. Skipping.`);
      throw new Error('OTP request already in progress. Please wait.');
    }
    requestCache.set(cacheKey, true);
    setTimeout(() => requestCache.delete(cacheKey), 5000);

    const message = `Your VoteLink election OTP is: ${otp}. Expires in 5 minutes. Do not share.`;

    console.log(`📤 Sending OTP to ${formattedNumber}...`);
    console.log(`🔑 API Key (first 10 chars): ${FAST2SMS_API_KEY?.substring(0, 10)}...`);

    // Fast2SMS API - CORRECT FORMAT
    // Authorization must be in PARAMS (not headers)
    // Using GET request with URL parameters
    const response = await axios.get(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        params: {
          authorization: FAST2SMS_API_KEY,
          route: 'dlt',
          message: message,
          numbers: formattedNumber
        },
        timeout: 15000
      }
    );

    // Check response structure
    console.log(`📊 Fast2SMS Response:`, JSON.stringify(response.data, null, 2));
    
    if (response.data?.return === true) {
      console.log(`✅ OTP sent successfully via Fast2SMS`);
      return {
        success: true,
        message: 'OTP sent to your mobile number',
        data: response.data
      };
    }

    // API returned false - extract error message
    const errorMsg = response.data?.message || 'SMS gateway returned error';
    console.error(`❌ Fast2SMS error: ${errorMsg}`);
    throw new Error(errorMsg);

  } catch (error) {
    console.error(`❌ OTP send failed: ${error.message}`);
    
    // Provide helpful error messages
    if (error.response?.status === 401) {
      console.error(`🔐 Unauthorized: API Key may be invalid or expired`);
      console.error(`📝 Full Error Response:`, JSON.stringify(error.response.data, null, 2));
      throw new Error('SMS authentication failed. Check API key in .env file.');
    } else if (error.response?.status === 400) {
      console.error(`❌ Bad Request`);
      console.error(`📝 Full Error Response:`, JSON.stringify(error.response.data, null, 2));
      throw new Error('Invalid request format. Verify mobile number format.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('SMS gateway timeout. Please try again.');
    }
    
    console.error(`📝 Full Error:`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Generate and send OTP to user - SINGLE REQUEST
 * @param {string} email - User's email
 * @param {string} mobile - User's mobile number
 * @returns {Promise<object>} - OTP details (without actual OTP)
 */
async function generateAndSendOTP(email, mobile) {
  try {
    validateFast2SMSConfig();

    const normalizedEmail = email.toLowerCase().trim();
    const cleanMobile = mobile.replace(/\D/g, '');

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

    // Store OTP in memory with metadata
    const otpKey = `${normalizedEmail}_${cleanMobile}`;
    otpStore.set(otpKey, {
      otp,
      email: normalizedEmail,
      mobile: cleanMobile,
      expiresAt: otpExpiry,
      attempts: 0,
      createdAt: new Date()
    });

    // Send OTP via SMS - SINGLE REQUEST ONLY
    const smsResult = await sendOTPViaSMS(cleanMobile, otp);

    console.log(`✅ OTP generated and sent for ${normalizedEmail}`);

    return {
      success: true,
      message: 'OTP sent successfully to your registered mobile number',
      data: {
        email: normalizedEmail,
        mobile: cleanMobile.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'),
        expiresIn: `${OTP_EXPIRY_MINUTES} minutes`,
        smsSent: true
      }
    };

  } catch (error) {
    console.error('❌ Failed to generate and send OTP:', error.message);
    throw error;
  }
}

/**
 * Verify OTP provided by user
 * @param {string} email - User's email
 * @param {string} mobile - User's mobile number
 * @param {string} userOTP - OTP provided by user
 * @returns {Promise<object>} - Verification result
 */
async function verifyOTP(email, mobile, userOTP) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const cleanMobile = mobile.replace(/\D/g, '');
    const otpKey = `${normalizedEmail}_${cleanMobile}`;

    const storedOTP = otpStore.get(otpKey);

    // Check if OTP exists
    if (!storedOTP) {
      return {
        success: false,
        error: 'OTP_NOT_FOUND',
        message: 'OTP not found or expired. Please request a new OTP.'
      };
    }

    // Check if OTP is expired
    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(otpKey);
      return {
        success: false,
        error: 'OTP_EXPIRED',
        message: 'OTP has expired. Please request a new OTP.'
      };
    }

    // Check attempt limit (max 3 attempts)
    if (storedOTP.attempts >= 3) {
      otpStore.delete(otpKey);
      return {
        success: false,
        error: 'TOO_MANY_ATTEMPTS',
        message: 'Too many failed attempts. Please request a new OTP.'
      };
    }

    // Verify OTP
    const trimmedUserOTP = userOTP.trim();
    console.log(`🔍 OTP Verification:
      Stored: ${storedOTP.otp}
      User Input: ${trimmedUserOTP}
      Match: ${trimmedUserOTP === storedOTP.otp}`);
    
    if (trimmedUserOTP !== storedOTP.otp) {
      storedOTP.attempts++;
      const attemptsRemaining = 3 - storedOTP.attempts;
      console.log(`❌ OTP Mismatch! Attempts: ${storedOTP.attempts}/3`);
      
      return {
        success: false,
        error: 'INVALID_OTP',
        message: 'Invalid OTP. Please try again.',
        attemptsRemaining
      };
    }

    // OTP is correct - clean up
    otpStore.delete(otpKey);

    console.log(`✅ OTP verified successfully for ${normalizedEmail}`);

    return {
      success: true,
      message: 'OTP verified successfully',
      data: {
        email: normalizedEmail,
        mobile: cleanMobile,
        verified: true
      }
    };

  } catch (error) {
    console.error('❌ Error verifying OTP:', error.message);
    return {
      success: false,
      error: 'VERIFICATION_ERROR',
      message: 'Error verifying OTP. Please try again.'
    };
  }
}

/**
 * Check if OTP is stored for a given email and mobile
 * @param {string} email - User's email
 * @param {string} mobile - User's mobile number
 */
function isOTPPending(email, mobile) {
  const normalizedEmail = email.toLowerCase().trim();
  const cleanMobile = mobile.replace(/\D/g, '');
  const otpKey = `${normalizedEmail}_${cleanMobile}`;

  const storedOTP = otpStore.get(otpKey);
  
  if (!storedOTP) {
    return false;
  }

  // Check if expired
  if (Date.now() > storedOTP.expiresAt) {
    otpStore.delete(otpKey);
    return false;
  }

  return true;
}

/**
 * Get OTP info (for testing only - shows time remaining)
 * @param {string} email - User's email
 * @param {string} mobile - User's mobile number
 */
function getOTPInfo(email, mobile) {
  const normalizedEmail = email.toLowerCase().trim();
  const cleanMobile = mobile.replace(/\D/g, '');
  const otpKey = `${normalizedEmail}_${cleanMobile}`;

  const storedOTP = otpStore.get(otpKey);
  
  if (!storedOTP) {
    return null;
  }

  const timeRemaining = storedOTP.expiresAt - Date.now();
  const isExpired = timeRemaining <= 0;

  if (isExpired) {
    otpStore.delete(otpKey);
    return null;
  }

  return {
    email: storedOTP.email,
    mobile: cleanMobile.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'),
    attempts: storedOTP.attempts,
    expiresIn: Math.ceil(timeRemaining / 1000), // seconds
    createdAt: storedOTP.createdAt
  };
}

/**
 * Clear OTP for a user (admin or cleanup function)
 * @param {string} email - User's email
 * @param {string} mobile - User's mobile number
 */
function clearOTP(email, mobile) {
  const normalizedEmail = email.toLowerCase().trim();
  const cleanMobile = mobile.replace(/\D/g, '');
  const otpKey = `${normalizedEmail}_${cleanMobile}`;

  if (otpStore.has(otpKey)) {
    otpStore.delete(otpKey);
    console.log(`🗑️ OTP cleared for ${normalizedEmail}`);
    return true;
  }
  
  return false;
}

/**
 * Cleanup expired OTPs (should be called periodically)
 */
function cleanupExpiredOTPs() {
  let count = 0;
  const now = Date.now();

  for (const [key, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(key);
      count++;
    }
  }

  if (count > 0) {
    console.log(`🧹 Cleaned up ${count} expired OTPs`);
  }

  return count;
}

/**
 * Get OTP store statistics
 */
function getOTPStoreStats() {
  return {
    totalOTPs: otpStore.size,
    otps: Array.from(otpStore.entries()).map(([key, data]) => ({
      key,
      email: data.email,
      mobile: data.mobile.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'),
      attempts: data.attempts,
      expiresAt: new Date(data.expiresAt).toISOString(),
      createdAt: data.createdAt.toISOString()
    }))
  };
}

module.exports = {
  generateAndSendOTP,
  verifyOTP,
  isOTPPending,
  getOTPInfo,
  clearOTP,
  cleanupExpiredOTPs,
  getOTPStoreStats,
  validateFast2SMSConfig,
  // For testing only
  generateOTP,
  sendOTPViaSMS
};
