/**
 * OTP Generator Utility
 * Provides functions to generate, verify, and manage OTPs.
 */

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 30;

/**
 * Generate a random numeric OTP
 * @returns {string} OTP string of OTP_LENGTH digits
 */
const generateOTP = () => {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

/**
 * Generate OTP expiry timestamp
 * @returns {Date} Expiry date (current time + OTP_EXPIRY_MINUTES)
 */
const generateOTPExpiry = () => {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};

/**
 * Verify an OTP against the stored OTP and expiry
 * @param {string} inputOTP - OTP provided by the user
 * @param {string} storedOTP - OTP stored in the database
 * @param {Date} storedExpiry - Expiry timestamp of the stored OTP
 * @returns {boolean} true if OTP is valid and not expired
 */
const verifyOTP = (inputOTP, storedOTP, storedExpiry) => {
  if (!inputOTP || !storedOTP || !storedExpiry) {
    return false;
  }

  // Check if OTP has expired
  if (new Date() > new Date(storedExpiry)) {
    return false;
  }

  // Compare OTPs (trim whitespace)
  return inputOTP.trim() === storedOTP.trim();
};

/**
 * Check if enough time has passed to allow resending OTP
 * @param {Date} lastSentTime - Timestamp of last OTP sent
 * @returns {boolean} true if cooldown period has passed
 */
const canResendOTP = (lastSentTime) => {
  if (!lastSentTime) {
    return true;
  }

  const timeSinceLastSent = Date.now() - new Date(lastSentTime).getTime();
  return timeSinceLastSent >= OTP_RESEND_COOLDOWN_SECONDS * 1000;
};

module.exports = {
  generateOTP,
  generateOTPExpiry,
  verifyOTP,
  canResendOTP,
};
