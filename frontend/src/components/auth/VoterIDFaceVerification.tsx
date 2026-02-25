import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, Shield, FileCheck } from 'lucide-react';
import { faceRecognitionService, FaceMatchResult } from '../../services/faceRecognitionService';

interface VoterIDFaceVerificationProps {
  storedFaceDescriptor: Float32Array;
  onVerificationComplete: (success: boolean, matchResult: FaceMatchResult) => void;
  onBack: () => void;
}

export const VoterIDFaceVerification: React.FC<VoterIDFaceVerificationProps> = ({
  storedFaceDescriptor,
  onVerificationComplete,
  onBack
}) => {
  const [voterIDFile, setVoterIDFile] = useState<File | null>(null);
  const [voterIDPreview, setVoterIDPreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<FaceMatchResult | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large. Please upload an image under 10MB');
      return;
    }

    setVoterIDFile(file);
    setError(null);
    setMatchResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setVoterIDPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVerification = async () => {
    if (!voterIDFile) {
      setError('Please upload your Voter ID');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // Extract face from Voter ID
      console.log('Extracting face from Voter ID...');
      const voterIDDescriptor = await faceRecognitionService.extractFaceFromFile(voterIDFile);

      if (!voterIDDescriptor) {
        setError('No face detected in Voter ID image. Please upload a clear photo showing your face.');
        setIsVerifying(false);
        return;
      }

      // Compare with stored face descriptor
      console.log('Comparing faces...');
      const result = await faceRecognitionService.verifyFace(storedFaceDescriptor, voterIDDescriptor);
      
      setMatchResult(result);

      // Wait a moment to show result, then callback
      setTimeout(() => {
        onVerificationComplete(result.match, result);
      }, 2000);

    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBgColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-50 border-green-200';
    if (confidence >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20">
      <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-6 w-full max-w-xl border border-white/30">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
            <FileCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-black mb-1">Voter ID Face Verification</h1>
          <p className="text-sm text-gray-700">Upload your Voter ID to verify your identity</p>
        </div>

        {!matchResult ? (
          <>
            {/* Upload Area */}
            <div className="mb-4">
              <label
                htmlFor="voter-id-upload"
                className="block w-full cursor-pointer"
              >
                <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300
                              ${voterIDPreview 
                                ? 'border-blue-400 bg-blue-50/50' 
                                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'}`}
                >
                  {voterIDPreview ? (
                    <div className="space-y-3">
                      <img
                        src={voterIDPreview}
                        alt="Voter ID Preview"
                        className="max-h-48 mx-auto rounded-lg shadow-lg"
                      />
                      <div className="flex items-center justify-center gap-2 text-blue-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Voter ID Uploaded</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setVoterIDFile(null);
                          setVoterIDPreview(null);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 underline"
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-12 h-12 mx-auto text-gray-400" />
                      <div>
                        <p className="text-base font-medium text-gray-700">
                          Click to upload Voter ID
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </label>
              <input
                id="voter-id-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium text-sm">Error</p>
                  <p className="text-red-600 text-xs">{error}</p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-1 text-sm">Upload Guidelines:</h3>
              <ul className="text-xs text-blue-800 space-y-0.5">
                <li>• Upload a clear, high-resolution photo of your Voter ID</li>
                <li>• Ensure your face is clearly visible in the photo</li>
                <li>• Avoid glare, shadows, or obstructions</li>
                <li>• The entire Voter ID card should be visible</li>
                <li>• Image should be well-lit and in focus</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleVerification}
                disabled={!voterIDFile || isVerifying}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium text-sm
                         hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                         flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying Face...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Verify Face Match
                  </>
                )}
              </button>

              <button
                onClick={onBack}
                disabled={isVerifying}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-medium text-sm
                         hover:bg-gray-300 transition-all duration-300 disabled:opacity-50"
              >
                Back
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Verification Result */}
            <div className="space-y-6">
              {matchResult.match ? (
                <div className="text-center">
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-bounce" />
                  <h2 className="text-3xl font-bold text-green-600 mb-2">Face Match Verified! ✅</h2>
                  <p className="text-gray-700 text-lg mb-6">{matchResult.message}</p>

                  <div className={`p-6 rounded-2xl border-2 ${getConfidenceBgColor(matchResult.confidence)} mb-6`}>
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="text-6xl font-bold ${getConfidenceColor(matchResult.confidence)}">
                        {matchResult.confidence}%
                      </div>
                    </div>
                    <p className="font-medium text-gray-700">Match Confidence</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Distance Score: {matchResult.distance.toFixed(4)}
                    </p>
                  </div>

                  {voterIDPreview && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-3">Verified Voter ID:</p>
                      <img
                        src={voterIDPreview}
                        alt="Verified Voter ID"
                        className="max-h-48 mx-auto rounded-lg shadow-lg"
                      />
                    </div>
                  )}

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-green-800 mb-2">✅ Verification Successful</h3>
                    <p className="text-sm text-green-700">
                      Your face matches the Voter ID photo. You can now proceed to voting.
                    </p>
                  </div>

                  <p className="text-sm text-gray-700">
                    Proceeding to next step...
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-red-600 mb-2">Face Mismatch ❌</h2>
                  <p className="text-gray-700 text-lg mb-6">{matchResult.message}</p>

                  <div className={`p-6 rounded-2xl border-2 ${getConfidenceBgColor(matchResult.confidence)} mb-6`}>
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className={`text-6xl font-bold ${getConfidenceColor(matchResult.confidence)}`}>
                        {matchResult.confidence}%
                      </div>
                    </div>
                    <p className="font-medium text-gray-700">Match Confidence</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Distance Score: {matchResult.distance.toFixed(4)}
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-red-800 mb-2">❌ Verification Failed</h3>
                    <p className="text-sm text-red-700 mb-3">
                      The face in your Voter ID does not match your captured face photo.
                    </p>
                    <ul className="text-sm text-red-700 text-left space-y-1">
                      <li>• Ensure you uploaded YOUR Voter ID card</li>
                      <li>• Make sure the Voter ID photo is clear</li>
                      <li>• Try recapturing your face with better lighting</li>
                      <li>• Contact support if you believe this is an error</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setMatchResult(null);
                      setVoterIDFile(null);
                      setVoterIDPreview(null);
                      setError(null);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium
                             hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Privacy Notice */}
        <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-[10px] text-blue-700">
              <p className="font-medium mb-0.5">🔒 Secure Face Verification</p>
              <p>Your facial data is encrypted and only used for identity verification.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
