const nodemailer = require('nodemailer');

// In-memory OTP store for login email OTP flow
const otpStore = new Map();
const OTP_EXPIRY_MINUTES = 5;

// Create transporter for email service
const createTransporter = () => {
    const config = {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    };
    
    console.log('Creating transporter with config:', {
        service: config.service,
        host: config.host,
        port: config.port,
        user: config.auth.user,
        passSet: !!config.auth.pass
    });
    
    return nodemailer.createTransport(config);
};

/**
 * Send OTP email for signup verification
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} username - User's username
 * @returns {Promise} Email send result
 */
const sendSignupOTP = async (email, otp, username = 'User') => {
    try {
        console.log('Starting email send process...');
        console.log('Email config:', {
            service: 'gmail',
            user: process.env.EMAIL_USER,
            passLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
        });
        
        const transporter = createTransporter();
        
        console.log('Transporter created successfully');
        
        const mailOptions = {
            from: `"VOTE-LINK" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🗳️ VOTE-LINK — Verify Your Email to Register',
            html: `
<div style="font-family: Arial, Helvetica, sans-serif; background:#f4f7fb; padding:30px;">
  <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,.08)">

    <div style="background:#0f172a;padding:25px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:26px;">VOTE-LINK</h1>
      <p style="color:#93c5fd;margin-top:6px;font-size:14px;">
        Registration Verification
      </p>
    </div>

    <div style="padding:30px;color:#1f2933;">
      <h2 style="margin-top:0;">Hi ${username},</h2>

      <p>
        Thank you for registering on VOTE-LINK.
        Enter the OTP below to verify your email and complete registration:
      </p>

      <div style="background:#ecfeff;
                  border-radius:10px;
                  padding:20px;
                  text-align:center;
                  margin:25px 0;">
        <p style="margin:0;font-size:12px;letter-spacing:2px;color:#0284c7;">
          REGISTRATION OTP
        </p>
        <h1 style="margin:10px 0;font-size:42px;color:#0c4a6e;letter-spacing:8px;">
          ${otp}
        </h1>
        <p style="margin:0;font-size:13px;color:#6b7280;">
          Expires in 5 minutes
        </p>
      </div>

      <div style="background:#fee2e2;
                  border-left:4px solid #ef4444;
                  padding:12px;
                  font-size:13px;
                  color:#7f1d1d;">
        If this wasn't you, do NOT share this code and ignore this email.
      </div>
    </div>

    <div style="background:#f9fafb;text-align:center;padding:15px;font-size:12px;color:#6b7280;">
      \u00a9 ${new Date().getFullYear()} VOTE-LINK | Protected Access System
    </div>

  </div>
</div>
            `
        };
        
        console.log('Mail options prepared, attempting to send...');
        console.log('Sending to:', email);
        
        const result = await transporter.sendMail(mailOptions);
        console.log('Signup OTP email sent successfully:', result.messageId);
        return result;
        
    } catch (error) {
        console.error('Email send error details:', {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        });
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

/**
 * Send OTP email for signin verification
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} username - User's username
 * @returns {Promise} Email send result
 */
const sendSigninOTPEmail = async (email, otp, username = 'User') => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"VOTE-LINK" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔐 VOTE-LINK — Sign In Verification Code',
            html: `
<div style="font-family: Arial, Helvetica, sans-serif; background:#f4f7fb; padding:30px;">
  <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,.08)">

    <div style="background:#0f172a;padding:25px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:26px;">VOTE-LINK</h1>
      <p style="color:#93c5fd;margin-top:6px;font-size:14px;">
        Login Verification
      </p>
    </div>

    <div style="padding:30px;color:#1f2933;">
      <h2 style="margin-top:0;">Hi ${username},</h2>

      <p>
        We detected a login attempt on your VOTE-LINK account.
        Enter the OTP below to continue:
      </p>

      <div style="background:#ecfeff;
                  border-radius:10px;
                  padding:20px;
                  text-align:center;
                  margin:25px 0;">
        <p style="margin:0;font-size:12px;letter-spacing:2px;color:#0284c7;">
          LOGIN OTP
        </p>
        <h1 style="margin:10px 0;font-size:42px;color:#0c4a6e;letter-spacing:8px;">
          ${otp}
        </h1>
        <p style="margin:0;font-size:13px;color:#6b7280;">
          Expires in 5 minutes
        </p>
      </div>

      <div style="background:#fee2e2;
                  border-left:4px solid #ef4444;
                  padding:12px;
                  font-size:13px;
                  color:#7f1d1d;">
        If this wasn't you, do NOT share this code and secure your account immediately.
      </div>
    </div>

    <div style="background:#f9fafb;text-align:center;padding:15px;font-size:12px;color:#6b7280;">
      \u00a9 ${new Date().getFullYear()} VOTE-LINK | Protected Access System
    </div>

  </div>
</div>
            `
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('Signin OTP email sent successfully:', result.messageId);
        return result;
        
    } catch (error) {
        console.error('Error sending signin OTP email:', error);
        throw error;
    }
};

/**
 * Generate a random 6-digit OTP
 */
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate OTP and send it to the user's email (for login flow)
 * @param {string} email - Recipient email
 * @returns {Promise<object>} Result with email and expiry info
 */
const generateAndSendOTP = async (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    const otp = generateOTP();
    const otpExpiry = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

    // Store OTP in memory
    otpStore.set(normalizedEmail, {
        otp,
        expiresAt: otpExpiry,
        attempts: 0,
        createdAt: new Date()
    });

    // Send via email using the signin template
    await sendSigninOTPEmail(normalizedEmail, otp);

    console.log(`✅ Login OTP generated and sent for ${normalizedEmail}`);

    return {
        success: true,
        message: 'OTP sent successfully to your email',
        email: normalizedEmail,
        expiresIn: `${OTP_EXPIRY_MINUTES} minutes`
    };
};

/**
 * Verify OTP provided by user (for login flow)
 * @param {string} email - User's email
 * @param {string} userOTP - OTP provided by user
 * @returns {object} Verification result
 */
const verifyOTP = (email, userOTP) => {
    const normalizedEmail = email.toLowerCase().trim();
    const stored = otpStore.get(normalizedEmail);

    if (!stored) {
        return {
            success: false,
            error: 'OTP_NOT_FOUND',
            message: 'OTP not found or expired. Please request a new OTP.'
        };
    }

    if (Date.now() > stored.expiresAt) {
        otpStore.delete(normalizedEmail);
        return {
            success: false,
            error: 'OTP_EXPIRED',
            message: 'OTP has expired. Please request a new OTP.'
        };
    }

    if (stored.attempts >= 3) {
        otpStore.delete(normalizedEmail);
        return {
            success: false,
            error: 'TOO_MANY_ATTEMPTS',
            message: 'Too many failed attempts. Please request a new OTP.'
        };
    }

    if (userOTP.trim() !== stored.otp) {
        stored.attempts++;
        const attemptsRemaining = 3 - stored.attempts;
        return {
            success: false,
            error: 'INVALID_OTP',
            message: 'Invalid OTP. Please try again.',
            attemptsRemaining
        };
    }

    // OTP correct — clean up
    otpStore.delete(normalizedEmail);
    console.log(`✅ Login OTP verified for ${normalizedEmail}`);

    return {
        success: true,
        email: normalizedEmail,
        message: 'OTP verified successfully'
    };
};

module.exports = {
    sendSignupOTP,
    sendSigninOTPEmail,
    generateAndSendOTP,
    verifyOTP
};