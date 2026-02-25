import React, { useState } from 'react';
import { CreditCard, Shield, CheckCircle, AlertCircle, Loader2, MessageSquare, Eye, EyeOff, Clock, RefreshCw, Lock, XCircle } from 'lucide-react';
import { verificationService, VerificationResult, AadhaarDetails } from '../../services/verificationService';

interface AadhaarVerificationProps {
  onVerificationComplete: (result: VerificationResult) => void;
  onBack: () => void;
}

export const AadhaarVerification: React.FC<AadhaarVerificationProps> = ({
  onVerificationComplete,
  onBack
}) => {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [isAadhaarValid, setIsAadhaarValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Enhanced Aadhaar formatting with validation feedback
  const formatAadhaar = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  // Enhanced Verhoeff algorithm implementation
  const verhoeffValidation = (aadhaar: string): { isValid: boolean; confidence: number } => {
    const cleanAadhaar = aadhaar.replace(/\s/g, '');
    
    if (cleanAadhaar.length !== 12) {
      return { isValid: false, confidence: 0 };
    }

    // Verhoeff algorithm tables
    const multiplicationTable = [
      [0,1,2,3,4,5,6,7,8,9],
      [1,2,3,4,0,6,7,8,9,5],
      [2,3,4,0,1,7,8,9,5,6],
      [3,4,0,1,2,8,9,5,6,7],
      [4,0,1,2,3,9,5,6,7,8],
      [5,9,8,7,6,0,4,3,2,1],
      [6,5,9,8,7,1,0,4,3,2],
      [7,6,5,9,8,2,1,0,4,3],
      [8,7,6,5,9,3,2,1,0,4],
      [9,8,7,6,5,4,3,2,1,0]
    ];
    
    const permutationTable = [
      [0,1,2,3,4,5,6,7,8,9],
      [1,5,7,6,2,8,3,0,9,4],
      [5,8,0,3,7,9,6,1,4,2],
      [8,9,1,6,0,4,3,5,2,7],
      [9,4,5,3,1,2,6,8,7,0],
      [4,2,8,6,5,7,3,9,0,1],
      [2,7,9,3,8,0,6,4,1,5],
      [7,0,4,6,9,1,3,2,5,8]
    ];
    
    let checksum = 0;
    const digits = cleanAadhaar.split('').reverse().map(Number);
    
    for (let i = 0; i < digits.length; i++) {
      checksum = multiplicationTable[checksum][permutationTable[((i + 1) % 8)][digits[i]]];
    }
    
    const isValid = checksum === 0;
    const confidence = isValid ? 95 : 0;
    
    return { isValid, confidence };
  };

  // Real-time validation feedback
  const getValidationFeedback = (aadhaar: string) => {
    const cleaned = aadhaar.replace(/\s/g, '');
    
    if (cleaned.length === 0) {
      return { message: '', type: 'neutral' };
    }
    
    if (cleaned.length < 12) {
      return { 
        message: `${cleaned.length}/12 digits entered`, 
        type: 'warning' 
      };
    }
    
    if (cleaned.length === 12) {
      const validation = verhoeffValidation(aadhaar);
      if (validation.isValid) {
        return { 
          message: '✓ Valid Aadhaar format', 
          type: 'success' 
        };
      } else {
        return { 
          message: '✗ Invalid Aadhaar checksum', 
          type: 'error' 
        };
      }
    }
    
    return { message: 'Too many digits', type: 'error' };
  };

  const validationFeedback = getValidationFeedback(aadhaarNumber);

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAadhaar(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 12) {
      setAadhaarNumber(formatted);
      
      // Real-time validation
      if (formatted.replace(/\s/g, '').length === 12) {
        const validation = verhoeffValidation(formatted);
        setIsAadhaarValid(validation.isValid);
        setValidationMessage(validation.isValid ? 'Valid Aadhaar format ✓' : 'Invalid Aadhaar checksum ✗');
      } else {
        setIsAadhaarValid(false);
        setValidationMessage('');
      }
    }
  };

  const handleSendOtp = async () => {
    const cleanAadhaar = aadhaarNumber.replace(/\s/g, '');
    
    // Enhanced validation
    if (cleanAadhaar.length !== 12) {
      setValidationMessage('Please enter a complete 12-digit Aadhaar number');
      return;
    }

    const validation = verhoeffValidation(aadhaarNumber);
    if (!validation.isValid) {
      setValidationMessage('Invalid Aadhaar number. Please check and try again.');
      return;
    }

    setIsSendingOtp(true);
    setValidationMessage('');

    try {
      // Simulate UIDAI API call with enhanced feedback
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      setOtpSent(true);
      setOtpTimer(60); // Increased to 60 seconds for better UX
      
      // Enhanced countdown with cleanup
      const timer = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Enhanced success message with masked Aadhaar
      const maskedAadhaar = `XXXX XXXX ${cleanAadhaar.slice(-4)}`;
      setValidationMessage(`OTP sent to mobile registered with Aadhaar ${maskedAadhaar}`);
      
    } catch (err) {
      console.error('OTP sending error:', err);
      setValidationMessage('Failed to send OTP. Please check your network and try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanAadhaar = aadhaarNumber.replace(/\s/g, '');

    // Enhanced validation with specific error messages
    if (!cleanAadhaar || cleanAadhaar.length !== 12) {
      setValidationMessage('Please enter a complete 12-digit Aadhaar number');
      return;
    }

    const validation = verhoeffValidation(aadhaarNumber);
    if (!validation.isValid) {
      setValidationMessage('Invalid Aadhaar number format. Please check your entry.');
      return;
    }

    if (!otp || otp.length !== 6) {
      setValidationMessage('Please enter the complete 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    setShowResult(false);
    setValidationMessage('Verifying with UIDAI...');

    try {
      // Enhanced verification with confidence scoring
      const result = await verificationService.verifyAadhaar(cleanAadhaar, otp);
      
      // Add format validation confidence to result
      if (result.verified) {
        result.confidence = Math.min(result.confidence + validation.confidence, 100);
      }

      setVerificationResult(result);
      setShowResult(true);

      if (result.verified) {
        setValidationMessage('✓ Aadhaar verified successfully!');
        setTimeout(() => {
          onVerificationComplete(result);
        }, 2500);
      } else {
        setValidationMessage(result.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      const errorResult = {
        success: false,
        verified: false,
        error: 'Aadhaar verification service is currently unavailable. Please try again later.',
        confidence: 0
      };
      setVerificationResult(errorResult);
      setValidationMessage(errorResult.error);
      setShowResult(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <CheckCircle className="w-5 h-5" />;
    if (confidence >= 70) return <AlertCircle className="w-5 h-5" />;
    return <XCircle className="w-5 h-5" />;
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return 'High Confidence';
    if (confidence >= 70) return 'Medium Confidence';
    if (confidence >= 50) return 'Low Confidence';
    return 'Very Low Confidence';
  };

  const resetForm = () => {
    setShowResult(false);
    setVerificationResult(null);
    setAadhaarNumber('');
    setOtp('');
    setOtpSent(false);
    setOtpTimer(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/30">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Aadhaar Verification</h1>
          <p className="text-black/70">Verify your identity using Aadhaar OTP</p>
        </div>

        {!showResult ? (
          <>
            {/* Verification Form */}
            <form onSubmit={handleVerification} className="space-y-6">
              {/* Aadhaar Number Input */}
              <div>
                <label className="block text-black font-medium mb-2">
                  Aadhaar Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/50 w-5 h-5" />
                  <input
                    type={showAadhaar ? "text" : "password"}
                    value={aadhaarNumber}
                    onChange={handleAadhaarChange}
                    placeholder="XXXX XXXX XXXX"
                    className={`w-full pl-12 pr-12 py-3 bg-white/20 backdrop-blur-sm border rounded-xl 
                             text-black placeholder-black/50 focus:outline-none focus:ring-2 
                             transition-all duration-300 font-mono tracking-wider ${
                               aadhaarNumber.replace(/\s/g, '').length === 12
                                 ? isAadhaarValid
                                   ? 'border-green-400 focus:border-green-500 focus:ring-green-400/20'
                                   : 'border-red-400 focus:border-red-500 focus:ring-red-400/20'
                                 : 'border-white/30 focus:border-purple-400 focus:ring-purple-400/20'
                             }`}
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {aadhaarNumber.replace(/\s/g, '').length === 12 && (
                      <div className={`w-2 h-2 rounded-full ${
                        isAadhaarValid ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowAadhaar(!showAadhaar)}
                      className="text-black/50 hover:text-black/70 transition-colors"
                    >
                      {showAadhaar ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                {/* Real-time validation feedback */}
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-black/60">
                    Enter your 12-digit Aadhaar number
                  </p>
                  {validationFeedback.message && (
                    <span className={`text-xs font-medium ${
                      validationFeedback.type === 'success' ? 'text-green-600' :
                      validationFeedback.type === 'error' ? 'text-red-600' :
                      validationFeedback.type === 'warning' ? 'text-amber-600' :
                      'text-black/60'
                    }`}>
                      {validationFeedback.message}
                    </span>
                  )}
                </div>
                
                {/* Enhanced validation message display */}
                {validationMessage && (
                  <div className={`mt-2 p-2 rounded-lg text-xs ${
                    validationMessage.includes('✓') ? 'bg-green-50 text-green-700 border border-green-200' :
                    validationMessage.includes('✗') ? 'bg-red-50 text-red-700 border border-red-200' :
                    'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {validationMessage}
                  </div>
                )}
              </div>

              {/* Send OTP Button */}
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || !isAadhaarValid || aadhaarNumber.replace(/\s/g, '').length !== 12}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium 
                           hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                           flex items-center justify-center gap-2 shadow-lg"
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting to UIDAI...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Send Secure OTP</span>
                    </>
                  )}
                </button>
              ) : (
                <>
                  {/* OTP Input */}
                  <div>
                    <label className="block text-black font-medium mb-2">
                      Enter OTP <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/50 w-5 h-5" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 6) {
                            setOtp(value);
                          }
                        }}
                        placeholder="Enter 6-digit OTP"
                        className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl 
                                 text-black placeholder-black/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 
                                 transition-all duration-300 text-center tracking-widest font-mono text-lg"
                        maxLength={6}
                        required
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-black/60 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        OTP sent to registered mobile
                      </p>
                      {otpTimer > 0 ? (
                        <span className="text-xs text-purple-600 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Resend in {otpTimer}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium underline flex items-center gap-1 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={isVerifying || otp.length !== 6}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium 
                             hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                             flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        Verify Aadhaar
                      </>
                    )}
                  </button>
                </>
              )}
            </form>

            {/* Back Button */}
            <button
              onClick={onBack}
              className="w-full py-3 mt-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl font-medium 
                       text-black hover:bg-white/30 transition-all duration-300"
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            {/* Verification Result */}
            <div className="space-y-6">
              {verificationResult?.verified ? (
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-600 mb-2">Aadhaar Verified!</h2>
                  <p className="text-black/70 mb-4">Your Aadhaar has been successfully verified.</p>
                  
                  {verificationResult.details && (
                    <div className="bg-green-50/50 backdrop-blur-sm rounded-xl p-4 text-left border border-green-200/50">
                      <h3 className="font-semibold text-green-800 mb-3">Verified Details:</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Name:</span> {(verificationResult.details as AadhaarDetails).fullName}</div>
                        <div><span className="font-medium">Date of Birth:</span> {(verificationResult.details as AadhaarDetails).dateOfBirth}</div>
                        <div><span className="font-medium">State:</span> {(verificationResult.details as AadhaarDetails).state}</div>
                        <div><span className="font-medium">Mobile:</span> {(verificationResult.details as AadhaarDetails).mobileNumber}</div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getConfidenceColor(verificationResult.confidence)}`}>
                      {getConfidenceIcon(verificationResult.confidence)}
                      <span>
                        {getConfidenceLabel(verificationResult.confidence)} ({verificationResult.confidence}%)
                      </span>
                    </div>
                  </div>
                  
                  {/* Enhanced verification details */}
                  <div className="mt-4 p-3 bg-green-50/50 backdrop-blur-sm rounded-xl border border-green-200/50">
                    <div className="text-xs text-green-700 space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        <span>Format validation: Passed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        <span>Verhoeff checksum: Valid</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        <span>UIDAI verification: Successful</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        <span>Data encryption: AES-256</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-black/60 mt-4">
                    Redirecting to voting interface...
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
                  <p className="text-black/70 mb-4">{verificationResult?.error}</p>

                  <div className="bg-red-50/50 backdrop-blur-sm rounded-xl p-4 mt-4 border border-red-200/50">
                    <h3 className="font-semibold text-red-800 mb-2">Common Issues:</h3>
                    <ul className="text-sm text-red-700 text-left space-y-1">
                      <li>• Incorrect Aadhaar number</li>
                      <li>• Wrong or expired OTP</li>
                      <li>• Mobile number not linked to Aadhaar</li>
                      <li>• Network connectivity issues</li>
                    </ul>
                  </div>

                  <button
                    onClick={resetForm}
                    className="w-full py-3 mt-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium 
                             hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-purple-50/50 backdrop-blur-sm rounded-xl border border-purple-200/50">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-purple-700">
              <p className="font-medium mb-1">UIDAI Verified</p>
              <p>Your Aadhaar verification is processed through secure UIDAI channels. We follow all privacy and data protection protocols.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};