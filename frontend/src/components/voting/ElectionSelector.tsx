import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Vote,
  CheckCircle,
  AlertCircle,
  Play,
  MapPin,
  Globe,
  Building,
  Home,
  Award,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { electionService, Election } from '../../services/electionService';

interface VotedElection {
  electionId: string;
  votedAt: Date | string;
}

interface ElectionSelectorProps {
  userEmail: string;
  onSelectElection: (election: Election) => void;
  selectedState?: string;
  selectedDistrict?: string;
  votedElections?: VotedElection[];
  onViewResults?: (election: Election) => void;
}

export const ElectionSelector: React.FC<ElectionSelectorProps> = ({
  userEmail,
  onSelectElection,
  selectedState,
  selectedDistrict,
  votedElections = [],
  onViewResults
}) => {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Check if user has voted in a specific election
  const hasVotedInElection = (electionId: string): boolean => {
    return votedElections.some(v => 
      v.electionId === electionId || 
      v.electionId === `election_${electionId}` ||
      electionId === `election_${v.electionId}`
    );
  };

  // Get voted date for a specific election
  const getVotedDate = (electionId: string): string | null => {
    const vote = votedElections.find(v => 
      v.electionId === electionId || 
      v.electionId === `election_${electionId}` ||
      electionId === `election_${v.electionId}`
    );
    if (vote) {
      return new Date(vote.votedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
    return null;
  };

  // Subscribe to election updates
  useEffect(() => {
    setIsLoading(true);
    
    const unsubscribe = electionService.subscribe((updatedElections) => {
      // Filter elections based on user's region
      const activeElections = updatedElections.filter(e => {
        if (e.status !== 'active') return false;
        
        // National elections are available to everyone
        if (e.type === 'national') return true;
        
        // Filter by state if provided
        if (selectedState && e.region.state !== selectedState && e.region.state !== 'All States') {
          return false;
        }
        
        // Filter by district if provided
        if (selectedDistrict && e.region.district && e.region.district !== selectedDistrict) {
          return false;
        }
        
        return true;
      });
      
      setElections(activeElections);
      setIsLoading(false);
      setLastRefresh(new Date());
    });

    return () => unsubscribe();
  }, [selectedState, selectedDistrict]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger re-subscription to get latest elections
      const activeElections = electionService.getActiveElections();
      setElections(activeElections.filter(e => {
        if (selectedState && e.region.state !== selectedState && e.region.state !== 'All States') {
          return false;
        }
        if (selectedDistrict && e.region.district && e.region.district !== selectedDistrict) {
          return false;
        }
        return true;
      }));
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedState, selectedDistrict]);

  const getTypeIcon = (type: Election['type']) => {
    switch (type) {
      case 'national': return <Globe className="w-5 h-5 text-blue-600" />;
      case 'state': return <Building className="w-5 h-5 text-green-600" />;
      case 'district': return <MapPin className="w-5 h-5 text-purple-600" />;
      case 'local':
      case 'municipal': return <Home className="w-5 h-5 text-orange-600" />;
      case 'panchayat': return <Award className="w-5 h-5 text-yellow-600" />;
      default: return <Vote className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: Election['type']) => {
    switch (type) {
      case 'national': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'state': return 'bg-green-100 text-green-800 border-green-200';
      case 'district': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'local':
      case 'municipal': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'panchayat': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} left`;
    }
    
    return `${hours}h ${minutes}m left`;
  };

  const handleSelectElection = (election: Election) => {
    // Don't allow selection if user has already voted in this election
    if (hasVotedInElection(election.id || election._id || '')) {
      return;
    }
    setSelectedElection(election);
  };

  const handleProceed = () => {
    if (selectedElection && !hasVotedInElection(selectedElection.id || selectedElection._id || '')) {
      onSelectElection(selectedElection);
    }
  };

  const handleViewResults = (election: Election) => {
    if (onViewResults) {
      onViewResults(election);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    const activeElections = electionService.getActiveElections();
    setElections(activeElections.filter(e => {
      if (selectedState && e.region.state !== selectedState && e.region.state !== 'All States') {
        return false;
      }
      if (selectedDistrict && e.region.district && e.region.district !== selectedDistrict) {
        return false;
      }
      return true;
    }));
    setLastRefresh(new Date());
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading available elections...</p>
        </div>
      </div>
    );
  }

  if (elections.length === 0) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.3)'
      }} className="rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Elections</h3>
        <p className="text-gray-600 mb-4">
          There are currently no active elections in your region. 
          Please check back later or contact your election administrator.
        </p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <Vote className="w-5 h-5 mr-2 text-orange-600" />
            Live Elections
          </h2>
          <p className="text-sm text-gray-600">
            Select an election to cast your vote
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Updated: {lastRefresh.toLocaleTimeString()}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh elections"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Elections List */}
      <div className="space-y-3">
        {elections.map((election) => {
          const electionId = election.id || election._id || '';
          const isVoted = hasVotedInElection(electionId);
          const votedDate = getVotedDate(electionId);

          return (
          <div
            key={electionId}
            onClick={() => handleSelectElection(election)}
            style={{
              background: isVoted
                ? 'rgba(34, 197, 94, 0.15)'
                : selectedElection?.id === election.id
                ? 'rgba(255, 255, 255, 0.35)'
                : 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              boxShadow: isVoted
                ? '0 4px 15px rgba(34, 197, 94, 0.2)'
                : selectedElection?.id === election.id
                ? '0 10px 30px rgba(255, 153, 51, 0.3)'
                : '0 4px 15px rgba(0,0,0,0.1)',
              border: isVoted
                ? '2px solid rgba(34, 197, 94, 0.5)'
                : selectedElection?.id === election.id
                ? '2px solid rgba(255, 153, 51, 0.5)'
                : '1px solid rgba(255,255,255,0.3)'
            }}
            className={`rounded-xl p-4 transition-all duration-300 ${isVoted ? 'cursor-default' : 'cursor-pointer hover:shadow-lg transform hover:-translate-y-1'}`}
          >
            {/* Election Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/50 rounded-lg">
                  {getTypeIcon(election.type)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{election.title}</h3>
                  <p className="text-sm text-gray-600">{election.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(election.type)}`}>
                  {election.type.charAt(0).toUpperCase() + election.type.slice(1)}
                </span>
                {isVoted ? (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">VOTED</span>
                  </div>
                ) : (
                <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-green-700">LIVE</span>
                </div>
                )}
              </div>
            </div>

            {/* Already Voted Badge */}
            {isVoted && (
              <div className="mb-3 flex items-center justify-between p-3 bg-green-100 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">You have already voted in this election</p>
                    <p className="text-xs text-green-600">Voted on: {votedDate}</p>
                  </div>
                </div>
                {onViewResults && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewResults(election);
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>View Results</span>
                  </button>
                )}
              </div>
            )}

            {/* Election Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="bg-white/50 rounded-lg p-2">
                <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                  <MapPin className="w-3 h-3" />
                  <span>Region</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{election.region.name}</p>
                <p className="text-xs text-gray-600">{election.region.state}</p>
              </div>
              
              <div className="bg-white/50 rounded-lg p-2">
                <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                  <Users className="w-3 h-3" />
                  <span>Participation</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  {election.votesCast.toLocaleString()} / {election.totalVoters.toLocaleString()}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(election.votesCast / election.totalVoters) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-white/50 rounded-lg p-2">
                <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                  <Calendar className="w-3 h-3" />
                  <span>End Date</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{formatDate(election.endDate)}</p>
              </div>
              
              <div className="bg-white/50 rounded-lg p-2">
                <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                  <Clock className="w-3 h-3" />
                  <span>Time Left</span>
                </div>
                <p className="text-sm font-semibold text-orange-600">{getTimeRemaining(election.endDate)}</p>
              </div>
            </div>

            {/* Candidates Preview */}
            <div className="bg-white/30 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                <Vote className="w-3 h-3 mr-1" />
                Candidates ({election.candidates.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {election.candidates.slice(0, 4).map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center space-x-2 px-2 py-1 bg-white/50 rounded-lg text-xs"
                  >
                    <span className="text-lg">{candidate.symbol}</span>
                    <span className="font-medium text-gray-800">{candidate.party}</span>
                  </div>
                ))}
                {election.candidates.length > 4 && (
                  <span className="px-2 py-1 bg-gray-200 rounded-lg text-xs text-gray-600">
                    +{election.candidates.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Selection Indicator */}
            {!isVoted && selectedElection?.id === election.id && (
              <div className="mt-3 flex items-center justify-center space-x-2 text-green-700 font-semibold">
                <CheckCircle className="w-5 h-5" />
                <span>Selected</span>
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* Proceed Button */}
      {selectedElection && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">Ready to vote in:</p>
              <p className="text-sm text-gray-600">{selectedElection.title}</p>
            </div>
            <button
              onClick={handleProceed}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all flex items-center space-x-2"
            >
              <span>Proceed to Vote</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionSelector;
