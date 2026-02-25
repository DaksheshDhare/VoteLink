import React, { useState } from 'react';
import EmailOTPVerification from '@/components/auth/EmailOTPVerification';
import authService from '@/services/authService';

/**
 * Example: Email OTP Login Flow
 * 
 * This example demonstrates how to integrate Email OTP verification
 * into your application's authentication flow.
 */

type AuthStep = 'email-input' | 'email-otp' | 'success' | 'error';

export default function EmailOTPLoginExample() {
  const [step, setStep] = useState<AuthStep>('email-input');
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Step 1: Email Input
   * User enters their email address
   */
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter a valid email');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Invalid email format');
        return;
      }

      // Move to OTP verification step
      setStep('email-otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Email OTP Verification
   * User receives OTP and verifies it
   */
  const handleOTPSuccess = (token: string) => {
    // Store the session token
    localStorage.setItem('votelink_session_token', token);
    
    // Move to success screen
    setStep('success');

    // Redirect to dashboard after brief delay
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 2000);
  };

  const handleOTPError = (errorMsg: string) => {
    setError(errorMsg);
    setStep('error');
  };

  /**
   * Go back to email input
   */
  const handleBack = () => {
    setStep('email-input');
    setEmail('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Step 1: Email Input */}
        {step === 'email-input' && (
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Login with Email</h1>
              <p className="mt-2 text-gray-600">
                Enter your email to receive a verification code
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition">
              Continue with Phone (SMS)
            </button>
          </div>
        )}

        {/* Step 2: Email OTP Verification */}
        {step === 'email-otp' && (
          <EmailOTPVerification
            email={email}
            onSuccess={handleOTPSuccess}
            onError={handleOTPError}
            onBack={handleBack}
          />
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">Success!</h2>
              <p className="mt-2 text-gray-600">
                Your email has been verified. Redirecting to dashboard...
              </p>
            </div>

            <div className="text-sm text-gray-500">
              <p>Redirecting in a few seconds...</p>
            </div>
          </div>
        )}

        {/* Step 4: Error */}
        {step === 'error' && (
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
              <p className="mt-2 text-gray-600">{error}</p>
            </div>

            <button
              onClick={handleBack}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Try Again with Different Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example: Using Email OTP in Custom Components
 * 
 * If you want to integrate Email OTP into existing auth components,
 * use the authService methods directly:
 */

export async function exampleEmailOTPIntegration() {
  const userEmail = 'user@example.com';

  // Step 1: Send OTP
  const sendResponse = await authService.sendEmailOTP(userEmail);
  
  if (!sendResponse.success) {
    console.error('Failed to send OTP:', sendResponse.message);
    return;
  }

  console.log('OTP sent to:', userEmail);

  // Step 2: User receives email and enters OTP code
  const otpCode = '123456'; // User input

  // Step 3: Verify OTP
  const verifyResponse = await authService.verifyEmailOTP(userEmail, otpCode);

  if (verifyResponse.success) {
    // Store session token
    localStorage.setItem('votelink_session_token', verifyResponse.data?.token || '');
    console.log('Email verified successfully!');
    // Redirect to dashboard
    window.location.href = '/dashboard';
  } else {
    console.error('OTP verification failed:', verifyResponse.message);
    // Show error to user
  }

  // Step 4 (Optional): Resend OTP if user didn't receive it
  const resendResponse = await authService.resendEmailOTP(userEmail);
  
  if (resendResponse.success) {
    console.log('OTP resent to:', userEmail);
  }
}

/**
 * Example: Hybrid Auth with Both SMS and Email OTP
 */

export async function hybridAuthExample(email: string, phone: string) {
  // Option 1: Send both OTP methods
  const emailOtpResponse = authService.sendEmailOTP(email);
  const smsOtpResponse = authService.sendOTP(email, phone); // Existing SMS method

  await Promise.all([emailOtpResponse, smsOtpResponse]);

  console.log('Both email and SMS OTP sent');

  // User can now choose which to verify first
  // Once one is verified, the session token is created
}
