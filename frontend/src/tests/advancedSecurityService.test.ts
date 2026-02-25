import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import AdvancedSecurityService from '../services/advancedSecurityService';

// Mock browser APIs
const mockGetUserMedia = vi.fn();
const mockCreateElement = vi.fn();
const mockGetContext = vi.fn();

// Mock WebGL context
const mockWebGLContext = {
  getParameter: vi.fn(),
  getExtension: vi.fn(),
  getSupportedExtensions: vi.fn(),
};

// Mock Audio context
const mockAudioContext = {
  createOscillator: vi.fn(),
  createAnalyser: vi.fn(),
  createGain: vi.fn(),
};

// Mock Canvas
const mockCanvas = {
  getContext: mockGetContext,
  toDataURL: vi.fn(),
  width: 200,
  height: 200,
};

// Mock Canvas 2D context
const mockCanvas2DContext = {
  fillStyle: '',
  fillText: vi.fn(),
  fillRect: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  beginPath: vi.fn(),
  font: '',
};

// Setup global mocks
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: { getUserMedia: mockGetUserMedia },
  writable: true,
});

Object.defineProperty(global.document, 'createElement', {
  value: mockCreateElement,
  writable: true,
});

Object.defineProperty(global.window, 'AudioContext', {
  value: vi.fn(() => mockAudioContext),
  writable: true,
});

Object.defineProperty(global.window, 'webkitAudioContext', {
  value: vi.fn(() => mockAudioContext),
  writable: true,
});

