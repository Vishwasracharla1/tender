import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { KPIWidget } from '../components/KPIWidget';
import { Activity, Zap, AlertCircle, TrendingUp, Cpu, Clock, ListTodo, CheckCircle2, XCircle, AlertTriangle, X, BarChart3 } from 'lucide-react';

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

  const getLogStatusConfig = (status: AgentLog['status']) => {
    switch (status) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-emerald-50 to-teal-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          badge: 'bg-gradient-to-r from-emerald-500 to-teal-500',
          icon: CheckCircle2,
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          text: 'text-red-700',
          border: 'border-red-200',
          badge: 'bg-gradient-to-r from-red-500 to-rose-500',
          icon: XCircle,
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          badge: 'bg-gradient-to-r from-amber-500 to-orange-500',
          icon: AlertTriangle,
        };
    }
  };

  return (
    <>
      <Sidebar currentPage="monitoring" onNavigate={onNavigate} />
      <div className="app-shell min-h-screen bg-gray-50 pb-24">
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
            <div className="col-span-2 rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white via-blue-50/30 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden">
              <div className="px-6 py-4 border-b-2 border-slate-200 bg-gradient-to-r from-white via-blue-50/50 to-white backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Cpu className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Agent Status Overview
                      </h2>
                      <p className="text-xs text-slate-500">Real-time agent performance</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(['1h', '24h', '7d', '30d'] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl border-2 transition-all duration-200 ${
                          timeRange === range
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-500 shadow-md'
                            : 'bg-white/80 text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 shadow-sm'
                        }`}
                      >
                        {range.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 grid grid-cols-2 gap-3">
                {agents.map((agent) => {
                  const isSelected = selectedAgent === agent.id;
                  const successCount = Math.round(agent.tasksProcessed * (agent.successRate / 100));
                  return (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent.id)}
                      className={`group relative rounded-xl border-2 p-3 cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'border-blue-400 bg-gradient-to-br from-blue-50 via-white to-cyan-50 shadow-lg scale-[1.02]'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md flex-shrink-0 ${
                              agent.status === 'active'
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                : agent.status === 'idle'
                                ? 'bg-gradient-to-br from-slate-400 to-slate-500'
                                : agent.status === 'error'
                                ? 'bg-gradient-to-br from-red-500 to-rose-500'
                                : 'bg-gradient-to-br from-amber-500 to-orange-500'
                            }`}>
                              <Cpu className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xs font-bold text-slate-900 mb-1 truncate">
                                {agent.name}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md border shadow-sm ${
                                  agent.status === 'active'
                                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200'
                                    : agent.status === 'idle'
                                    ? 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border-slate-200'
                                    : agent.status === 'error'
                                    ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200'
                                    : 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {agent.status === 'active' && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>}
                                {agent.status}
                              </span>
                            </div>
                          </div>
                          {agent.currentTask && (
                            <p className="text-[10px] font-medium text-slate-700 mb-1 ml-[40px] line-clamp-1">
                              {agent.currentTask}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 ml-[40px]">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <p className="text-[10px] text-slate-500">
                              {agent.lastActivity}
                            </p>
                          </div>
                        </div>

                        <div className="text-right ml-2 flex-shrink-0">
                          <div className="grid grid-cols-2 gap-1.5">
                            <div className="bg-slate-50 rounded-md p-1.5 border border-slate-200">
                              <div className="text-[9px] text-slate-500 mb-0.5">Tasks</div>
                              <div className="text-xs font-black text-slate-900">
                                {agent.tasksProcessed.toLocaleString()}
                              </div>
                            </div>
                            <div className="bg-slate-50 rounded-md p-1.5 border border-slate-200">
                              <div className="text-[9px] text-slate-500 mb-0.5">Avg</div>
                              <div className="text-xs font-black text-slate-900">
                                {agent.avgProcessingTime}s
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-md p-1.5 border-2 border-emerald-200 col-span-2">
                              <div className="text-[9px] text-emerald-600 font-bold mb-0.5">Success</div>
                              <div className="text-xs font-black text-emerald-700">
                                {agent.successRate}%
                              </div>
                            </div>
                            {agent.errorCount > 0 && (
                              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-md p-1.5 border-2 border-red-200 col-span-2">
                                <div className="text-[9px] text-red-600 font-bold mb-0.5">Errors</div>
                                <div className="text-xs font-black text-red-700">
                                  {agent.errorCount}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm"></div>
                            <span className="text-[10px] font-bold text-slate-700">
                              {successCount.toLocaleString()} success
                            </span>
                          </div>
                          {agent.errorCount > 0 && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-red-400 to-rose-500 shadow-sm"></div>
                              <span className="text-[10px] font-bold text-slate-700">
                                {agent.errorCount} errors
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white via-indigo-50/30 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col min-w-0">
              <div className="px-4 py-3 border-b-2 border-slate-200 bg-gradient-to-r from-white via-indigo-50/50 to-white backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg flex-shrink-0">
                      <ListTodo className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-slate-900 truncate">
                        Activity Log
                      </h2>
                      <p className="text-[10px] text-slate-500">Recent activities</p>
                    </div>
                  </div>
                  {selectedAgent && (
                    <button
                      onClick={() => setSelectedAgent(null)}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-indigo-700 bg-white/80 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 shadow-sm flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                      All
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 space-y-2 flex-1 overflow-y-auto custom-scrollbar min-h-0">
                {filteredLogs.map((log) => {
                  const config = getLogStatusConfig(log.status);
                  const StatusIcon = config.icon;
                  return (
                    <div
                      key={log.id}
                      className={`group relative rounded-lg border-2 ${config.border} ${config.bg} p-3 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-lg ${config.badge} flex items-center justify-center shadow-md flex-shrink-0`}>
                          <StatusIcon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <div className="text-[11px] font-bold text-slate-900 truncate">
                              {log.agentName}
                            </div>
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold text-white rounded shadow-sm ${config.badge} flex-shrink-0`}>
                              {log.status}
                            </span>
                          </div>
                          <div className="text-[11px] font-semibold text-slate-700 mb-1 break-words">
                            {log.action}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                            <span className="text-[9px] text-slate-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[10px] font-medium text-slate-600 mb-2 break-words">{log.details}</p>

                      <div className="flex items-center">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/60 rounded-md border border-slate-200">
                          <Clock className="w-2.5 h-2.5 text-slate-500 flex-shrink-0" />
                          <span className="text-[9px] font-bold text-slate-700">
                            {log.duration}s
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white via-slate-50/30 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden">
            <div className="px-6 py-4 border-b-2 border-slate-200 bg-gradient-to-r from-white via-slate-50/50 to-white backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Agent Performance Metrics
                  </h2>
                  <p className="text-xs text-slate-500">Comprehensive agent statistics</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b-2 border-slate-200">
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Tasks
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Avg Time
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Errors
                    </th>
                    <th className="text-center py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {agents.map((agent, index) => (
                    <tr 
                      key={agent.id} 
                      className="bg-white hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/30 transition-all duration-200 hover:shadow-sm group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md flex-shrink-0 ${
                            agent.status === 'active'
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                              : agent.status === 'idle'
                              ? 'bg-gradient-to-br from-slate-400 to-slate-500'
                              : agent.status === 'error'
                              ? 'bg-gradient-to-br from-red-500 to-rose-500'
                              : 'bg-gradient-to-br from-amber-500 to-orange-500'
                          }`}>
                            <Cpu className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-bold text-slate-900">
                            {agent.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-sm font-black text-slate-900">
                          {agent.tasksProcessed.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-sm font-bold text-slate-700">
                          {agent.avgProcessingTime}s
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                              style={{ width: `${agent.successRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-black text-emerald-700 min-w-[3rem]">
                            {agent.successRate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span
                          className={`px-3 py-1.5 rounded-lg font-bold text-sm border-2 shadow-sm ${
                            agent.errorCount > 5
                              ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200'
                              : agent.errorCount > 0
                              ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200'
                              : 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {agent.errorCount}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border-2 shadow-sm ${
                            agent.status === 'active'
                              ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200'
                              : agent.status === 'idle'
                              ? 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border-slate-200'
                              : agent.status === 'error'
                              ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200'
                              : 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {agent.status === 'active' && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>}
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
