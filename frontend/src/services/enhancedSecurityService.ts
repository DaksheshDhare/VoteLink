interface DeviceFingerprint {
  id: string;
  timestamp: Date;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: string | null;
  canvas: string;
  webgl: string;
  audio: string;
  fonts: string[];
  plugins: string[];
  touchSupport: boolean;
  connectionType: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  colorDepth: number;
  pixelRatio: number;
}

interface BiometricData {
  type: 'fingerprint' | 'face' | 'voice' | 'device';
  data: string;
  confidence: number;
  timestamp: Date;
}

class EnhancedSecurityService {
  private deviceFingerprint: DeviceFingerprint | null = null;

  // Generate comprehensive device fingerprint
  async generateDeviceFingerprint(): Promise<DeviceFingerprint> {
    const canvas = this.getCanvasFingerprint();
    const webgl = this.getWebGLFingerprint();
    const audio = await this.getAudioFingerprint();
    const fonts = this.getAvailableFonts();
    const plugins = this.getPluginsList();

    const fingerprint: DeviceFingerprint = {
      id: this.generateFingerprintId(),
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      canvas,
      webgl,
      audio,
      fonts,
      plugins,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      connectionType: this.getConnectionType(),
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: (navigator as any).deviceMemory || 0,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio
    };

    this.deviceFingerprint = fingerprint;
    return fingerprint;
  }

  // Simulate biometric authentication for devices without physical scanners
  async simulateBiometricAuth(type: 'fingerprint' | 'face' | 'voice'): Promise<BiometricData> {
    return new Promise((resolve) => {
      // Simulate biometric scanning delay
      setTimeout(() => {
        const biometricData: BiometricData = {
          type,
          data: this.generateBiometricHash(type),
          confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
          timestamp: new Date()
        };
        resolve(biometricData);
      }, 2000 + Math.random() * 2000); // 2-4 second delay
    });
  }

  // Check for actual biometric support
  async checkBiometricSupport(): Promise<{
    fingerprint: boolean;
    face: boolean;
    voice: boolean;
    webauthn: boolean;
  }> {
    const support = {
      fingerprint: false,
      face: false,
      voice: false,
      webauthn: false
    };

    // Check for WebAuthn support
    if (window.PublicKeyCredential) {
      support.webauthn = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }

    // Check for getUserMedia (camera/microphone)
    if (navigator.mediaDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        support.face = devices.some(device => device.kind === 'videoinput');
        support.voice = devices.some(device => device.kind === 'audioinput');
      } catch (error) {
        console.warn('Could not enumerate media devices:', error);
      }
    }

    // Fingerprint detection (usually not available in browsers for security)
    support.fingerprint = support.webauthn; // Use WebAuthn as proxy

    return support;
  }

  // Enhanced device authentication
  async authenticateDevice(): Promise<{
    success: boolean;
    confidence: number;
    factors: string[];
    deviceId: string;
  }> {
    const fingerprint = await this.generateDeviceFingerprint();
    const savedFingerprint = this.getSavedDeviceFingerprint();
    
    let confidence = 0;
    const factors: string[] = [];

    if (savedFingerprint) {
      // Compare fingerprints
      if (fingerprint.userAgent === savedFingerprint.userAgent) {
        confidence += 0.2;
        factors.push('User Agent Match');
      }
      
      if (fingerprint.screenResolution === savedFingerprint.screenResolution) {
        confidence += 0.2;
        factors.push('Screen Resolution Match');
      }
      
      if (fingerprint.timezone === savedFingerprint.timezone) {
        confidence += 0.1;
        factors.push('Timezone Match');
      }
      
      if (fingerprint.canvas === savedFingerprint.canvas) {
        confidence += 0.2;
        factors.push('Canvas Fingerprint Match');
      }
      
      if (fingerprint.webgl === savedFingerprint.webgl) {
        confidence += 0.15;
        factors.push('WebGL Fingerprint Match');
      }
      
      if (fingerprint.hardwareConcurrency === savedFingerprint.hardwareConcurrency) {
        confidence += 0.1;
        factors.push('Hardware Concurrency Match');
      }
      
      if (this.compareFonts(fingerprint.fonts, savedFingerprint.fonts)) {
        confidence += 0.05;
        factors.push('Font List Match');
      }
    } else {
      // First time device
      confidence = 0.5; // Neutral confidence for new devices
      factors.push('New Device Registration');
    }

    // Save current fingerprint
    this.saveDeviceFingerprint(fingerprint);

    return {
      success: confidence > 0.6,
      confidence,
      factors,
      deviceId: fingerprint.id
    };
  }

  private generateFingerprintId(): string {
    const data = `${navigator.userAgent}${screen.width}${screen.height}${navigator.language}${navigator.platform}`;
    return this.hashString(data);
  }

  private generateBiometricHash(type: string): string {
    const deviceData = this.deviceFingerprint || { id: 'unknown' };
    const biometricSeed = `${type}_${deviceData.id}_${Date.now()}`;
    return this.hashString(biometricSeed);
  }

  private getCanvasFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = 200;
    canvas.height = 50;
    
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('VoteLink Security 🔒', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Device Fingerprint', 4, 35);

    return canvas.toDataURL();
  }

  private getWebGLFingerprint(): string {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return '';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return '';

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    
    return `${vendor}~${renderer}`;
  }

  private async getAudioFingerprint(): Promise<string> {
    return new Promise((resolve) => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const analyser = audioContext.createAnalyser();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        
        oscillator.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        
        setTimeout(() => {
          const frequencyData = new Float32Array(analyser.frequencyBinCount);
          analyser.getFloatFrequencyData(frequencyData);
          
          oscillator.stop();
          audioContext.close();
          
          const audioHash = this.hashString(frequencyData.toString());
          resolve(audioHash);
        }, 100);
      } catch (error) {
        resolve('audio_not_supported');
      }
    });
  }

  private getAvailableFonts(): string[] {
    const testFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
      'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Trebuchet MS',
      'Arial Black', 'Impact', 'Lucida Console', 'Tahoma', 'Geneva'
    ];

    return testFonts.filter(font => this.isFontAvailable(font));
  }

  private isFontAvailable(font: string): boolean {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return false;

    context.font = `72px monospace`;
    const baselineWidth = context.measureText('mmmmmmmmmmlli').width;
    
    context.font = `72px ${font}, monospace`;
    const testWidth = context.measureText('mmmmmmmmmmlli').width;
    
    return testWidth !== baselineWidth;
  }

  private getPluginsList(): string[] {
    const plugins: string[] = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push(navigator.plugins[i].name);
    }
    return plugins;
  }

  private getConnectionType(): string {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      return connection.effectiveType || connection.type || 'unknown';
    }
    return 'unknown';
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private saveDeviceFingerprint(fingerprint: DeviceFingerprint): void {
    localStorage.setItem('deviceFingerprint', JSON.stringify(fingerprint));
  }

  private getSavedDeviceFingerprint(): DeviceFingerprint | null {
    const saved = localStorage.getItem('deviceFingerprint');
    return saved ? JSON.parse(saved) : null;
  }

  private compareFonts(fonts1: string[], fonts2: string[]): boolean {
    if (fonts1.length !== fonts2.length) return false;
    return fonts1.every(font => fonts2.includes(font));
  }

  // Public method to clear stored fingerprints (for testing/reset)
  clearStoredFingerprints(): void {
    localStorage.removeItem('deviceFingerprint');
  }
}

export const enhancedSecurityService = new EnhancedSecurityService();