// Fast2SMS-based OTP Service for VoteLink
// Uses backend endpoint to send OTP via Fast2SMS service

export interface OTPResponse {
  success: boolean;
  message: string;
  otpId?: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  uid?: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export class OTPService {
  private otpId: string | null = null;
  private otpAttempts: number = 0;
  private maxOtpAttempts: number = 5;
  private lastOtpRequestTime: number = 0;
  private otpResendCooldown: number = 30000; // 30 seconds
  private isOtpSending: boolean = false;
  private userEmail: string = '';
  private userMobile: string = '';

  // Send OTP to mobile using backend Fast2SMS service
  async sendSMSOTP(email: string, mobile: string): Promise<OTPResponse> {
    if (this.isOtpSending) {
      return {
        success: false,
        message: 'OTP request already in progress. Please wait.'
      };
    }

    this.isOtpSending = true;
    
    try {
      if (!email || !mobile) {
        return {
          success: false,
          message: 'Email and mobile number are required'
        };
      }

      const response = await fetch(`${BACKEND_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          mobile: mobile.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.otpId = data.data?.email || 'otp-' + Date.now();
        this.userEmail = email.trim();
        this.userMobile = mobile.trim();
        this.otpAttempts = 0;
        this.lastOtpRequestTime = Date.now();
        
        return {
          success: true,
          message: data.message || 'OTP sent to your mobile number',
          otpId: this.otpId
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to send OTP'
        };
      }
    } catch (error: unknown) {
      console.error('Error sending OTP:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      
      return {
        success: false,
        message: `Failed to send OTP: ${errorMessage}`
      };
    } finally {
      this.isOtpSending = false;
    }
  }

  // Resend OTP with cooldown check
  async resendOTP(email: string, mobile: string): Promise<OTPResponse> {
    const timeSinceLastRequest = Date.now() - this.lastOtpRequestTime;
    if (this.lastOtpRequestTime > 0 && timeSinceLastRequest < this.otpResendCooldown) {
      const secondsRemaining = Math.ceil((this.otpResendCooldown - timeSinceLastRequest) / 1000);
      return {
        success: false,
        message: `Please wait ${secondsRemaining} seconds before requesting a new OTP`
      };
    }

    return this.sendSMSOTP(email, mobile);
  }

  // Verify OTP using backend service
  async verifyOTP(enteredOTP: string): Promise<VerifyOTPResponse> {
    try {
      this.otpAttempts++;

      if (this.otpAttempts > this.maxOtpAttempts) {
        return {
          success: false,
          message: `Too many verification attempts. Please request a new OTP.`
        };
      }

      if (!this.userEmail) {
        return {
          success: false,
          message: 'No active OTP session. Please request OTP first.'
        };
      }

      // Validate OTP format
      if (!enteredOTP || enteredOTP.length !== 6 || !/^\d{6}$/.test(enteredOTP)) {
        return {
          success: false,
          message: 'OTP must be 6 digits'
        };
      }

      const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.userEmail,
          mobile: this.userMobile,
          otp: enteredOTP.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.cleanup();
        return {
          success: true,
          message: 'OTP verified successfully',
          uid: data.data?.uid || 'user-' + Date.now()
        };
      } else {
        return {
          success: false,
          message: data.message || 'Invalid OTP'
        };
      }
    } catch (error: unknown) {
      console.error('Error verifying OTP:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to verify OTP: ${errorMessage}`
      };
    }
  }

  // Cleanup method
  cleanup(): void {
    this.otpId = null;
    this.userEmail = '';
    this.userMobile = '';
    this.otpAttempts = 0;
    localStorage.removeItem('tempEmail');
  }
}

// Export singleton instance
export const otpService = new OTPService();
