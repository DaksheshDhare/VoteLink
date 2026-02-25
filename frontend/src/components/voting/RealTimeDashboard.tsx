import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  Clock,
  BarChart3,
  MapPin,
  Wifi,
  RefreshCw
} from 'lucide-react';
import { 
  realTimeMonitoringService, 
  SystemMetrics, 
  RealTimeStats, 
  FraudAlert 
} from '../../services/realTimeMonitoringService';

interface RealTimeDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

export const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({
  isVisible,
  onClose
}) => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [stats, setStats] = useState<RealTimeStats | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (!isVisible) return;

    // Load initial data
    loadInitialData();

    // Set up real-time subscriptions
    const metricsCallback = (data: unknown) => {
      setMetrics(data as SystemMetrics);
      setLastUpdate(new Date());
    };

    const statsCallback = (data: unknown) => {
      setStats(data as RealTimeStats);
    };

    const fraudCallback = (data: unknown) => {
      setFraudAlerts(prev => [data as FraudAlert, ...prev.slice(0, 9)]);
    };

    realTimeMonitoringService.on('metricsUpdate', metricsCallback);
    realTimeMonitoringService.on('statsUpdate', statsCallback);
    realTimeMonitoringService.on('fraudAlert', fraudCallback);

    return () => {
      realTimeMonitoringService.off('metricsUpdate', metricsCallback);
      realTimeMonitoringService.off('statsUpdate', statsCallback);
      realTimeMonitoringService.off('fraudAlert', fraudCallback);
    };
  }, [isVisible]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Load cached data
      const cachedMetrics = realTimeMonitoringService.getSystemMetrics();
      const cachedStats = realTimeMonitoringService.getRealTimeStats();
      
      if (cachedMetrics) setMetrics(cachedMetrics);
      if (cachedStats) setStats(cachedStats);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: FraudAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Real-Time Monitoring Dashboard</h2>
              <p className="text-blue-100">Live election monitoring and fraud detection</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Wifi className="w-4 h-4" />
              <span>Live</span>
            </div>
            <div className="text-sm">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading dashboard...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* System Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Votes"
                  value={formatNumber(metrics?.totalVotesCast || 0)}
                  icon={<BarChart3 className="w-6 h-6 text-green-600" />}
                  trend="+12% from last hour"
                />
                <MetricCard
                  title="Registered Voters"
                  value={formatNumber(metrics?.votersRegistered || 0)}
                  icon={<Users className="w-6 h-6 text-blue-600" />}
                  trend="Active registration"
                />
                <MetricCard
                  title="Online Users"
                  value={formatNumber(metrics?.onlineUsers || 0)}
                  icon={<Activity className="w-6 h-6 text-purple-600" />}
                  trend={`${Math.round((metrics?.onlineUsers || 0) / (metrics?.votersRegistered || 1) * 100)}% online`}
                />
                <MetricCard
                  title="Fraud Alerts"
                  value={formatNumber(metrics?.fraudAlertsActive || 0)}
                  icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
                  trend={metrics?.fraudAlertsActive === 0 ? "All clear" : "Needs attention"}
                  isAlert={(metrics?.fraudAlertsActive || 0) > 0}
                />
              </div>

              {/* Real-time Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Voting Rate */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Voting Rate</h3>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stats?.votesPerMinute || 0} <span className="text-lg font-normal text-gray-600">votes/min</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((stats?.votesPerMinute || 0) / 10 * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Peak capacity: 10 votes/min
                  </p>
                </div>

                {/* System Health */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="space-y-3">
                    <HealthBar 
                      label="System Load" 
                      value={metrics?.systemLoad || 0} 
                      maxValue={100}
                      color="blue"
                    />
                    <HealthBar 
                      label="Response Time" 
                      value={metrics?.avgResponseTime || 0} 
                      maxValue={1000}
                      color="purple"
                      unit="ms"
                    />
                    <HealthBar 
                      label="Error Rate" 
                      value={metrics?.errorRate || 0} 
                      maxValue={10}
                      color={(metrics?.errorRate || 0) > 5 ? "red" : "green"}
                      unit="%"
                    />
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      metrics?.blockchainSyncStatus === 'synced' ? 'bg-green-500' :
                      metrics?.blockchainSyncStatus === 'syncing' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm text-gray-600">
                      Blockchain: {metrics?.blockchainSyncStatus || 'unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Regional Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Regional Breakdown</h3>
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="space-y-3">
                    {stats?.regionalBreakdown.slice(0, 5).map((region, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{region.region}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${region.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {formatNumber(region.voteCount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fraud Alerts */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {fraudAlerts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Shield className="w-12 h-12 mx-auto mb-2 text-green-500" />
                        <p>No fraud alerts - All systems secure</p>
                      </div>
                    ) : (
                      fraudAlerts.map((alert) => (
                        <div key={alert.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                                  {alert.severity.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTime(alert.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-900 font-medium">
                                {alert.description}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                User: {alert.userId.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Time Series Chart Placeholder */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Voting Timeline</h3>
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-2" />
                    <p>Interactive chart would be displayed here</p>
                    <p className="text-sm">Showing votes over time</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  isAlert?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, isAlert }) => (
  <div className={`bg-white rounded-lg border p-4 ${isAlert ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-medium text-gray-600">{title}</h4>
      {icon}
    </div>
    <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
    <p className={`text-xs ${isAlert ? 'text-red-600' : 'text-gray-600'}`}>{trend}</p>
  </div>
);

interface HealthBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  unit?: string;
}

const HealthBar: React.FC<HealthBarProps> = ({ label, value, maxValue, color, unit = '' }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium text-gray-900">
          {Math.round(value)}{unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};