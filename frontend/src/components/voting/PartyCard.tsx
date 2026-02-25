import React, { useState } from 'react';
import { Party } from '../../types';
import { Check } from 'lucide-react';
import { getPartyAbbreviation, getPartyIconBg, getPartyTextColor, getPartySymbol } from '../../utils/partyUtils';

interface PartyCardProps {
  party: Party;
  isSelected: boolean;
  onSelect: (partyId: string) => void;
  disabled?: boolean;
}

export const PartyCard: React.FC<PartyCardProps> = ({
  party,
  isSelected,
  onSelect,
  disabled = false
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const hasLogo = party.logo && party.logo.trim() !== '';
  const showImg = hasLogo && !imgFailed;

  const abbreviation = getPartyAbbreviation(party.name);
  const iconBg = getPartyIconBg(party.name);
  const textColor = getPartyTextColor(party.name);
  const symbol = getPartySymbol(party.name);

  return (
    <div className={`
      relative bg-black/10 backdrop-blur-lg rounded-xl p-4 border transition-all duration-300 h-[280px] flex flex-col
      ${isSelected 
        ? 'border-green-400 bg-green-500/20 shadow-lg shadow-green-500/20' 
        : 'border-black/20 hover:border-black/40 hover:bg-black/15'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      transform hover:shadow-xl
    `}>
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
          <Check className="text-black" size={12} />
        </div>
      )}

      <div className="flex flex-col items-center text-center space-y-3 flex-1">
        <div className={`
          w-16 h-16 rounded-full flex items-center justify-center
          shadow-lg transition-all duration-300 overflow-hidden
          ${showImg ? party.color || 'bg-white' : iconBg}
        `}>
          {showImg ? (
            <img 
              src={party.logo} 
              alt={`${party.name} logo`}
              className="w-12 h-12 rounded-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <span className="text-xl leading-none">{symbol}</span>
              <span className={`text-[10px] font-bold mt-0.5 ${textColor}`}>{abbreviation}</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-black mb-1">{party.name}</h3>
          <p className="text-gray-700 text-xs">{party.description}</p>
        </div>

        <button
          onClick={() => !disabled && onSelect(party.id)}
          disabled={disabled}
          className={`
            w-full py-2 rounded-lg text-sm font-semibold transition-all duration-300 mt-auto
            ${isSelected
              ? 'bg-green-500 text-black shadow-lg'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-black hover:from-blue-600 hover:to-purple-700'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            transform hover:scale-105 shadow-lg hover:shadow-xl
          `}
        >
          {isSelected ? 'Selected' : 'Select Party'}
        </button>
      </div>
    </div>
  );
};