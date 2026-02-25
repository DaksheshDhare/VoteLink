import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Vote,
  Phone,
  MapPin,
  Shield,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react';
import userService, { 
  User, 
  UserStats, 
  PaginationInfo,
  GetAllUsersParams 
} from '../../services/userService';

interface UserDetailsModal {
  isOpen: boolean;
  user: User | null;
}

export const DatabaseUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVoted, setFilterVoted] = useState<'all' | 'voted' | 'not-voted'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'voter' | 'admin'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'lastLogin' | 'email' | 'name'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserDetailsModal>({ isOpen: false, user: null });
  const [exporting, setExporting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: GetAllUsersParams = {
        page: currentPage,
        limit: 20,
        sortBy,
        sortOrder
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (filterVoted !== 'all') {
        params.hasVoted = filterVoted === 'voted';
      }

      if (filterRole !== 'all') {
        params.role = filterRole;
      }

      const response = await userService.getAllUsers(params);

      if (response.success && response.data) {
        setUsers(response.data.users);
        setStats(response.data.stats);
        setPagination(response.data.pagination);
      } else {
        setError(response.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterVoted, filterRole, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await userService.downloadUsersCSV();
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export users');
    } finally {
      setExporting(false);
    }
  };

  const handleViewDetails = async (user: User) => {
    setSelectedUser({ isOpen: true, user });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const getStatusBadge = (hasVoted: boolean) => {
    if (hasVoted) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Voted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </span>
    );
  };

  const getVerificationBadge = (isVerified: boolean) => {
    if (isVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <UserCheck className="w-3 h-3 mr-1" />
          Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <UserX className="w-3 h-3 mr-1" />
        Unverified
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
        <Vote className="w-3 h-3 mr-1" />
        Voter
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Database Users</h1>
          <p className="text-black/70">View all registered users in the system</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || users.length === 0}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Verified</p>
                <p className="text-2xl font-bold text-blue-600">{stats.verifiedUsers}</p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Voted</p>
                <p className="text-2xl font-bold text-green-600">{stats.votedUsers}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Admins</p>
                <p className="text-2xl font-bold text-purple-600">{stats.adminUsers}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Turnout</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.totalUsers > 0 ? ((stats.votedUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <Vote className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <form onSubmit={handleSearch} className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by email, name, voter ID, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterVoted}
              onChange={(e) => {
                setFilterVoted(e.target.value as 'all' | 'voted' | 'not-voted');
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="voted">Voted</option>
              <option value="not-voted">Not Voted</option>
            </select>
          </div>

          <select
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value as 'all' | 'voter' | 'admin');
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="voter">Voters</option>
            <option value="admin">Admins</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="lastLogin-desc">Recent Login</option>
            <option value="email-asc">Email (A-Z)</option>
            <option value="name-asc">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600">Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Users className="w-12 h-12 mb-3" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voter ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className="flex items-center text-gray-500">
                          <Phone className="w-3 h-3 mr-1" />
                          {user.mobile || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-mono text-gray-900">
                        {user.voterID || 'Not Set'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col space-y-1">
                        {getStatusBadge(user.hasVoted)}
                        {getVerificationBadge(user.isVerified)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-4 py-4">
                      {user.region?.constituency ? (
                        <div className="text-sm">
                          <div className="flex items-center text-gray-700">
                            <MapPin className="w-3 h-3 mr-1" />
                            {user.region.constituency}
                          </div>
                          <p className="text-gray-500 text-xs">
                            {user.region.district}, {user.region.state}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not Set</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(user.lastLogin)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)} of{' '}
              {pagination.totalUsers} users
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser.isOpen && selectedUser.user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                <button
                  onClick={() => setSelectedUser({ isOpen: false, user: null })}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.user.name?.charAt(0) || selectedUser.user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.user.name || 'N/A'}</h3>
                  <p className="text-gray-500">{selectedUser.user.email}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-medium flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {selectedUser.user.mobile || 'N/A'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Voter ID</p>
                  <p className="font-medium font-mono">{selectedUser.user.voterID || 'Not Set'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Role</p>
                  <div className="mt-1">{getRoleBadge(selectedUser.user.role)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Voting Status</p>
                  <div className="mt-1">{getStatusBadge(selectedUser.user.hasVoted)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Verification</p>
                  <div className="mt-1">{getVerificationBadge(selectedUser.user.isVerified)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Face Data</p>
                  <p className="font-medium">
                    {selectedUser.user.hasFaceData ? (
                      <span className="text-green-600">✓ Captured</span>
                    ) : (
                      <span className="text-gray-400">Not captured</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Region */}
              {selectedUser.user.region?.constituency && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-2">Region</p>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-blue-500 mr-2" />
                    <div>
                      <p className="font-medium">{selectedUser.user.region.constituency}</p>
                      <p className="text-sm text-gray-600">
                        {selectedUser.user.region.district}, {selectedUser.user.region.state}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="font-medium">{formatDate(selectedUser.user.lastLogin)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registered</p>
                  <p className="font-medium">{formatDate(selectedUser.user.createdAt)}</p>
                </div>
                {selectedUser.user.votedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Voted At</p>
                    <p className="font-medium">{formatDate(selectedUser.user.votedAt)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">IP Address</p>
                  <p className="font-medium font-mono text-sm">{selectedUser.user.ipAddress || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseUsers;
