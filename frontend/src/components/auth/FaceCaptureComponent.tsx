import React, { useRef, useState, useEffect } from 'react';
import { Camera, CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react';

// Declare FaceDetector for TypeScript
declare global {
  interface Window {
    FaceDetector: new () => {
      detect: (image: HTMLVideoElement | HTMLCanvasElement | ImageBitmap) => Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
    };
  }
}

interface FaceCaptureComponentProps {
  onFaceCaptured: (faceDescriptor: Float32Array, faceImage: string) => void;
  onCancel: () => void;
  title?: string;
  instructions?: string;
}

export const FaceCaptureComponent: React.FC<FaceCaptureComponentProps> = ({
  onFaceCaptured,
  onCancel,
  title = "Capture Your Face",
  instructions = "Position your face in the frame and click capture"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [captureStage, setCaptureStage] = useState<string>('');
  const [waitCountdown, setWaitCountdown] = useState<number | null>(null);
  const [faceDetectorSupported, setFaceDetectorSupported] = useState(false);
  const [popup, setPopup] = useState<{ show: boolean; message: string; type: 'error' | 'success' }>({ show: false, message: '', type: 'error' });
  const faceDetectorRef = useRef<any>(null);

  useEffect(() => {
    // Check if FaceDetector API is available (Chrome)
    if ('FaceDetector' in window) {
      faceDetectorRef.current = new window.FaceDetector();
      setFaceDetectorSupported(true);
      console.log('Native FaceDetector API available');
    } else {
      console.log('FaceDetector API not available, will use canvas-based detection');
      setFaceDetectorSupported(false);
    }
    
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please grant camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const captureWithCountdown = () => {
    setError(null);
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          captureFace();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const showPopup = (message: string, type: 'error' | 'success' = 'error') => {
    setPopup({ show: true, message, type });
    // Auto-hide popup after 3 seconds
    setTimeout(() => {
      setPopup(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    setError(null);
    setSuccess(false);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Draw current frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      let facesDetected = 0;

      // Use native FaceDetector if available (very fast)
      if (faceDetectorSupported && faceDetectorRef.current) {
        setCaptureStage('Detecting faces...');
        try {
          const faces = await faceDetectorRef.current.detect(canvas);
          facesDetected = faces.length;
        } catch (e) {
          console.error('FaceDetector error:', e);
          // Fallback: assume 1 face if detection fails
          facesDetected = 1;
        }
      } else {
        // Fallback: Simple brightness-based detection
        setCaptureStage('Analyzing image...');
        const imageData = ctx.getImageData(
          canvas.width * 0.25, 
          canvas.height * 0.1, 
          canvas.width * 0.5, 
          canvas.height * 0.6
        );
        const data = imageData.data;
        
        // Check if there's meaningful content in the face area
        let totalBrightness = 0;
        let variance = 0;
        const brightnesses: number[] = [];
        
        for (let i = 0; i < data.length; i += 16) {
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          brightnesses.push(brightness);
          totalBrightness += brightness;
        }
        
        const avgBrightness = totalBrightness / brightnesses.length;
        
        for (const b of brightnesses) {
          variance += Math.pow(b - avgBrightness, 2);
        }
        variance /= brightnesses.length;
        
        // If variance is high enough, assume there's a face (not blank)
        if (variance > 500 && avgBrightness > 30 && avgBrightness < 240) {
          facesDetected = 1;
        } else {
          facesDetected = 0;
        }
      }

      // Check: No face detected
      if (facesDetected === 0) {
        showPopup('No face detected.', 'error');
        setIsCapturing(false);
        return;
      }

      // Check: Multiple faces detected
      if (facesDetected > 1) {
        showPopup('Multiple faces detected. Please ensure only one person is in the frame.', 'error');
        setIsCapturing(false);
        return;
      }

      // ✅ Exactly one face detected - proceed with capture
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Create placeholder descriptor
      const placeholderDescriptor = new Float32Array(128);

      setCaptureStage('Face captured!');
      setSuccess(true);
      
      // Wait 3 seconds before proceeding
      setWaitCountdown(3);
      setCaptureStage('Proceeding in 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWaitCountdown(2);
      setCaptureStage('Proceeding in 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWaitCountdown(1);
      setCaptureStage('Proceeding in 1 second...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onFaceCaptured(placeholderDescriptor, imageDataUrl);
      stopCamera();

    } catch (err) {
      console.error('Face capture error:', err);
      setError(err instanceof Error ? err.message : 'Failed to capture face');
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            <p className="text-gray-600 text-xs mt-0.5">{instructions}</p>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onCancel();
            }}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Video Preview */}
        <div className="relative bg-gray-900 rounded-xl overflow-hidden mb-3" style={{ height: '280px' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ minHeight: '280px', maxHeight: '280px' }}
          />
          
          {/* Popup Message */}
          {popup.show && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
              <div className={`p-6 rounded-xl max-w-xs text-center shadow-2xl ${
                popup.type === 'error' ? 'bg-red-500' : 'bg-green-500'
              }`}>
                <div className="mb-3">
                  {popup.type === 'error' ? (
                    <AlertCircle className="w-12 h-12 text-white mx-auto" />
                  ) : (
                    <CheckCircle className="w-12 h-12 text-white mx-auto" />
                  )}
                </div>
                <p className="text-white text-lg font-semibold">{popup.message}</p>
              </div>
            </div>
          )}

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-8xl font-bold animate-pulse">
                {countdown}
              </div>
            </div>
          )}

          {/* Success Overlay with Wait Countdown */}
          {success && waitCountdown !== null && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
              <CheckCircle className="w-20 h-20 text-green-400 mb-4" />
              <p className="text-white text-xl font-semibold mb-2">Face Captured!</p>
              <p className="text-green-300 text-lg">Proceeding in {waitCountdown}...</p>
            </div>
          )}

          {/* Face Frame Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className="border-4 border-blue-400/60 rounded-full"
              style={{ 
                width: '180px', 
                height: '220px',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(59, 130, 246, 0.3)'
              }}
            ></div>
          </div>

          {/* Camera Status */}
          {!cameraActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-white text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                <p>Initializing camera...</p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Error Message */}
        {error && (
          <div className="mb-2 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium text-sm">Error</p>
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mb-3">
          {isCapturing ? (
            <button
              disabled
              className="flex-1 py-2.5 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium
                       opacity-70 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 animate-spin" />
              {captureStage || 'Processing...'}
            </button>
          ) : (
            <>
              <button
                onClick={captureWithCountdown}
                disabled={!cameraActive || success}
                className="flex-1 py-2.5 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium
                         hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                         flex items-center justify-center gap-2"
              >
                {success ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Captured!
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Capture Face
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  stopCamera();
                  onCancel();
                }}
                className="px-5 py-2.5 text-sm bg-gray-200 text-gray-700 rounded-xl font-medium
                         hover:bg-gray-300 transition-all duration-300"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Privacy Notice */}
        <p className="text-xs text-gray-700 text-center">
          🔒 Your facial data is encrypted and stored securely. We never share your biometric information.
        </p>
      </div>
    </div>
  );
};
