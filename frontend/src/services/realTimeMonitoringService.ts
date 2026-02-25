/**
 * Real-time Monitoring and Audit Trail System
 * Provides live vote tracking, fraud detection, and comprehensive audit capabilities
 */

import { advancedSecurityService } from './advancedSecurityService';

export interface VoteEvent {
  id: string;
  eventType: 'vote_cast' | 'voter_registered' | 'fraud_detected' | 'security_breach' | 'system_alert';
  userId: string;
  voterHash: string;
  partyHash?: string;
  blockchainTxHash?: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    region: string;
  };
  deviceInfo: {
    fingerprint: string;
    userAgent: string;
    ipAddress: string;
  };
  securityScore: number;
  metadata: Record<string, unknown>;
}

export interface AuditLogEntry {
  id: string;
  eventId: string;
  action: string;
  userId: string;
  timestamp: number;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  verified: boolean;
}

export interface FraudAlert {
  id: string;
  type: 'duplicate_vote' | 'suspicious_pattern' | 'device_anomaly' | 'location_mismatch' | 'time_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  description: string;
  evidence: Record<string, unknown>;
  timestamp: number;
  resolved: boolean;
  investigatorId?: string;
}

export interface SystemMetrics {
  totalVotesCast: number;
  votersRegistered: number;
  onlineUsers: number;
  fraudAlertsActive: number;
  systemLoad: number;
  avgResponseTime: number;
  errorRate: number;
  blockchainSyncStatus: 'synced' | 'syncing' | 'error';
  lastBlockNumber: number;
}

export interface RealTimeStats {
  votesPerMinute: number;
  regionalBreakdown: Array<{
    region: string;
    voteCount: number;
    percentage: number;
  }>;
  partyPerformance: Array<{
    partyId: string;
    voteCount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  timeSeriesData: Array<{
    timestamp: number;
    voteCount: number;
    cumulativeVotes: number;
  }>;
}

class RealTimeMonitoringService {
  private eventListeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private auditBuffer: AuditLogEntry[] = [];
  private metricsCache: SystemMetrics | null = null;
  private realTimeStatsCache: RealTimeStats | null = null;
  private fraudDetectionEngine: FraudDetectionEngine;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private blockchainMonitor: BlockchainMonitor;

  constructor() {
    this.fraudDetectionEngine = new FraudDetectionEngine();
    this.blockchainMonitor = new BlockchainMonitor();
    this.startMonitoring();
  }

  /**
   * Start real-time monitoring
   */
  private startMonitoring(): void {
    // Start metrics collection
    this.monitoringInterval = setInterval(() => {
      this.updateSystemMetrics();
      this.updateRealTimeStats();
      this.flushAuditBuffer();
    }, 5000); // Update every 5 seconds

    // Start blockchain monitoring
    this.blockchainMonitor.start();

    // Set up Supabase real-time subscriptions
    this.setupRealtimeSubscriptions();
  }

  /**
   * Set up Supabase real-time subscriptions
   */
  private setupRealtimeSubscriptions(): void {
    // Subscribe to vote events
    supabase
      .channel('vote-events')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'vote_events' },
        (payload) => {
          this.handleVoteEvent(payload.new as VoteEvent);
        }
      )
      .subscribe();

