import React, { useState, useEffect, useRef } from 'react';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
import authService from '../../services/authService';

interface OTPVerificationResult {
  success: boolean;
  error?: string;
}

interface OTPVerificationProps {
  onVerify: (otp: string, otpId?: string) => Promise<boolean | OTPVerificationResult>;
  onBack: () => void;
  isLoading: boolean;
  userEmail: string;
  userMobile: string;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  onVerify,
  onBack,
  isLoading,
  userEmail,
  userMobile
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes
  const [otpId, setOtpId] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const hasSentOTP = useRef(false);

  useEffect(() => {
    // Guard against React StrictMode double-mount
    if (hasSentOTP.current) return;
    hasSentOTP.current = true;
    sendInitialOTP();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sendInitialOTP = async () => {
    try {
      const result = await authService.sendEmailOTP(userEmail);
      if (result.success) {
        setOtpId(result.otpId || '');
        setOtpSent(true);
        setError('');
        console.log('✅ OTP sent successfully via Email');
      } else {
        const msg = result.message || 'Failed to send OTP';
        if (msg.toLowerCase().includes('do not match') || msg.toLowerCase().includes('no_match')) {
          setError(msg);
          setTimeout(() => onBack(), 3000);
        } else {
          setError(msg);
        }
        console.warn('OTP send failed:', result.message);
      }
    } catch (error) {
      setError('Failed to send OTP. Please check your connection and try again.');
      console.error('Error sending initial OTP:', error);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError('');
    
    try {
      const result = await authService.resendEmailOTP(userEmail);
      if (result.success) {
        setOtpId(result.otpId || '');
        setTimer(300);
        setOtp(['', '', '', '', '', '']);
        setError('');
        console.log('✅ OTP resent successfully via Email');
      } else {
        setError(result.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
      console.error('Error resending OTP:', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter a complete 6-digit OTP');
      return;
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otpString)) {
      setError('OTP must contain only digits');
      return;
    }

    // Call parent's onVerify handler which calls backend verification
    const result = await onVerify(otpString, otpId);
    
    // Handle both boolean and object return types
    const isSuccess = typeof result === 'boolean' ? result : result?.success;
    const errorMessage = typeof result === 'object' && result?.error 
      ? result.error 
      : 'Invalid OTP. Please try again.';
    
    if (!isSuccess) {
      setError(errorMessage);
      setOtp(['', '', '', '', '', '']);
    } else {
      setError(''); // Clear any errors on success
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20">
      <div className="bg-black/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-black/20">
        <button
          onClick={onBack}
          className="mb-6 text-black/70 hover:text-black flex items-center transition-colors duration-300"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Shield className="text-black" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Verify OTP</h2>
          <p className="text-gray-800 text-base">
            Enter the 6-digit code sent to your email
          </p>
          <p className="text-blue-600 font-semibold text-base">{userEmail}</p>
          <p className="text-gray-700 text-sm mt-2">
            Code expires in: <span className="text-red-600 font-semibold">{formatTime(timer)}</span>
          </p>
          {otpSent && (
            <p className="text-green-600 text-sm mt-2 flex items-center justify-center">
              ✅ OTP sent successfully to your email address
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                className="w-12 h-12 text-center bg-black/10 border border-black/20 rounded-xl 
                         text-black text-xl font-bold
                         focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20
                         transition-all duration-300"
                maxLength={1}
              />
            ))}
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-600 
                     text-black rounded-xl font-semibold
                     hover:from-green-600 hover:to-blue-700 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transform hover:scale-105 transition-all duration-300
                     shadow-lg hover:shadow-xl
                     flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>

          <div className="text-center">
            <p className="text-gray-700 text-sm mb-2">Didn't receive the OTP?</p>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isResending || timer === 0 && isResending}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <Loader2 className="animate-spin inline mr-2" size={16} />
                  Resending...
                </>
              ) : (
                'Resend OTP'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
