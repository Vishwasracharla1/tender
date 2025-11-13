import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { KPIWidget } from '../components/KPIWidget';
import { Activity, Zap, AlertCircle, TrendingUp } from 'lucide-react';

interface AgentMonitoringPageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring') => void;
}

interface Agent {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error' | 'paused';
  tasksProcessed: number;
  avgProcessingTime: number;
  successRate: number;
  currentTask?: string;
  lastActivity: string;
  errorCount: number;
}

interface AgentLog {
  id: string;
  agentName: string;
  timestamp: string;
  action: string;
  status: 'success' | 'error' | 'warning';
  duration: number;
  details: string;
}

export function AgentMonitoringPage({ onNavigate }: AgentMonitoringPageProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const agents: Agent[] = [
    {
      id: 'datavalidation',
      name: 'DataValidation.Agent',
      status: 'active',
      tasksProcessed: 847,
      avgProcessingTime: 2.3,
      successRate: 98.5,
      currentTask: 'Processing TND-2025-002 documents',
      lastActivity: '2 minutes ago',
      errorCount: 3,
    },
    {
      id: 'evalai',
      name: 'EvalAI.Agent',
      status: 'active',
      tasksProcessed: 1243,
      avgProcessingTime: 5.8,
      successRate: 96.2,
      currentTask: 'Scoring 4 vendors for TND-2025-001',
      lastActivity: '5 minutes ago',
      errorCount: 8,
    },
    {
      id: 'tenderiq',
      name: 'TenderIQ.Agent',
      status: 'idle',
      tasksProcessed: 634,
      avgProcessingTime: 3.1,
      successRate: 94.7,
      currentTask: undefined,
      lastActivity: '15 minutes ago',
      errorCount: 12,
    },
    {
      id: 'integritybot',
      name: 'IntegrityBot.Agent',
      status: 'active',
      tasksProcessed: 892,
      avgProcessingTime: 4.2,
      successRate: 99.1,
      currentTask: 'Analyzing evaluator patterns',
      lastActivity: '1 minute ago',
      errorCount: 2,
    },
    {
      id: 'justifyai',
      name: 'JustifyAI.Agent',
      status: 'idle',
      tasksProcessed: 423,
      avgProcessingTime: 8.5,
      successRate: 97.8,
      currentTask: undefined,
      lastActivity: '32 minutes ago',
      errorCount: 5,
    },
    {
      id: 'scenariosim',
      name: 'ScenarioSim.Agent',
      status: 'active',
      tasksProcessed: 567,
      avgProcessingTime: 6.3,
      successRate: 95.4,
      currentTask: 'Running 3 award scenarios',
      lastActivity: '3 minutes ago',
      errorCount: 7,
    },
    {
      id: 'governai',
      name: 'GovernAI.Agent',
      status: 'active',
      tasksProcessed: 1834,
      avgProcessingTime: 1.8,
      successRate: 99.6,
      currentTask: 'Aggregating compliance metrics',
      lastActivity: '30 seconds ago',
      errorCount: 1,
    },
  ];

  const [logs, setLogs] = useState<AgentLog[]>([
    {
      id: '1',
      agentName: 'GovernAI.Agent',
      timestamp: new Date(Date.now() - 30000).toISOString(),
      action: 'Generate Executive Dashboard',
      status: 'success',
      duration: 1.2,
      details: 'Aggregated data from 28 active tenders across 4 departments',
    },
    {
      id: '2',
      agentName: 'IntegrityBot.Agent',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      action: 'Detect Evaluator Bias',
      status: 'warning',
      duration: 3.8,
      details: 'High bias score detected for Michael Ross (78/100)',
    },
    {
      id: '3',
      agentName: 'ScenarioSim.Agent',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      action: 'Simulate Award Scenarios',
      status: 'success',
      duration: 5.4,
      details: 'Generated 3 scenarios for TND-2025-001 with recommendations',
    },
    {
      id: '4',
      agentName: 'EvalAI.Agent',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      action: 'Score Vendor Submission',
      status: 'success',
      duration: 4.2,
      details: 'Scored BuildTech Ltd across 16 criteria (85.2/100)',
    },
    {
      id: '5',
      agentName: 'TenderIQ.Agent',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      action: 'Benchmark Market Prices',
      status: 'success',
      duration: 2.8,
      details: 'Identified 5 outliers from 847 market data points',
    },
    {
      id: '6',
      agentName: 'DataValidation.Agent',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      action: 'Validate BOQ Extraction',
      status: 'error',
      duration: 2.1,
      details: 'Failed to parse non-standard table format in vendor document',
    },
    {
      id: '7',
      agentName: 'JustifyAI.Agent',
      timestamp: new Date(Date.now() - 1920000).toISOString(),
      action: 'Generate Justification Section',
      status: 'success',
      duration: 7.2,
      details: 'Created "Financial Stability - Acme Corp" section (145 words)',
    },
  ]);

  const filteredLogs = selectedAgent
    ? logs.filter((log) => log.agentName === agents.find((a) => a.id === selectedAgent)?.name)
    : logs;

  const activeAgents = agents.filter((a) => a.status === 'active').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.tasksProcessed, 0);
  const avgSuccessRate = agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length;
  const totalErrors = agents.reduce((sum, a) => sum + a.errorCount, 0);

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'idle':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getLogStatusColor = (status: AgentLog['status']) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700';
      case 'error':
        return 'bg-red-50 text-red-700';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700';
    }
  };

  return (
    <>
      <Sidebar currentPage="monitoring" onNavigate={onNavigate} />
      <div className="min-h-screen bg-gray-50 pb-24 lg:pl-64">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Agent Monitoring Console
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Real-time AI agent performance and activity logs
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                  {activeAgents} Agents Active
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-4 gap-6 mb-8">
            <KPIWidget
              title="Active Agents"
              value={activeAgents}
              subtitle={`${agents.length} total agents`}
              icon={Activity}
              trend={{ value: '12%', isPositive: true }}
            />

            <KPIWidget
              title="Tasks Processed"
              value={totalTasks.toLocaleString()}
              subtitle="Last 24 hours"
              icon={Zap}
              trend={{ value: '18%', isPositive: true }}
            />

            <KPIWidget
              title="Avg Success Rate"
              value={`${avgSuccessRate.toFixed(1)}%`}
              subtitle="Across all agents"
              icon={TrendingUp}
              trend={{ value: '2%', isPositive: true }}
            />

            <KPIWidget
              title="Total Errors"
              value={totalErrors}
              subtitle="Requires attention"
              icon={AlertCircle}
            />
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                  Agent Status Overview
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimeRange('1h')}
                    className={`px-3 py-1 text-xs font-medium rounded ${
                      timeRange === '1h'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    1H
                  </button>
                  <button
                    onClick={() => setTimeRange('24h')}
                    className={`px-3 py-1 text-xs font-medium rounded ${
                      timeRange === '24h'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    24H
                  </button>
                  <button
                    onClick={() => setTimeRange('7d')}
                    className={`px-3 py-1 text-xs font-medium rounded ${
                      timeRange === '7d'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    7D
                  </button>
                  <button
                    onClick={() => setTimeRange('30d')}
                    className={`px-3 py-1 text-xs font-medium rounded ${
                      timeRange === '30d'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    30D
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAgent === agent.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {agent.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded border ${getStatusColor(
                              agent.status
                            )}`}
                          >
                            {agent.status}
                          </span>
                        </div>
                        {agent.currentTask && (
                          <p className="text-xs text-gray-600 mb-2">
                            {agent.currentTask}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Last activity: {agent.lastActivity}
                        </p>
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-xs text-gray-500 mb-1">
                          Tasks: {agent.tasksProcessed.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          Avg: {agent.avgProcessingTime}s
                        </div>
                        <div className="text-xs font-medium text-emerald-600">
                          {agent.successRate}% success
                        </div>
                        {agent.errorCount > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            {agent.errorCount} errors
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          <span className="text-gray-600">
                            {Math.round(agent.tasksProcessed * (agent.successRate / 100))}{' '}
                            success
                          </span>
                        </div>
                        {agent.errorCount > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span className="text-gray-600">
                              {agent.errorCount} errors
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                  Activity Log
                </h2>
                {selectedAgent && (
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Show All
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-900 mb-1">
                          {log.agentName}
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          {log.action}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${getLogStatusColor(
                          log.status
                        )}`}
                      >
                        {log.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-2">{log.details}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Duration: {log.duration}s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Agent Performance Metrics
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Agent
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      Tasks
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      Avg Time
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      Success Rate
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      Errors
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {agent.name}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {agent.tasksProcessed.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {agent.avgProcessingTime}s
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-emerald-600 font-medium">
                          {agent.successRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={
                            agent.errorCount > 5
                              ? 'text-red-600 font-medium'
                              : 'text-gray-600'
                          }
                        >
                          {agent.errorCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(
                            agent.status
                          )}`}
                        >
                          {agent.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
