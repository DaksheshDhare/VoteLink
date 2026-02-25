import React, { useState, useEffect } from 'react';
import { 
  Vote, Shield, Users, CheckCircle, ArrowRight, 
  Clock, FileText, UserCheck, Eye, Volume2, 
  AccessibilityIcon as Wheelchair, Lock, Award, Info,
  Heart, Fingerprint, Camera, Download,
  Smartphone, BarChart3, X
} from 'lucide-react';
import { LanguageSelector } from './ui/LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';
import AnimatedBackground from './ui/AnimatedBackground';
import { ResultsDashboard } from './voting/ResultsDashboard';
import { electionService, Election } from '../services/electionService';
import '../styles/animations.css';

interface LandingPageProps {
  onStartVoting?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartVoting }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showElectionSelector, setShowElectionSelector] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [completedElections, setCompletedElections] = useState<Election[]>([]);
  const { t } = useTranslation();
  
  useEffect(() => {
    setIsVisible(true);
    
    // Function to load published elections
    const loadPublishedElections = () => {
      const elections = electionService.getAllElections();
      console.log('📊 All elections:', elections.map(e => ({ 
        id: e.id, 
        title: e.title, 
        status: e.status,
        resultsPublished: e.resultsPublished 
      })));
      // Show elections with published results OR completed elections
      const withResults = elections.filter(e => 
        e.resultsPublished === true || e.status === 'completed'
      );
      console.log('📊 Elections with results:', withResults.length);
      setCompletedElections(withResults);
    };
    
    // Initial load
    loadPublishedElections();
    
    // Subscribe to election updates (when admin publishes results)
    const unsubscribe = electionService.subscribe(() => {
      loadPublishedElections();
    });
    
    return () => unsubscribe();
  }, []);

  const handleViewResults = async () => {
    try {
      const elections = electionService.getAllElections();
      console.log('📊 handleViewResults - All elections:', elections.map(e => ({
        id: e.id,
        title: e.title,
        status: e.status,
        resultsPublished: e.resultsPublished
      })));
      
      // Show elections with PUBLISHED results, OR completed elections as fallback
      const withResults = elections.filter(e => 
        e.resultsPublished === true || e.status === 'completed'
      );
      console.log('📊 Elections with results:', withResults.length);
      setCompletedElections(withResults);
      
      if (withResults.length === 0) {
        alert('No elections with results available to view.\n\nResults will appear here once elections are completed or results are published by an admin.');
        return;
      }
      
      if (withResults.length === 1) {
        // If only one election with results, show it directly
        setSelectedElection(withResults[0]);
        setShowResults(true);
      } else {
        // Show election selector
        setShowElectionSelector(true);
      }
    } catch (error) {
      console.error('Error loading election results:', error);
      alert('Unable to load election results. Please try again later.');
    }
  };

  const handleElectionSelect = (election: Election) => {
    setSelectedElection(election);
    setShowElectionSelector(false);
    setShowResults(true);
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setSelectedElection(null);
  };

  // If showing results dashboard
  if (showResults && selectedElection) {
    return (
      <ResultsDashboard
        electionId={selectedElection.id || selectedElection._id || ''}
        electionTitle={selectedElection.title}
        totalVoters={selectedElection.totalVoters || 0}
        candidates={selectedElection.candidates}
        isLive={false}
        onClose={handleCloseResults}
      />
    );
  }

  const features = [
    {
      icon: <Shield className="w-16 h-16 text-orange-500" />,
      title: "Military-Grade Security",
      description: "Advanced encryption, biometric verification, and blockchain technology protect every vote",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <Eye className="w-16 h-16 text-blue-500" />,
      title: "Crystal Clear Transparency",
      description: "Real-time monitoring, public audit trails, and open-source verification for complete trust",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Wheelchair className="w-16 h-16 text-blue-500" />,
      title: "Universal Access",
      description: "Comprehensive accessibility features ensuring every citizen can vote with dignity",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      icon: <Smartphone className="w-16 h-16 text-indigo-500" />,
      title: "Smart Technology",
      description: "AI-powered fraud detection and seamless multi-device compatibility",
      gradient: "from-indigo-500 to-pink-500"
    }
  ];



  const votingSteps = [
    {
      step: 1,
      title: "Register & Verify",
      description: "Upload your Voter ID and complete identity verification",
      icon: <UserCheck className="w-8 h-8" />,
      details: [
        "Upload clear photo of Voter ID",
        "Biometric verification",
        "Address confirmation",
        "Disability accommodation (if needed)"
      ]
    },
    {
      step: 2,
      title: "Authentication",
      description: "Multi-factor authentication with OTP verification",
      icon: <Lock className="w-8 h-8" />,
      details: [
        "Mobile/Email OTP verification",
        "Face recognition check",
        "Device fingerprinting",
        "Security question validation"
      ]
    },
    {
      step: 3,
      title: "Cast Your Vote",
      description: "Select your candidate and confirm your choice",
      icon: <Vote className="w-8 h-8" />,
      details: [
        "Review candidate information",
        "Make your selection",
        "Confirm vote choice",
        "Encrypted vote submission"
      ]
    },
    {
      step: 4,
      title: "Verification Receipt",
      description: "Get your digital voting certificate",
      icon: <Award className="w-8 h-8" />,
      details: [
        "Digital certificate generation",
        "Blockchain verification",
        "Download voting proof",
        "Transaction ID for tracking"
      ]
    }
  ];



  return (
    <div className="min-h-screen overflow-x-hidden relative">
      {/* Tricolor Animated Background */}
      <AnimatedBackground />

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-sm border-b border-white/20" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Government Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-[#000080] font-bold text-sm">🇮🇳</span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-800">Government of India</div>
                  <div className="text-xs text-gray-600">Election Commission</div>
                </div>
              </div>
            </div>
            
            {/* Language Selector */}
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 4rem)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Floating Icons Animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
          </div>

          {/* Main Logo with Tricolor Glowing Effect */}
          <div className="flex justify-center mb-12 relative">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] rounded-full blur-xl opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-[#FF9933] via-white to-[#138808] p-8 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-500">
                <Vote className="w-20 h-20 text-[#000080]" />
              </div>
            </div>
          </div>

          {/* Dynamic Title with Modern Gradient Text */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-black mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
              VoteLink
            </h1>
            <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-semibold text-gray-700 mb-2">
              <Fingerprint className="w-8 h-8 text-[#FF9933] animate-pulse" />
              <span>Secure</span>
              <div className="w-2 h-2 bg-[#FF9933] rounded-full animate-ping"></div>
              <Camera className="w-8 h-8 text-[#138808] animate-pulse" />
              <span>Transparent</span>
              <div className="w-2 h-2 bg-[#138808] rounded-full animate-ping"></div>
            </div>
          </div>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            {t('subtitle')} <br />
            <span className="text-lg text-[#FF9933] font-semibold">🇮🇳 Empowering India's Democratic Future</span>
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={onStartVoting}
              className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-500 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-purple-500/80 to-indigo-600/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              <span className="relative flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {t('startVoting')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
            
            <button
              onClick={handleViewResults}
              className="group relative px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-500 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/80 to-green-600/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              <span className="relative flex items-center justify-center gap-2">
                <BarChart3 className="w-4 h-4" />
                View Results
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
            
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 border-2 border-[#138808] bg-white/20 backdrop-blur-sm text-[#138808] rounded-xl font-semibold text-sm hover:bg-[#138808] hover:text-white transform hover:scale-105 transition-all duration-500 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Info className="w-4 h-4" />
              {t('learnMore')}
            </button>
          </div>
        </div>
      </div>

      {/* Simple Features Section */}
      <div className="py-20 bg-gradient-to-br from-orange-50 via-white to-green-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose <span className="text-[#FF9933]">VoteLink</span>?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure</h3>
              <p className="text-gray-600">Bank-level encryption and blockchain verification</p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Transparent</h3>
              <p className="text-gray-600">Real-time monitoring and verifiable results</p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Easy to Use</h3>
              <p className="text-gray-600">Simple interface accessible from any device</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-24 bg-gradient-to-br from-orange-600 via-red-500 to-green-600 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          {/* Patriotic Flag Elements */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              <div className="w-4 h-16 bg-orange-400 rounded-full animate-pulse"></div>
              <div className="w-4 h-16 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-4 h-16 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          <h2 className="text-5xl md:text-7xl font-black text-yellow-100 mb-6 animate-gradient-x bg-gradient-to-r from-yellow-100 via-orange-200 to-green-200 bg-clip-text">
            Your Vote. Your Voice. Your Future.
          </h2>
          
          <p className="text-2xl text-white/90 mb-4 max-w-4xl mx-auto leading-relaxed">
            Join millions of proud citizens in shaping India's democratic destiny
          </p>
          
          <p className="text-lg text-white/80 mb-12 max-w-3xl mx-auto">
            🇮🇳 <strong>Secure • Transparent</strong> - Experience the future of voting with VoteLink
          </p>

          {/* Enhanced CTA Button */}
          <div className="flex flex-col items-center space-y-6">
            <button
              onClick={onStartVoting}
              className="group relative px-8 py-3 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-2xl font-bold text-base shadow-xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-500 overflow-hidden animate-glow"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></span>
              <span className="relative flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-500">
                <CheckCircle className="w-5 h-5" />
                Start Voting
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl"></div>
            </button>

            <button
              onClick={handleViewResults}
              className="group relative px-8 py-3 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 rounded-2xl font-bold text-base shadow-xl hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-500 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></span>
              <span className="relative flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-500">
                <BarChart3 className="w-5 h-5" />
                View Election Results
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Election Selector Modal */}
      {showElectionSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">Select Election to View Results</h2>
              <button
                onClick={() => setShowElectionSelector(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {completedElections.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No elections with published results available yet.</p>
                  <p className="text-gray-500 text-sm mt-2">Results will appear here once voting has taken place.</p>
                </div>
              ) : (
                completedElections.map((election) => (
                  <button
                    key={election.id || election._id}
                    onClick={() => handleElectionSelect(election)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:shadow-lg transition-all duration-300 text-left group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                            {election.title}
                          </h3>
                          {election.status === 'completed' ? (
                            <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                              Completed
                            </span>
                          ) : election.status === 'active' ? (
                            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                              Active
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{election.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {election.status === 'completed' 
                                ? `Ended: ${new Date(election.endDate).toLocaleDateString()}`
                                : `Ends: ${new Date(election.endDate).toLocaleDateString()}`
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span className="font-semibold text-green-600">{election.votesCast || 0} votes cast</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;