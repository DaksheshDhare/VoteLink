import React, { useState } from 'react';
import { 
  MapPin, 
  Globe, 
  Building, 
  Home, 
  Award,
  Plus,
  Search,
  Users,
  Calendar,
  Settings,
  Play,
  Eye,
  BarChart3,
  LogOut,
  User
} from 'lucide-react';

interface ElectionHostingProps {
  userEmail: string;
  onCreateElection: () => void;
  onManageElections: () => void;
  onLogout?: () => void;
}

interface HostingRegion {
  id: string;
  name: string;
  type: 'national' | 'state' | 'district' | 'local' | 'municipal' | 'panchayat';
  state: string;
  district?: string;
  description: string;
  eligibleVoters: number;
  activeElections: number;
  icon: React.ReactNode;
  status: 'available' | 'active' | 'scheduled';
}

export const ElectionHostingInterface: React.FC<ElectionHostingProps> = ({
  userEmail,
  onCreateElection,
  onManageElections,
  onLogout
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'national' | 'state' | 'district' | 'local'>('all');

  const hostingRegions: HostingRegion[] = [
    {
      id: 'national_india',
      name: 'All India',
      type: 'national',
      state: 'All States',
      description: 'Host national elections like Lok Sabha, Presidential elections',
      eligibleVoters: 95000000,
      activeElections: 1,
      icon: <Globe className="w-8 h-8 text-blue-600" />,
      status: 'active'
    },
    {
      id: 'state_maharashtra',
      name: 'Maharashtra',
      type: 'state',
      state: 'Maharashtra',
      description: 'Host Maharashtra Vidhan Sabha and legislative elections',
      eligibleVoters: 8500000,
      activeElections: 0,
      icon: <Building className="w-8 h-8 text-green-600" />,
      status: 'available'
    },
    {
      id: 'state_karnataka',
      name: 'Karnataka',
      type: 'state',
      state: 'Karnataka',
      description: 'Host Karnataka Assembly and local body elections',
      eligibleVoters: 4500000,
      activeElections: 1,
      icon: <Building className="w-8 h-8 text-green-600" />,
      status: 'scheduled'
    },
    {
      id: 'district_mumbai',
      name: 'Mumbai District',
      type: 'district',
      state: 'Maharashtra',
      district: 'Mumbai',
      description: 'Host district-level elections and municipal corporations',
      eligibleVoters: 1200000,
      activeElections: 0,
      icon: <MapPin className="w-8 h-8 text-purple-600" />,
      status: 'available'
    },
    {
      id: 'local_pune',
      name: 'Pune Municipal Corporation',
      type: 'municipal',
      state: 'Maharashtra',
      district: 'Pune',
      description: 'Host local municipal and ward-level elections',
      eligibleVoters: 850000,
      activeElections: 0,
      icon: <Home className="w-8 h-8 text-orange-600" />,
      status: 'available'
    },
    {
      id: 'panchayat_rural_mh',
      name: 'Maharashtra Rural Panchayats',
      type: 'panchayat',
      state: 'Maharashtra',
      description: 'Host Gram Panchayat and village-level elections',
      eligibleVoters: 2500000,
      activeElections: 0,
      icon: <Award className="w-8 h-8 text-yellow-600" />,
      status: 'available'
    }
  ];

  const filteredRegions = hostingRegions.filter(region => {
    const matchesSearch = region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         region.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         region.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'national' && region.type === 'national') ||
                         (filterType === 'state' && region.type === 'state') ||
                         (filterType === 'district' && region.type === 'district') ||
                         (filterType === 'local' && ['local', 'municipal', 'panchayat'].includes(region.type));
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: HostingRegion['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'available': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: HostingRegion['status']) => {
    switch (status) {
      case 'active': return 'Election Active';
      case 'scheduled': return 'Election Scheduled';
      case 'available': return 'Available for Hosting';
      default: return 'Available';
    }
  };

  const handleHostElection = (regionId: string) => {
    alert(`Hosting election for ${hostingRegions.find(r => r.id === regionId)?.name}. Creating election wizard...`);
    onCreateElection();
  };

  const handleViewDetails = (regionId: string) => {
    const region = hostingRegions.find(r => r.id === regionId);
    alert(`Viewing details for ${region?.name}:\n\nEligible Voters: ${region?.eligibleVoters.toLocaleString()}\nActive Elections: ${region?.activeElections}\nStatus: ${region?.status}`);
  };

  const handleViewAnalytics = (regionId: string) => {
    const region = hostingRegions.find(r => r.id === regionId);
    alert(`Analytics for ${region?.name}:\n\nVoter Registration Trends, Participation Rates, and Election Statistics will be displayed here.`);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background matching login page */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Tricolor Gradient Background with Blue */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933] via-[#ffffff] via-[#000080] to-[#138808]" />
        
        {/* Animated Particles (Blue Dots) */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-900 rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 bg-black/5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Floating Shapes */}
        <div className="absolute top-3/4 left-1/4 w-64 h-64 bg-orange-900/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-3/4 right-1/4 w-48 h-48 bg-green-900/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Government Logo and Title */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF9933] via-[#ffffff] to-[#138808] rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  <span className="text-[#000080] text-xl font-bold">🇮🇳</span>
                </div>
                <div className="text-left">
                  <div className="text-xs text-white font-medium">Government of India</div>
                  <div className="text-sm text-white font-semibold">Election Commission</div>
                </div>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-white">Election Hosting Dashboard</h1>
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              {/* User Profile */}
              <div className="flex items-center space-x-2 text-white">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{userEmail}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={onCreateElection}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create New Election
                </button>
                <button
                  onClick={onManageElections}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Manage Elections
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/50 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search regions, states, or districts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/10 border border-black/20 rounded-lg text-black placeholder-black/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="px-4 py-3 bg-black/10 border border-black/20 rounded-lg text-black focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
              >
                <option value="all">All Regions</option>
                <option value="national">National</option>
                <option value="state">State</option>
                <option value="district">District</option>
                <option value="local">Local/Municipal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Election Hosting Regions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegions.map((region) => (
            <div
              key={region.id}
              className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 hover:shadow-2xl hover:bg-black/15 transition-all duration-300 overflow-hidden transform hover:scale-105"
            >
              {/* Region Header */}
              <div className="p-6 border-b border-black/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-black/10 backdrop-blur-sm rounded-lg">
                    {region.icon}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(region.status)}`}>
                    {getStatusText(region.status)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{region.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{region.state}</p>
                {region.district && (
                  <p className="text-sm text-gray-700">{region.district} District</p>
                )}
              </div>

              {/* Region Details */}
              <div className="p-6">
                <p className="text-gray-700 mb-4">{region.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-700">Eligible Voters</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {(region.eligibleVoters / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">Active Elections</p>
                    <p className="text-lg font-semibold text-blue-600">{region.activeElections}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleHostElection(region.id)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Host Election
                  </button>
                  <button 
                    onClick={() => handleViewDetails(region.id)}
                    className="flex items-center justify-center px-3 py-2 border border-white/30 bg-black/10 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-black/20 transition-all duration-300"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleViewAnalytics(region.id)}
                    className="flex items-center justify-center px-3 py-2 border border-white/30 bg-black/10 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-black/20 transition-all duration-300"
                    title="View Analytics"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100/30 backdrop-blur-sm rounded-lg mr-4">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-black/70">Total Regions</p>
                <p className="text-2xl font-bold text-black">{hostingRegions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100/30 backdrop-blur-sm rounded-lg mr-4">
                <Play className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-black/70">Active Elections</p>
                <p className="text-2xl font-bold text-green-600">
                  {hostingRegions.reduce((sum, r) => sum + r.activeElections, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100/30 backdrop-blur-sm rounded-lg mr-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-black/70">Total Voters</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(hostingRegions.reduce((sum, r) => sum + r.eligibleVoters, 0) / 1000000).toFixed(0)}M
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100/30 backdrop-blur-sm rounded-lg mr-4">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-black/70">Available Regions</p>
                <p className="text-2xl font-bold text-orange-600">
                  {hostingRegions.filter(r => r.status === 'available').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};