    // Subscribe to fraud alerts
    supabase
      .channel('fraud-alerts')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'fraud_alerts' },
        (payload) => {
          this.handleFraudAlert(payload.new as FraudAlert);
        }
      )
      .subscribe();
  }

  /**
   * Log a vote event
   */
  async logVoteEvent(
    eventType: VoteEvent['eventType'],
    userId: string,
    voterHash: string,
    partyHash?: string,
    blockchainTxHash?: string,
    metadata: Record<string, unknown> = {}
  ): Promise<string> {
    try {
      // Get device and location info
      const deviceFingerprint = await advancedSecurityService.generateDeviceFingerprint();
      const location = await this.getCurrentLocation();
      const securityScore = advancedSecurityService.calculateRiskScore(userId);

      const voteEvent: Omit<VoteEvent, 'id'> = {
        eventType,
        userId,
        voterHash,
        partyHash,
        blockchainTxHash,
        timestamp: Date.now(),
        location,
        deviceInfo: {
          fingerprint: deviceFingerprint.id,
          userAgent: navigator.userAgent,
          ipAddress: await this.getClientIP()
        },
        securityScore,
        metadata
      };

      // Store in database
      const { data, error } = await supabase
        .from('vote_events')
        .insert(voteEvent)
        .select('id')
        .single();

      if (error) throw error;

      const eventId = data.id;

      // Create audit log entry
      await this.createAuditLogEntry(eventId, 'vote_event_logged', userId, {
        eventType,
        voterHash,
        partyHash,
        securityScore
      });

      // Run fraud detection
      await this.fraudDetectionEngine.analyzeEvent({ id: eventId, ...voteEvent });

      // Emit real-time event
      this.emit('voteEvent', { id: eventId, ...voteEvent });

      return eventId;
    } catch (error) {
      console.error('Failed to log vote event:', error);
      throw new Error('Failed to log vote event');
    }
  }

  /**
   * Create audit log entry
   */
  async createAuditLogEntry(
    eventId: string,
    action: string,
    userId: string,
    details: Record<string, unknown>
  ): Promise<void> {
    const auditEntry: Omit<AuditLogEntry, 'id'> = {
      eventId,
      action,
      userId,
      timestamp: Date.now(),
      details,
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      verified: false
    };

    // Add to buffer for batch processing
    this.auditBuffer.push({ id: '', ...auditEntry });

    // If buffer is full, flush immediately
    if (this.auditBuffer.length >= 10) {
      await this.flushAuditBuffer();
    }
  }

  /**
   * Flush audit buffer to database
   */
  private async flushAuditBuffer(): Promise<void> {
    if (this.auditBuffer.length === 0) return;

    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert(this.auditBuffer);

      if (error) throw error;

      this.auditBuffer = [];
    } catch (error) {
      console.error('Failed to flush audit buffer:', error);
    }
  }

  /**
   * Get current location (if permitted)
   */
  private async getCurrentLocation(): Promise<VoteEvent['location'] | undefined> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            region: 'unknown' // Would be determined by reverse geocoding
          });
        },
        () => {
          resolve(undefined);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    });
  }

  /**
   * Get client IP address
   */
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Update system metrics
   */
  private async updateSystemMetrics(): Promise<void> {
    try {
      // Get metrics from database
      const [votesResult, votersResult, fraudAlertsResult] = await Promise.all([
        supabase.from('vote_events').select('id', { count: 'exact' }),
        supabase.from('voters').select('id', { count: 'exact' }),
        supabase.from('fraud_alerts').select('id', { count: 'exact' }).eq('resolved', false)
      ]);

      const metrics: SystemMetrics = {
        totalVotesCast: votesResult.count || 0,
        votersRegistered: votersResult.count || 0,
        onlineUsers: await this.getOnlineUsersCount(),
        fraudAlertsActive: fraudAlertsResult.count || 0,
        systemLoad: await this.getSystemLoad(),
        avgResponseTime: await this.getAverageResponseTime(),
        errorRate: await this.getErrorRate(),
        blockchainSyncStatus: this.blockchainMonitor.getSyncStatus(),
        lastBlockNumber: await this.blockchainMonitor.getLastBlockNumber()
      };

      this.metricsCache = metrics;
      this.emit('metricsUpdate', metrics);
    } catch (error) {
      console.error('Failed to update system metrics:', error);
    }
  }

  /**
   * Update real-time statistics
   */
  private async updateRealTimeStats(): Promise<void> {
    try {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;

      // Get votes per minute
      const { count: votesPerMinute } = await supabase
        .from('vote_events')
        .select('id', { count: 'exact' })
        .eq('eventType', 'vote_cast')
        .gte('timestamp', oneMinuteAgo);

      // Get regional breakdown
      const { data: regionalData } = await supabase
        .from('vote_events')
        .select('location->region, count(*)')
        .eq('eventType', 'vote_cast')
        .not('location', 'is', null);

      // Get party performance
      const { data: partyData } = await supabase
        .from('vote_events')
        .select('partyHash, count(*)')
        .eq('eventType', 'vote_cast')
        .not('partyHash', 'is', null);

      // Get time series data (last 24 hours)
      const { data: timeSeriesData } = await supabase
        .from('vote_events')
        .select('timestamp')
        .eq('eventType', 'vote_cast')
        .gte('timestamp', now - 86400000)
        .order('timestamp');

      const stats: RealTimeStats = {
        votesPerMinute: votesPerMinute || 0,
        regionalBreakdown: this.processRegionalData(regionalData || []),
        partyPerformance: this.processPartyData(partyData || []),
        timeSeriesData: this.processTimeSeriesData(timeSeriesData || [])
      };

      this.realTimeStatsCache = stats;
      this.emit('statsUpdate', stats);
    } catch (error) {
      console.error('Failed to update real-time stats:', error);
    }
  }

  /**
   * Handle incoming vote event
   */
  private handleVoteEvent(voteEvent: VoteEvent): void {
    // Emit to listeners
    this.emit('newVoteEvent', voteEvent);

    // Update cached stats
    this.updateRealTimeStats();
  }

  /**
   * Handle fraud alert
   */
  private handleFraudAlert(fraudAlert: FraudAlert): void {
    // Emit to listeners
    this.emit('fraudAlert', fraudAlert);

    // Update metrics
    this.updateSystemMetrics();

    // Log security event
    advancedSecurityService.logSecurityEvent('suspicious_activity', {
      fraudAlertId: fraudAlert.id,
      type: fraudAlert.type,
      severity: fraudAlert.severity,
      description: fraudAlert.description
    }, fraudAlert.userId);
  }

  /**
   * Process regional data
   */
  private processRegionalData(data: unknown[]): RealTimeStats['regionalBreakdown'] {
    // Simplified processing - would be more complex in real implementation
    return data.map((item: any, index) => ({
      region: item.region || `Region ${index + 1}`,
      voteCount: item.count || 0,
      percentage: 0 // Would calculate based on total votes
    }));
  }

  /**
   * Process party data
   */
  private processPartyData(data: unknown[]): RealTimeStats['partyPerformance'] {
    // Simplified processing
    return data.map((item: any, index) => ({
      partyId: item.partyHash || `Party ${index + 1}`,
      voteCount: item.count || 0,
      percentage: 0, // Would calculate based on total votes
      trend: 'stable' as const
    }));
  }

  /**
   * Process time series data
   */
  private processTimeSeriesData(data: unknown[]): RealTimeStats['timeSeriesData'] {
    // Group by hour and count votes
    const hourlyData = new Map<number, number>();
    let cumulativeVotes = 0;

    (data as { timestamp: number }[]).forEach(item => {
      const hour = Math.floor(item.timestamp / 3600000) * 3600000;
      hourlyData.set(hour, (hourlyData.get(hour) || 0) + 1);
    });

    return Array.from(hourlyData.entries()).map(([timestamp, voteCount]) => {
      cumulativeVotes += voteCount;
      return {
        timestamp,
        voteCount,
        cumulativeVotes
      };
    });
  }

  /**
   * Get online users count
   */
  private async getOnlineUsersCount(): Promise<number> {
    // Simplified - would track active sessions
    return Math.floor(Math.random() * 100) + 50;
  }

  /**
   * Get system load
   */
  private async getSystemLoad(): Promise<number> {
    // Simplified - would measure actual system performance
    return Math.random() * 100;
  }

  /**
   * Get average response time
   */
  private async getAverageResponseTime(): Promise<number> {
    // Simplified - would track API response times
    return Math.random() * 500 + 100;
  }

  /**
   * Get error rate
   */
  private async getErrorRate(): Promise<number> {
    // Simplified - would track actual error rates
    return Math.random() * 5;
  }

  /**
   * Event emitter functionality
   */
  on(event: string, callback: (data: unknown) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: unknown) => void): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: unknown): void {
    this.eventListeners.get(event)?.forEach(callback => callback(data));
  }

  /**
   * Get current metrics
   */
  getSystemMetrics(): SystemMetrics | null {
    return this.metricsCache;
  }

  /**
   * Get current real-time stats
   */
  getRealTimeStats(): RealTimeStats | null {
    return this.realTimeStatsCache;
  }

  /**
   * Get audit trail for user
   */
  async getAuditTrail(userId: string, limit = 50): Promise<AuditLogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('userId', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get audit trail:', error);
      return [];
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.blockchainMonitor.stop();
    this.eventListeners.clear();
  }
}

