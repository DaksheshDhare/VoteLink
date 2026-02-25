import React, { useState, useEffect } from 'react';
import { Camera, Volume2, Eye, Armchair as Wheelchair, LogOut, CheckCircle, AlertCircle, MapPin, ArrowLeft } from 'lucide-react';
import { PartyCard } from './PartyCard';
import { VoteConfirmation } from './VoteConfirmation';
import { CameraMonitor } from './CameraMonitor';
import { SecurityBreachModal } from './SecurityBreachModal';
import { VotingCertificate } from './VotingCertificate';
import { Party, User, VotingRegion } from '../../types';

interface VotingInterfaceProps {
  parties: Party[];
  onVote: (partyId: string) => Promise<boolean>;
  onLogout: () => void;
  onStartDisabledVoting: () => void;
  userEmail: string;
  hasVoted: boolean;
  isLoading: boolean;
  showVoteButton: boolean;
  user?: User | null;
  selectedRegion?: VotingRegion;
  onBack?: () => void;
}

export const VotingInterface: React.FC<VotingInterfaceProps> = ({
  parties,
  onVote,
  onLogout,
  onStartDisabledVoting,
  userEmail,
  hasVoted,
  isLoading,
  showVoteButton,
  user,
  selectedRegion,
  onBack
}) => {
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  const [showSecurityBreach, setShowSecurityBreach] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [votingComplete, setVotingComplete] = useState(false);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);

  // Get current election ID (from selected region or default)
  const currentElectionId = selectedRegion?.activeElections?.[0]?.id || 'default_election';
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const handlePartySelect = (partyId: string) => {
    setSelectedParty(partyId);
    if (audioEnabled) {
      const party = parties.find(p => p.id === partyId);
      if (party) {
        const utterance = new SpeechSynthesisUtterance(`Selected ${party.name}. ${party.description}`);
        speechSynthesis.speak(utterance);
      }
    }
  };

  const handleVoteClick = () => {
    if (selectedParty) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmVote = async () => {
    if (selectedParty) {
      console.log('🗳️ Starting vote confirmation for party:', selectedParty);
      setEligibilityError(null);
      
      try {
        // Call the main vote handler - it has all the backend verification
        const success = await onVote(selectedParty);
        console.log('✅ Vote result:', success);
        
        if (success) {
          setVotingComplete(true);
          setShowCertificate(true);
          console.log('🎉 Vote completed successfully, showing certificate');
        } else {
          setEligibilityError('Failed to record vote. Please try again.');
        }
      } catch (error) {
        console.error('❌ Vote confirmation failed:', error);
        setEligibilityError(error instanceof Error ? error.message : 'Voting failed. Please try again.');
      }
      setShowConfirmation(false);
    }
  };

  const handleCancelVote = () => {
    setShowConfirmation(false);
  };

  const toggleAudioGuide = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled) {
      const utterance = new SpeechSynthesisUtterance('Audio guide enabled. I will now read out party information when you select them.');
      speechSynthesis.speak(utterance);
    } else {
      speechSynthesis.cancel();
    }
  };

  const handleSecurityBreach = () => {
    setShowSecurityBreach(true);
    setCameraEnabled(false);
    if (speechSynthesis) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('Security breach detected. Voting session terminated for your safety.');
      speechSynthesis.speak(utterance);
    }
  };

  const handleGoToOfflineBooth = () => {
    // In a real app, this would redirect to a booth locator
    window.open('https://www.google.com/maps/search/voting+booth+near+me', '_blank');
    onLogout();
  };

  const handleCameraStatus = (isWorking: boolean) => {
    // Handle camera status updates
    console.log('Camera status:', isWorking);
  };

  if (hasVoted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-20">
        <VotingCertificate
          isVisible={showCertificate}
          voterData={{
            id: user?.id || userEmail.split('@')[0],
            email: userEmail,
            name: 'Verified Voter',
            constituency: 'General Constituency',
            blockchainData: user?.voteTransactionHash ? {
              transactionHash: user.voteTransactionHash,
              blockNumber: user.voteBlockNumber || 0,
              blockHash: user.voteBlockHash || '',
              networkName: 'Ganache Local Testnet'
            } : undefined
          }}
          onClose={() => setShowCertificate(false)}
        />
        
        <div className="bg-black/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-black/20 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-black mb-4">Vote Cast Successfully!</h2>
          <p className="text-gray-700 mb-6">Thank you for participating in the democratic process.</p>
          
          <button
            onClick={() => setShowCertificate(true)}
            className="w-full py-3 mb-4 bg-gradient-to-r from-blue-500 to-green-600 
                     text-black rounded-xl font-semibold
                     hover:from-blue-600 hover:to-green-700 
                     transform hover:scale-105 transition-all duration-300
                     shadow-lg hover:shadow-xl"
          >
            Download Voting Certificate
          </button>
          
          <button
            onClick={onLogout}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-green-600 
                     text-black rounded-xl font-semibold
                     hover:from-orange-600 hover:to-green-700 
                     transform hover:scale-105 transition-all duration-300
                     shadow-lg hover:shadow-xl"
          >
            Exit Voting System
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 pt-16 pb-6 overflow-x-hidden">
      {/* Back Button */}
      {onBack && !hasVoted && (
        <div className="max-w-7xl mx-auto mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Region Selection</span>
          </button>
        </div>
      )}

      {/* Region Information */}
      {selectedRegion && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.3)'
        }} className="rounded-lg p-3 mb-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-center">
            <MapPin className="h-5 w-5 text-gray-600 mr-2" />
            <div className="text-center">
              <h3 className="font-semibold text-gray-800">Voting Region: {selectedRegion.name}</h3>
              <p className="text-sm text-gray-700">
                {selectedRegion.constituency} • {selectedRegion.district}, {selectedRegion.state}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {selectedRegion.totalVoters.toLocaleString()} registered voters
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Camera Monitor */}
      {cameraEnabled && (
        <CameraMonitor
          isActive={cameraEnabled}
          onCameraStatus={handleCameraStatus}
          onSecurityBreach={handleSecurityBreach}
        />
      )}

      {/* Security Breach Modal */}
      <SecurityBreachModal
        isOpen={showSecurityBreach}
        onClose={() => {
          setShowSecurityBreach(false);
          onLogout();
        }}
        onGoToOfflineBooth={handleGoToOfflineBooth}
      />

      {/* Accessibility Controls */}
      <div className="bg-black/5 backdrop-blur-lg border border-black/20 rounded-2xl p-3 mb-4 max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-center">
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 text-sm ${
              highContrast 
                ? 'bg-blue-500 text-black shadow-lg' 
                : 'bg-black/10 text-black border border-black/20 hover:bg-black/20'
            }`}
          >
            <Eye className="w-4 h-4" />
            High Contrast
          </button>
          
          <button
            onClick={toggleAudioGuide}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 text-sm ${
              audioEnabled 
                ? 'bg-green-500 text-black shadow-lg' 
                : 'bg-black/10 text-black border border-black/20 hover:bg-black/20'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            Audio Guide
          </button>

          <button
            onClick={onStartDisabledVoting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/10 text-black border border-black/20 rounded-lg hover:bg-black/20 transition-all duration-300 text-sm"
          >
            <Wheelchair className="w-4 h-4" />
            Disabled Voting
          </button>

          <button
            onClick={() => setCameraEnabled(!cameraEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 text-sm ${
              cameraEnabled 
                ? 'bg-orange-500 text-black shadow-lg' 
                : 'bg-black/10 text-black border border-black/20 hover:bg-black/20'
            }`}
          >
            <Camera className="w-4 h-4" />
            Camera Monitor
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-700 border border-red-500/30 rounded-lg hover:bg-red-500/30 hover:text-red-800 transition-all duration-300 text-sm"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            Select Your Political Party
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto text-sm sm:text-base">
            Choose your preferred political party by clicking on their card. 
            Review your selection carefully before casting your vote.
          </p>
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

        {/* Party Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6 items-stretch">
          {parties.map((party) => (
            <PartyCard
              key={party.id}
              party={party}
              isSelected={selectedParty === party.id}
              onSelect={handlePartySelect}
              disabled={hasVoted}
            />
          ))}
        </div>

        {/* Vote Button */}
        {selectedParty && !hasVoted && (
          <div className="text-center">
            <button
              onClick={handleVoteClick}
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-500 to-green-600 text-black px-8 py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Processing Vote...
                </div>
              ) : (
                'Cast Your Vote'
              )}
            </button>
          </div>
        )}

        {/* Eligibility Error Display */}
        {eligibilityError && (
          <div className="mt-4 mx-auto max-w-md">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800">Voting Error</h4>
                <p className="text-sm text-red-700">{eligibilityError}</p>
                <button
                  onClick={() => setEligibilityError(null)}
                  className="mt-2 text-xs text-red-600 underline hover:text-red-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Vote Confirmation Modal */}
      {showConfirmation && selectedParty && (
        <VoteConfirmation
          party={parties.find(p => p.id === selectedParty)!}
          onConfirm={handleConfirmVote}
          onCancel={handleCancelVote}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};