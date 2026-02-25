import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Key, 
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Activity,
  Search,
  Download,
  Upload,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'auditor' | 'operator' | 'viewer';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  department: string;
  location: string;
  lastLogin: Date;
  createdAt: Date;
  permissions: string[];
  phone?: string;
  twoFactorEnabled: boolean;
  loginAttempts: number;
  sessionCount: number;
}

interface Permission {
  id: string;
  name: string;
  category: 'system' | 'elections' | 'users' | 'reports' | 'security';
  description: string;
  level: 'read' | 'write' | 'admin';
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isDefault: boolean;
  color: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'moderator' | 'auditor' | 'operator' | 'viewer'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended' | 'pending'>('all');
  const [currentView, setCurrentView] = useState<'users' | 'roles' | 'permissions'>('users');

  useEffect(() => {
    // Mock permissions
    const mockPermissions: Permission[] = [
      {
        id: 'perm_001',
        name: 'View Elections',
        category: 'elections',
        description: 'View election details and results',
        level: 'read'
      },
      {
        id: 'perm_002',
        name: 'Create Elections',
        category: 'elections',
        description: 'Create and configure new elections',
        level: 'write'
      },
      {
        id: 'perm_003',
        name: 'Manage Elections',
        category: 'elections',
        description: 'Full control over election management',
        level: 'admin'
      },
      {
        id: 'perm_004',
        name: 'View Users',
        category: 'users',
        description: 'View user accounts and profiles',
        level: 'read'
      },
      {
        id: 'perm_005',
        name: 'Manage Users',
        category: 'users',
        description: 'Create, edit, and delete user accounts',
        level: 'admin'
      },
      {
        id: 'perm_006',
        name: 'View Reports',
        category: 'reports',
        description: 'Access system and election reports',
        level: 'read'
      },
      {
        id: 'perm_007',
        name: 'Security Settings',
        category: 'security',
        description: 'Configure security settings and policies',
        level: 'admin'
      },
      {
        id: 'perm_008',
        name: 'System Administration',
        category: 'system',
        description: 'Full system administration access',
        level: 'admin'
      }
    ];

    // Mock roles
    const mockRoles: Role[] = [
      {
        id: 'role_001',
        name: 'Super Admin',
        description: 'Full system access and control',
        permissions: ['perm_001', 'perm_002', 'perm_003', 'perm_004', 'perm_005', 'perm_006', 'perm_007', 'perm_008'],
        userCount: 2,
        isDefault: false,
        color: 'red'
      },
      {
        id: 'role_002',
        name: 'Election Admin',
        description: 'Manage elections and view reports',
        permissions: ['perm_001', 'perm_002', 'perm_003', 'perm_004', 'perm_006'],
        userCount: 5,
        isDefault: false,
        color: 'blue'
      },
      {
        id: 'role_003',
        name: 'Moderator',
        description: 'Monitor elections and assist users',
        permissions: ['perm_001', 'perm_004', 'perm_006'],
        userCount: 12,
        isDefault: false,
        color: 'green'
      },
      {
        id: 'role_004',
        name: 'Auditor',
        description: 'Access reports and audit trails',
        permissions: ['perm_001', 'perm_006'],
        userCount: 8,
        isDefault: false,
        color: 'purple'
      },
      {
        id: 'role_005',
        name: 'Viewer',
        description: 'Read-only access to elections',
        permissions: ['perm_001'],
        userCount: 23,
        isDefault: true,
        color: 'gray'
      }
    ];

    // Mock users
    const mockUsers: User[] = [
      {
        id: 'user_001',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@votelink.gov.in',
        role: 'admin',
        status: 'active',
        department: 'Election Commission',
        location: 'New Delhi',
        lastLogin: new Date(Date.now() - 1800000), // 30 minutes ago
        createdAt: new Date('2024-01-15'),
        permissions: ['perm_001', 'perm_002', 'perm_003', 'perm_004', 'perm_005', 'perm_006', 'perm_007', 'perm_008'],
        phone: '+91 98765 43210',
        twoFactorEnabled: true,
        loginAttempts: 0,
        sessionCount: 2
      },
      {
        id: 'user_002',
        name: 'Priya Sharma',
        email: 'priya.sharma@votelink.gov.in',
        role: 'moderator',
        status: 'active',
        department: 'Regional Office - Mumbai',
        location: 'Mumbai',
        lastLogin: new Date(Date.now() - 3600000), // 1 hour ago
        createdAt: new Date('2024-02-20'),
        permissions: ['perm_001', 'perm_004', 'perm_006'],
        phone: '+91 87654 32109',
        twoFactorEnabled: true,
        loginAttempts: 0,
        sessionCount: 1
      },
      {
        id: 'user_003',
        name: 'Amit Singh',
        email: 'amit.singh@votelink.gov.in',
        role: 'auditor',
        status: 'active',
        department: 'Audit & Compliance',
        location: 'Bangalore',
        lastLogin: new Date(Date.now() - 7200000), // 2 hours ago
        createdAt: new Date('2024-01-10'),
        permissions: ['perm_001', 'perm_006'],
        phone: '+91 76543 21098',
        twoFactorEnabled: false,
        loginAttempts: 1,
        sessionCount: 1
      },
      {
        id: 'user_004',
        name: 'Sunita Patel',
        email: 'sunita.patel@votelink.gov.in',
        role: 'operator',
        status: 'inactive',
        department: 'Technical Support',
        location: 'Chennai',
        lastLogin: new Date(Date.now() - 86400000), // 1 day ago
        createdAt: new Date('2024-03-05'),
        permissions: ['perm_001'],
        phone: '+91 65432 10987',
        twoFactorEnabled: false,
        loginAttempts: 0,
        sessionCount: 0
      },
      {
        id: 'user_005',
        name: 'Vikram Mehta',
        email: 'vikram.mehta@contractor.com',
        role: 'viewer',
        status: 'suspended',
        department: 'External Contractor',
        location: 'Pune',
        lastLogin: new Date(Date.now() - 259200000), // 3 days ago
        createdAt: new Date('2024-02-28'),
        permissions: ['perm_001'],
        twoFactorEnabled: false,
        loginAttempts: 5,
        sessionCount: 0
      },
      {
        id: 'user_006',
        name: 'Anita Desai',
        email: 'anita.desai@votelink.gov.in',
        role: 'moderator',
        status: 'pending',
        department: 'Regional Office - Kolkata',
        location: 'Kolkata',
        lastLogin: new Date(0), // Never logged in
        createdAt: new Date(Date.now() - 86400000), // Created yesterday
        permissions: [],
        phone: '+91 54321 09876',
        twoFactorEnabled: false,
        loginAttempts: 0,
        sessionCount: 0
      }
    ];

    setUsers(mockUsers);
    setRoles(mockRoles);
    setPermissions(mockPermissions);
  }, []);

