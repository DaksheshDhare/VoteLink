import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  Crown,
  CheckCircle, 
  AlertCircle,
  Clock,
  Users,
  BarChart3,
  Download,
  Share2,
  Megaphone,
  FileText,
  Printer,
  Globe,
  Lock,
  Unlock,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  TrendingUp,
  MapPin,
  Calendar,
  Percent,
  Target,
  Send,
  X,
  Copy
} from 'lucide-react';
import { electionService, Election } from '../../services/electionService';

interface ElectionResult {
  id: string;
  electionId: string;
  electionTitle: string;
  region: string;
  status: 'counting' | 'partial' | 'final' | 'published';
  totalVotes: number;
  validVotes: number;
  invalidVotes: number;
  turnoutPercentage: number;
  countingProgress: number;
  results: CandidateResult[];
  leadingCandidate: string;
  margin: number;
  declaredAt?: string;
  publishedAt?: string;
  lastUpdated: string;
}

interface CandidateResult {
  candidateId: string;
  candidateName: string;
  partyId: string;
  partyName: string;
  symbol: string;
  color: string;
  votes: number;
  percentage: number;
  position: number;
  isWinner: boolean;
  margin?: number;
}

interface PublishingSettings {
  autoPublish: boolean;
  requireApproval: boolean;
  publicDisplay: boolean;
  mediaRelease: boolean;
  websiteUpdate: boolean;
  socialMediaPost: boolean;
  pressRelease: boolean;
}

