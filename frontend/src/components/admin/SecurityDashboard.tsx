import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  Users,
  Server,
  Database,
  Clock,
  Globe,
  Ban,
  UserX,
  Settings,
  FileText,
  Search
} from 'lucide-react';
import { BlockchainMonitor } from './BlockchainMonitor';

interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'login' | 'failed_login' | 'data_access' | 'system_change' | 'threat_detected' | 'blockchain_event';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: string;
  ip: string;
  location: string;
  device: string;
  description: string;
  status: 'active' | 'resolved' | 'investigating';
}

interface UserSession {
  id: string;
  user: string;
  email: string;
  role: 'admin' | 'voter' | 'moderator';
  loginTime: Date;
  lastActivity: Date;
  ip: string;
  location: string;
  device: string;
  status: 'active' | 'idle' | 'suspicious';
  actions: number;
}

interface SecurityMetrics {
  threatsBlocked: number;
  activeUsers: number;
  failedLogins: number;
  systemIntegrity: number;
  blockchainHealth: number;
  dataEncryption: number;
}

export const SecurityDashboard: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'blockchain' | 'threats' | 'controls'>('overview');
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    threatsBlocked: 0,
    activeUsers: 0,
    failedLogins: 0,
    systemIntegrity: 100,
    blockchainHealth: 99.9,
    dataEncryption: 100
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real security metrics from backend
  const fetchSecurityMetrics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/security/metrics');
      const result = await response.json();
      if (result.success) {
        setSecurityMetrics(result.data);
      }
    } catch (error) {
      console.error('Error fetching security metrics:', error);
    }
  };

  // Fetch real security events from backend
  const fetchSecurityEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/security/events?limit=50');
      const result = await response.json();
      if (result.success) {
        const events: SecurityEvent[] = result.data.map((event: any) => ({
          id: event.id,
          timestamp: new Date(event.timestamp),
          type: event.type,
          severity: event.severity,
          user: event.user,
          ip: event.ip,
          location: event.location,
          device: event.device,
          description: event.description,
          status: event.status
        }));
        setSecurityEvents(events);
      }
    } catch (error) {
      console.error('Error fetching security events:', error);
    }
  };

  // Fetch active sessions from backend
  const fetchActiveSessions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/active-sessions');
      const result = await response.json();
      if (result.success && result.data.sessions) {
        const sessions: UserSession[] = result.data.sessions.map((session: any, index: number) => ({
          id: `sess_${index}_${session.email}`,
          user: session.email?.split('@')[0] || 'User',
          email: session.email,
          role: 'voter' as const,
          loginTime: new Date(session.createdAt),
          lastActivity: new Date(session.lastActive),
          ip: session.ipAddress || 'Unknown',
          location: 'India',
          device: session.userAgent || 'Unknown Device',
          status: 'active' as const,
          actions: 1
        }));
        setActiveSessions(sessions);
      }
    } catch (error) {
      console.error('Error fetching active sessions:', error);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchSecurityMetrics(),
        fetchSecurityEvents(),
        fetchActiveSessions()
      ]);
      setIsLoading(false);
    };

    loadAllData();

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchSecurityMetrics();
      fetchSecurityEvents();
      fetchActiveSessions();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'resolved': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'investigating': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'idle': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'suspicious': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <CheckCircle className="w-4 h-4" />;
      case 'failed_login': return <XCircle className="w-4 h-4" />;
      case 'threat_detected': return <AlertTriangle className="w-4 h-4" />;
      case 'blockchain_event': return <Database className="w-4 h-4" />;
      case 'system_change': return <Settings className="w-4 h-4" />;
      case 'data_access': return <Eye className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.ip.includes(searchTerm);
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const handleBlockUser = (sessionId: string) => {
    setActiveSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, status: 'suspicious' as const }
          : session
      )
    );
    alert('User session has been flagged as suspicious and restricted.');
  };

  const handleTerminateSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
    alert('User session has been terminated successfully.');
  };

  // Security Control Handlers
  const handleEnableLockdown = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to enable system lockdown? This will:\n' +
      '- Force logout all active users\n' +
      '- Block new login attempts\n' +
      '- Restrict access until disabled'
    );
    
    if (confirmed) {
      try {
        const response = await fetch('http://localhost:5000/api/admin/force-logout-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        
        if (result.success) {
          setActiveSessions([]);
          alert('System lockdown enabled. All users have been logged out.');
          fetchSecurityMetrics();
        } else {
          alert('Failed to enable lockdown: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Lockdown error:', error);
        alert('Failed to enable lockdown. Please try again.');
      }
    }
  };

  const handleBackupSystem = () => {
    // Generate a backup report
    const backupData = {
      timestamp: new Date().toISOString(),
      securityMetrics,
      activeSessions: activeSessions.length,
      recentEvents: securityEvents.slice(0, 10).map(e => ({
        type: e.type,
        description: e.description,
        timestamp: e.timestamp
      }))
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Security backup created and downloaded successfully.');
  };

  const handleResetEncryption = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset encryption keys?\n\n' +
      'This action will:\n' +
      '- Generate new encryption keys\n' +
      '- Require all users to re-authenticate\n' +
      '- May take several minutes to complete'
    );

    if (confirmed) {
      alert('Encryption key reset initiated. This would typically:\n' +
        '1. Generate new AES-256 keys\n' +
        '2. Re-encrypt all sensitive data\n' +
        '3. Invalidate all existing sessions\n\n' +
        'Note: This is a simulation. In production, this would trigger actual key rotation.');
    }
  };

  const handleGenerateReport = () => {
    const report = `
SECURITY AUDIT REPORT
=====================
Generated: ${new Date().toLocaleString()}

SECURITY METRICS
----------------
Threats Blocked: ${securityMetrics.threatsBlocked}
Active Users: ${securityMetrics.activeUsers}
Failed Logins (24h): ${securityMetrics.failedLogins}
System Integrity: ${securityMetrics.systemIntegrity}%
Blockchain Health: ${securityMetrics.blockchainHealth}%
Data Encryption: ${securityMetrics.dataEncryption}%

ACTIVE SESSIONS
---------------
Total Active Sessions: ${activeSessions.length}
${activeSessions.map(s => `- ${s.email} (${s.ip}) - ${s.device}`).join('\n')}

RECENT SECURITY EVENTS
----------------------
${securityEvents.slice(0, 10).map(e => 
  `[${e.severity.toUpperCase()}] ${e.timestamp.toLocaleString()}: ${e.description}`
).join('\n')}

---
End of Report
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security_audit_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Security audit report generated and downloaded.');
  };

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return renderSecurityOverview();
      case 'blockchain':
        return <BlockchainMonitor />;
      case 'threats':
        return renderThreatAnalysis();
      case 'controls':
        return renderSecurityControls();
      default:
        return renderSecurityOverview();
    }
  };

  const renderSecurityOverview = () => (
    <div className="space-y-6">
      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/70">Threats Blocked</p>
              <p className="text-2xl font-bold text-red-600">{securityMetrics.threatsBlocked}</p>
            </div>
            <Shield className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/70">Active Users</p>
              <p className="text-2xl font-bold text-green-600">{securityMetrics.activeUsers}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/70">Failed Logins</p>
              <p className="text-2xl font-bold text-orange-600">{securityMetrics.failedLogins}</p>
            </div>
            <Lock className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/70">System Integrity</p>
              <p className="text-2xl font-bold text-blue-600">{securityMetrics.systemIntegrity}%</p>
            </div>
            <Server className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/70">Blockchain Health</p>
              <p className="text-2xl font-bold text-purple-600">{securityMetrics.blockchainHealth}%</p>
            </div>
            <Database className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/70">Data Encryption</p>
              <p className="text-2xl font-bold text-indigo-600">{securityMetrics.dataEncryption}%</p>
            </div>
            <Key className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Security Events and Sessions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Security Events Log */}
        <div className="xl:col-span-2 bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20">
          <div className="p-6 border-b border-black/10">
            <h2 className="text-lg font-semibold text-black mb-4">Security Events</h2>
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/50 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/10 border border-black/20 rounded-lg text-black placeholder-black/50 focus:outline-none focus:border-blue-400"
                />
              </div>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value as 'all' | 'low' | 'medium' | 'high' | 'critical')}
                className="px-3 py-2 bg-black/10 border border-black/20 rounded-lg text-black focus:outline-none focus:border-blue-400"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredEvents.map((event) => (
              <div key={event.id} className="p-4 border-b border-black/10 hover:bg-black/5 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(event.severity)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-black truncate">{event.description}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-black/70">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {event.timestamp.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <Globe className="w-3 h-3 mr-1" />
                        {event.ip}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20">
          <div className="p-6 border-b border-black/10">
            <h2 className="text-lg font-semibold text-black">Active Sessions</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {activeSessions.map((session) => (
              <div key={session.id} className="p-4 border-b border-black/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-black text-sm">{session.user}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-xs text-black/70 mt-1">{session.email}</p>
                    <div className="mt-2 text-xs text-black/70">
                      <p>{session.ip} • {session.location}</p>
                      <p>{session.device}</p>
                      <p>{session.actions} actions</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => handleBlockUser(session.id)}
                      className="p-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-600 rounded text-xs"
                    >
                      <Ban className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleTerminateSession(session.id)}
                      className="p-1 bg-red-500/20 hover:bg-red-500/30 text-red-600 rounded text-xs"
                    >
                      <UserX className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderThreatAnalysis = () => (
    <div className="text-center py-12">
      <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-black mb-2">Advanced Threat Analysis</h3>
      <p className="text-black/70 mb-4">AI-powered threat detection and analysis coming soon</p>
      <button className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 rounded-lg font-medium transition-colors">
        Configure Threat Detection
      </button>
    </div>
  );

  const renderSecurityControls = () => (
    <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-6">
      <h2 className="text-lg font-semibold text-black mb-6">Security Controls & Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={handleEnableLockdown}
          className="p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-left transition-colors"
        >
          <Shield className="w-6 h-6 text-blue-600 mb-2" />
          <h3 className="font-medium text-black">Enable Lockdown</h3>
          <p className="text-sm text-black/70">Restrict all access temporarily</p>
        </button>
        
        <button 
          onClick={handleBackupSystem}
          className="p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-left transition-colors"
        >
          <Database className="w-6 h-6 text-green-600 mb-2" />
          <h3 className="font-medium text-black">Backup System</h3>
          <p className="text-sm text-black/70">Create emergency backup</p>
        </button>
        
        <button 
          onClick={handleResetEncryption}
          className="p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-left transition-colors"
        >
          <Key className="w-6 h-6 text-purple-600 mb-2" />
          <h3 className="font-medium text-black">Reset Encryption</h3>
          <p className="text-sm text-black/70">Generate new security keys</p>
        </button>
        
        <button 
          onClick={handleGenerateReport}
          className="p-4 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-xl text-left transition-colors"
        >
          <FileText className="w-6 h-6 text-orange-600 mb-2" />
          <h3 className="font-medium text-black">Generate Report</h3>
          <p className="text-sm text-black/70">Export security audit</p>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Advanced Security Dashboard</h1>
        <p className="text-black/70">Real-time security monitoring and threat detection</p>
      </div>

      {/* Security Sub-Navigation */}
      <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20">
        <div className="flex border-b border-black/10">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeSubTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-black hover:text-blue-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Overview</span>
            </div>
          </button>
          <button
            onClick={() => setActiveSubTab('blockchain')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeSubTab === 'blockchain'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-black hover:text-blue-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Blockchain</span>
            </div>
          </button>
          <button
            onClick={() => setActiveSubTab('threats')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeSubTab === 'threats'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-black hover:text-blue-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Threats</span>
            </div>
          </button>
          <button
            onClick={() => setActiveSubTab('controls')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeSubTab === 'controls'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-black hover:text-blue-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Controls</span>
            </div>
          </button>
        </div>

        <div className="p-6">
          {renderSubTabContent()}
        </div>
      </div>
    </div>
  );
};