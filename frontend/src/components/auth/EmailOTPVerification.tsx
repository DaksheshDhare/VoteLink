import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';

interface EmailOTPProps {
  email: string;
  onSuccess?: (token: string) => void;
  onError?: (error: string) => void;
  onBack?: () => void;
}

const EmailOTPVerification: React.FC<EmailOTPProps> = ({
  email,
  onSuccess,
  onError,
  onBack
}) => {
  const [otp, setOtp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes
  const [canResend, setCanResend] = useState<boolean>(false);
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [otpSent, setOtpSent] = useState<boolean>(false);

  // Initial OTP send
  useEffect(() => {
    sendOTP();
  }, [email]);

  // Timer for OTP expiration
  useEffect(() => {
    if (timeLeft <= 0) {
      setError('OTP has expired. Please request a new one.');
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setResendCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCountdown]);

  const sendOTP = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await authService.sendEmailOTP(email);

      if (response.success) {
        setOtpSent(true);
        setSuccess(`OTP sent to ${email}`);
        setTimeLeft(300); // Reset timer to 5 minutes
        setCanResend(false);
      } else {
        setError(response.message || 'Failed to send OTP');
        onError?.(response.message || 'Failed to send OTP');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error sending OTP';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await authService.resendEmailOTP(email);

      if (response.success) {
        setSuccess('OTP resent to your email');
        setTimeLeft(300); // Reset timer
        setCanResend(false);
        setResendCountdown(30); // 30 second cooldown before next resend
        setOtp(''); // Clear OTP field
      } else {
        setError(response.message || 'Failed to resend OTP');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error resending OTP';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await authService.verifyEmailOTP(email, otp);

      if (response.success) {
        setSuccess('Email verified successfully!');
        onSuccess?.(response.data?.token || '');
      } else {
        setError(response.message || 'OTP verification failed');
        onError?.(response.message || 'OTP verification failed');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error verifying OTP';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Email Verification</h2>
          <p className="mt-2 text-gray-600">
            We've sent a verification code to<br />
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* OTP Form */}
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          {/* OTP Input */}
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP Code
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 text-center text-lg font-semibold tracking-widest border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
              disabled={loading || timeLeft === 0}
            />
            <p className="mt-2 text-xs text-gray-500">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Timer */}
          <div className="flex justify-between items-center text-sm">
            <span className={timeLeft <= 60 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
              Expires in: {formatTime(timeLeft)}
            </span>
            {otpSent && (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={!canResend || loading || timeLeft === 0}
                className={`font-semibold transition ${
                  canResend && !loading && timeLeft > 0
                    ? 'text-blue-600 hover:text-blue-700 cursor-pointer'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                {canResend ? 'Resend Code' : `Resend in ${resendCountdown}s`}
              </button>
            )}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || !otp.trim() || timeLeft === 0}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Back Button */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition"
          >
            Use Different Email
          </button>
        )}

        {/* Help Text */}
        <div className="text-center text-xs text-gray-500">
          <p>
            Didn't receive the code? Check your spam folder or{' '}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={!canResend || loading}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              request a new one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailOTPVerification;
