import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Shield, 
  Lock, 
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Server,
  Globe,
  Zap,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Key,
  Clock,
  Users,
  FileText,
  BarChart3,
  TrendingUp,
  Cpu,
  HardDrive,
  Wifi,
  Monitor
} from 'lucide-react';

interface BlockchainNode {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'syncing' | 'error';
  version: string;
  peers: number;
  blocks: number;
  lastSync: Date;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
}

interface BlockchainTransaction {
  id: string;
  hash: string;
  type: 'vote' | 'election_create' | 'election_update' | 'user_auth' | 'system_config';
  timestamp: Date;
  fromAddress: string;
  toAddress: string;
  gasUsed: number;
  gasPrice: number;
  status: 'confirmed' | 'pending' | 'failed';
  blockNumber: number;
  confirmations: number;
}

interface SecurityAlert {
  id: string;
  type: 'consensus_failure' | 'node_down' | 'suspicious_activity' | 'validation_error' | 'network_attack';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  affectedNodes: string[];
  resolved: boolean;
  actionRequired: boolean;
}

export const BlockchainMonitor: React.FC = () => {
  const [nodes, setNodes] = useState<BlockchainNode[]>([]);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [networkStats, setNetworkStats] = useState({
    totalNodes: 0,
    activeNodes: 0,
    consensusHealth: 0,
    averageLatency: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
    blocksPerSecond: 0,
    networkHashRate: 0
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);

  useEffect(() => {
    // Mock blockchain nodes
    const mockNodes: BlockchainNode[] = [
      {
        id: 'node_001',
        name: 'Primary Node - Delhi',
        location: 'Delhi, India',
        status: 'online',
        version: '2.4.1',
        peers: 12,
        blocks: 1847293,
        lastSync: new Date(Date.now() - 30000),
        cpuUsage: 23,
        memoryUsage: 67,
        diskUsage: 34,
        networkLatency: 45
      },
      {
        id: 'node_002',
        name: 'Backup Node - Mumbai',
        location: 'Mumbai, India',
        status: 'online',
        version: '2.4.1',
        peers: 11,
        blocks: 1847293,
        lastSync: new Date(Date.now() - 15000),
        cpuUsage: 18,
        memoryUsage: 52,
        diskUsage: 28,
        networkLatency: 67
      },
      {
        id: 'node_003',
        name: 'Validator Node - Bangalore',
        location: 'Bangalore, India',
        status: 'syncing',
        version: '2.4.0',
        peers: 8,
        blocks: 1847290,
        lastSync: new Date(Date.now() - 120000),
        cpuUsage: 89,
        memoryUsage: 91,
        diskUsage: 45,
        networkLatency: 234
      },
      {
        id: 'node_004',
        name: 'Archive Node - Chennai',
        location: 'Chennai, India',
        status: 'online',
        version: '2.4.1',
        peers: 15,
        blocks: 1847293,
        lastSync: new Date(Date.now() - 45000),
        cpuUsage: 12,
        memoryUsage: 34,
        diskUsage: 78,
        networkLatency: 89
      },
      {
        id: 'node_005',
        name: 'Monitoring Node - Kolkata',
        location: 'Kolkata, India',
        status: 'error',
        version: '2.3.9',
        peers: 0,
        blocks: 1847285,
        lastSync: new Date(Date.now() - 900000),
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkLatency: 0
      }
    ];

    // Mock transactions
    const mockTransactions: BlockchainTransaction[] = [
      {
        id: 'tx_001',
        hash: '0x8f9e2b1a3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
        type: 'vote',
        timestamp: new Date(Date.now() - 60000),
        fromAddress: '0x1234...5678',
        toAddress: '0xabcd...efgh',
        gasUsed: 21000,
        gasPrice: 20,
        status: 'confirmed',
        blockNumber: 1847293,
        confirmations: 12
      },
      {
        id: 'tx_002',
        hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        type: 'election_create',
        timestamp: new Date(Date.now() - 180000),
        fromAddress: '0x5678...9abc',
        toAddress: '0xdef0...1234',
        gasUsed: 85000,
        gasPrice: 25,
        status: 'confirmed',
        blockNumber: 1847291,
        confirmations: 24
      },
      {
        id: 'tx_003',
        hash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
        type: 'vote',
        timestamp: new Date(Date.now() - 30000),
        fromAddress: '0x9abc...def0',
        toAddress: '0x1234...5678',
        gasUsed: 21000,
        gasPrice: 22,
        status: 'pending',
        blockNumber: 0,
        confirmations: 0
      }
    ];

    // Mock security alerts
    const mockAlerts: SecurityAlert[] = [
      {
        id: 'alert_001',
        type: 'node_down',
        severity: 'high',
        message: 'Monitoring Node - Kolkata has been offline for 15 minutes',
        timestamp: new Date(Date.now() - 900000),
        affectedNodes: ['node_005'],
        resolved: false,
        actionRequired: true
      },
      {
        id: 'alert_002',
        type: 'suspicious_activity',
        severity: 'medium',
        message: 'Unusual voting pattern detected from IP range 192.168.1.0/24',
        timestamp: new Date(Date.now() - 300000),
        affectedNodes: [],
        resolved: false,
        actionRequired: true
      },
      {
        id: 'alert_003',
        type: 'consensus_failure',
        severity: 'critical',
        message: 'Consensus temporarily lost between nodes, recovered in 23 seconds',
        timestamp: new Date(Date.now() - 1800000),
        affectedNodes: ['node_001', 'node_002', 'node_003'],
        resolved: true,
        actionRequired: false
      }
    ];

    setNodes(mockNodes);
    setTransactions(mockTransactions);
    setAlerts(mockAlerts);

    // Calculate network stats
    const activeNodeCount = mockNodes.filter(n => n.status === 'online').length;
    const avgLatency = mockNodes.reduce((sum, n) => sum + n.networkLatency, 0) / mockNodes.length;
    
    setNetworkStats({
      totalNodes: mockNodes.length,
      activeNodes: activeNodeCount,
      consensusHealth: (activeNodeCount / mockNodes.length) * 100,
      averageLatency: Math.round(avgLatency),
      totalTransactions: 2847592,
      pendingTransactions: mockTransactions.filter(t => t.status === 'pending').length,
      blocksPerSecond: 0.33,
      networkHashRate: 12.7
    });

    // Auto-refresh simulation
    const interval = setInterval(() => {
      if (autoRefresh) {
        // Simulate live data updates
        setNetworkStats(prev => ({
          ...prev,
          totalTransactions: prev.totalTransactions + Math.floor(Math.random() * 5),
          pendingTransactions: Math.floor(Math.random() * 10),
          averageLatency: prev.averageLatency + Math.floor(Math.random() * 10) - 5
        }));
      }
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 border-green-300';
      case 'syncing': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'offline': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'error': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getNodeStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'syncing': return <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />;
      case 'offline': return <XCircle className="w-4 h-4 text-gray-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'failed': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Blockchain Network Monitor</h1>
          <p className="text-black/70">Real-time blockchain network status and transaction monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-black/30 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-black">Auto Refresh</span>
          </label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-2 bg-black/10 border border-black/20 rounded-lg text-black text-sm focus:outline-none focus:border-blue-400"
            disabled={!autoRefresh}
          >
            <option value={1}>1s</option>
            <option value={5}>5s</option>
            <option value={10}>10s</option>
            <option value={30}>30s</option>
          </select>
        </div>
      </div>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/70">Total Nodes</p>
              <p className="text-2xl font-bold text-blue-600">{networkStats.totalNodes}</p>
            </div>
            <Server className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/70">Active Nodes</p>
              <p className="text-2xl font-bold text-green-600">{networkStats.activeNodes}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/70">Consensus Health</p>
              <p className="text-2xl font-bold text-purple-600">{networkStats.consensusHealth.toFixed(1)}%</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/70">Avg Latency</p>
              <p className="text-2xl font-bold text-orange-600">{networkStats.averageLatency}ms</p>
            </div>
            <Wifi className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/70">Total Transactions</p>
              <p className="text-2xl font-bold text-indigo-600">{networkStats.totalTransactions.toLocaleString()}</p>
            </div>
            <Database className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/70">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{networkStats.pendingTransactions}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/70">Blocks/sec</p>
              <p className="text-2xl font-bold text-teal-600">{networkStats.blocksPerSecond}</p>
            </div>
            <Zap className="w-8 h-8 text-teal-600" />
          </div>
        </div>

        <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/70">Hash Rate</p>
              <p className="text-2xl font-bold text-pink-600">{networkStats.networkHashRate} TH/s</p>
            </div>
            <Cpu className="w-8 h-8 text-pink-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Node Status */}
        <div className="xl:col-span-2 bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20">
          <div className="p-6 border-b border-black/10">
            <h2 className="text-lg font-semibold text-black">Node Status</h2>
          </div>
          <div className="p-6 space-y-4">
            {nodes.map((node) => (
              <div key={node.id} className="bg-black/5 rounded-lg p-4 border border-black/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getNodeStatusIcon(node.status)}
                      <h3 className="font-medium text-black">{node.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getNodeStatusColor(node.status)}`}>
                        {node.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-black/70">Version:</span>
                        <p className="text-black font-medium">v{node.version}</p>
                      </div>
                      <div>
                        <span className="text-black/70">Peers:</span>
                        <p className="text-black font-medium">{node.peers}</p>
                      </div>
                      <div>
                        <span className="text-black/70">Blocks:</span>
                        <p className="text-black font-medium">{node.blocks.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-black/70">Latency:</span>
                        <p className="text-black font-medium">{node.networkLatency}ms</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-4">
                      <div className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-black/70">CPU</span>
                          <span className="text-black">{node.cpuUsage}%</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${node.cpuUsage > 80 ? 'bg-red-500' : node.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${node.cpuUsage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-black/70">Memory</span>
                          <span className="text-black">{node.memoryUsage}%</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${node.memoryUsage > 80 ? 'bg-red-500' : node.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${node.memoryUsage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-black/70">Disk</span>
                          <span className="text-black">{node.diskUsage}%</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${node.diskUsage > 80 ? 'bg-red-500' : node.diskUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${node.diskUsage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Alerts */}
        <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20">
          <div className="p-6 border-b border-black/10">
            <h2 className="text-lg font-semibold text-black">Security Alerts</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 border-b border-black/10 ${!alert.resolved ? 'bg-red-50/50' : 'bg-green-50/50'}`}>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className={`w-5 h-5 mt-1 ${
                    alert.severity === 'critical' ? 'text-red-600' :
                    alert.severity === 'high' ? 'text-orange-600' :
                    alert.severity === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAlertColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-black/70">
                        {alert.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-black mb-2">{alert.message}</p>
                    {alert.actionRequired && !alert.resolved && (
                      <button className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 px-2 py-1 rounded">
                        Take Action
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-black/10 backdrop-blur-lg rounded-xl shadow-lg border border-black/20">
        <div className="p-6 border-b border-black/10">
          <h2 className="text-lg font-semibold text-black">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/10">
                <th className="text-left py-3 px-6 font-medium text-black">Hash</th>
                <th className="text-left py-3 px-6 font-medium text-black">Type</th>
                <th className="text-left py-3 px-6 font-medium text-black">Status</th>
                <th className="text-left py-3 px-6 font-medium text-black">Block</th>
                <th className="text-left py-3 px-6 font-medium text-black">Gas</th>
                <th className="text-left py-3 px-6 font-medium text-black">Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-black/5 hover:bg-black/5 transition-colors">
                  <td className="py-3 px-6">
                    <div className="font-mono text-sm text-black">
                      {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 8)}
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTransactionStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm text-black">
                    {tx.blockNumber > 0 ? tx.blockNumber.toLocaleString() : '-'}
                  </td>
                  <td className="py-3 px-6 text-sm text-black">
                    {tx.gasUsed.toLocaleString()}
                  </td>
                  <td className="py-3 px-6 text-sm text-black/70">
                    {tx.timestamp.toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};