/**
 * Fraud Detection Engine
 */
class FraudDetectionEngine {
  private patterns: Map<string, unknown[]> = new Map();

  async analyzeEvent(voteEvent: VoteEvent): Promise<void> {
    const alerts: Omit<FraudAlert, 'id'>[] = [];

    // Check for duplicate votes
    if (await this.checkDuplicateVote(voteEvent)) {
      alerts.push(this.createFraudAlert('duplicate_vote', 'critical', voteEvent.userId, 
        'Duplicate vote attempt detected', { voteEvent }));
    }

    // Check for suspicious patterns
    if (await this.checkSuspiciousPattern(voteEvent)) {
      alerts.push(this.createFraudAlert('suspicious_pattern', 'high', voteEvent.userId,
        'Suspicious voting pattern detected', { voteEvent }));
    }

    // Check device anomalies
    if (this.checkDeviceAnomaly(voteEvent)) {
      alerts.push(this.createFraudAlert('device_anomaly', 'medium', voteEvent.userId,
        'Device anomaly detected', { voteEvent }));
    }

    // Store alerts
    for (const alert of alerts) {
      await this.storeFraudAlert(alert);
    }
  }

  private async checkDuplicateVote(voteEvent: VoteEvent): Promise<boolean> {
    const { count } = await supabase
      .from('vote_events')
      .select('id', { count: 'exact' })
      .eq('voterHash', voteEvent.voterHash)
      .eq('eventType', 'vote_cast');

    return (count || 0) > 1;
  }

