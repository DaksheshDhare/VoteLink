import React, { useState } from 'react';
import { CheckCircle, Shield, Eye, Lock, Users, Accessibility, ArrowRight, AlertTriangle } from 'lucide-react';

interface InstructionsPageProps {
  onProceed: () => void;
  userEmail: string;
  isDisabledVoter?: boolean;
}

export const InstructionsPage: React.FC<InstructionsPageProps> = ({
  onProceed,
  userEmail,
  isDisabledVoter = false
}) => {
  const [acknowledgments, setAcknowledgments] = useState({
    rules: false,
    guidelines: false
  });

  const handleAcknowledgment = (key: keyof typeof acknowledgments) => {
    setAcknowledgments(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const allAcknowledged = Object.values(acknowledgments).every(Boolean);

  return (
    <div className="min-h-screen p-4 pt-20 pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-black/20">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Shield className="text-black" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">Voting Instructions</h1>
            <p className="text-gray-700">Please read carefully before proceeding to vote</p>
            <div 
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                border: '2px solid rgba(255, 153, 51, 0.6)'
              }}
              className="mt-3 inline-flex items-center px-5 py-2.5 rounded-full"
            >
              <span className="text-gray-900 font-bold text-sm">Voter:</span>
              <span className="text-orange-600 font-bold text-sm ml-2">{userEmail}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Voting Rules */}
            <div className="bg-black/5 rounded-2xl p-6 border border-black/10">
              <div className="flex items-center mb-4">
                <Users className="text-orange-400 mr-3" size={24} />
                <h3 className="text-xl font-bold text-black">Voting Rules</h3>
              </div>
              <ul className="space-y-3 text-black/80 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="text-green-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>Each voter can cast only ONE vote</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>Vote is linked to your verified Aadhaar/Voter ID</span>
                </li>
                {isDisabledVoter && (
                  <li className="flex items-start">
                    <CheckCircle className="text-green-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                    <span>Disabled voters have additional assistance available</span>
                  </li>
                )}
                <li className="flex items-start">
                  <CheckCircle className="text-green-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>No changes allowed after final submission</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>Voting is mandatory for eligible citizens</span>
                </li>
              </ul>
            </div>

            {/* Secrecy Notice */}
            <div className="bg-black/5 rounded-2xl p-6 border border-black/10">
              <div className="flex items-center mb-4">
                <Eye className="text-blue-400 mr-3" size={24} />
                <h3 className="text-xl font-bold text-black">Vote Secrecy</h3>
              </div>
              <ul className="space-y-3 text-black/80 text-sm">
                <li className="flex items-start">
                  <Lock className="text-blue-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>Your vote choice remains completely anonymous</span>
                </li>
                <li className="flex items-start">
                  <Lock className="text-blue-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>Identity verified but vote choice is secret</span>
                </li>
                <li className="flex items-start">
                  <Lock className="text-blue-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>No one can see who you voted for</span>
                </li>
                <li className="flex items-start">
                  <Lock className="text-blue-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>Encrypted and stored securely</span>
                </li>
              </ul>
            </div>

            {/* Security Guidelines */}
            <div className="bg-black/5 rounded-2xl p-6 border border-black/10">
              <div className="flex items-center mb-4">
                <Shield className="text-green-400 mr-3" size={24} />
                <h3 className="text-xl font-bold text-black">Security Guidelines</h3>
              </div>
              <ul className="space-y-3 text-black/80 text-sm">
                <li className="flex items-start">
                  <AlertTriangle className="text-yellow-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>Vote in a private, secure location</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="text-yellow-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>Do not share your login credentials</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="text-yellow-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>Camera monitoring for security purposes</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="text-yellow-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>Report any suspicious activity immediately</span>
                </li>
              </ul>
            </div>

            {/* Accessibility Features */}
            <div className="bg-black/5 rounded-2xl p-6 border border-black/10">
              <div className="flex items-center mb-4">
                <Accessibility className="text-purple-400 mr-3" size={24} />
                <h3 className="text-xl font-bold text-black">Accessibility Support</h3>
              </div>
              <ul className="space-y-3 text-black/80 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="text-purple-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>Screen reader compatible interface</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-purple-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>High contrast mode available</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-purple-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>Keyboard navigation support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-purple-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>Audio assistance available on request</span>
                </li>
                {isDisabledVoter && (
                  <>
                    <li className="flex items-start">
                      <CheckCircle className="text-purple-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span>Extended voting time for disabled voters</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-purple-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span>Companion assistance allowed if needed</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Disabled Voter Rights Section */}
          {isDisabledVoter && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 mb-8">
              <div className="flex items-start space-x-3">
                <Accessibility className="text-purple-400 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="text-purple-300 font-bold mb-2">Disabled Voter Rights & Assistance</h4>
                  <ul className="text-purple-200 text-sm space-y-2">
                    <li>• You have the right to vote independently and privately</li>
                    <li>• Extended time limit for completing your vote</li>
                    <li>• Audio assistance and screen reader compatibility</li>
                    <li>• High contrast mode and large text options</li>
                    <li>• Companion assistance is allowed if you request it</li>
                    <li>• Technical support available throughout the process</li>
                    <li>• Your accessibility needs are protected by law</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Important Warnings */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="text-red-300 font-bold mb-2">Important Warnings</h4>
                <ul className="text-red-200 text-sm space-y-2">
                  <li>• Vote buying, selling, or coercion is a criminal offense</li>
                  <li>• Taking photos/videos of your ballot is prohibited</li>
                  <li>• Sharing your vote choice publicly may compromise election integrity</li>
                  <li>• Any attempt to manipulate the voting system will be prosecuted</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Acknowledgment Checkboxes */}
          <div className="space-y-4 mb-8">
            <h4 className="text-black font-bold text-lg">Please acknowledge that you have read and understood:</h4>
            
            {[
              { key: 'rules', label: 'Voting Rules and Regulations' },
              { key: 'guidelines', label: 'Security Guidelines and Warnings' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgments[key as keyof typeof acknowledgments]}
                  onChange={() => handleAcknowledgment(key as keyof typeof acknowledgments)}
                  className="w-5 h-5 rounded border-2 border-black/30 bg-black/10 
                           checked:bg-green-500 checked:border-green-500 
                           focus:ring-2 focus:ring-green-400/20"
                />
                <span className="text-black/90">{label}</span>
              </label>
            ))}
          </div>

          {/* Proceed Button */}
          <button
            onClick={onProceed}
            disabled={!allAcknowledged}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-green-600 
                     text-black rounded-2xl font-bold text-lg
                     hover:from-orange-600 hover:to-green-700 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transform hover:scale-105 transition-all duration-300
                     shadow-2xl hover:shadow-3xl
                     flex items-center justify-center"
          >
            <span>Proceed to Voting</span>
            <ArrowRight className="ml-2" size={24} />
          </button>

          {!allAcknowledged && (
            <p className="text-yellow-300 text-center text-sm mt-4">
              Please acknowledge all sections above to proceed
            </p>
          )}
        </div>
      </div>
    </div>
  );
};