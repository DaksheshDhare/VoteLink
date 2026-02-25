import React from 'react';
import { AlertTriangle, Shield, ExternalLink } from 'lucide-react';

interface SecurityBreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToOfflineBooth: () => void;
}

export const SecurityBreachModal: React.FC<SecurityBreachModalProps> = ({
  isOpen,
  onClose,
  onGoToOfflineBooth
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-red-500/50">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
            <AlertTriangle className="text-black" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Security Breach Detected</h2>
          <p className="text-gray-700">Suspicious activity has been detected during your voting session</p>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-6">
          <div className="flex items-start space-x-3">
            <Shield className="text-red-400 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="text-red-300 font-bold mb-2">Security Violations Detected:</h4>
              <ul className="text-red-200 text-sm space-y-1">
                <li>• Excessive movement or suspicious behavior</li>
                <li>• Multiple faces detected in camera view</li>
                <li>• Potential unauthorized assistance</li>
                <li>• Camera obstruction or tampering</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-yellow-200 text-sm">
              <p className="font-medium mb-1">For Your Security:</p>
              <p>Your voting session has been terminated to maintain election integrity. Please visit an official offline voting booth to cast your vote.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={onGoToOfflineBooth}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 
                     text-black rounded-xl font-semibold
                     hover:from-orange-600 hover:to-red-700 
                     transform hover:scale-105 transition-all duration-300
                     shadow-lg hover:shadow-xl
                     flex items-center justify-center"
          >
            <ExternalLink className="mr-2" size={20} />
            Find Nearest Offline Booth
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-600 text-black rounded-xl font-semibold
                     hover:bg-gray-700 transition-all duration-300"
          >
            Close & Exit
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-black/60 text-xs">
            This action is taken to ensure fair and secure elections.<br/>
            Your vote privacy and election integrity are our top priorities.
          </p>
        </div>
      </div>
    </div>
  );
};