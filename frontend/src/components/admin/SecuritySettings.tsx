import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  EyeOff,
  AlertTriangle, 
  CheckCircle, 
  Settings,
  Users,
  Database,
  Server,
  Globe,
  Smartphone,
  Wifi,
  Fingerprint,
  UserCheck,
  Clock,
  MapPin,
  Activity,
  Zap,
  FileText,
  Download,
  RefreshCw,
  RotateCcw,
  Power,
  HardDrive
} from 'lucide-react';

interface SecuritySetting {
  id: string;
  category: 'authentication' | 'encryption' | 'monitoring' | 'access' | 'blockchain';
  name: string;
  description: string;
  enabled: boolean;
  level: 'basic' | 'advanced' | 'enterprise';
  lastModified: Date;
  modifiedBy: string;
}

interface SystemHealth {
  component: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  uptime: string;
  lastCheck: Date;
  responseTime: number;
  load: number;
}

export const SecuritySettings: React.FC = () => {
  const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'authentication' | 'encryption' | 'monitoring' | 'access' | 'blockchain'>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    // Mock security settings
    const mockSettings: SecuritySetting[] = [
      // Authentication Settings
      {
        id: 'auth_001',
        category: 'authentication',
        name: 'Two-Factor Authentication',
        description: 'Require 2FA for all admin accounts',
        enabled: true,
        level: 'advanced',
        lastModified: new Date(Date.now() - 3600000),
        modifiedBy: 'admin@votelink.gov'
      },
      {
        id: 'auth_002',
        category: 'authentication',
        name: 'Biometric Verification',
        description: 'Enable fingerprint and facial recognition for voter authentication',
        enabled: true,
        level: 'enterprise',
        lastModified: new Date(Date.now() - 7200000),
        modifiedBy: 'security@votelink.gov'
      },
      {
        id: 'auth_003',
        category: 'authentication',
        name: 'Session Timeout',
        description: 'Automatic logout after 30 minutes of inactivity',
        enabled: true,
        level: 'basic',
        lastModified: new Date(Date.now() - 86400000),
        modifiedBy: 'admin@votelink.gov'
      },
      {
        id: 'auth_004',
        category: 'authentication',
        name: 'IP Whitelist',
        description: 'Restrict admin access to predefined IP addresses',
        enabled: false,
        level: 'advanced',
        lastModified: new Date(Date.now() - 172800000),
        modifiedBy: 'security@votelink.gov'
      },

      // Encryption Settings
      {
        id: 'enc_001',
        category: 'encryption',
        name: 'End-to-End Encryption',
        description: 'AES-256 encryption for all data transmission',
        enabled: true,
        level: 'enterprise',
        lastModified: new Date(Date.now() - 3600000),
        modifiedBy: 'security@votelink.gov'
      },
      {
        id: 'enc_002',
        category: 'encryption',
        name: 'Database Encryption',
        description: 'Encrypt voter data and election results at rest',
        enabled: true,
        level: 'enterprise',
        lastModified: new Date(Date.now() - 7200000),
        modifiedBy: 'security@votelink.gov'
      },
      {
        id: 'enc_003',
        category: 'encryption',
        name: 'Key Rotation',
        description: 'Automatic encryption key rotation every 90 days',
        enabled: true,
        level: 'advanced',
        lastModified: new Date(Date.now() - 14400000),
        modifiedBy: 'security@votelink.gov'
      },

      // Monitoring Settings
      {
        id: 'mon_001',
        category: 'monitoring',
        name: 'Real-time Threat Detection',
        description: 'AI-powered anomaly detection and threat monitoring',
        enabled: true,
        level: 'enterprise',
        lastModified: new Date(Date.now() - 1800000),
        modifiedBy: 'security@votelink.gov'
      },
      {
        id: 'mon_002',
        category: 'monitoring',
        name: 'Login Attempt Monitoring',
        description: 'Track and alert on suspicious login patterns',
        enabled: true,
        level: 'basic',
        lastModified: new Date(Date.now() - 3600000),
        modifiedBy: 'admin@votelink.gov'
      },
      {
        id: 'mon_003',
        category: 'monitoring',
        name: 'System Performance Monitoring',
        description: 'Monitor server performance and resource usage',
        enabled: true,
        level: 'advanced',
        lastModified: new Date(Date.now() - 7200000),
        modifiedBy: 'admin@votelink.gov'
      },

      // Access Control Settings
      {
        id: 'acc_001',
        category: 'access',
        name: 'Role-Based Access Control',
        description: 'Granular permissions based on user roles',
        enabled: true,
        level: 'advanced',
        lastModified: new Date(Date.now() - 3600000),
        modifiedBy: 'admin@votelink.gov'
      },
      {
        id: 'acc_002',
        category: 'access',
        name: 'Audit Trail Logging',
        description: 'Comprehensive logging of all system activities',
        enabled: true,
        level: 'enterprise',
        lastModified: new Date(Date.now() - 7200000),
        modifiedBy: 'security@votelink.gov'
      },

      // Blockchain Settings
      {
        id: 'bc_001',
        category: 'blockchain',
        name: 'Multi-Node Validation',
        description: 'Require consensus from multiple blockchain nodes',
        enabled: true,
        level: 'enterprise',
        lastModified: new Date(Date.now() - 1800000),
        modifiedBy: 'blockchain@votelink.gov'
      },
      {
        id: 'bc_002',
        category: 'blockchain',
        name: 'Smart Contract Auditing',
        description: 'Automated security auditing of smart contracts',
        enabled: true,
        level: 'advanced',
        lastModified: new Date(Date.now() - 14400000),
        modifiedBy: 'blockchain@votelink.gov'
      }
    ];

    const mockSystemHealth: SystemHealth[] = [
      {
        component: 'Web Server',
        status: 'healthy',
        uptime: '99.98%',
        lastCheck: new Date(Date.now() - 60000),
        responseTime: 45,
        load: 23
      },
      {
        component: 'Database Server',
        status: 'healthy',
        uptime: '99.99%',
        lastCheck: new Date(Date.now() - 30000),
        responseTime: 12,
        load: 34
      },
      {
        component: 'Authentication Service',
        status: 'warning',
        uptime: '99.95%',
        lastCheck: new Date(Date.now() - 45000),
        responseTime: 89,
        load: 67
      },
      {
        component: 'Blockchain Network',
        status: 'healthy',
        uptime: '99.97%',
        lastCheck: new Date(Date.now() - 90000),
        responseTime: 156,
        load: 45
      },
      {
        component: 'File Storage',
        status: 'healthy',
        uptime: '99.99%',
        lastCheck: new Date(Date.now() - 120000),
        responseTime: 23,
        load: 12
      },
      {
        component: 'Backup System',
        status: 'critical',
        uptime: '87.34%',
        lastCheck: new Date(Date.now() - 300000),
        responseTime: 0,
        load: 0
      }
    ];

    setSecuritySettings(mockSettings);
    setSystemHealth(mockSystemHealth);
  }, []);

  const handleToggleSetting = (settingId: string) => {
    setSecuritySettings(prev =>
      prev.map(setting =>
        setting.id === settingId
          ? { 
              ...setting, 
              enabled: !setting.enabled,
              lastModified: new Date(),
              modifiedBy: 'admin@votelink.gov'
            }
          : setting
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return <UserCheck className="w-5 h-5" />;
      case 'encryption': return <Key className="w-5 h-5" />;
      case 'monitoring': return <Eye className="w-5 h-5" />;
      case 'access': return <Lock className="w-5 h-5" />;
      case 'blockchain': return <Database className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'bg-green-100 text-green-800 border-green-300';
      case 'advanced': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'enterprise': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'offline': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'offline': return <Power className="w-4 h-4 text-gray-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredSettings = securitySettings.filter(setting => 
    selectedCategory === 'all' || setting.category === selectedCategory
  ).filter(setting => 
    showAdvanced || setting.level !== 'enterprise'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Security Settings</h1>
        <p className="text-black/70">Configure advanced security parameters and system policies</p>
      </div>



      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Settings Categories */}
        <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Categories</h2>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-blue-500/20 text-blue-600 border border-blue-500/30' 
                  : 'hover:bg-black/5 text-black'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">All Settings</span>
            </button>
            <button
              onClick={() => setSelectedCategory('authentication')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                selectedCategory === 'authentication' 
                  ? 'bg-blue-500/20 text-blue-600 border border-blue-500/30' 
                  : 'hover:bg-black/5 text-black'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span className="font-medium">Authentication</span>
            </button>
            <button
              onClick={() => setSelectedCategory('encryption')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                selectedCategory === 'encryption' 
                  ? 'bg-blue-500/20 text-blue-600 border border-blue-500/30' 
                  : 'hover:bg-black/5 text-black'
              }`}
            >
              <Key className="w-5 h-5" />
              <span className="font-medium">Encryption</span>
            </button>
            <button
              onClick={() => setSelectedCategory('monitoring')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                selectedCategory === 'monitoring' 
                  ? 'bg-blue-500/20 text-blue-600 border border-blue-500/30' 
                  : 'hover:bg-black/5 text-black'
              }`}
            >
              <Eye className="w-5 h-5" />
              <span className="font-medium">Monitoring</span>
            </button>
            <button
              onClick={() => setSelectedCategory('access')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                selectedCategory === 'access' 
                  ? 'bg-blue-500/20 text-blue-600 border border-blue-500/30' 
                  : 'hover:bg-black/5 text-black'
              }`}
            >
              <Lock className="w-5 h-5" />
              <span className="font-medium">Access Control</span>
            </button>
            <button
              onClick={() => setSelectedCategory('blockchain')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                selectedCategory === 'blockchain' 
                  ? 'bg-blue-500/20 text-blue-600 border border-blue-500/30' 
                  : 'hover:bg-black/5 text-black'
              }`}
            >
              <Database className="w-5 h-5" />
              <span className="font-medium">Blockchain</span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-black/10">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={showAdvanced}
                onChange={(e) => setShowAdvanced(e.target.checked)}
                className="rounded border-black/30 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-black">Show Enterprise Features</span>
            </label>
          </div>
        </div>

        {/* Settings List */}
        <div className="xl:col-span-3 bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20">
          <div className="p-6 border-b border-black/10">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-black">Security Configuration</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>Export Config</span>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {filteredSettings.map((setting) => (
              <div key={setting.id} className="bg-black/5 rounded-lg p-4 border border-black/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      {getCategoryIcon(setting.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-black">{setting.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(setting.level)}`}>
                          {setting.level}
                        </span>
                      </div>
                      <p className="text-sm text-black/70 mb-2">{setting.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-black/60">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Modified {setting.lastModified.toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {setting.modifiedBy}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleSetting(setting.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        setting.enabled 
                          ? 'bg-blue-600' 
                          : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Actions */}
      <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Emergency Security Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-left transition-colors">
            <Shield className="w-6 h-6 text-red-600 mb-2" />
            <h3 className="font-medium text-black">Emergency Lockdown</h3>
            <p className="text-sm text-black/70">Immediately lock all system access</p>
          </button>
          
          <button className="p-4 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-xl text-left transition-colors">
            <RotateCcw className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-medium text-black">Reset All Keys</h3>
            <p className="text-sm text-black/70">Generate new encryption keys</p>
          </button>
          
          <button className="p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-left transition-colors">
            <HardDrive className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-black">Force Backup</h3>
            <p className="text-sm text-black/70">Create immediate system backup</p>
          </button>
          
          <button className="p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-left transition-colors">
            <FileText className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-medium text-black">Audit Report</h3>
            <p className="text-sm text-black/70">Generate security audit report</p>
          </button>
        </div>
      </div>
    </div>
  );
};