import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Vote, 
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash,
  Play,
  Pause,
  Square,
  Archive,
  MapPin,
  Globe,
  Building,
  Home,
  BarChart3,
  Settings,
  Shield,
  Database
} from 'lucide-react';
import ElectionCreationWizard from './ElectionCreationWizard';

interface Election {
  id: string;
  title: string;
  description: string;
  type: 'national' | 'state' | 'local' | 'referendum';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived';
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  totalVoters: number;
  votescast: number;
  candidates: number;
  createdAt: string;
  template?: string;
}

// Election template interface for future implementation
/* interface ElectionTemplate {
  id: string;
  name: string;
  type: 'national' | 'state' | 'local' | 'referendum';
  description: string;
  defaultDuration: number; // in hours
  settings: {
    allowEarlyVoting: boolean;
    requireVoterVerification: boolean;
    enableRealTimeResults: boolean;
    allowProxyVoting: boolean;
  };
} */

const ElectionManagementDashboard: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  // const [templates, setTemplates] = useState<ElectionTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'scheduled' | 'completed' | 'archived'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'national' | 'state' | 'local' | 'referendum'>('all');
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  // Mock data initialization
  useEffect(() => {
    const mockElections: Election[] = [
      {
        id: 'el_001',
        title: 'General Election 2026',
        description: 'National parliamentary election',
        type: 'national',
        status: 'active',
        startDate: '2026-11-01T08:00:00Z',
        endDate: '2026-11-01T18:00:00Z',
        registrationDeadline: '2026-10-15T23:59:59Z',
        totalVoters: 125000,
        votescast: 87500,
        candidates: 45,
        createdAt: '2026-09-01T10:00:00Z',
        template: 'national_election'
      },
      {
        id: 'el_002',
        title: 'State Assembly Election - Maharashtra',
        description: 'Maharashtra state assembly election',
        type: 'state',
        status: 'scheduled',
        startDate: '2025-12-15T08:00:00Z',
        endDate: '2025-12-15T18:00:00Z',
        registrationDeadline: '2025-11-30T23:59:59Z',
        totalVoters: 45000,
        votescast: 0,
        candidates: 28,
        createdAt: '2025-10-01T14:30:00Z',
        template: 'state_election'
      },
      {
        id: 'el_003',
        title: 'Municipal Corporation Election - Mumbai',
        description: 'Local municipal corporation election',
        type: 'local',
        status: 'completed',
        startDate: '2025-09-20T08:00:00Z',
        endDate: '2025-09-20T18:00:00Z',
        registrationDeadline: '2025-09-05T23:59:59Z',
        totalVoters: 25000,
        votescast: 18750,
        candidates: 15,
        createdAt: '2025-08-15T09:00:00Z'
      }
    ];

    // Election templates will be implemented in future version
    /* const mockTemplates: ElectionTemplate[] = [
      {
        id: 'tpl_national',
        name: 'National Election Template',
        type: 'national',
        description: 'Standard template for national parliamentary elections',
        defaultDuration: 12,
        settings: {
          allowEarlyVoting: false,
          requireVoterVerification: true,
          enableRealTimeResults: false,
          allowProxyVoting: false
        }
      },
      {
        id: 'tpl_state',
        name: 'State Assembly Template',
        type: 'state',
        description: 'Template for state assembly elections',
        defaultDuration: 10,
        settings: {
          allowEarlyVoting: true,
          requireVoterVerification: true,
          enableRealTimeResults: true,
          allowProxyVoting: false
        }
      },
      {
        id: 'tpl_local',
        name: 'Local Election Template',
        type: 'local',
        description: 'Template for municipal and local elections',
        defaultDuration: 8,
        settings: {
          allowEarlyVoting: true,
          requireVoterVerification: false,
          enableRealTimeResults: true,
          allowProxyVoting: true
        }
      }
    ]; */

    setElections(mockElections);
    // setTemplates(mockTemplates); // Templates will be used in future version
  }, []);

  const getStatusColor = (status: Election['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'archived': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: Election['type']) => {
    switch (type) {
      case 'national': return '🏛️';
      case 'state': return '🏢';
      case 'local': return '🏘️';
      case 'referendum': return '📊';
    }
  };

  const filteredElections = elections.filter(election => {
    const matchesSearch = election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         election.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || election.type === filterType;
    const matchesTab = activeTab === 'active' ? election.status === 'active' || election.status === 'paused' :
                      activeTab === 'scheduled' ? election.status === 'scheduled' || election.status === 'draft' :
                      activeTab === 'completed' ? election.status === 'completed' :
                      election.status === 'archived';
    
    return matchesSearch && matchesFilter && matchesTab;
  });

  const handleElectionAction = (electionId: string, action: 'start' | 'pause' | 'stop' | 'archive' | 'delete') => {
    setElections(prev => prev.map(election => {
      if (election.id === electionId) {
        switch (action) {
          case 'start':
            return { ...election, status: 'active' as const };
          case 'pause':
            return { ...election, status: 'paused' as const };
          case 'stop':
            return { ...election, status: 'completed' as const };
          case 'archive':
            return { ...election, status: 'archived' as const };
          default:
            return election;
        }
      }
      return election;
    }));

    if (action === 'delete') {
      setElections(prev => prev.filter(election => election.id !== electionId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Election Management Dashboard
              </h1>
              <p className="text-gray-600">Manage elections, timelines, and monitor real-time status</p>
            </div>
            <button
              onClick={() => setShowCreateWizard(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl
                         hover:from-blue-700 hover:to-purple-700 transition-all duration-300
                         flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Election
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Elections</p>
                <p className="text-2xl font-bold text-green-600">
                  {elections.filter(e => e.status === 'active').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Vote className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Scheduled Elections</p>
                <p className="text-2xl font-bold text-blue-600">
                  {elections.filter(e => e.status === 'scheduled').length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Voters</p>
                <p className="text-2xl font-bold text-purple-600">
                  {elections.reduce((sum, e) => sum + e.totalVoters, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Votes Cast Today</p>
                <p className="text-2xl font-bold text-orange-600">
                  {elections.filter(e => e.status === 'active')
                           .reduce((sum, e) => sum + e.votescast, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 pt-6">
              {[
                { key: 'active', label: 'Active Elections', count: elections.filter(e => e.status === 'active' || e.status === 'paused').length },
                { key: 'scheduled', label: 'Scheduled', count: elections.filter(e => e.status === 'scheduled' || e.status === 'draft').length },
                { key: 'completed', label: 'Completed', count: elections.filter(e => e.status === 'completed').length },
                { key: 'archived', label: 'Archives', count: elections.filter(e => e.status === 'archived').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'active' | 'scheduled' | 'completed' | 'archived')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-300 ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search elections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'national' | 'state' | 'local' | 'referendum')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="national">National</option>
                  <option value="state">State</option>
                  <option value="local">Local</option>
                  <option value="referendum">Referendum</option>
                </select>

                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </button>

                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Elections List */}
          <div className="p-6">
            <div className="space-y-4">
              {filteredElections.map((election) => (
                <div key={election.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getTypeIcon(election.type)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{election.title}</h3>
                          <p className="text-sm text-gray-600">{election.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(election.status)}`}>
                          {election.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-600">Start Date</p>
                          <p className="text-sm font-medium">{new Date(election.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">End Date</p>
                          <p className="text-sm font-medium">{new Date(election.endDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Registered Voters</p>
                          <p className="text-sm font-medium">{election.totalVoters.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Votes Cast</p>
                          <p className="text-sm font-medium">
                            {election.votescast.toLocaleString()} 
                            <span className="text-xs text-gray-400 ml-1">
                              ({((election.votescast / election.totalVoters) * 100).toFixed(1)}%)
                            </span>
                          </p>
                        </div>
                      </div>

                      {election.status === 'active' && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Voting Progress</span>
                            <span>{((election.votescast / election.totalVoters) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(election.votescast / election.totalVoters) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-6">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {election.status === 'scheduled' && (
                        <button 
                          onClick={() => handleElectionAction(election.id, 'start')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      
                      {election.status === 'active' && (
                        <button 
                          onClick={() => handleElectionAction(election.id, 'pause')}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      
                      {(election.status === 'active' || election.status === 'paused') && (
                        <button 
                          onClick={() => handleElectionAction(election.id, 'stop')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      )}
                      
                      {election.status === 'completed' && (
                        <button 
                          onClick={() => handleElectionAction(election.id, 'archive')}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleElectionAction(election.id, 'delete')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredElections.length === 0 && (
              <div className="text-center py-12">
                <Vote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No elections found</h3>
                <p className="text-gray-700">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Election Creation Wizard */}
      <ElectionCreationWizard
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        onCreateElection={(electionData) => {
          console.log('Creating election with candidates:', electionData);
          // Here you would typically call an API to create the election
          // For now, we'll just add it to the local state
          const newElection: Election = {
            id: `el_${Date.now()}`,
            title: electionData.title,
            description: electionData.description,
            type: electionData.type,
            status: 'draft',
            startDate: electionData.startDate,
            endDate: electionData.endDate,
            registrationDeadline: electionData.registrationDeadline,
            totalVoters: 0,
            votescast: 0,
            candidates: electionData.candidates?.length || 0,
            createdAt: new Date().toISOString(),
            template: electionData.templateId || 'custom'
          };
          setElections(prev => [newElection, ...prev]);
          setShowCreateWizard(false);
          
          console.log('✅ Election created with', electionData.candidates?.length || 0, 'candidates');
        }}
      />
    </div>
  );
};

export default ElectionManagementDashboard;