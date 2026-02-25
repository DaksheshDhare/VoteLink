import React, { useState } from 'react';
import { CreditCard, Calendar, User, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';
import { verificationService, VerificationResult } from '../../services/verificationService';

interface VoterIDVerificationProps {
  onVerificationComplete: (result: VerificationResult) => void;
  onBack: () => void;
}

export const VoterIDVerification: React.FC<VoterIDVerificationProps> = ({
  onVerificationComplete,
  onBack
}) => {
  const [voterId, setVoterId] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [fullName, setFullName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!voterId || !dateOfBirth) {
      alert('Please fill in all required fields');
      return;
    }

    setIsVerifying(true);
    setShowResult(false);

    try {
      const result = await verificationService.verifyVoterID(
        voterId.trim(),
        dateOfBirth,
        fullName.trim() || undefined
      );

      setVerificationResult(result);
      setShowResult(true);

      if (result.verified) {
        // Store voter ID info and proceed to face verification
        setTimeout(() => {
          onVerificationComplete(result);
        }, 2000);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        success: false,
        verified: false,
        error: 'Verification service is currently unavailable',
        confidence: 0
      });
      setShowResult(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return 'High Confidence';
    if (confidence >= 70) return 'Medium Confidence';
    if (confidence >= 50) return 'Low Confidence';
    return 'Very Low Confidence';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/30">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Voter ID Verification</h1>
          <p className="text-black/70">Verify your identity using Voter ID details</p>
        </div>

        {!showResult ? (
          <>
            {/* Verification Form */}
            <form onSubmit={handleVerification} className="space-y-6">
              {/* Voter ID Input */}
              <div>
                <label className="block text-black font-medium mb-2">
                  Voter ID Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/50 w-5 h-5" />
                  <input
                    type="text"
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value.toUpperCase())}
                    placeholder="Enter your Voter ID"
                    className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl 
                             text-black placeholder-black/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 
                             transition-all duration-300"
                    maxLength={20}
                    required
                  />
                </div>
                <p className="text-xs text-black/60 mt-1">
                  Example: ABC1234567890
                </p>
              </div>

              {/* Date of Birth Input */}
              <div>
                <label className="block text-black font-medium mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/50 w-5 h-5" />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl 
                             text-black focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 
                             transition-all duration-300"
                    required
                  />
                </div>
                <p className="text-xs text-black/60 mt-1">
                  Enter date as mentioned on your Voter ID
                </p>
              </div>

              {/* Full Name Input (Optional) */}
              <div>
                <label className="block text-black font-medium mb-2">
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/50 w-5 h-5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl 
                             text-black placeholder-black/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 
                             transition-all duration-300"
                  />
                </div>
                <p className="text-xs text-black/60 mt-1">
                  Helps improve verification accuracy
                </p>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium 
                         hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105
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
                    Verify Voter ID
                  </>
                )}
              </button>
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
                  <h2 className="text-2xl font-bold text-green-600 mb-2">Verification Successful!</h2>
                  <p className="text-black/70 mb-4">Your Voter ID has been verified successfully.</p>
                  
                  {verificationResult.details && (
                    <div className="bg-green-50/50 backdrop-blur-sm rounded-xl p-4 text-left border border-green-200/50">
                      <h3 className="font-semibold text-green-800 mb-3">Verified Details:</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Name:</span> {(verificationResult.details as any).fullName}</div>
                        <div><span className="font-medium">Voter ID:</span> {(verificationResult.details as any).voterId}</div>
                        <div><span className="font-medium">Constituency:</span> {(verificationResult.details as any).constituency}</div>
                        <div><span className="font-medium">State:</span> {(verificationResult.details as any).state}</div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(verificationResult.confidence)}`}>
                      Confidence: {verificationResult.confidence}% - {getConfidenceLabel(verificationResult.confidence)}
                    </span>
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
                  
                  {verificationResult?.confidence && verificationResult.confidence > 0 && (
                    <div className="mt-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(verificationResult.confidence)}`}>
                        Confidence: {verificationResult.confidence}% - {getConfidenceLabel(verificationResult.confidence)}
                      </span>
                    </div>
                  )}

                  <div className="bg-red-50/50 backdrop-blur-sm rounded-xl p-4 mt-4 border border-red-200/50">
                    <h3 className="font-semibold text-red-800 mb-2">What you can do:</h3>
                    <ul className="text-sm text-red-700 text-left space-y-1">
                      <li>• Double-check your Voter ID number</li>
                      <li>• Verify your date of birth</li>
                      <li>• Try adding your full name for better matching</li>
                      <li>• Contact election officials if issues persist</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setShowResult(false);
                      setVerificationResult(null);
                      setVoterId('');
                      setDateOfBirth('');
                      setFullName('');
                    }}
                    className="w-full py-3 mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium 
                             hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-blue-50/50 backdrop-blur-sm rounded-xl border border-blue-200/50">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">Secure Verification</p>
              <p>Your data is encrypted and verified against official Election Commission records. We do not store sensitive information.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};