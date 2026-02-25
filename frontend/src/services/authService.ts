// Frontend authentication service for handling login/logout with session management

interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    email: string;
    expiresAt: string;
  };
  error?: string;
  details?: {
    sessionStartTime: string;
    lastActive: string;
    currentDevice: string;
    currentIP: string;
  };
  retryAfter?: string;
  blockedSince?: string;
  securityBreach?: boolean;
}

interface SessionResponse {
  success: boolean;
  data?: {
    email: string;
    sessionStartTime: string;
    lastActive: string;
    userAgent: string;
    ipAddress: string;
  };
  error?: string;
  message?: string;
}

interface LogoutResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class AuthService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5000/api';
    this.token = localStorage.getItem('votelink_session_token');
  }

  /**
   * Set authentication token
   * @param {string | null} token - Session token
   */
  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('votelink_session_token', token);
    } else {
      localStorage.removeItem('votelink_session_token');
    }
  }

  /**
   * Get authentication token
   * @returns {string|null} - Session token
   */
  getToken(): string | null {
    return this.token || localStorage.getItem('votelink_session_token');
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user has valid token
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Make authenticated API request
   * @param {string} endpoint - API endpoint
   * @param {RequestInit} options - Fetch options
   * @returns {Promise<Response>} - Fetch response
   */
  async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    return fetch(`${this.baseURL}${endpoint}`, mergedOptions);
  }

  /**
   * Login user with email and mobile
   * @param {string} email - User's email address
   * @param {string} mobile - User's mobile number
   * @returns {Promise<LoginResponse>} - Login response
   */
  async login(email: string, mobile: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
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
        // Store session token
        this.setToken(data.data.token);
        
        return {
          success: true,
          message: data.message,
          data: {
            email: data.data.email,
            expiresAt: data.data.expiresAt,
            token: data.data.token
          }
        };
      } else {
        // Handle various error cases
        if (response.status === 403) {
          // Check if it's a security breach
          if (data.error === 'SECURITY_BREACH') {
            return {
              success: false,
              error: 'SECURITY_BREACH',
              message: data.message || 'Security breach detected. Your account has been permanently blocked for online voting.',
              blockedSince: data.blockedSince
            };
          }
          // User has already voted - block login
          return {
            success: false,
            error: 'ALREADY_VOTED',
            message: data.message || 'This account has already been used to cast a vote. Each voter can only participate once.',
            details: data.votedAt ? { votedAt: data.votedAt } : null
          };
        } else if (response.status === 409) {
          // Duplicate login attempt
          return {
            success: false,
            error: 'DUPLICATE_LOGIN',
            message: data.message || 'This Gmail account is already logged in from another device.',
            details: data.details || null
          };
        } else if (response.status === 429) {
          // Rate limit exceeded
          return {
            success: false,
            error: 'RATE_LIMITED',
            message: data.message || 'Too many login attempts. Please try again later.',
            retryAfter: data.retryAfter || '15 minutes'
          };
        } else if (response.status === 400) {
          // Validation error
          return {
            success: false,
            error: 'VALIDATION_ERROR',
            message: data.error || 'Invalid email or mobile number format.'
          };
        } else {
          // Other errors
          return {
            success: false,
            error: 'LOGIN_FAILED',
            message: data.error || 'Login failed. Please try again.'
          };
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('API URL:', this.baseURL);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: `Unable to connect to server at ${this.baseURL}\n\nError: ${errorMessage}\n\nPlease check:\n1. Backend server is running\n2. Same WiFi network\n3. Correct IP address`
      };
    }
  }

  /**
   * Logout user and terminate session
   * @returns {Promise<LogoutResponse>} - Logout response
   */
  async logout(): Promise<LogoutResponse> {
    try {
      const response = await this.makeAuthenticatedRequest('/auth/logout', {
        method: 'POST'
      });

      const data = await response.json();

      // Clear token regardless of response
      this.setToken(null);

      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message || 'Logout successful'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Logout failed',
          message: data.error || 'An error occurred during logout'
        };
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Clear token even if request fails
      this.setToken(null);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to server, but you have been logged out locally.'
      };
    }
  }

  /**
   * Check current session status
   * @returns {Promise<SessionResponse>} - Session status response
   */
  async checkSession(): Promise<SessionResponse> {
    try {
      const response = await this.makeAuthenticatedRequest('/auth/session');
      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          data: data.data
        };
      } else if (response.status === 401) {
        // Session expired or invalid
        this.setToken(null);
        return {
          success: false,
          error: 'SESSION_EXPIRED',
          message: 'Your session has expired. Please login again.'
        };
      } else {
        return {
          success: false,
          error: 'SESSION_CHECK_FAILED',
          message: data.error || 'Unable to verify session'
        };
      }
    } catch (error) {
      console.error('Session check error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to verify session status'
      };
    }
  }

  /**
   * Force logout from all devices for given email
   * @param {string} email - User's email address
   * @returns {Promise<LogoutResponse>} - Force logout response
   */
  async forceLogout(email: string): Promise<LogoutResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/force-logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message || 'All sessions terminated successfully'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Force logout failed',
          message: data.error || 'Unable to terminate sessions'
        };
      }
    } catch (error) {
      console.error('Force logout error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to server'
      };
    }
  }

  /**
   * Send Email OTP for login
   * @param {string} email - User's email address
   * @returns {Promise<LoginResponse>} - Send OTP response
   */
  async sendEmailOTP(email: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/send-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message,
          data: {
            email: data.data.email,
            token: data.data.sessionId || '',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
          }
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to send email OTP',
          message: data.error || 'Unable to send OTP to email'
        };
      }
    } catch (error) {
      console.error('Send email OTP error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to server'
      };
    }
  }

  /**
   * Send Email Verification OTP for signup/registration
   * @param {string} email - User's email address
   * @param {string} username - User's chosen username
   * @returns {Promise<LoginResponse>} - Send OTP response
   */
  async sendSignupVerificationOTP(email: string, username: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/send-verification-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message || 'OTP sent to your email',
          data: {
            email: data.data?.email || email,
            token: '',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
          }
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to send verification OTP',
          message: data.message || data.error || 'Unable to send OTP'
        };
      }
    } catch (error) {
      console.error('Send signup verification OTP error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to server'
      };
    }
  }

  /**
   * Verify Email OTP and complete registration
   * @param {object} params - Registration data with OTP
   * @returns {Promise<LoginResponse>} - Verification + registration response
   */
  async verifySignupOTP(params: {
    email: string;
    otp: string;
    username: string;
    password: string;
    name?: string;
    fullname?: string;
    phone?: string;
  }): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: params.email.trim(),
          otp: params.otp.trim(),
          username: params.username.trim(),
          password: params.password,
          name: params.name || params.username,
          fullname: params.fullname || params.name || params.username,
          phone: params.phone
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store tokens from registration
        if (data.data?.accessToken) {
          this.setToken(data.data.accessToken);
        }

        return {
          success: true,
          message: data.message || 'Registration completed successfully!',
          data: {
            email: data.data?.user?.email || params.email,
            token: data.data?.accessToken || '',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        };
      } else {
        return {
          success: false,
          error: data.error || 'Verification failed',
          message: data.message || data.error || 'OTP verification failed'
        };
      }
    } catch (error) {
      console.error('Verify signup OTP error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to server'
      };
    }
  }

  /**
   * Resend signup verification OTP
   * @param {string} email - User's email address
   * @param {string} username - User's username
   * @returns {Promise<LoginResponse>} - Resend response
   */
  async resendSignupVerificationOTP(email: string, username?: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/resend-verification-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          username: username?.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message || 'OTP resent to your email'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to resend OTP',
          message: data.message || data.error || 'Unable to resend OTP'
        };
      }
    } catch (error) {
      console.error('Resend signup verification OTP error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to server'
      };
    }
  }

  /**
   * Verify Email OTP for login
   * @param {string} email - User's email address
   * @param {string} otp - OTP code
   * @returns {Promise<LoginResponse>} - Verification response
   */
  async verifyEmailOTP(email: string, otp: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/verify-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store session token
        if (data.data?.token) {
          this.setToken(data.data.token);
        }

        return {
          success: true,
          message: data.message || 'Email verified successfully',
          data: {
            email: data.data?.email || email,
            token: data.data?.token || '',
            expiresAt: data.data?.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        };
      } else if (response.status === 400) {
        return {
          success: false,
          error: 'INVALID_OTP',
          message: data.error || 'Invalid or expired OTP'
        };
      } else {
        return {
          success: false,
          error: 'VERIFICATION_FAILED',
          message: data.error || 'OTP verification failed'
        };
      }
    } catch (error) {
      console.error('Verify email OTP error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to verify OTP'
      };
    }
  }

  /**
   * Resend Email OTP
   * @param {string} email - User's email address
   * @returns {Promise<LoginResponse>} - Resend response
   */
  async resendEmailOTP(email: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/resend-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message || 'OTP resent to your email'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to resend OTP',
          message: data.error || 'Unable to resend OTP'
        };
      }
    } catch (error) {
      console.error('Resend email OTP error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to server'
      };
    }
  }

  /**
   * Get user info from current session
   * @returns {object|null} - User info or null if not authenticated
   */
  getCurrentUser(): { isAuthenticated: boolean; token: string } | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      // In a real app, you might decode JWT token here
      // For now, we'll return basic info
      return {
        isAuthenticated: true,
        token: token
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      this.setToken(null);
      return null;
    }
  }

  /**
   * Initialize auth service - check if user has valid session
   * @returns {Promise<boolean>} - True if user has valid session
   */
  async initialize(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    const sessionCheck = await this.checkSession();
    return sessionCheck.success;
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;