import { AlertTriangle, ShieldAlert, TrendingUp, CheckCircle, ArrowUpRight, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Alert {
  id: string;
  type: 'bias' | 'collusion' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidenceScore: number;
  entitiesInvolved: string[];
  status: 'open' | 'cleared' | 'escalated';
  detectedAt: string;
}

interface IntegrityAlertListProps {
  alerts: Alert[];
  onMarkCleared: (alertId: string) => void;
  onEscalate: (alertId: string) => void;
}

export function IntegrityAlertList({ alerts, onMarkCleared, onEscalate }: IntegrityAlertListProps) {
  const [hoveredAlert, setHoveredAlert] = useState<string | null>(null);

  const getIcon = (type: string, severity: string) => {
    const iconClass = "w-5 h-5 text-white";
    switch (type) {
      case 'bias':
        return (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
            severity === 'critical' ? 'from-red-500 to-rose-600' :
            severity === 'high' ? 'from-orange-500 to-amber-600' :
            severity === 'medium' ? 'from-yellow-500 to-orange-600' :
            'from-blue-500 to-cyan-600'
          } flex items-center justify-center shadow-inner`}>
            <TrendingUp className={iconClass} />
          </div>
        );
      case 'collusion':
        return (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
            severity === 'critical' ? 'from-red-500 to-rose-600' :
            severity === 'high' ? 'from-orange-500 to-amber-600' :
            severity === 'medium' ? 'from-yellow-500 to-orange-600' :
            'from-blue-500 to-cyan-600'
          } flex items-center justify-center shadow-inner`}>
            <ShieldAlert className={iconClass} />
          </div>
        );
      case 'anomaly':
        return (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
            severity === 'critical' ? 'from-red-500 to-rose-600' :
            severity === 'high' ? 'from-orange-500 to-amber-600' :
            severity === 'medium' ? 'from-yellow-500 to-orange-600' :
            'from-blue-500 to-cyan-600'
          } flex items-center justify-center shadow-inner`}>
            <AlertTriangle className={iconClass} />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-inner">
            <AlertTriangle className={iconClass} />
          </div>
        );
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          text: 'text-red-700',
          bg: 'bg-red-50',
          border: 'border-red-200',
          gradient: 'from-red-50 via-white to-rose-50',
          badge: 'text-red-700 bg-red-100 border-red-300',
          progress: 'bg-gradient-to-r from-red-500 to-rose-600',
          shadow: 'shadow-red-100/50'
        };
      case 'high':
        return {
          text: 'text-orange-700',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          gradient: 'from-orange-50 via-white to-amber-50',
          badge: 'text-orange-700 bg-orange-100 border-orange-300',
          progress: 'bg-gradient-to-r from-orange-500 to-amber-600',
          shadow: 'shadow-orange-100/50'
        };
      case 'medium':
        return {
          text: 'text-yellow-700',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          gradient: 'from-yellow-50 via-white to-amber-50',
          badge: 'text-yellow-700 bg-yellow-100 border-yellow-300',
          progress: 'bg-gradient-to-r from-yellow-500 to-amber-600',
          shadow: 'shadow-yellow-100/50'
        };
      case 'low':
        return {
          text: 'text-blue-700',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          gradient: 'from-blue-50 via-white to-cyan-50',
          badge: 'text-blue-700 bg-blue-100 border-blue-300',
          progress: 'bg-gradient-to-r from-blue-500 to-cyan-600',
          shadow: 'shadow-blue-100/50'
        };
      default:
        return {
          text: 'text-gray-700',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          gradient: 'from-gray-50 via-white to-slate-50',
          badge: 'text-gray-700 bg-gray-100 border-gray-300',
          progress: 'bg-gradient-to-r from-gray-500 to-slate-600',
          shadow: 'shadow-gray-100/50'
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'cleared':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-300 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Cleared
          </span>
        );
      case 'escalated':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-300 shadow-sm">
            <ArrowUpRight className="w-3 h-3" />
            Escalated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-300 shadow-sm">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
            Open
          </span>
        );
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const openAlerts = alerts.filter(a => a.status === 'open');
  const closedAlerts = alerts.filter(a => a.status !== 'open');

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50/30 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden h-full flex flex-col max-h-[600px]">
      <div className="relative px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-inner">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Integrity Alerts
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Fraud detection & anomaly alerts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-50 rounded-lg border border-rose-200">
            {openAlerts.length} open
          </span>
          <span className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-50 rounded-lg border border-slate-200">
            {alerts.length} total
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        {openAlerts.length === 0 && closedAlerts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">No integrity alerts detected</p>
            <p className="text-xs text-gray-500 mt-1">All systems operating normally</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {openAlerts.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider px-2">
                  Open Alerts
                </p>
              </div>
            )}

            {openAlerts.map((alert) => {
              const colors = getSeverityColor(alert.severity);
              const isHovered = hoveredAlert === alert.id;
              
              return (
                <div
                  key={alert.id}
                  onMouseEnter={() => setHoveredAlert(alert.id)}
                  onMouseLeave={() => setHoveredAlert(null)}
                  className={`
                    relative rounded-xl border-2 p-4 transition-all duration-300
                    bg-gradient-to-br ${colors.gradient}
                    ${colors.border}
                    ${isHovered ? `shadow-lg scale-[1.02] -translate-y-0.5 ${colors.shadow}` : 'shadow-md'}
                    border-l-4
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {getIcon(alert.type, alert.severity)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-gray-900">
                            {alert.title}
                          </h3>
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border shadow-sm ${colors.badge} uppercase tracking-wider`}>
                            {alert.severity}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-gray-500 whitespace-nowrap bg-white/80 px-2 py-1 rounded-md border border-gray-200">
                          {formatTime(alert.detectedAt)}
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed text-gray-700 mb-3">
                        {alert.description}
                      </p>

                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-600">Confidence:</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                              <div
                                className={`h-full ${colors.progress} rounded-full transition-all duration-300`}
                                style={{ width: `${alert.confidenceScore * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-900">
                              {(alert.confidenceScore * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        {alert.entitiesInvolved.length > 0 && (
                          <>
                            <div className="h-3 w-px bg-gray-300" />
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-gray-600">Entities:</span>
                              <span className="text-xs font-medium text-gray-700">
                                {alert.entitiesInvolved.join(', ')}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {alert.status === 'open' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onMarkCleared(alert.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all duration-200 hover:shadow-sm flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Mark Cleared
                          </button>
                          <button
                            onClick={() => onEscalate(alert.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all duration-200 hover:shadow-sm flex items-center gap-1.5"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            Escalate to Audit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {closedAlerts.length > 0 && (
              <>
                <div className="mt-4 mb-2">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider px-2">
                    Resolved Alerts
                  </p>
                </div>

                {closedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 opacity-75"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 opacity-60">
                        {getIcon(alert.type, alert.severity)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-600">
                            {alert.title}
                          </h3>
                          {getStatusBadge(alert.status)}
                        </div>

                        <p className="text-xs text-gray-500">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
