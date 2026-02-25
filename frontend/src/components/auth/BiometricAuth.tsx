import React, { useState, useEffect } from 'react';
import { Fingerprint, Camera, Mic, Shield, CheckCircle, AlertCircle, Loader2, RefreshCw, WifiOff, Moon, Sun } from 'lucide-react';
import { enhancedSecurityService } from '../../services/enhancedSecurityService';

interface BiometricAuthProps {
  onAuthComplete: (success: boolean, data: any) => void;
  requiredMethods?: ('fingerprint' | 'face' | 'voice')[];
  onClose?: () => void;
}

interface ErrorState {
  message: string;
  details: string;
  recoverySteps: string[];
  retryable: boolean;
}

export const BiometricAuth: React.FC<BiometricAuthProps> = ({
  onAuthComplete,
  requiredMethods = ['fingerprint'],
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentMethod, setCurrentMethod] = useState<string>('');
  const [authResults, setAuthResults] = useState<{ [key: string]: any }>({});
  const [deviceSupport, setDeviceSupport] = useState<{ [key: string]: boolean }>({});
  const [step, setStep] = useState(0);
  const [deviceAuth, setDeviceAuth] = useState<any>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [darkMode, setDarkMode] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    checkDeviceCapabilities();
    performDeviceAuthentication();
    
    // Online/Offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Dark mode detection
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(darkModeQuery.matches);
    const handleDarkModeChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    darkModeQuery.addEventListener('change', handleDarkModeChange);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      darkModeQuery.removeEventListener('change', handleDarkModeChange);
    };
  }, []);

  const checkDeviceCapabilities = async () => {
    const support = await enhancedSecurityService.checkBiometricSupport();
    setDeviceSupport(support);
  };

  const performDeviceAuthentication = async () => {
    setIsLoading(true);
    setCurrentMethod('device');
    setError(null);
    
    // Simulate loading progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      setLoadingProgress(Math.min(progress, 90));
    }, 200);
    
    try {
      const deviceAuthResult = await enhancedSecurityService.authenticateDevice();
      setDeviceAuth(deviceAuthResult);
      setLoadingProgress(100);
    } catch (error: any) {
      console.error('Device authentication failed:', error);
      setError({
        message: 'Device Authentication Failed',
        details: error.message || 'Unable to verify device identity',
        recoverySteps: [
          'Check your internet connection',
          'Clear browser cache and cookies',
          'Try using a different browser',
          'Contact support if issue persists'
        ],
        retryable: true
      });
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
      setLoadingProgress(0);
    }
  };

  const performBiometricAuth = async (method: 'fingerprint' | 'face' | 'voice') => {
    setIsLoading(true);
    setCurrentMethod(method);
    setError(null);

    // Check if offline
    if (!isOnline) {
      setError({
        message: 'No Internet Connection',
        details: 'Biometric authentication requires an active internet connection',
        recoverySteps: [
          'Check your WiFi or mobile data connection',
          'Try moving to an area with better signal',
          'Restart your router if using WiFi'
        ],
        retryable: true
      });
      setIsLoading(false);
      return;
    }

    // Simulate loading progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 15;
      setLoadingProgress(Math.min(progress, 90));
    }, 300);

    try {
      // Check if device actually supports this method
      if (!deviceSupport[method] && method !== 'fingerprint') {
        throw new Error(`${method} authentication not supported on this device`);
      }

      const result = await enhancedSecurityService.simulateBiometricAuth(method);
      
      setAuthResults(prev => ({ ...prev, [method]: result }));
      setLoadingProgress(100);
      setRetryCount(0); // Reset retry count on success
      
      // Move to next step or complete
      const nextStep = step + 1;
      if (nextStep >= requiredMethods.length) {
        // All methods completed
        const allResults = { ...authResults, [method]: result, device: deviceAuth };
        onAuthComplete(true, allResults);
      } else {
        setStep(nextStep);
      }
      
    } catch (error: any) {
      console.error(`${method} authentication failed:`, error);
      setAuthResults(prev => ({ ...prev, [method]: { error: error } }));
      
      const errorMessages: { [key: string]: ErrorState } = {
        fingerprint: {
          message: 'Fingerprint Authentication Failed',
          details: 'Unable to verify your fingerprint',
          recoverySteps: [
            'Clean your finger and the sensor',
            'Try using a different finger',
            'Ensure your finger covers the entire sensor',
            'Check device biometric settings'
          ],
          retryable: true
        },
        face: {
          message: 'Face Recognition Failed',
          details: 'Unable to verify your face',
          recoverySteps: [
            'Ensure good lighting on your face',
            'Remove glasses, hats, or masks',
            'Look directly at the camera',
            'Move to a well-lit area',
            'Clean your camera lens'
          ],
          retryable: true
        },
        voice: {
          message: 'Voice Recognition Failed',
          details: 'Unable to verify your voice',
          recoverySteps: [
            'Speak clearly and at normal volume',
            'Reduce background noise',
            'Check microphone permissions',
            'Ensure microphone is not muted',
            'Try a quieter environment'
          ],
          retryable: true
        }
      };
      
      setError(errorMessages[method] || {
        message: 'Authentication Failed',
        details: error.message || 'An unexpected error occurred',
        recoverySteps: ['Try again', 'Contact support if issue persists'],
        retryable: true
      });
      setRetryCount(prev => prev + 1);
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
      setCurrentMethod('');
      setLoadingProgress(0);
    }
  };
  
  const handleRetry = () => {
    setError(null);
    if (currentMethodName) {
      performBiometricAuth(currentMethodName as 'fingerprint' | 'face' | 'voice');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const getBiometricIcon = (method: string) => {
    switch (method) {
      case 'fingerprint':
        return <Fingerprint className="w-8 h-8" />;
      case 'face':
        return <Camera className="w-8 h-8" />;
      case 'voice':
        return <Mic className="w-8 h-8" />;
      default:
        return <Shield className="w-8 h-8" />;
    }
  };

  const getBiometricTitle = (method: string) => {
    switch (method) {
      case 'fingerprint':
        return 'Fingerprint Authentication';
      case 'face':
        return 'Facial Recognition';
      case 'voice':
        return 'Voice Recognition';
      default:
        return 'Biometric Authentication';
    }
  };

  const getBiometricDescription = (method: string) => {
    switch (method) {
      case 'fingerprint':
        return deviceSupport.fingerprint 
          ? 'Please place your finger on the scanner or authenticate using your device biometrics'
          : 'Simulated fingerprint authentication - Click the button below to proceed';
      case 'face':
        return deviceSupport.face
          ? 'Please look at the camera for facial recognition'
          : 'Facial recognition not available - using alternative verification';
      case 'voice':
        return deviceSupport.voice
          ? 'Please speak clearly into the microphone'
          : 'Voice recognition not available - using alternative verification';
      default:
        return 'Please complete biometric verification';
    }
  };

  const currentMethodName = requiredMethods[step] || '';
  const isCompleted = step >= requiredMethods.length;
  
  // Skeleton loader component
  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-20 w-20 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mx-auto"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mx-auto"></div>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="biometric-auth-title"
      aria-describedby="biometric-auth-description"
    >
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-orange-200 dark:border-orange-800 transition-all duration-300 animate-slideIn">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          onKeyPress={(e) => handleKeyPress(e, () => setDarkMode(!darkMode))}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
        </button>
        
        {/* Offline Indicator */}
        {!isOnline && (
          <div 
            className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-center animate-fadeIn"
            role="alert"
            aria-live="polite"
          >
            <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-sm text-red-800 dark:text-red-300 font-medium">You are currently offline</span>
          </div>
        )}
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div 
            className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-orange-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110"
            role="img"
            aria-label={`${getBiometricTitle(currentMethodName)} icon`}
          >
            {isLoading && loadingProgress < 100 ? (
              <div className="relative">
                <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-spin" />
                <span className="sr-only">Loading {loadingProgress}%</span>
              </div>
            ) : isLoading && loadingProgress === 0 ? (
              <SkeletonLoader />
            ) : (
              getBiometricIcon(currentMethodName)
            )}
          </div>
          
          {/* Loading Progress Bar */}
          {isLoading && loadingProgress > 0 && (
            <div className="mb-4 animate-fadeIn">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-green-600 h-1.5 transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                  role="progressbar"
                  aria-valuenow={loadingProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Loading progress"
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{loadingProgress}%</p>
            </div>
          )}
          
          <h2 
            id="biometric-auth-title"
            className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-300"
          >
            Enhanced Security Verification
          </h2>
          <p 
            id="biometric-auth-description"
            className="text-sm sm:text-base text-gray-600 dark:text-gray-300 transition-colors duration-300"
          >
            Multi-factor biometric authentication for secure voting
          </p>
        </div>

        {/* Device Authentication Status */}
        {deviceAuth && (
          <div 
            className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-4 mb-6 border border-blue-200 dark:border-blue-800 transition-all duration-300 animate-fadeIn"
            role="status"
            aria-label="Device authentication status"
          >
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <h4 className="text-blue-800 dark:text-blue-300 font-semibold text-sm mb-1">Device Authentication</h4>
                <p className="text-blue-700 dark:text-blue-400 text-xs mb-2">
                  Confidence: {Math.round(deviceAuth.confidence * 100)}%
                </p>
                <div className="flex flex-wrap gap-1.5" role="list" aria-label="Authentication factors">
                  {deviceAuth.factors.map((factor: string, idx: number) => (
                    <span 
                      key={idx} 
                      className="text-xs bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded transition-colors duration-300"
                      role="listitem"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Display with Recovery Steps */}
        {error && (
          <div 
            className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 sm:p-5 mb-6 animate-shake"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="flex items-start space-x-3 mb-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <h4 className="text-red-800 dark:text-red-300 font-bold text-sm sm:text-base mb-1">{error.message}</h4>
                <p className="text-red-700 dark:text-red-400 text-xs sm:text-sm mb-3">{error.details}</p>
                
                <div className="bg-red-100 dark:bg-red-900/50 rounded-lg p-3 mb-3">
                  <p className="text-red-800 dark:text-red-300 font-semibold text-xs mb-2">Recovery Steps:</p>
                  <ol className="list-decimal list-inside space-y-1" role="list">
                    {error.recoverySteps.map((step, idx) => (
                      <li key={idx} className="text-red-700 dark:text-red-400 text-xs">{step}</li>
                    ))}
                  </ol>
                </div>
                
                {error.retryable && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleRetry}
                      onKeyPress={(e) => handleKeyPress(e, handleRetry)}
                      disabled={isLoading}
                      className="flex-1 py-2.5 sm:py-2 px-4 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg font-medium text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px] sm:min-h-[40px]"
                      aria-label="Retry authentication"
                    >
                      <RefreshCw className="w-4 h-4" aria-hidden="true" />
                      Retry {retryCount > 0 && `(Attempt ${retryCount + 1})`}
                    </button>
                    {onClose && (
                      <button
                        onClick={onClose}
                        onKeyPress={(e) => handleKeyPress(e, onClose)}
                        className="flex-1 py-2.5 sm:py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 min-h-[44px] sm:min-h-[40px]"
                        aria-label="Cancel and close"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!isCompleted && !error ? (
          <>
            {/* Current Method */}
            <div className="text-center mb-6 animate-fadeIn">
              <h3 
                className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-300"
                id="current-method-title"
              >
                {getBiometricTitle(currentMethodName)}
              </h3>
              <p 
                className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-4 transition-colors duration-300"
                id="current-method-description"
              >
                {getBiometricDescription(currentMethodName)}
              </p>
              
              {/* Enhanced Progress with Step Details */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Step {step + 1} of {requiredMethods.length}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-orange-600 dark:text-orange-400">
                    {Math.round(((step + 1) / requiredMethods.length) * 100)}% Complete
                  </span>
                </div>
                
                {/* Visual Progress Bar */}
                <div 
                  className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner"
                  role="progressbar"
                  aria-valuenow={Math.round(((step + 1) / requiredMethods.length) * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Overall authentication progress"
                >
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                    style={{ width: `${((step + 1) / requiredMethods.length) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
                  </div>
                </div>
                
                {/* Step Indicators */}
                <div className="flex justify-between mt-3 px-1">
                  {requiredMethods.map((method, idx) => (
                    <div 
                      key={method}
                      className="flex flex-col items-center flex-1"
                      role="listitem"
                      aria-label={`Step ${idx + 1}: ${getBiometricTitle(method)}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        idx < step ? 'bg-green-500 dark:bg-green-600' :
                        idx === step ? 'bg-orange-500 dark:bg-orange-600 scale-110' :
                        'bg-gray-300 dark:bg-gray-600'
                      }`}>
                        {idx < step ? (
                          <CheckCircle className="w-5 h-5 text-white" aria-hidden="true" />
                        ) : (
                          <span className="text-xs font-bold text-white">{idx + 1}</span>
                        )}
                      </div>
                      <span className={`text-xs mt-1 transition-colors duration-300 ${
                        idx === step ? 'text-gray-800 dark:text-gray-100 font-semibold' :
                        'text-gray-500 dark:text-gray-400'
                      }`}>
                        {method === 'fingerprint' ? 'Print' : method === 'face' ? 'Face' : 'Voice'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Authentication Button */}
            <button
              onClick={() => performBiometricAuth(currentMethodName as 'fingerprint' | 'face' | 'voice')}
              onKeyPress={(e) => handleKeyPress(e, () => performBiometricAuth(currentMethodName as 'fingerprint' | 'face' | 'voice'))}
              disabled={isLoading || !isOnline}
              className="w-full py-4 sm:py-5 bg-gradient-to-r from-orange-500 to-green-600 
                       text-white rounded-xl font-semibold text-base sm:text-lg
                       hover:from-orange-600 hover:to-green-700 
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transform hover:scale-105 active:scale-95 transition-all duration-300
                       shadow-lg hover:shadow-xl flex items-center justify-center
                       focus:outline-none focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-700
                       min-h-[56px] sm:min-h-[60px] touch-manipulation"
              aria-label={`Start ${getBiometricTitle(currentMethodName)}`}
              aria-describedby="current-method-description"
              aria-busy={isLoading}
            >
              {isLoading && currentMethod === currentMethodName ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={24} aria-hidden="true" />
                  <span>Authenticating...</span>
                  <span className="sr-only">Please wait while we verify your biometric data</span>
                </>
              ) : (
                <>
                  <span aria-hidden="true">{getBiometricIcon(currentMethodName)}</span>
                  <span className="ml-3">
                    Start {getBiometricTitle(currentMethodName)}
                  </span>
                </>
              )}
            </button>

            {/* Device Support Info */}
            <div className="mt-6 text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center transition-colors duration-300">
              {!deviceSupport[currentMethodName] && currentMethodName !== 'fingerprint' && (
                <div 
                  className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4 animate-fadeIn"
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" aria-hidden="true" />
                    <span className="text-yellow-800 dark:text-yellow-300 text-left">
                      {currentMethodName === 'face' ? 'Camera' : 'Microphone'} not detected. Using simulated authentication.
                    </span>
                  </div>
                </div>
              )}
              
              <p className="flex items-center justify-center gap-2" role="status">
                <Shield className="w-4 h-4" aria-hidden="true" />
                <span>Device fingerprinting and encrypted authentication</span>
              </p>
            </div>
          </>
        ) : isCompleted ? (
          /* Completion Screen */
          <div className="text-center animate-fadeIn" role="status" aria-live="polite">
            <div className="relative inline-block mb-4">
              <CheckCircle 
                className="w-16 h-16 sm:w-20 sm:h-20 text-green-600 dark:text-green-500 mx-auto animate-checkmark" 
                aria-hidden="true"
              />
              <div className="absolute inset-0 animate-ping opacity-20">
                <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-600" aria-hidden="true" />
              </div>
            </div>
            
            <h3 
              className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-300"
              aria-label="Authentication successful"
            >
              Authentication Successful!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-6 transition-colors duration-300">
              All biometric verifications completed successfully.
            </p>
            
            <div className="space-y-2 mb-6" role="list" aria-label="Completed authentication methods">
              {requiredMethods.map((method, idx) => (
                <div 
                  key={method} 
                  className="flex items-center justify-between bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4 transition-all duration-300 hover:shadow-md animate-fadeIn"
                  style={{ animationDelay: `${idx * 100}ms` }}
                  role="listitem"
                >
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true">{getBiometricIcon(method)}</span>
                    <span className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-100">
                      {getBiometricTitle(method)}
                    </span>
                  </div>
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-500" aria-label="Completed" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Cancel Button */}
        {onClose && !error && (
          <button
            onClick={onClose}
            onKeyPress={(e) => handleKeyPress(e, onClose)}
            className="w-full mt-4 py-3 sm:py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium
                     hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300
                     focus:outline-none focus:ring-2 focus:ring-gray-500
                     min-h-[44px] sm:min-h-[40px] touch-manipulation"
            aria-label="Cancel authentication process"
          >
            Cancel Authentication
          </button>
        )}
      </div>
    </div>
  );
};

// Add custom CSS animations to your global styles or index.css
/*
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes checkmark {
  0% { transform: scale(0) rotate(-45deg); }
  50% { transform: scale(1.2) rotate(-45deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

.animate-shake {
  animation: shake 0.5s ease-out;
}

.animate-shimmer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 2s infinite;
}

.animate-checkmark {
  animation: checkmark 0.6s ease-out;
}
*/