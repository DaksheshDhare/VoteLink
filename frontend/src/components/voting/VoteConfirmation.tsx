import React from 'react';
import { Party } from '../../types';
import { AlertTriangle, Check, Loader2 } from 'lucide-react';

interface VoteConfirmationProps {
  party: Party;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const VoteConfirmation: React.FC<VoteConfirmationProps> = ({
  party,
  onConfirm,
  onCancel,
  isLoading
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-orange-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirm Your Vote</h2>
          <p className="text-gray-600">Please review your selection carefully</p>
        </div>

        <div className="bg-orange-50 rounded-2xl p-6 mb-6 border border-orange-200">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${party.color}`}>
              <img 
                src={party.logo} 
                alt={`${party.name} logo`}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling!.textContent = party.name.split(' ').map(w => w[0]).join('');
                }}
              />
              <span className="hidden text-white text-sm font-bold"></span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{party.name}</h3>
              <p className="text-gray-600 text-sm">{party.description}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-red-700 text-sm">
              <p className="font-medium mb-1">Important Notice:</p>
              <p>This action cannot be undone. You will only be able to vote once.</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold
                     hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-green-500 
                     text-white rounded-xl font-semibold
                     hover:from-orange-600 hover:to-green-600 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transform hover:scale-105 transition-all duration-300
                     shadow-lg hover:shadow-xl
                     flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Casting...
              </>
            ) : (
              <>
                <Check className="mr-2" size={20} />
                Cast Vote
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};