  private async checkSuspiciousPattern(voteEvent: VoteEvent): Promise<boolean> {
    // Check for rapid voting from same IP
    const { count } = await supabase
      .from('vote_events')
      .select('id', { count: 'exact' })
      .eq('deviceInfo->ipAddress', voteEvent.deviceInfo.ipAddress)
      .eq('eventType', 'vote_cast')
      .gte('timestamp', Date.now() - 60000); // Last minute

    return (count || 0) > 5;
  }

  private checkDeviceAnomaly(voteEvent: VoteEvent): boolean {
    return voteEvent.securityScore > 70;
  }

  private createFraudAlert(
    type: FraudAlert['type'],
    severity: FraudAlert['severity'],
    userId: string,
    description: string,
    evidence: Record<string, unknown>
  ): Omit<FraudAlert, 'id'> {
    return {
      type,
      severity,
      userId,
      description,
      evidence,
      timestamp: Date.now(),
      resolved: false
    };
  }

  private async storeFraudAlert(alert: Omit<FraudAlert, 'id'>): Promise<void> {
    try {
      await supabase.from('fraud_alerts').insert(alert);
    } catch (error) {
      console.error('Failed to store fraud alert:', error);
    }
  }
}

/**
 * Blockchain Monitor
 */
class BlockchainMonitor {
  private isRunning = false;
  private syncStatus: 'synced' | 'syncing' | 'error' = 'synced';
  private lastBlockNumber = 0;

  start(): void {
    this.isRunning = true;
    // Implementation would connect to blockchain and monitor events
  }

  stop(): void {
    this.isRunning = false;
  }

  getSyncStatus(): 'synced' | 'syncing' | 'error' {
    return this.syncStatus;
  }

  async getLastBlockNumber(): Promise<number> {
    return this.lastBlockNumber;
  }
}

export const realTimeMonitoringService = new RealTimeMonitoringService();