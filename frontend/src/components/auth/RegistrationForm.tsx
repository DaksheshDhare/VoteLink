import { useState, useEffect } from 'react';
import { AnimatedBackground } from '../ui/AnimatedBackground';
import { Mail, User, Lock, Shield, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import authService from '../../services/authService';

type RegistrationStep = 'form' | 'otp' | 'success';

interface RegistrationFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  name: string;
}

interface RegistrationFormProps {
  onRegistrationSuccess?: () => void;
  onBackToLogin?: () => void;
}

export function RegistrationForm({ onRegistrationSuccess, onBackToLogin }: RegistrationFormProps) {
  const [step, setStep] = useState<RegistrationStep>('form');
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [isResending, setIsResending] = useState(false);

  // Countdown timer for OTP
  useEffect(() => {
    if (step !== 'otp') return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleInputChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.username || !formData.password || !formData.name) {
      setError('All fields are required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  // Step 1: Send OTP to email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await authService.sendSignupVerificationOTP(formData.email, formData.username);
      
      if (result.success) {
        setStep('otp');
        setTimer(300);
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError('Network error. Please check if the backend server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`reg-otp-${index + 1}`) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };

  // Handle backspace to go to previous input
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`reg-otp-${index - 1}`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  // Step 2: Verify OTP and complete registration
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter a complete 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await authService.verifySignupOTP({
        email: formData.email,
        otp: otpString,
        username: formData.username,
        password: formData.password,
        name: formData.name,
        fullname: formData.name,
      });

      if (result.success) {
        setStep('success');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          if (onBackToLogin) {
            onBackToLogin();
          } else if (onRegistrationSuccess) {
            onRegistrationSuccess();
          }
        }, 2000);
      } else {
        setError(result.message || 'OTP verification failed');
        setOtp(['', '', '', '', '', '']);
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setIsResending(true);
    setError(null);

    try {
      const result = await authService.resendSignupVerificationOTP(formData.email, formData.username);
      if (result.success) {
        setTimer(300);
        setOtp(['', '', '', '', '', '']);
      } else {
        setError(result.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen flex items-center justify-center p-3 py-4 relative z-10">
        <div className="w-full max-w-xl">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">

            {/* SUCCESS STEP */}
            {step === 'success' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                <p className="text-gray-600 mb-4">Your account has been created. Redirecting to login...</p>
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            )}

            {/* FORM STEP */}
            {step === 'form' && (
              <>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl">📝</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h1>
                  <p className="text-sm text-gray-600">Register with email verification</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                    ❌ {error}
                  </div>
                )}

                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="voter@example.com"
                        className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Username *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                        placeholder="johndoe123"
                        className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        required
                        minLength={3}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:scale-[1.02]'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={20} />
                        Sending OTP...
                      </>
                    ) : (
                      'Send Verification OTP'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onBackToLogin}
                    className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Already have an account? Login
                  </button>
                </form>
              </>
            )}

            {/* OTP STEP */}
            {step === 'otp' && (
              <>
                <button
                  onClick={() => { setStep('form'); setError(null); setOtp(['', '', '', '', '', '']); }}
                  className="mb-4 text-gray-600 hover:text-gray-900 flex items-center text-sm"
                >
                  <ArrowLeft size={18} className="mr-1" />
                  Back
                </button>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Shield className="text-white" size={28} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Verify Your Email</h2>
                  <p className="text-sm text-gray-600">
                    Enter the 6-digit code sent to
                  </p>
                  <p className="text-blue-600 font-semibold text-sm">{formData.email}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    Code expires in: <span className="text-red-600 font-bold">{formatTime(timer)}</span>
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                    ❌ {error}
                  </div>
                )}

                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="flex justify-center space-x-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`reg-otp-${index}`}
                        type="text"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-12 text-center border-2 border-gray-300 rounded-xl text-gray-900 text-xl font-bold
                                 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        maxLength={1}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || otp.join('').length !== 6}
                    className={`w-full py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center ${
                      isSubmitting || otp.join('').length !== 6
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-blue-600 hover:shadow-lg hover:scale-[1.02]'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={20} />
                        Verifying & Registering...
                      </>
                    ) : (
                      'Verify & Complete Registration'
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-gray-500 text-xs mb-2">Didn't receive the OTP?</p>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isResending}
                      className="text-blue-600 hover:text-blue-700 font-semibold text-sm disabled:opacity-50"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="animate-spin inline mr-1" size={14} />
                          Resending...
                        </>
                      ) : (
                        'Resend OTP'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
