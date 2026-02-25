// Session management service for preventing duplicate logins
const crypto = require('crypto');

class SessionService {
  constructor() {
    // In-memory session store (use Redis in production)
    this.activeSessions = new Map();
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Generate a unique session token
   */
  generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Check if user already has an active session
   * @param {string} email - User's email address
   * @returns {boolean} - True if user has active session
   */
  hasActiveSession(email) {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if session exists and is not expired
    if (this.activeSessions.has(normalizedEmail)) {
      const session = this.activeSessions.get(normalizedEmail);
      
      // Check if session is expired
      if (Date.now() - session.createdAt > this.sessionTimeout) {
        this.activeSessions.delete(normalizedEmail);
        return false;
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Create a new session for user
   * @param {string} email - User's email address
   * @param {string} userAgent - User's browser/device info
   * @param {string} ipAddress - User's IP address
   * @returns {object} - Session object with token
   */
  createSession(email, userAgent = '', ipAddress = '') {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Clear any existing session for this user (allow re-login)
    if (this.hasActiveSession(normalizedEmail)) {
      console.log(`🔄 Clearing existing session for ${normalizedEmail}`);
      this.activeSessions.delete(normalizedEmail);
    }

    const sessionToken = this.generateSessionToken();
    const sessionData = {
      token: sessionToken,
      email: normalizedEmail,
      createdAt: Date.now(),
      lastActive: Date.now(),
      userAgent,
      ipAddress,
      isActive: true
    };

    // Store session
    this.activeSessions.set(normalizedEmail, sessionData);
    console.log(`✅ New session created for ${normalizedEmail}`);

    return {
      token: sessionToken,
      email: normalizedEmail,
      expiresAt: new Date(Date.now() + this.sessionTimeout)
    };
  }

  /**
   * Validate session token
   * @param {string} token - Session token to validate
   * @returns {object|null} - Session data if valid, null otherwise
   */
  validateSession(token) {
    for (const [email, session] of this.activeSessions) {
      if (session.token === token && session.isActive) {
        // Check expiry
        if (Date.now() - session.createdAt > this.sessionTimeout) {
          this.activeSessions.delete(email);
          return null;
        }

        // Update last active time
        session.lastActive = Date.now();
        return session;
      }
    }
    return null;
  }

  /**
   * End user session
   * @param {string} email - User's email address
   * @returns {boolean} - True if session was terminated
   */
  terminateSession(email) {
    const normalizedEmail = email.toLowerCase().trim();
    return this.activeSessions.delete(normalizedEmail);
  }

  /**
   * End session by token
   * @param {string} token - Session token
   * @returns {boolean} - True if session was terminated
   */
  terminateSessionByToken(token) {
    for (const [email, session] of this.activeSessions) {
      if (session.token === token) {
        this.activeSessions.delete(email);
        return true;
      }
    }
    return false;
  }

  /**
   * Get active session info for user
   * @param {string} email - User's email address
   * @returns {object|null} - Session info or null
   */
  getSessionInfo(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const session = this.activeSessions.get(normalizedEmail);
    
    if (!session) return null;
    
    // Check expiry
    if (Date.now() - session.createdAt > this.sessionTimeout) {
      this.activeSessions.delete(normalizedEmail);
      return null;
    }
    
    return {
      email: session.email,
      createdAt: new Date(session.createdAt),
      lastActive: new Date(session.lastActive),
      userAgent: session.userAgent,
      ipAddress: session.ipAddress
    };
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    for (const [email, session] of this.activeSessions) {
      if (now - session.createdAt > this.sessionTimeout) {
        this.activeSessions.delete(email);
      }
    }
  }

  /**
   * Get all active sessions (admin only)
   * @returns {Array} - Array of active sessions
   */
  getAllActiveSessions() {
    const activeSessions = [];
    const now = Date.now();
    
    for (const [email, session] of this.activeSessions) {
      if (now - session.createdAt <= this.sessionTimeout) {
        activeSessions.push({
          email: session.email,
          createdAt: new Date(session.createdAt),
          lastActive: new Date(session.lastActive),
          userAgent: session.userAgent,
          ipAddress: session.ipAddress
        });
      }
    }
    
    return activeSessions;
  }

  /**
   * Force logout all users (admin function)
   */
  forceLogoutAll() {
    this.activeSessions.clear();
    return true;
  }
}

// Export singleton instance
const sessionService = new SessionService();

// Clean up expired sessions every hour
setInterval(() => {
  sessionService.cleanupExpiredSessions();
}, 60 * 60 * 1000);

module.exports = sessionService;