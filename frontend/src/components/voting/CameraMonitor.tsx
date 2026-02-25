import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, UserX, RotateCw } from 'lucide-react';
import * as posenet from '@tensorflow-models/posenet';
import '@tensorflow/tfjs';

// --- Type Definitions ---
type AlertType = 'obstructed' | 'no_user' | 'looking_away' | 'suspicious';

interface AlertState {
  type: AlertType | null;
  message: string | null;
}

// --- Component Props ---
interface CameraMonitorProps {
  isActive: boolean;
  onCameraStatus: (isWorking: boolean) => void;
  onCapture?: (imageData: string) => void;
  onSecurityBreach?: (type: AlertType, message: string) => void;
}

export const CameraMonitor: React.FC<CameraMonitorProps> = ({
  isActive,
  onCameraStatus,
  onCapture,
  onSecurityBreach,
}) => {
  // --- Refs ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbackRef = useRef({ onSecurityBreach });
  
  const alertCountersRef = useRef({
    obstructed: 0,
    no_user: 0,
    looking_away: 0,
    rightWrist: 0, // Reusing for motion detection
  });
  
  const lastAlertTimeRef = useRef({
    obstructed: 0,
    no_user: 0,
    looking_away: 0,
    suspicious: 0,
  });

  // --- State ---
  const [isRecording, setIsRecording] = useState(false);
  const [net, setNet] = useState<posenet.PoseNet | null>(null);
  const [alert, setAlert] = useState<AlertState>({ type: null, message: null });
  const [cameraStatus, setCameraStatus] = useState<'active' | 'inactive' | 'initializing'>('inactive');

  // --- Effects ---
  useEffect(() => {
    callbackRef.current = { onSecurityBreach };
  }, [onSecurityBreach]);

  // Initialize PoseNet separately (with fallback)
  useEffect(() => {
    const initializePoseNet = async () => {
      if (!net) {
        try {
          console.log('Loading PoseNet...');
          
          // Set a timeout for PoseNet loading
          const loadPromise = posenet.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            inputResolution: { width: 640, height: 480 },
            multiplier: 0.75,
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('PoseNet loading timeout')), 10000)
          );

          const loadedNet = await Promise.race([loadPromise, timeoutPromise]);
          setNet(loadedNet as posenet.PoseNet);
          console.log('PoseNet loaded successfully');
        } catch (error) {
          console.error('PoseNet loading error:', error);
          // Don't set error - allow camera to work without AI monitoring
          console.log('Camera will work without AI pose detection');
        }
      }
    };

    initializePoseNet();
  }, [net]);

  // Camera management
  useEffect(() => {
    const startCamera = async () => {
      try {
        setCameraStatus('initializing');
        console.log('Requesting camera access...');
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 }, 
            facingMode: 'user' 
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          
          await new Promise<void>((resolve) => {
            if (videoRef.current) {
              videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play().then(() => {
                  setIsRecording(true);
                  setCameraStatus('active');
                  onCameraStatus(true);
                  setAlert({ type: null, message: null });
                  console.log('✅ Camera started successfully');
                  resolve();
                }).catch(console.error);
              };
            }
          });
        }
      } catch (error) {
        console.error('Camera access error:', error);
        setCameraStatus('inactive');
        onCameraStatus(false);
      }
    };

    const stopCamera = () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsRecording(false);
      setCameraStatus('inactive');
      onCameraStatus(false);
      setAlert({ type: null, message: null });
    };

    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return stopCamera;
  }, [isActive, onCameraStatus]);

  // --- Advanced Intelligent Malicious Activity Detection ---
  useEffect(() => {
    if (!isRecording) return;
    
    console.log('🔍 Starting intelligent malicious activity detection system');
    console.log('PoseNet loaded:', !!net);
    
    // ===== CONFIGURABLE THRESHOLDS =====
    const CONFIG = {
      // Motion detection - BALANCED for real-world use
      MIN_MOTION_DIFF: 20,              // Minimum pixel difference to count as motion (lowered from 30)
      MIN_CONTOUR_AREA: 0.08,           // 8% of screen must move (balanced - not too sensitive, not too strict)
      MOTION_INTENSITY_THRESHOLD: 35,   // Average motion intensity for detection (lowered from 50)
      
      // Temporal filtering - Require confirmation but not too long
      MIN_SUSPICIOUS_FRAMES: 5,         // Must persist for 5 frames (~1.25 seconds at 250ms)
      DEBOUNCE_TIME: 10000,             // 10s cooldown between alerts
      
      // Region-based detection - Smaller ignore zones to catch more
      IGNORE_REGIONS: {
        head: { x: 0.4, y: 0.05, w: 0.2, h: 0.25 },  // Smaller head region (40-60% x, 5-30% y)
        hands: { x: 0.25, y: 0.45, w: 0.5, h: 0.25 }, // Smaller normal hand region
      },
      
      // User presence
      MIN_BRIGHTNESS: 30,
      MIN_PIXEL_ACTIVITY: 0.1,
      USER_ABSENCE_FRAMES: 10,          // 2.5 seconds of absence
      
      // Face obstruction (still check for cheating)
      FACE_OBSTRUCTION_RATIO: 0.5,     // Face 50% darker = suspicious (more sensitive)
      OBSTRUCTION_FRAMES: 8,           // 2 seconds of obstruction (faster detection)
    };
    
    // Motion history for temporal analysis
    const motionHistory: number[] = [];
    const maxHistoryLength = 20; // 5 seconds of history
    
    // Frame buffer for confirmation
    let suspiciousFrameBuffer: {
      timestamp: number;
      motionPercentage: number;
      intensity: number;
      region: string;
    }[] = [];
    
    // Previous frame data
    let previousFrameData: ImageData | null = null;
    
    // Detection state
    let lastAlertTime = 0;
    
    const isInIgnoreRegion = (x: number, y: number, width: number, height: number): boolean => {
      const relX = x / width;
      const relY = y / height;
      
      // Check if point is in head region
      const headRegion = CONFIG.IGNORE_REGIONS.head;
      if (relX >= headRegion.x && relX <= headRegion.x + headRegion.w &&
          relY >= headRegion.y && relY <= headRegion.y + headRegion.h) {
        return true;
      }
      
      // Check if point is in normal hand region
      const handRegion = CONFIG.IGNORE_REGIONS.hands;
      if (relX >= handRegion.x && relX <= handRegion.x + handRegion.w &&
          relY >= handRegion.y && relY <= handRegion.y + handRegion.h) {
        return true;
      }
      
      return false;
    };
    
    const analyzeMotionPattern = (): { isSuspicious: boolean; reason: string } => {
      if (motionHistory.length < CONFIG.MIN_SUSPICIOUS_FRAMES) {
        return { isSuspicious: false, reason: 'Insufficient data' };
      }
      
      // Get recent motion data
      const recentMotion = motionHistory.slice(-CONFIG.MIN_SUSPICIOUS_FRAMES);
      const avgRecentMotion = recentMotion.reduce((a, b) => a + b, 0) / recentMotion.length;
      
      // Check for sustained high motion (hostile activity pattern)
      const highMotionFrames = recentMotion.filter(m => m > CONFIG.MIN_CONTOUR_AREA).length;
      const sustainedMotion = highMotionFrames >= CONFIG.MIN_SUSPICIOUS_FRAMES * 0.75; // 75% of frames
      
      // Check for sudden spike pattern (aggressive movement)
      const maxMotion = Math.max(...recentMotion);
      const suddenSpike = maxMotion > CONFIG.MIN_CONTOUR_AREA * 1.5 && avgRecentMotion > CONFIG.MIN_CONTOUR_AREA;
      
      if (sustainedMotion) {
        return { isSuspicious: true, reason: 'Sustained high-intensity movement detected' };
      }
      
      if (suddenSpike) {
        return { isSuspicious: true, reason: 'Aggressive movement pattern detected' };
      }
      
      return { isSuspicious: false, reason: 'Normal activity' };
    };
    
    const runIntelligentDetection = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      try {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Calculate overall brightness and activity
        let totalBrightness = 0;
        let nonZeroPixels = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          totalBrightness += brightness;
          if (brightness > 10) nonZeroPixels++;
        }
        
        const avgBrightness = totalBrightness / (data.length / 4);
        const pixelActivity = nonZeroPixels / (data.length / 4);
        
        const counters = alertCountersRef.current;
        const now = Date.now();
        
        // ===== 1. USER PRESENCE CHECK =====
        const isUserPresent = avgBrightness > CONFIG.MIN_BRIGHTNESS && pixelActivity > CONFIG.MIN_PIXEL_ACTIVITY;
        
        if (!isUserPresent) {
          counters.no_user++;
          if (counters.no_user > CONFIG.USER_ABSENCE_FRAMES) {
            if (now - lastAlertTimeRef.current.no_user > 5000) {
              lastAlertTimeRef.current.no_user = now;
              console.log('🚨 USER ABSENCE ALERT');
              setAlert({ type: 'no_user', message: 'User not detected in the frame.' });
              onSecurityBreach?.('no_user', 'User not detected in the frame.');
            }
          }
          return; // Skip motion analysis if no user
        } else {
          counters.no_user = 0;
          setAlert(current => (current.type === 'no_user' ? { type: null, message: null } : current));
        }
        
        // ===== 2. REGIONAL MOTION ANALYSIS =====
        if (previousFrameData) {
          let relevantMotionPixels = 0;
          let totalRelevantMotion = 0;
          let relevantPixelCount = 0;
          
          // Analyze motion in grid to identify regions
          const gridSize = 32; // Analyze in 32x32 pixel blocks
          
          for (let y = 0; y < canvas.height; y += gridSize) {
            for (let x = 0; x < canvas.width; x += gridSize) {
              // Skip ignored regions (head, normal hand area)
              if (isInIgnoreRegion(x + gridSize/2, y + gridSize/2, canvas.width, canvas.height)) {
                continue;
              }
              
              // Analyze this block
              let blockMotion = 0;
              let blockPixels = 0;
              
              for (let by = y; by < Math.min(y + gridSize, canvas.height); by++) {
                for (let bx = x; bx < Math.min(x + gridSize, canvas.width); bx++) {
                  const pixelIndex = (by * canvas.width + bx) * 4;
                  const brightness = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3;
                  const prevBrightness = (previousFrameData.data[pixelIndex] + 
                                         previousFrameData.data[pixelIndex + 1] + 
                                         previousFrameData.data[pixelIndex + 2]) / 3;
                  
                  const motionDiff = Math.abs(brightness - prevBrightness);
                  if (motionDiff > CONFIG.MIN_MOTION_DIFF) {
                    blockMotion += motionDiff;
                    relevantMotionPixels++;
                  }
                  blockPixels++;
                }
              }
              
              if (blockPixels > 0) {
                totalRelevantMotion += blockMotion / blockPixels;
                relevantPixelCount++;
              }
            }
          }
          
          const motionPercentage = relevantMotionPixels / (data.length / 4);
          const avgMotionIntensity = relevantPixelCount > 0 ? totalRelevantMotion / relevantPixelCount : 0;
          
          // Add to motion history
          motionHistory.push(motionPercentage);
          if (motionHistory.length > maxHistoryLength) {
            motionHistory.shift();
          }
          
          console.log(`Detection: motion=${(motionPercentage*100).toFixed(2)}%, intensity=${avgMotionIntensity.toFixed(1)}, frames=${motionHistory.length}`);
          
          // ===== 3. TEMPORAL CONFIRMATION =====
          const isHighMotion = motionPercentage > CONFIG.MIN_CONTOUR_AREA || avgMotionIntensity > CONFIG.MOTION_INTENSITY_THRESHOLD;
          
          if (isHighMotion) {
            suspiciousFrameBuffer.push({
              timestamp: now,
              motionPercentage,
              intensity: avgMotionIntensity,
              region: 'body/arms'
            });
            
            // Clean old frames (older than 3 seconds)
            suspiciousFrameBuffer = suspiciousFrameBuffer.filter(f => now - f.timestamp < 3000);
            
            console.log(`⚠️  Suspicious motion buffer: ${suspiciousFrameBuffer.length} frames`);
          } else {
            // Decay the buffer gradually
            if (suspiciousFrameBuffer.length > 0) {
              suspiciousFrameBuffer.shift();
            }
          }
          
          // ===== 4. ALERT DECISION =====
          if (suspiciousFrameBuffer.length >= CONFIG.MIN_SUSPICIOUS_FRAMES) {
            // Analyze pattern
            const pattern = analyzeMotionPattern();
            
            if (pattern.isSuspicious && now - lastAlertTime > CONFIG.DEBOUNCE_TIME) {
              lastAlertTime = now;
              console.log(`🚨 MALICIOUS ACTIVITY ALERT: ${pattern.reason}`);
              setAlert({ type: 'suspicious', message: pattern.reason });
              onSecurityBreach?.('suspicious', pattern.reason);
              
              // Clear buffer after alert
              suspiciousFrameBuffer = [];
              motionHistory.length = 0;
              
              // Auto-clear after 5 seconds
              setTimeout(() => {
                setAlert(current => (current.type === 'suspicious' ? { type: null, message: null } : current));
              }, 5000);
            }
          }
          
          // ===== 5. FACE OBSTRUCTION CHECK (Cheating Detection) =====
          const centerX = Math.floor(canvas.width / 2);
          const centerY = Math.floor(canvas.height / 2);
          const faceRegionSize = 60;
          
          let faceBrightness = 0;
          let facePixels = 0;
          
          for (let y = centerY - faceRegionSize; y < centerY + faceRegionSize; y++) {
            for (let x = centerX - faceRegionSize; x < centerX + faceRegionSize; x++) {
              if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
                const pixelIndex = (y * canvas.width + x) * 4;
                const brightness = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3;
                faceBrightness += brightness;
                facePixels++;
              }
            }
          }
          
          const avgFaceBrightness = faceBrightness / facePixels;
          
          if (avgFaceBrightness < avgBrightness * CONFIG.FACE_OBSTRUCTION_RATIO && avgBrightness > 40) {
            counters.obstructed++;
            
            if (counters.obstructed > CONFIG.OBSTRUCTION_FRAMES) {
              if (now - lastAlertTimeRef.current.obstructed > CONFIG.DEBOUNCE_TIME) {
                lastAlertTimeRef.current.obstructed = now;
                console.log('🚨 FACE OBSTRUCTION ALERT');
                setAlert({ type: 'obstructed', message: 'Face obstruction detected. Please remain visible.' });
                onSecurityBreach?.('obstructed', 'Face obstruction detected. Please remain visible.');
                counters.obstructed = 0;
              }
            }
          } else {
            counters.obstructed = Math.max(0, counters.obstructed - 1);
            setAlert(current => (current.type === 'obstructed' ? { type: null, message: null } : current));
          }
        }
        
        // Store current frame
        previousFrameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
      } catch (error) {
        console.error('Error in intelligent detection:', error);
      }
    };

    // Run detection every 250ms (4 FPS) for real-time performance (<200-400ms latency)
    const detectionInterval = setInterval(runIntelligentDetection, 250);
    
    return () => {
      clearInterval(detectionInterval);
    };
  }, [isRecording, onSecurityBreach, net]);

  // --- Alert icon ---
  const getAlertIcon = () => {
    switch (alert.type) {
      case 'obstructed':
      case 'suspicious':
        return <AlertCircle className="text-yellow-400 mb-1" size={24} />;
      case 'no_user':
      case 'looking_away':
        return <UserX className="text-red-400 mb-1" size={24} />;
      default:
        return null;
    }
  };

  // Retry camera
  const retryCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
    setCameraStatus('inactive');
    
    setTimeout(() => {
      setCameraStatus('initializing');
    }, 500);
  };

  // --- Render ---
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative w-64 h-48 rounded-xl overflow-hidden bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
        {/* Video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />
        
        {/* Hidden canvas for detection */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Status Indicator */}
        <div className="absolute top-2 left-2 flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            cameraStatus === 'active' ? 'bg-green-500 animate-pulse' :
            cameraStatus === 'initializing' ? 'bg-yellow-500 animate-pulse' :
            'bg-red-500'
          }`} />
          <span className="text-xs text-white/80 font-medium">
            {cameraStatus === 'active' ? 'Monitoring' :
             cameraStatus === 'initializing' ? 'Starting...' :
             'Inactive'}
          </span>
        </div>

        {/* Alert Overlay */}
        {alert.type && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-3">
            {getAlertIcon()}
            <p className="text-white text-xs text-center font-medium">
              {alert.message}
            </p>
          </div>
        )}

        {/* Retry Button (when inactive) */}
        {cameraStatus === 'inactive' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
            <button
              onClick={retryCamera}
              className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 
                       rounded-lg transition-colors"
            >
              <RotateCw size={16} className="text-white" />
              <span className="text-white text-xs font-medium">Retry Camera</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
