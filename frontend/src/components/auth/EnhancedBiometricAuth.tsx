import React, { useState, useRef, useEffect } from 'react';
import { Fingerprint, Eye, Scan, Shield, AlertTriangle } from 'lucide-react';
import { advancedSecurityService } from '../../services/advancedSecurityService';

interface BiometricAuthProps {
  onSuccess: (biometricData: BiometricData) => void;
  onError: (error: string) => void;
  userEmail: string;
  isLoading?: boolean;
}

interface BiometricData {
  type: 'fingerprint' | 'face' | 'voice' | 'iris';
  data: string;
  confidence: number;
  timestamp: number;
  deviceFingerprint: string;
}

interface WebAuthnCredential {
  id: string;
  rawId: ArrayBuffer;
  response: AuthenticatorAttestationResponse;
  type: 'public-key';
}

export const EnhancedBiometricAuth: React.FC<BiometricAuthProps> = ({
  onSuccess,
  onError,
  userEmail,
  isLoading = false
}) => {
  const [authStep, setAuthStep] = useState<'selection' | 'fingerprint' | 'face' | 'voice' | 'iris' | 'processing'>('selection');
  const [isProcessing, setIsProcessing] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);
  const [supportedMethods, setSupportedMethods] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    const supported: string[] = [];

    // Check WebAuthn support (for fingerprint)
    if (window.PublicKeyCredential) {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (available) supported.push('fingerprint');
    }

    // Check camera support (for face recognition)
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      if (devices.some(device => device.kind === 'videoinput')) {
        supported.push('face');
      }
      if (devices.some(device => device.kind === 'audioinput')) {
        supported.push('voice');
      }
    } catch (error) {
      console.error('Error checking media devices:', error);
    }

    // Iris scanning (simulated - would require specialized hardware)
    if (supported.includes('face')) {
      supported.push('iris');
    }

    setSupportedMethods(supported);
  };

  const handleFingerprintAuth = async () => {
    setAuthStep('fingerprint');
    setIsProcessing(true);
    setAuthProgress(0);

    try {
      // Generate device fingerprint
      const deviceFingerprint = await advancedSecurityService.generateDeviceFingerprint();
      
      // Log security event
      await advancedSecurityService.logSecurityEvent('login_attempt', {
        method: 'fingerprint',
        userEmail
      });

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setAuthProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // WebAuthn registration/authentication
      const credential = await createWebAuthnCredential(userEmail);
      
      if (credential) {
        const biometricData: BiometricData = {
          type: 'fingerprint',
          data: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
          confidence: 0.95,
          timestamp: Date.now(),
          deviceFingerprint: deviceFingerprint.id
        };

        onSuccess(biometricData);
      } else {
        throw new Error('Fingerprint authentication failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Fingerprint authentication failed';
      onError(errorMessage);
      await advancedSecurityService.logSecurityEvent('suspicious_activity', {
        method: 'fingerprint',
        error: errorMessage,
        userEmail
      });
    } finally {
      setIsProcessing(false);
      setAuthProgress(0);
    }
  };

  const createWebAuthnCredential = async (userEmail: string): Promise<WebAuthnCredential | null> => {
    if (!window.PublicKeyCredential) {
      throw new Error('WebAuthn not supported');
    }

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge: new Uint8Array(32),
      rp: {
        name: "VoteLink",
        id: window.location.hostname,
      },
      user: {
        id: new TextEncoder().encode(userEmail),
        name: userEmail,
        displayName: userEmail,
      },
      pubKeyCredParams: [{alg: -7, type: "public-key"}],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required"
      },
      timeout: 60000,
      attestation: "direct"
    };

    // Fill challenge with random data
    const challengeArray = new Uint8Array(publicKeyCredentialCreationOptions.challenge as ArrayBuffer);
    window.crypto.getRandomValues(challengeArray);

    try {
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      return credential as unknown as WebAuthnCredential;
    } catch (error) {
      console.error('WebAuthn error:', error);
      return null;
    }
  };

  const handleFaceAuth = async () => {
    setAuthStep('face');
    setIsProcessing(true);
    setAuthProgress(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Simulate face detection and analysis
      await performFaceAnalysis(stream);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Face authentication failed';
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const performFaceAnalysis = async (stream: MediaStream) => {
    const deviceFingerprint = await advancedSecurityService.generateDeviceFingerprint();
    
    // Simulate face detection progress
    for (let i = 0; i <= 100; i += 5) {
      setAuthProgress(i);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Capture face image for analysis
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        
        const faceData = canvas.toDataURL('image/jpeg', 0.8);
        
        const biometricData: BiometricData = {
          type: 'face',
          data: faceData,
          confidence: 0.92,
          timestamp: Date.now(),
          deviceFingerprint: deviceFingerprint.id
        };

        // Stop video stream
        stream.getTracks().forEach(track => track.stop());
        
        onSuccess(biometricData);
      }
    }
  };

  const handleVoiceAuth = async () => {
    setAuthStep('voice');
    setIsProcessing(true);
    setAuthProgress(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioRef.current = mediaRecorder;

      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioData = await blobToBase64(audioBlob);
        
        const deviceFingerprint = await advancedSecurityService.generateDeviceFingerprint();
        
        const biometricData: BiometricData = {
          type: 'voice',
          data: audioData,
          confidence: 0.88,
          timestamp: Date.now(),
          deviceFingerprint: deviceFingerprint.id
        };

        stream.getTracks().forEach(track => track.stop());
        onSuccess(biometricData);
      };

      mediaRecorder.start();

      // Record for 3 seconds
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.stop();
        }
      }, 3000);

      // Simulate progress
      for (let i = 0; i <= 100; i += 2) {
        setAuthProgress(i);
        await new Promise(resolve => setTimeout(resolve, 30));
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Voice authentication failed';
      onError(errorMessage);
      setIsProcessing(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const renderAuthMethod = (method: string, icon: React.ReactNode, title: string, description: string) => (
    <button
      key={method}
      onClick={() => {
        switch (method) {
          case 'fingerprint':
            handleFingerprintAuth();
            break;
          case 'face':
            handleFaceAuth();
            break;
          case 'voice':
            handleVoiceAuth();
            break;
          case 'iris':
            handleFaceAuth(); // Use face auth for iris simulation
            break;
        }
      }}
      disabled={isLoading || isProcessing}
      className="w-full p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
          {icon}
        </div>
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </button>
  );

  if (authStep === 'selection') {
    return (
      <div className="max-w-md mx-auto p-6 bg-gray-50 rounded-xl">
        <div className="text-center mb-6">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enhanced Biometric Authentication</h2>
          <p className="text-gray-600">Choose your preferred authentication method</p>
        </div>

        <div className="space-y-4">
          {supportedMethods.includes('fingerprint') && renderAuthMethod(
            'fingerprint',
            <Fingerprint className="w-6 h-6 text-blue-600" />,
            'Fingerprint',
            'Touch sensor for secure authentication'
          )}

          {supportedMethods.includes('face') && renderAuthMethod(
            'face',
            <Scan className="w-6 h-6 text-blue-600" />,
            'Face Recognition',
            'Look at the camera for verification'
          )}

          {supportedMethods.includes('voice') && renderAuthMethod(
            'voice',
            <Eye className="w-6 h-6 text-blue-600" />,
            'Voice Recognition',
            'Speak the provided phrase'
          )}

          {supportedMethods.includes('iris') && renderAuthMethod(
            'iris',
            <Eye className="w-6 h-6 text-blue-600" />,
            'Iris Scan',
            'Look directly at the camera'
          )}
        </div>

        {supportedMethods.length === 0 && (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600">No biometric authentication methods available on this device.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-blue-200 rounded-full animate-ping" />
          <div className="absolute inset-4 bg-blue-300 rounded-full" />
          {authStep === 'fingerprint' && <Fingerprint className="absolute inset-6 w-12 h-12 text-blue-600" />}
          {authStep === 'face' && <Scan className="absolute inset-6 w-12 h-12 text-blue-600" />}
          {authStep === 'voice' && <Eye className="absolute inset-6 w-12 h-12 text-blue-600" />}
          {authStep === 'iris' && <Eye className="absolute inset-6 w-12 h-12 text-blue-600" />}
        </div>

        <h3 className="text-xl font-semibold text-gray-900 capitalize">
          {authStep} Authentication
        </h3>
        
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${authProgress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">{authProgress}% Complete</p>
      </div>

      {authStep === 'face' && (
        <div className="mb-4">
          <video
            ref={videoRef}
            className="w-full rounded-lg"
            autoPlay
            muted
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {authStep === 'voice' && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-lg font-medium text-gray-900 mb-2">
            Please say: "I authorize my vote for VoteLink"
          </p>
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      <button
        onClick={() => setAuthStep('selection')}
        disabled={isProcessing}
        className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        Back to Selection
      </button>
    </div>
  );
};