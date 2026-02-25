import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity,
  Users,
  MapPin,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  Target,
  Percent,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Download,
  Share2,
  Filter
} from 'lucide-react';
import { electionService } from '../../services/electionService';

interface ExitPollData {
  id: string;
  pollsterName: string;
  region: string;
  sampleSize: number;
  margin: number;
  confidence: number;
  timestamp: string;
  predictions: PredictionData[];
  demographics: DemographicData[];
  turnoutForecast: number;
  lastUpdated: string;
}

interface PredictionData {
  partyId: string;
  partyName: string;
  symbol: string;
  color: string;
  predictedPercentage: number;
  seatProjection: number;
  trend: 'up' | 'down' | 'stable';
  changeFromLast: number;
}

interface DemographicData {
  category: string;
  subcategory: string;
  percentage: number;
  leadingParty: string;
}

interface LiveUpdate {
  id: string;
  timestamp: string;
  type: 'prediction' | 'turnout' | 'trend' | 'alert';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export const ExitPolls: React.FC = () => {
  const [exitPolls, setExitPolls] = useState<ExitPollData[]>([]);
  const [selectedPoll, setSelectedPoll] = useState<ExitPollData | null>(null);
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'trends' | 'demographics'>('overview');

  // Load real elections - Exit polls require actual elections to be created first
  useEffect(() => {
    const loadRealElections = () => {
      const allElections = electionService.getAllElections();
      
      // Check if there are any active or completed elections
      const relevantElections = allElections.filter(
        election => election.status === 'active' || election.status === 'completed'
      );

      if (relevantElections.length === 0) {
        // No real elections available - clear polls
        setExitPolls([]);
        setSelectedPoll(null);
        setLiveUpdates([]);
        return;
      }

      // TODO: In a real implementation, exit polls would come from:
      // 1. Third-party polling agencies
      // 2. Admin-configured exit poll data
      // 3. Integration with external polling services
      
      // For now, show empty state prompting admin to configure exit polls
      setExitPolls([]);
      setSelectedPoll(null);
      setLiveUpdates([{
        id: '1',
        timestamp: new Date().toISOString(),
        type: 'alert',
        message: `${relevantElections.length} active election(s) found. Configure exit poll data to display predictions.`,
        severity: 'medium'
      }]);
    };

    loadRealElections();

    // Subscribe to election updates
    const unsubscribe = electionService.subscribe(() => {
      loadRealElections();
    });

    return () => unsubscribe();
  }, []);

  // Auto-refresh simulation
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate small fluctuations in data
      setExitPolls(prevPolls => 
        prevPolls.map(poll => ({
          ...poll,
          predictions: poll.predictions.map(pred => ({
            ...pred,
            predictedPercentage: Math.max(0, pred.predictedPercentage + (Math.random() - 0.5) * 0.5),
            changeFromLast: (Math.random() - 0.5) * 2
          })),
          lastUpdated: new Date().toISOString()
        }))
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  const renderOverview = () => {
    if (!selectedPoll) return null;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black/70">Sample Size</p>
                <p className="text-2xl font-bold text-black">
                  {selectedPoll.sampleSize.toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black/70">Margin of Error</p>
                <p className="text-2xl font-bold text-black">±{selectedPoll.margin}%</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black/70">Turnout Forecast</p>
                <p className="text-2xl font-bold text-black">{selectedPoll.turnoutForecast}%</p>
              </div>
              <Percent className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black/70">Confidence Level</p>
                <p className="text-2xl font-bold text-black">{selectedPoll.confidence}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Party Predictions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-black mb-4">Party-wise Predictions</h3>
          <div className="space-y-4">
            {selectedPoll.predictions.map((prediction) => (
              <div key={prediction.partyId} className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${prediction.color}20` }}
                  >
                    {prediction.symbol}
                  </div>
                  <div>
                    <h4 className="font-semibold text-black">{prediction.partyName}</h4>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(prediction.trend)}
                      <span className={`text-sm ${
                        prediction.trend === 'up' ? 'text-green-600' :
                        prediction.trend === 'down' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {prediction.changeFromLast > 0 ? '+' : ''}{prediction.changeFromLast.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-black">{prediction.predictedPercentage.toFixed(1)}%</p>
                  <p className="text-sm text-black/70">{prediction.seatProjection} seats</p>
                </div>

                <div className="w-32">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${prediction.predictedPercentage}%`,
                        backgroundColor: prediction.color
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seat Projection Chart */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-black mb-4">Seat Projections</h3>
          <div className="flex items-end space-x-2 h-40">
            {selectedPoll.predictions.map((prediction) => (
              <div key={prediction.partyId} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full rounded-t-lg transition-all duration-1000"
                  style={{ 
                    height: `${(prediction.seatProjection / 300) * 100}%`,
                    backgroundColor: prediction.color
                  }}
                ></div>
                <div className="text-center mt-2">
                  <p className="text-xs text-black/70">{prediction.partyName}</p>
                  <p className="text-sm font-semibold text-black">{prediction.seatProjection}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-black/70">Total Seats: 543 | Majority Mark: 272</p>
          </div>
        </div>
      </div>
    );
  };

  const renderDemographics = () => {
    if (!selectedPoll || !selectedPoll.demographics.length) {
      return (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
          <Users className="w-16 h-16 text-black/50 mx-auto mb-4" />
          <p className="text-black/70">No demographic data available for this poll</p>
        </div>
      );
    }

    const groupedDemographics = selectedPoll.demographics.reduce((acc, demo) => {
      if (!acc[demo.category]) acc[demo.category] = [];
      acc[demo.category].push(demo);
      return acc;
    }, {} as Record<string, DemographicData[]>);

    return (
      <div className="space-y-6">
        {Object.entries(groupedDemographics).map(([category, data]) => (
          <div key={category} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-black mb-4">{category} Breakdown</h3>
            <div className="space-y-3">
              {data.map((demo, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                  <div>
                    <p className="font-medium text-black">{demo.subcategory}</p>
                    <p className="text-sm text-black/70">Leading Party: {demo.leadingParty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-black">{demo.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-black">Exit Polls & Predictions</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
              autoRefresh 
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </button>
          
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 rounded-lg border border-white/30 bg-white/20 text-black"
          >
            <option value="all">All Regions</option>
            <option value="national">National</option>
            <option value="state">State-wise</option>
            <option value="constituency">Constituency</option>
          </select>
        </div>
      </div>

      {/* Empty State - No Exit Polls Configured */}
      {exitPolls.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-12 border border-white/20 text-center">
          <BarChart3 className="w-20 h-20 text-black/30 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-black mb-3">No Exit Poll Data Available</h3>
          <p className="text-black/70 mb-6 max-w-md mx-auto">
            Exit polls are predictions made before official results are declared. 
            Configure exit poll data sources to display predictions here.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Exit polls require real elections to be created. Demo exit poll data is not displayed.
            </p>
          </div>
          {liveUpdates.length > 0 && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <AlertCircle className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
              {liveUpdates.map(update => (
                <p key={update.id} className="text-sm text-yellow-900">{update.message}</p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Poll List */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="text-lg font-semibold text-black mb-4">Available Polls</h3>
              <div className="space-y-3">
                {exitPolls.map((poll) => (
                  <div
                    key={poll.id}
                    onClick={() => setSelectedPoll(poll)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedPoll?.id === poll.id
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-white/30 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <h4 className="font-medium text-black text-sm">{poll.pollsterName}</h4>
                    <p className="text-xs text-black/70">{poll.region}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-black/60">
                        {poll.sampleSize.toLocaleString()} voters
                      </span>
                      <div className="flex items-center text-xs text-green-600">
                        <Activity className="w-3 h-3 mr-1" />
                        Live
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Updates */}
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="text-lg font-semibold text-black mb-4">Live Updates</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {liveUpdates.map((update) => (
                  <div key={update.id} className="p-3 bg-white/10 rounded-lg border border-white/20">
                    <div className="flex items-start space-x-2">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        update.severity === 'high' ? 'bg-red-500' :
                        update.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-black">{update.message}</p>
                        <p className="text-xs text-black/60 mt-1">
                          {new Date(update.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              {/* View Mode Tabs */}
              <div className="flex space-x-4 mb-6 border-b border-white/20">
                {[
                  { key: 'overview', label: 'Overview', icon: BarChart3 },
                  { key: 'detailed', label: 'Detailed', icon: TrendingUp },
                  { key: 'trends', label: 'Trends', icon: Activity },
                  { key: 'demographics', label: 'Demographics', icon: Users }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setViewMode(tab.key as any)}
                    className={`flex items-center px-4 py-2 border-b-2 transition-colors duration-200 ${
                      viewMode === tab.key
                        ? 'border-blue-500 text-blue-600 bg-blue-50/20'
                        : 'border-transparent text-black/70 hover:text-black hover:bg-white/10'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content based on view mode */}
              {viewMode === 'overview' && renderOverview()}
              {viewMode === 'demographics' && renderDemographics()}
              {(viewMode === 'detailed' || viewMode === 'trends') && (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-black/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-black mb-2">
                    {viewMode === 'detailed' ? 'Detailed Analysis' : 'Trend Analysis'}
                  </h3>
                  <p className="text-black/70">
                    Advanced {viewMode} view coming soon with enhanced visualizations
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExitPolls;