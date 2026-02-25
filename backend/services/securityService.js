/**
 * Security Service
 * Provides security monitoring, metrics, and breach management functionality
 */

const { User, AuditLog } = require('../models');

class SecurityService {
  constructor() {
    // Cache for metrics (refresh every 30 seconds)
    this.metricsCache = null;
    this.lastMetricsUpdate = 0;
    this.CACHE_TTL = 30000; // 30 seconds
  }

  /**
   * Get real-time security metrics from database
   */
  async getSecurityMetrics() {
    const now = Date.now();
    
    // Return cached metrics if still valid
    if (this.metricsCache && (now - this.lastMetricsUpdate) < this.CACHE_TTL) {
      return this.metricsCache;
    }

    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      // Get various metrics from audit logs
      const [
        totalUsers,
        verifiedUsers,
        breachedAccounts,
        failedLogins24h,
        suspiciousActivities24h,
        recentLogins
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isVerified: true }),
        User.countDocuments({ 'securityBreach.detected': true }),
        AuditLog.countDocuments({ 
          action: 'login',
          status: 'failure',
          timestamp: { $gte: twentyFourHoursAgo }
        }),
        AuditLog.countDocuments({
          action: 'suspicious_activity',
          timestamp: { $gte: twentyFourHoursAgo }
        }),
        AuditLog.countDocuments({
          action: 'login',
          status: 'success',
          timestamp: { $gte: oneHourAgo }
        })
      ]);

      // Calculate derived metrics
      const threatsBlocked = breachedAccounts + suspiciousActivities24h + Math.floor(failedLogins24h / 3);
      const systemIntegrity = totalUsers > 0 
        ? Math.min(100, 100 - (breachedAccounts / totalUsers * 100))
        : 100;

      this.metricsCache = {
        threatsBlocked,
        activeUsers: recentLogins,
        failedLogins: failedLogins24h,
        systemIntegrity: parseFloat(systemIntegrity.toFixed(1)),
        blockchainHealth: 99.9, // Would come from blockchain service
        dataEncryption: 100 // All data is encrypted
      };

      this.lastMetricsUpdate = now;
      return this.metricsCache;
    } catch (error) {
      console.error('Error getting security metrics:', error);
      // Return default values on error
      return {
        threatsBlocked: 0,
        activeUsers: 0,
        failedLogins: 0,
        systemIntegrity: 100,
        blockchainHealth: 99.9,
        dataEncryption: 100
      };
    }
  }

  /**
   * Get security events from audit logs
   */
  async getSecurityEvents(limit = 50, severity = null) {
    try {
      const filter = {
        action: { $in: ['login', 'suspicious_activity', 'security_breach', 'registration_blocked'] }
      };

      const logs = await AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .limit(limit);

      return logs.map(log => ({
        id: log._id.toString(),
        timestamp: log.timestamp,
        type: this.mapActionToEventType(log.action, log.status),
        severity: this.determineSeverity(log),
        user: log.userEmail || 'system',
        ip: log.ipAddress || 'unknown',
        location: 'India', // Would need IP geolocation service
        device: log.deviceInfo || 'Unknown Device',
        description: this.getEventDescription(log),
        status: log.status === 'failure' ? 'investigating' : 'resolved'
      }));
    } catch (error) {
      console.error('Error getting security events:', error);
      return [];
    }
  }

  mapActionToEventType(action, status) {
    if (action === 'login' && status === 'success') return 'login';
    if (action === 'login' && status === 'failure') return 'failed_login';
    if (action === 'suspicious_activity') return 'threat_detected';
    if (action === 'security_breach') return 'threat_detected';
    if (action === 'registration_blocked') return 'threat_detected';
    return 'system_change';
  }

  determineSeverity(log) {
    if (log.action === 'security_breach') return 'critical';
    if (log.action === 'suspicious_activity') return 'high';
    if (log.action === 'registration_blocked') return 'high';
    if (log.action === 'login' && log.status === 'failure') return 'medium';
    return 'low';
  }

  getEventDescription(log) {
    switch (log.action) {
      case 'login':
        return log.status === 'success' 
          ? `User ${log.userEmail} logged in successfully`
          : `Failed login attempt for ${log.userEmail}`;
      case 'suspicious_activity':
        return log.details?.reason || 'Suspicious activity detected';
      case 'security_breach':
        return log.details?.reason || 'Security breach detected';
      case 'registration_blocked':
        return log.details?.reason || 'Registration attempt blocked';
      default:
        return log.errorMessage || 'Security event occurred';
    }
  }

  /**
   * Flag user account as security breach
   */
  async flagSecurityBreach(email, reason, details = {}) {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      const user = await User.findOneAndUpdate(
        { email: normalizedEmail },
        {
          $set: {
            'securityBreach.detected': true,
            'securityBreach.reason': reason,
            'securityBreach.detectedAt': new Date(),
            'securityBreach.details': details
          }
        },
        { new: true }
      );

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Log the breach
      await AuditLog.create({
        action: 'security_breach',
        userEmail: normalizedEmail,
        voterID: user.voterID,
        details: { reason, ...details },
        status: 'success'
      });

      // Invalidate metrics cache
      this.metricsCache = null;

      return { 
        success: true, 
        message: 'Security breach flagged',
        user 
      };
    } catch (error) {
      console.error('Error flagging security breach:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if account is breached
   */
  async isAccountBreached(email) {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: normalizedEmail });
      return user?.securityBreach?.detected === true;
    } catch (error) {
      console.error('Error checking breach status:', error);
      return false;
    }
  }

  /**
   * Get breach info for a user
   */
  async getBreachInfo(email) {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const user = await User.findOne(
        { email: normalizedEmail },
        { securityBreach: 1 }
      );
      return user?.securityBreach || null;
    } catch (error) {
      console.error('Error getting breach info:', error);
      return null;
    }
  }

  /**
   * Clear security breach flag
   */
  async clearSecurityBreach(email, reason = 'Admin override') {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      const user = await User.findOneAndUpdate(
        { email: normalizedEmail },
        {
          $set: {
            'securityBreach.detected': false,
            'securityBreach.clearedAt': new Date(),
            'securityBreach.clearedReason': reason
          }
        },
        { new: true }
      );

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Log the clearance
      await AuditLog.create({
        action: 'admin_action',
        userEmail: normalizedEmail,
        details: { action: 'clear_security_breach', reason },
        status: 'success'
      });

      // Invalidate metrics cache
      this.metricsCache = null;

      return { 
        success: true, 
        message: 'Security breach cleared',
        user 
      };
    } catch (error) {
      console.error('Error clearing security breach:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Detect potential threats based on patterns
   */
  async detectThreats(email, ipAddress, userAgent, attemptCount = 1) {
    const threats = [];

    try {
      // Check for multiple failed attempts
      if (attemptCount >= 3) {
        threats.push({
          type: 'brute_force',
          severity: attemptCount >= 5 ? 'high' : 'medium',
          description: `Multiple failed login attempts (${attemptCount})`
        });
      }

      // Check if IP has multiple failed logins for different accounts
      const ipFailedAttempts = await AuditLog.countDocuments({
        ipAddress,
        action: 'login',
        status: 'failure',
        timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
      });

      if (ipFailedAttempts >= 5) {
        threats.push({
          type: 'ip_suspicious',
          severity: 'high',
          description: `IP ${ipAddress} has ${ipFailedAttempts} failed login attempts in the last hour`
        });
      }

      // Check if account is already breached
      if (email) {
        const isBreached = await this.isAccountBreached(email);
        if (isBreached) {
          threats.push({
            type: 'breached_account',
            severity: 'critical',
            description: 'Account has been flagged for security breach'
          });
        }
      }

      return threats;
    } catch (error) {
      console.error('Error detecting threats:', error);
      return threats;
    }
  }
}

// Export singleton instance
module.exports = new SecurityService();