export const ResultPublishing: React.FC = () => {
  const [results, setResults] = useState<ElectionResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ElectionResult | null>(null);
  const [publishingSettings, setPublishingSettings] = useState<PublishingSettings>({
    autoPublish: false,
    requireApproval: true,
    publicDisplay: true,
    mediaRelease: true,
    websiteUpdate: true,
    socialMediaPost: false,
    pressRelease: true
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedResults, setPublishedResults] = useState<string[]>([]);
  const [showPressRelease, setShowPressRelease] = useState(false);
  const [pressReleaseText, setPressReleaseText] = useState('');

  // Download PDF function
  const handleDownloadPDF = (result: ElectionResult) => {
    const winner = result.results.find(r => r.isWinner);
    const runnerUp = result.results.find(r => r.position === 2);
    
    // Create PDF content as HTML
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Election Results - ${result.electionTitle}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #1a365d; text-align: center; border-bottom: 2px solid #3182ce; padding-bottom: 10px; }
    h2 { color: #2c5282; margin-top: 30px; }
    .winner-box { background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .stat-box { background: #f7fafc; padding: 15px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #2d3748; }
    .stat-label { color: #718096; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #edf2f7; }
    .footer { margin-top: 40px; text-align: center; color: #718096; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
  </style>
</head>
<body>
  <h1>ELECTION RESULTS</h1>
  <h2>${result.electionTitle}</h2>
  <p style="text-align: center; color: #4a5568;">${result.region}</p>
  
  ${winner ? `
  <div class="winner-box">
    <h2 style="margin: 0; color: #92400e;">🏆 WINNER DECLARED</h2>
    <p style="font-size: 28px; font-weight: bold; margin: 10px 0;">${winner.candidateName}</p>
    <p style="color: #78350f;">${winner.partyName}</p>
    <p style="font-size: 20px;">${winner.votes.toLocaleString()} votes (${winner.percentage.toFixed(1)}%)</p>
    <p style="color: #059669; font-weight: bold;">Victory Margin: ${result.margin.toLocaleString()} votes</p>
  </div>
  ` : ''}
  
  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-value">${result.totalVotes.toLocaleString()}</div>
      <div class="stat-label">Total Votes</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${result.validVotes.toLocaleString()}</div>
      <div class="stat-label">Valid Votes</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${result.turnoutPercentage}%</div>
      <div class="stat-label">Voter Turnout</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${result.countingProgress}%</div>
      <div class="stat-label">Counting Progress</div>
    </div>
  </div>
  
  <h2>All Candidates</h2>
  <table>
    <thead>
      <tr>
        <th>Position</th>
        <th>Candidate</th>
        <th>Party</th>
        <th>Votes</th>
        <th>Percentage</th>
      </tr>
    </thead>
    <tbody>
      ${result.results.sort((a, b) => a.position - b.position).map(c => `
        <tr ${c.isWinner ? 'style="background: #fef3c7;"' : ''}>
          <td>#${c.position} ${c.isWinner ? '👑' : ''}</td>
          <td><strong>${c.candidateName}</strong></td>
          <td>${c.partyName}</td>
          <td>${c.votes.toLocaleString()}</td>
          <td>${c.percentage.toFixed(1)}%</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="footer">
    <p>Official Election Results - Election Commission of India</p>
    <p>Generated on: ${new Date().toLocaleString()}</p>
    <p>This document is an official record of the election results.</p>
  </div>
</body>
</html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Election_Results_${result.electionTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Results downloaded successfully! Open the HTML file in a browser and use Print > Save as PDF for PDF format.');
  };

  // Show Press Release function
  const handlePressRelease = (result: ElectionResult) => {
    const text = generatePressRelease(result);
    setPressReleaseText(text);
    setShowPressRelease(true);
  };

  // Copy Press Release to clipboard
  const copyPressRelease = () => {
    navigator.clipboard.writeText(pressReleaseText);
    alert('Press release copied to clipboard!');
  };

  // Share Results function
  const handleShareResults = async (result: ElectionResult) => {
    const winner = result.results.find(r => r.isWinner);
    const shareText = `📊 Election Results: ${result.electionTitle}\n\n🏆 Winner: ${winner?.candidateName || 'TBD'} (${winner?.partyName || ''})\n📈 Votes: ${winner?.votes.toLocaleString() || 0} (${winner?.percentage.toFixed(1) || 0}%)\n🗳️ Turnout: ${result.turnoutPercentage}%\n\n#ElectionResults #Democracy`;
    
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Election Results - ${result.electionTitle}`,
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled or share failed, fall back to clipboard
        navigator.clipboard.writeText(shareText);
        alert('Share text copied to clipboard!');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Share text copied to clipboard! You can paste it on social media or messaging apps.');
    }
  };

  // Load real elections and votes from backend
  useEffect(() => {
    const loadRealElections = async () => {
      try {
        // Get all elections from election service
        const allElections = electionService.getAllElections();
        
        // Filter only completed or active elections (not demo data)
        const completedElections = allElections.filter(
          election => election.status === 'completed' || election.status === 'active'
        );

        if (completedElections.length === 0) {
          setResults([]);
          setSelectedResult(null);
          return;
        }

        // Convert elections to ElectionResult format with real vote data from backend
        const electionResults: ElectionResult[] = await Promise.all(
          completedElections.map(async (election) => {
            // Fetch vote data for THIS specific election
            const electionIdParam = election.id || election._id || 'default_election';
            const voteResponse = await fetch(
              `http://localhost:5000/api/votes/results?electionId=${electionIdParam}`
            );
            const voteData = await voteResponse.json();

            if (!voteData.success) {
              console.error('Failed to fetch vote results for election:', electionIdParam, voteData.error);
            }

            const { results: voteResults = [], totalVotes = 0, totalVoters = 0 } = voteData.data || {};

            // Map candidates to result format with actual votes from backend
            const candidateResults: CandidateResult[] = election.candidates.map(candidate => {
              const voteData = voteResults.find((v: any) => v.candidateId === candidate.id);
              const votes = voteData?.votes || 0;
              const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
              
              return {
                candidateId: candidate.id,
                candidateName: candidate.name,
                partyId: candidate.party,
                partyName: candidate.party,
                symbol: candidate.symbol || '🗳️',
                color: candidate.color || '#666666',
                votes: votes,
                percentage: percentage,
                position: 0, // Will be set after sorting
                isWinner: false, // Will be set after sorting
              };
            });

            // Sort by votes and assign positions
            candidateResults.sort((a, b) => b.votes - a.votes);
            candidateResults.forEach((result, index) => {
              result.position = index + 1;
              result.isWinner = index === 0 && result.votes > 0;
            });

            // Calculate margin
            const margin = candidateResults.length >= 2 
              ? candidateResults[0].votes - candidateResults[1].votes 
              : candidateResults[0]?.votes || 0;

            const turnout = election.totalVoters > 0 
              ? (totalVotes / election.totalVoters) * 100 
              : 0;

            // Check if results were already published (from backend)
            const isPublished = election.resultsPublished === true;
            
            // Status based on published state - completed elections can always be published
            const status: 'counting' | 'partial' | 'final' | 'published' = 
              isPublished ? 'published' : 'final';

            return {
              id: election.id || election._id || '',
              electionId: election.id || election._id || '',
              electionTitle: election.title,
              region: `${election.region.state}${election.region.district ? ' - ' + election.region.district : ''}`,
              status: status,
              totalVotes: totalVotes,
              validVotes: totalVotes,
              invalidVotes: 0,
              turnoutPercentage: parseFloat(turnout.toFixed(1)),
              countingProgress: 100, // Always 100% - results are available
              results: candidateResults,
              leadingCandidate: candidateResults[0]?.candidateName || 'No votes yet',
              margin: margin,
              declaredAt: election.status === 'completed' ? election.endDate : undefined,
              publishedAt: election.resultsPublishedAt || undefined,
              lastUpdated: new Date().toISOString()
            };
          })
        );

        setResults(electionResults);
        
        // Initialize publishedResults state based on elections that are already published
        // Use a functional update to merge with existing publishedResults, not replace them
        const alreadyPublished = electionResults
          .filter(r => r.status === 'published')
          .map(r => r.id);
        setPublishedResults(prev => {
          // Merge existing published IDs with newly discovered ones
          const merged = new Set([...prev, ...alreadyPublished]);
          return Array.from(merged);
        });
        
        if (electionResults.length > 0 && !selectedResult) {
          setSelectedResult(electionResults[0]);
        } else if (selectedResult) {
          // Keep the same selection if it still exists
          const stillExists = electionResults.find(r => r.id === selectedResult.id);
          if (stillExists) {
            setSelectedResult(stillExists);
          }
        }
      } catch (error) {
        console.error('Error loading election results:', error);
        setResults([]);
      }
    };

    // Initial load
    loadRealElections();

    // Subscribe to election updates
    const unsubscribe = electionService.subscribe(() => {
      loadRealElections();
    });

    // Refresh every 10 seconds for live updates
    const interval = setInterval(loadRealElections, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'partial': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'final': return 'bg-green-100 text-green-800 border-green-200';
      case 'published': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'partial': return <Clock className="w-4 h-4" />;
      case 'final': return <CheckCircle className="w-4 h-4" />;
      case 'published': return <Globe className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const publishResult = async (resultId: string) => {
    console.log('🚀 Publishing result for election:', resultId);
    setIsPublishing(true);
    
    try {
      // Publish results through election service (persists to backend/localStorage)
      const published = await electionService.publishElectionResults(resultId);
      console.log('📋 Publish response:', published);
      
      if (published) {
        // Update local state
        setResults(prevResults => 
          prevResults.map(result => 
            result.id === resultId 
              ? { 
                  ...result, 
                  status: 'published' as const, 
                  publishedAt: new Date().toISOString() 
                }
              : result
          )
        );
        
        setPublishedResults(prev => [...prev, resultId]);
        console.log('✅ Results published successfully for election:', resultId);
        alert('Results published successfully!');
      } else {
        console.error('Failed to publish results - no response');
        alert('Failed to publish results. Please try again.');
      }
    } catch (error) {
      console.error('Error publishing results:', error);
      alert('Error publishing results: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsPublishing(false);
    }
  };

  const generatePressRelease = (result: ElectionResult) => {
    const winner = result.results.find(r => r.isWinner);
    const runnerUp = result.results.find(r => r.position === 2);
    
    return `
PRESS RELEASE - ELECTION RESULTS

${result.electionTitle} - ${result.region}

RESULT DECLARED

The Election Commission announces the final results for ${result.region} constituency:

WINNER: ${winner?.candidateName} (${winner?.partyName})
Votes: ${winner?.votes.toLocaleString()} (${winner?.percentage.toFixed(1)}%)

Runner-up: ${runnerUp?.candidateName} (${runnerUp?.partyName})
Votes: ${runnerUp?.votes.toLocaleString()} (${runnerUp?.percentage.toFixed(1)}%)

Victory Margin: ${result.margin.toLocaleString()} votes
Voter Turnout: ${result.turnoutPercentage}%
Total Valid Votes: ${result.validVotes.toLocaleString()}

Declared on: ${new Date(result.declaredAt!).toLocaleString()}

Election Commission of India
    `.trim();
  };

  const renderResultOverview = () => {
    if (!selectedResult) return null;

    return (
      <div className="space-y-6">
        {/* Result Summary */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-black">{selectedResult.electionTitle}</h3>
            <div className="flex items-center space-x-2">
              {getStatusIcon(selectedResult.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedResult.status)}`}>
                {selectedResult.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-black">{selectedResult.totalVotes.toLocaleString()}</p>
              <p className="text-sm text-black/70">Total Votes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{selectedResult.validVotes.toLocaleString()}</p>
              <p className="text-sm text-black/70">Valid Votes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{selectedResult.turnoutPercentage}%</p>
              <p className="text-sm text-black/70">Turnout</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                <p className="text-xl font-bold text-green-600">Ready</p>
              </div>
              <p className="text-sm text-black/70">Available to Publish</p>
            </div>
          </div>
        </div>

        {/* Winner Announcement */}
        {selectedResult.totalVotes > 0 ? (
          <div className="bg-gradient-to-r from-yellow-100/50 to-orange-100/50 backdrop-blur-sm rounded-xl p-6 border border-yellow-200">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-yellow-600 mr-3" />
              <h3 className="text-2xl font-bold text-black">WINNER DECLARED</h3>
            </div>
            
            {(() => {
              const winner = selectedResult.results.find(r => r.isWinner);
              return winner && (
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                    style={{ backgroundColor: `${winner.color}20` }}
                  >
                    {winner.symbol}
                  </div>
                  <h2 className="text-3xl font-bold text-black mb-2">{winner.candidateName}</h2>
                  <p className="text-xl text-black/80 mb-2">{winner.partyName}</p>
                  <p className="text-lg text-black">
                    {winner.votes.toLocaleString()} votes ({winner.percentage.toFixed(1)}%)
                  </p>
                  {winner.margin && (
                    <p className="text-green-600 font-semibold mt-2">
                      Victory Margin: {winner.margin.toLocaleString()} votes
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="bg-blue-50/50 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-black">LEADING CANDIDATE</h3>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-black">{selectedResult.leadingCandidate}</h2>
              <p className="text-blue-600">Leading by {selectedResult.margin.toLocaleString()} votes</p>
            </div>
          </div>
        )}

        {/* Detailed Results */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-black mb-4">Candidate Results</h3>
          <div className="space-y-3">
            {selectedResult.results
              .sort((a, b) => a.position - b.position)
              .map((candidate, index) => (
              <div 
                key={candidate.candidateId}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  candidate.isWinner 
                    ? 'border-yellow-300 bg-yellow-50/50' 
                    : 'border-white/30 bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {candidate.isWinner && <Crown className="w-5 h-5 text-yellow-600" />}
                    <span className="text-lg font-bold text-black">#{candidate.position}</span>
                  </div>
                  
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${candidate.color}20` }}
                  >
                    {candidate.symbol}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-black">{candidate.candidateName}</h4>
                    <p className="text-sm text-black/70">{candidate.partyName}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-black">
                    {candidate.votes.toLocaleString()}
                  </p>
                  <p className="text-sm text-black/70">{candidate.percentage.toFixed(1)}%</p>
                  {candidate.margin && (
                    <p className={`text-xs ${
                      candidate.margin > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {candidate.margin > 0 ? '+' : ''}{candidate.margin.toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="w-32">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${candidate.percentage}%`,
                        backgroundColor: candidate.color
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-black">Result Publishing System</h2>
        <div className="flex items-center space-x-4">
          {selectedResult && selectedResult.status === 'final' && !publishedResults.includes(selectedResult.id) && (
            <button
              onClick={() => publishResult(selectedResult.id)}
              disabled={isPublishing}
              className="flex items-center px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50"
            >
              {isPublishing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isPublishing ? 'Publishing...' : 'Publish Results'}
            </button>
          )}
          
          {selectedResult && publishedResults.includes(selectedResult.id) && (
            <div className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-200">
              <CheckCircle className="w-4 h-4 mr-2" />
              Published
            </div>
          )}
        </div>
      </div>

      {/* Empty State - No Elections Created */}
      {results.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-12 border border-white/20 text-center">
          <Trophy className="w-20 h-20 text-black/30 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-black mb-3">No Elections Available</h3>
          <p className="text-black/70 mb-6 max-w-md mx-auto">
            No completed or active elections found. Create an election first to see results and publish them here.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Only elections created by the admin will appear here. Demo data is not shown.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Results List */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="text-lg font-semibold text-black mb-4">Election Results</h3>
              <div className="space-y-3">
                {results.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedResult?.id === result.id
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-white/30 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-black text-sm">{result.region}</h4>
                      {getStatusIcon(result.status)}
                    </div>
                    <p className="text-xs text-black/70">{result.electionTitle}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-black/60">
                        {result.turnoutPercentage}% turnout
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Publishing Settings */}
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="text-lg font-semibold text-black mb-4">Publishing Settings</h3>
              <div className="space-y-3">
                {Object.entries(publishingSettings).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setPublishingSettings(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                      className="rounded border-white/30"
                    />
                    <span className="text-sm text-black capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedResult ? (
              <div className="space-y-6">
                {renderResultOverview()}
                
                {/* Action Buttons */}
                {selectedResult.totalVotes > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-black mb-4">Publishing Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button 
                        onClick={() => handleDownloadPDF(selectedResult)}
                        className="flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </button>
                      
                      <button 
                        onClick={() => handlePressRelease(selectedResult)}
                        className="flex items-center justify-center px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Press Release
                      </button>
                      
                      <button 
                        onClick={() => handleShareResults(selectedResult)}
                        className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Results
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                <BarChart3 className="w-16 h-16 text-black/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-black mb-2">No Result Selected</h3>
                <p className="text-black/70">
                  Select an election result from the list to view details and publishing options.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Press Release Modal */}
      {showPressRelease && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-600" />
                Press Release
              </h3>
              <button
                onClick={() => setShowPressRelease(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                {pressReleaseText}
              </pre>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowPressRelease(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={copyPressRelease}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultPublishing;