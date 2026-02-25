/**
 * Advanced Security Service
 * Provides device fingerprinting, behavioral analysis, and fraud detection
 */

export interface DeviceFingerprint {
  id: string;
  userAgent: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
  };
  timezone: string;
  language: string;
  platform: string;
  cookiesEnabled: boolean;
  doNotTrack: string | null;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  canvas: string;
  webgl: string;
  audio: string;
  fonts: string[];
  timestamp: number;
}

export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: 'login_attempt' | 'vote_attempt' | 'suspicious_activity' | 'device_change' | 'location_change';
  deviceFingerprint: string;
  ipAddress: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  riskScore: number;
  details: Record<string, any>;
  timestamp: number;
}

export interface BehavioralPattern {
  userId: string;
  typingPattern: {
    averageSpeed: number;
    rhythm: number[];
    pauses: number[];
  };
  mouseMovement: {
    velocity: number;
    acceleration: number;
    pattern: string;
  };
  scrollBehavior: {
    speed: number;
    pattern: string;
  };
}

class AdvancedSecurityService {
  private deviceFingerprint: DeviceFingerprint | null = null;
  private behavioralData: BehavioralPattern | null = null;
  private securityEvents: SecurityEvent[] = [];
  private keystrokeTimings: number[] = [];
  private mousePositions: { x: number; y: number; timestamp: number }[] = [];

  constructor() {
    this.initializeSecurityMonitoring();
  }

  /**
   * Initialize security monitoring
   */
  private initializeSecurityMonitoring(): void {
    // Monitor keyboard events
    document.addEventListener('keydown', this.recordKeystroke.bind(this));
    document.addEventListener('keyup', this.recordKeystroke.bind(this));
    
    // Monitor mouse movements
    document.addEventListener('mousemove', this.recordMouseMovement.bind(this));
    
    // Monitor scroll behavior
    document.addEventListener('scroll', this.recordScrollBehavior.bind(this));
    
    // Monitor visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Generate comprehensive device fingerprint
   */
  public async generateDeviceFingerprint(): Promise<DeviceFingerprint> {
    if (this.deviceFingerprint) {
      return this.deviceFingerprint;
    }

    const canvas = this.generateCanvasFingerprint();
    const webgl = this.generateWebGLFingerprint();
    const audio = await this.generateAudioFingerprint();
    const fonts = await this.detectFonts();

    this.deviceFingerprint = {
      id: this.generateUniqueId(),
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio || 1,
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      canvas,
      webgl,
      audio,
      fonts,
      timestamp: Date.now(),
    };

    return this.deviceFingerprint;
  }

  /**
   * Generate canvas fingerprint
   */
  private generateCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return 'canvas_not_supported';

      canvas.width = 200;
      canvas.height = 50;

      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('VoteLink Security 🔒', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Secure Voting Platform', 4, 17);

      return canvas.toDataURL();
    } catch (error) {
      return 'canvas_error';
    }
  }