  const getRoleColor = (role: string) => {
    const roleData = roles.find(r => r.name.toLowerCase() === role);
    switch (roleData?.color || 'gray') {
      case 'red': return 'bg-red-100 text-red-800 border-red-300';
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'green': return 'bg-green-100 text-green-800 border-green-300';
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'gray': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive': return <Clock className="w-4 h-4 text-gray-600" />;
      case 'suspended': return <Ban className="w-4 h-4 text-red-600" />;
      case 'pending': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleUserAction = (action: 'activate' | 'deactivate' | 'suspend' | 'delete', userId: string) => {
    setUsers(prev => {
      if (action === 'delete') {
        return prev.filter(user => user.id !== userId);
      }
      return prev.map(user =>
        user.id === userId
          ? {
              ...user,
              status: action === 'activate' ? 'active' : action === 'deactivate' ? 'inactive' : 'suspended'
            }
          : user
      );
    });
    alert(`User has been ${action === 'delete' ? 'deleted' : action}d successfully.`);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">User Management</h1>
        <p className="text-black/70">Manage user accounts, roles, and permissions</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20">
        <div className="flex border-b border-black/10">
          <button
            onClick={() => setCurrentView('users')}
            className={`px-6 py-4 font-medium transition-colors ${
              currentView === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-black hover:text-blue-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Users ({users.length})</span>
            </div>
          </button>
          <button
            onClick={() => setCurrentView('roles')}
            className={`px-6 py-4 font-medium transition-colors ${
              currentView === 'roles'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-black hover:text-blue-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Roles ({roles.length})</span>
            </div>
          </button>
          <button
            onClick={() => setCurrentView('permissions')}
            className={`px-6 py-4 font-medium transition-colors ${
              currentView === 'permissions'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-black hover:text-blue-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5" />
              <span>Permissions ({permissions.length})</span>
            </div>
          </button>
        </div>

        {currentView === 'users' && (
          <div className="p-6">
            {/* Users Controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/50 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-black/10 border border-black/20 rounded-lg text-black placeholder-black/50 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as 'all' | 'admin' | 'moderator' | 'auditor' | 'operator' | 'viewer')}
                  className="px-3 py-2 bg-black/10 border border-black/20 rounded-lg text-black focus:outline-none focus:border-blue-400"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="auditor">Auditor</option>
                  <option value="operator">Operator</option>
                  <option value="viewer">Viewer</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive' | 'suspended' | 'pending')}
                  className="px-3 py-2 bg-black/10 border border-black/20 rounded-lg text-black focus:outline-none focus:border-blue-400"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-600 rounded-lg transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Import</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/10">
                    <th className="text-left py-3 px-4 font-medium text-black">User</th>
                    <th className="text-left py-3 px-4 font-medium text-black">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-black">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-black">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-black">Last Login</th>
                    <th className="text-left py-3 px-4 font-medium text-black">Security</th>
                    <th className="text-right py-3 px-4 font-medium text-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-black/5 hover:bg-black/5 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-black">{user.name}</p>
                          <p className="text-sm text-black/70">{user.email}</p>
                          {user.phone && (
                            <p className="text-sm text-black/60">{user.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(user.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm text-black">{user.department}</p>
                          <p className="text-xs text-black/70 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {user.location}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          {user.lastLogin.getTime() === 0 ? (
                            <span className="text-black/50">Never</span>
                          ) : (
                            <>
                              <p className="text-black">{user.lastLogin.toLocaleDateString()}</p>
                              <p className="text-black/70">{user.lastLogin.toLocaleTimeString()}</p>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {user.twoFactorEnabled ? (
                            <Shield className="w-4 h-4 text-green-600" title="2FA Enabled" />
                          ) : (
                            <Shield className="w-4 h-4 text-red-600" title="2FA Disabled" />
                          )}
                          {user.loginAttempts > 0 && (
                            <AlertTriangle className="w-4 h-4 text-yellow-600" title={`${user.loginAttempts} failed attempts`} />
                          )}
                          {user.sessionCount > 1 && (
                            <Activity className="w-4 h-4 text-blue-600" title={`${user.sessionCount} active sessions`} />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => alert('Edit user functionality will be implemented')}
                            className="p-1 hover:bg-black/10 rounded text-blue-600"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleUserAction('suspend', user.id)}
                              className="p-1 hover:bg-black/10 rounded text-yellow-600"
                              title="Suspend User"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction('activate', user.id)}
                              className="p-1 hover:bg-black/10 rounded text-green-600"
                              title="Activate User"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleUserAction('delete', user.id)}
                            className="p-1 hover:bg-black/10 rounded text-red-600"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'roles' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-black">System Roles</h3>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                <span>Add Role</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <div key={role.id} className="bg-black/5 rounded-lg p-6 border border-black/10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-black">{role.name}</h4>
                      <p className="text-sm text-black/70 mt-1">{role.description}</p>
                    </div>
                    {role.isDefault && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-black/70">Users:</span>
                      <span className="text-black font-medium">{role.userCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-black/70">Permissions:</span>
                      <span className="text-black font-medium">{role.permissions.length}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 py-2 px-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 rounded text-sm transition-colors">
                      Edit
                    </button>
                    {!role.isDefault && (
                      <button className="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-600 rounded text-sm transition-colors">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'permissions' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-black">System Permissions</h3>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                <span>Add Permission</span>
              </button>
            </div>
            <div className="space-y-4">
              {Object.entries(
                permissions.reduce((acc, perm) => {
                  if (!acc[perm.category]) acc[perm.category] = [];
                  acc[perm.category].push(perm);
                  return acc;
                }, {} as Record<string, Permission[]>)
              ).map(([category, perms]) => (
                <div key={category} className="bg-black/5 rounded-lg p-4 border border-black/10">
                  <h4 className="font-medium text-black capitalize mb-3">{category} Permissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {perms.map((permission) => (
                      <div key={permission.id} className="bg-black/5 rounded p-3 border border-black/5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium text-black text-sm">{permission.name}</h5>
                            <p className="text-xs text-black/70 mt-1">{permission.description}</p>
                            <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                              permission.level === 'admin' ? 'bg-red-100 text-red-800' :
                              permission.level === 'write' ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {permission.level}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};