describe('AdvancedSecurityService', () => {
  let securityService: AdvancedSecurityService;

  beforeEach(() => {
    securityService = new AdvancedSecurityService();
    vi.clearAllMocks();

    // Setup canvas mock
    mockCreateElement.mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas;
      }
      return {};
    });

    mockGetContext.mockImplementation((type: string) => {
      if (type === '2d') {
        return mockCanvas2DContext;
      }
      if (type === 'webgl' || type === 'experimental-webgl') {
        return mockWebGLContext;
      }
      return null;
    });

    mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mock-canvas-data');
    mockWebGLContext.getParameter.mockReturnValue('Mock WebGL Renderer');
    mockWebGLContext.getSupportedExtensions.mockReturnValue(['WEBGL_debug_renderer_info']);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Device Fingerprinting', () => {
    it('should generate canvas fingerprint', async () => {
      const fingerprint = await securityService.generateDeviceFingerprint();
      
      expect(mockCreateElement).toHaveBeenCalledWith('canvas');
      expect(mockGetContext).toHaveBeenCalledWith('2d');
      expect(mockCanvas2DContext.fillText).toHaveBeenCalled();
      expect(mockCanvas.toDataURL).toHaveBeenCalled();
      expect(fingerprint.canvas).toBe('mock-canvas-data');
    });

    it('should generate WebGL fingerprint', async () => {
      const fingerprint = await securityService.generateDeviceFingerprint();
      
      expect(mockGetContext).toHaveBeenCalledWith('webgl');
      expect(mockWebGLContext.getParameter).toHaveBeenCalled();
      expect(fingerprint.webgl).toContain('Mock WebGL Renderer');
    });

    it('should generate audio fingerprint', async () => {
      const fingerprint = await securityService.generateDeviceFingerprint();
      
      expect(fingerprint.audio).toBeDefined();
      expect(typeof fingerprint.audio).toBe('string');
    });

    it('should include browser features in fingerprint', async () => {
      const fingerprint = await securityService.generateDeviceFingerprint();
      
      expect(fingerprint.userAgent).toBeDefined();
      expect(fingerprint.language).toBeDefined();
      expect(fingerprint.timezone).toBeDefined();
      expect(fingerprint.screen).toBeDefined();
    });

    it('should handle missing WebGL support gracefully', async () => {
      mockGetContext.mockImplementation((type: string) => {
        if (type === '2d') return mockCanvas2DContext;
        return null; // No WebGL support
      });

      const fingerprint = await securityService.generateDeviceFingerprint();
      
      expect(fingerprint.webgl).toBe('Not supported');
    });

    it('should handle canvas errors gracefully', async () => {
      mockCanvas.toDataURL.mockImplementation(() => {
        throw new Error('Canvas tainted');
      });

      const fingerprint = await securityService.generateDeviceFingerprint();
      
      expect(fingerprint.canvas).toBe('Error generating canvas fingerprint');
    });
  });

  describe('Behavioral Analysis', () => {
    it('should track typing patterns', () => {
      const mockElement = document.createElement('input');
      
      securityService.startBehavioralAnalysis(mockElement);
      
      // Simulate typing
      const keydownEvent = new KeyboardEvent('keydown', { key: 'a' });
      const keyupEvent = new KeyboardEvent('keyup', { key: 'a' });
      
      mockElement.dispatchEvent(keydownEvent);
      setTimeout(() => {
        mockElement.dispatchEvent(keyupEvent);
      }, 100);

      const patterns = securityService.getBehavioralPatterns();
      expect(patterns).toBeDefined();
    });

    it('should track mouse movement patterns', () => {
      const mockElement = document.createElement('div');
      
      securityService.startBehavioralAnalysis(mockElement);
      
      // Simulate mouse movement
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 150,
      });
      
      mockElement.dispatchEvent(mouseMoveEvent);

      const patterns = securityService.getBehavioralPatterns();
      expect(patterns).toBeDefined();
    });

    it('should calculate risk scores based on patterns', () => {
      const patterns = {
        typingSpeed: 50,
        mouseVelocity: 100,
        clickFrequency: 5,
        sessionDuration: 300000, // 5 minutes
      };

      const riskScore = securityService.calculateRiskScore(patterns);
      
      expect(riskScore).toBeGreaterThanOrEqual(0);
      expect(riskScore).toBeLessThanOrEqual(100);
    });

    it('should detect suspicious rapid clicking', () => {
      const patterns = {
        typingSpeed: 200, // Very fast
        mouseVelocity: 500, // Very fast
        clickFrequency: 20, // Very high
        sessionDuration: 10000, // Very short
      };

      const riskScore = securityService.calculateRiskScore(patterns);
      
      expect(riskScore).toBeGreaterThan(70); // High risk
    });

    it('should detect normal user behavior', () => {
      const patterns = {
        typingSpeed: 40, // Normal
        mouseVelocity: 80, // Normal
        clickFrequency: 3, // Normal
        sessionDuration: 600000, // 10 minutes - normal
      };

      const riskScore = securityService.calculateRiskScore(patterns);
      
      expect(riskScore).toBeLessThan(30); // Low risk
    });
  });

  describe('Fraud Detection', () => {
    it('should detect multiple sessions from same device', async () => {
      const deviceId = 'test-device-123';
      const userId1 = 'user1';
      const userId2 = 'user2';

      // Simulate two different users from same device
      await securityService.checkForFraud(userId1, deviceId);
      const fraudResult = await securityService.checkForFraud(userId2, deviceId);

      expect(fraudResult.isFraudulent).toBe(true);
      expect(fraudResult.reasons).toContain('Multiple users detected from same device');
    });

    it('should detect rapid successive votes', async () => {
      const deviceId = 'test-device-456';
      const userId = 'rapid-voter';

      // First vote should be fine
      const firstVote = await securityService.checkForFraud(userId, deviceId);
      expect(firstVote.isFraudulent).toBe(false);

      // Immediate second attempt should be flagged
      const secondVote = await securityService.checkForFraud(userId, deviceId);
      expect(secondVote.isFraudulent).toBe(true);
      expect(secondVote.reasons).toContain('Multiple attempts detected in short time');
    });

    it('should allow legitimate voting after cooldown', async () => {
      const deviceId = 'test-device-789';
      const userId = 'patient-voter';

      // Mock time passage
      vi.useFakeTimers();
      
      await securityService.checkForFraud(userId, deviceId);
      
      // Advance time by 1 hour
      vi.advanceTimersByTime(60 * 60 * 1000);
      
      const laterVote = await securityService.checkForFraud(userId, deviceId);
      expect(laterVote.isFraudulent).toBe(false);

      vi.useRealTimers();
    });

    it('should detect unusual behavioral patterns', () => {
      const suspiciousPatterns = {
        typingSpeed: 300, // Impossibly fast
        mouseVelocity: 1000, // Too fast
        clickFrequency: 50, // Way too high
        sessionDuration: 1000, // Too short
      };

      const riskScore = securityService.calculateRiskScore(suspiciousPatterns);
      expect(riskScore).toBeGreaterThan(80); // Very high risk
    });

    it('should handle empty fraud history', async () => {
      const newDeviceId = 'brand-new-device';
      const newUserId = 'new-user';

      const fraudResult = await securityService.checkForFraud(newUserId, newDeviceId);
      
      expect(fraudResult.isFraudulent).toBe(false);
      expect(fraudResult.riskScore).toBeLessThan(50);
    });
  });

  describe('Security Event Logging', () => {
    it('should log security events', () => {
      const event = {
        type: 'login_attempt',
        userId: 'test-user',
        deviceId: 'test-device',
        timestamp: Date.now(),
        details: { success: true },
      };

      securityService.logSecurityEvent(event);
      
      const events = securityService.getSecurityEvents();
      expect(events).toContain(event);
    });

    it('should limit security event log size', () => {
      // Add many events to test limit
      for (let i = 0; i < 1500; i++) {
        securityService.logSecurityEvent({
          type: 'test_event',
          userId: `user${i}`,
          deviceId: `device${i}`,
          timestamp: Date.now(),
          details: {},
        });
      }

      const events = securityService.getSecurityEvents();
      expect(events.length).toBeLessThanOrEqual(1000); // Should be capped
    });

    it('should filter events by type', () => {
      securityService.logSecurityEvent({
        type: 'login',
        userId: 'user1',
        deviceId: 'device1',
        timestamp: Date.now(),
        details: {},
      });

      securityService.logSecurityEvent({
        type: 'vote',
        userId: 'user1',
        deviceId: 'device1',
        timestamp: Date.now(),
        details: {},
      });

      const loginEvents = securityService.getSecurityEvents('login');
      const voteEvents = securityService.getSecurityEvents('vote');

      expect(loginEvents.length).toBe(1);
      expect(voteEvents.length).toBe(1);
      expect(loginEvents[0].type).toBe('login');
      expect(voteEvents[0].type).toBe('vote');
    });
  });

  describe('Error Handling', () => {
    it('should handle getUserMedia errors gracefully', async () => {
      mockGetUserMedia.mockRejectedValue(new Error('Camera not available'));

      const fingerprint = await securityService.generateDeviceFingerprint();
      
      expect(fingerprint).toBeDefined();
      expect(fingerprint.camera).toBe('Not available');
    });

    it('should handle AudioContext creation errors', async () => {
      Object.defineProperty(global.window, 'AudioContext', {
        value: undefined,
        writable: true,
      });

      Object.defineProperty(global.window, 'webkitAudioContext', {
        value: undefined,
        writable: true,
      });

      const fingerprint = await securityService.generateDeviceFingerprint();
      
      expect(fingerprint.audio).toBe('AudioContext not supported');
    });

    it('should handle invalid element for behavioral analysis', () => {
      expect(() => {
        securityService.startBehavioralAnalysis(null as any);
      }).not.toThrow();

      expect(() => {
        securityService.startBehavioralAnalysis(undefined as any);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should complete fingerprinting within reasonable time', async () => {
      const startTime = Date.now();
      
      await securityService.generateDeviceFingerprint();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent fingerprinting requests', async () => {
      const promises = Array(10).fill(0).map(() => 
        securityService.generateDeviceFingerprint()
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.userAgent).toBeDefined();
      });
    });
  });
});