  /**
   * Generate WebGL fingerprint
   */
  private generateWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return 'webgl_not_supported';

      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);
      
      return `${vendor}~${renderer}`;
    } catch (error) {
      return 'webgl_error';
    }
  }

  /**
   * Generate audio fingerprint
   */
  private async generateAudioFingerprint(): Promise<string> {
    try {
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        return 'audio_not_supported';
      }

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

      gainNode.gain.value = 0;
      oscillator.type = 'triangle';
      oscillator.frequency.value = 10000;

      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();

      return new Promise((resolve) => {
        scriptProcessor.onaudioprocess = function(event) {
          const buffer = event.inputBuffer.getChannelData(0);
          let sum = 0;
          for (let i = 0; i < buffer.length; i++) {
            sum += Math.abs(buffer[i]);
          }
          oscillator.stop();
          audioContext.close();
          resolve(sum.toString());
        };
      });
    } catch (error) {
      return 'audio_error';
    }
  }

  /**
   * Detect available fonts
   */
  private async detectFonts(): Promise<string[]> {
    const testFonts = [
      'Arial', 'Arial Black', 'Calibri', 'Cambria', 'Comic Sans MS',
      'Courier New', 'Georgia', 'Helvetica', 'Impact', 'Lucida Console',
      'Times New Roman', 'Trebuchet MS', 'Verdana'
    ];

    const detectedFonts: string[] = [];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const baseFonts = ['monospace', 'sans-serif', 'serif'];

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    for (const font of testFonts) {
      const available = baseFonts.some(baseFont => {
        context.font = `${testSize} ${baseFont}`;
        const baseWidth = context.measureText(testString).width;
        
        context.font = `${testSize} ${font}, ${baseFont}`;
        const testWidth = context.measureText(testString).width;
        
        return baseWidth !== testWidth;
      });

      if (available) {
        detectedFonts.push(font);
      }
    }

    return detectedFonts;
  }

  /**
   * Record keystroke patterns
   */
  private recordKeystroke(event: KeyboardEvent): void {
    this.keystrokeTimings.push(event.timeStamp);
    
    // Keep only last 100 keystrokes
    if (this.keystrokeTimings.length > 100) {
      this.keystrokeTimings = this.keystrokeTimings.slice(-100);
    }
  }

  /**
   * Record mouse movement patterns
   */
  private recordMouseMovement(event: MouseEvent): void {
    this.mousePositions.push({
      x: event.clientX,
      y: event.clientY,
      timestamp: event.timeStamp
    });

    // Keep only last 1000 positions
    if (this.mousePositions.length > 1000) {
      this.mousePositions = this.mousePositions.slice(-1000);
    }
  }

  /**
   * Record scroll behavior
   */
  private recordScrollBehavior(_event: Event): void {
    // Implementation for scroll pattern analysis
    // TODO: Add scroll pattern tracking
  }

  /**
   * Handle visibility changes (tab switching detection)
   */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.logSecurityEvent('suspicious_activity', {
        type: 'tab_switch',
        message: 'User switched away from voting tab'
      });
    }
  }

  /**
   * Analyze behavioral patterns
   */
  public analyzeBehavioralPatterns(userId: string): BehavioralPattern {
    const typingPattern = this.analyzeTypingPattern();
    const mouseMovement = this.analyzeMouseMovement();
    const scrollBehavior = this.analyzeScrollBehavior();

    this.behavioralData = {
      userId,
      typingPattern,
      mouseMovement,
      scrollBehavior
    };

    return this.behavioralData;
  }

  /**
   * Analyze typing patterns
   */
  private analyzeTypingPattern() {
    if (this.keystrokeTimings.length < 10) {
      return {
        averageSpeed: 0,
        rhythm: [],
        pauses: []
      };
    }

    const intervals = [];
    for (let i = 1; i < this.keystrokeTimings.length; i++) {
      intervals.push(this.keystrokeTimings[i] - this.keystrokeTimings[i - 1]);
    }

    const averageSpeed = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    return {
      averageSpeed,
      rhythm: intervals.slice(0, 20), // First 20 intervals
      pauses: intervals.filter(interval => interval > 500) // Pauses > 500ms
    };
  }

  /**
   * Analyze mouse movement patterns
   */
  private analyzeMouseMovement() {
    if (this.mousePositions.length < 10) {
      return {
        velocity: 0,
        acceleration: 0,
        pattern: 'insufficient_data'
      };
    }

    const velocities = [];
    for (let i = 1; i < this.mousePositions.length; i++) {
      const dx = this.mousePositions[i].x - this.mousePositions[i - 1].x;
      const dy = this.mousePositions[i].y - this.mousePositions[i - 1].y;
      const dt = this.mousePositions[i].timestamp - this.mousePositions[i - 1].timestamp;
      
      if (dt > 0) {
        const velocity = Math.sqrt(dx * dx + dy * dy) / dt;
        velocities.push(velocity);
      }
    }

    const averageVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
    
    return {
      velocity: averageVelocity,
      acceleration: 0, // Simplified for now
      pattern: 'human' // Simplified classification
    };
  }

  /**
   * Analyze scroll behavior
   */
  private analyzeScrollBehavior() {
    return {
      speed: 0, // Simplified
      pattern: 'normal' // Simplified
    };
  }

  /**
   * Calculate risk score based on various factors
   */
  public calculateRiskScore(_userId: string): number {
    let riskScore = 0;

    // Device fingerprint consistency
    if (!this.deviceFingerprint) {
      riskScore += 30;
    }

    // Behavioral analysis
    const behavioral = this.behavioralData;
    if (behavioral) {
      if (behavioral.typingPattern.averageSpeed < 50 || behavioral.typingPattern.averageSpeed > 1000) {
        riskScore += 20;
      }
      
      if (behavioral.mouseMovement.velocity < 0.1 || behavioral.mouseMovement.velocity > 10) {
        riskScore += 15;
      }
    }

    // Time-based analysis
    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour > 23) {
      riskScore += 10; // Unusual voting hours
    }

    return Math.min(riskScore, 100);
  }

  /**
   * Log security event
   */
  public async logSecurityEvent(
    eventType: SecurityEvent['eventType'], 
    details: Record<string, any>,
    userId?: string
  ): Promise<void> {
    const event: SecurityEvent = {
      id: this.generateUniqueId(),
      userId: userId || 'anonymous',
      eventType,
      deviceFingerprint: this.deviceFingerprint?.id || 'unknown',
      ipAddress: await this.getClientIP(),
      riskScore: this.calculateRiskScore(userId || 'anonymous'),
      details,
      timestamp: Date.now()
    };

    this.securityEvents.push(event);

    // Store in Supabase
    try {
      await supabase.from('security_events').insert(event);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
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
   * Detect potential fraud
   */
  public async detectFraud(userId: string): Promise<boolean> {
    const riskScore = this.calculateRiskScore(userId);
    
    if (riskScore > 70) {
      await this.logSecurityEvent('suspicious_activity', {
        type: 'high_risk_score',
        riskScore,
        message: 'High fraud risk detected'
      }, userId);
      
      return true;
    }

    return false;
  }

  /**
   * Generate unique ID
   */
  private generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  /**
   * Get security summary
   */
  public getSecuritySummary() {
    return {
      deviceFingerprint: this.deviceFingerprint,
      behavioralData: this.behavioralData,
      recentEvents: this.securityEvents.slice(-10),
      currentRiskScore: this.calculateRiskScore('current_user')
    };
  }
}

export const advancedSecurityService = new AdvancedSecurityService();