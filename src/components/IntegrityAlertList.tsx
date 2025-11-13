import { AlertTriangle, ShieldAlert, TrendingUp, CheckCircle, ArrowUpRight } from 'lucide-react';

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
  const getIcon = (type: string) => {
    switch (type) {
      case 'bias':
        return <TrendingUp className="w-4 h-4" />;
      case 'collusion':
        return <ShieldAlert className="w-4 h-4" />;
      case 'anomaly':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'cleared':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            Cleared
          </span>
        );
      case 'escalated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-full border border-red-200">
            <ArrowUpRight className="w-3 h-3" />
            Escalated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-50 rounded-full border border-gray-200">
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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Integrity Alerts
          </h2>
          <span className="text-xs text-gray-500">
            {openAlerts.length} open / {alerts.length} total
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {openAlerts.length === 0 && closedAlerts.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No integrity alerts detected</p>
          </div>
        ) : (
          <>
            {openAlerts.length > 0 && (
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Open Alerts
                </p>
              </div>
            )}

            {openAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border-l-4 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 mt-0.5 ${getSeverityColor(alert.severity).split(' ')[0]}`}>
                    {getIcon(alert.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {alert.title}
                        </h3>
                        <span className={`text-xs font-medium uppercase tracking-wide ${getSeverityColor(alert.severity).split(' ')[0]}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatTime(alert.detectedAt)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {alert.description}
                    </p>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Confidence:</span>
                        <div className="flex items-center gap-1">
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all"
                              style={{ width: `${alert.confidenceScore * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            {(alert.confidenceScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {alert.entitiesInvolved.length > 0 && (
                        <>
                          <div className="h-3 w-px bg-gray-300" />
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Entities:</span>
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
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Mark Cleared
                        </button>
                        <button
                          onClick={() => onEscalate(alert.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <ArrowUpRight className="w-3 h-3" />
                          Escalate to Audit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {closedAlerts.length > 0 && (
              <>
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Resolved Alerts
                  </p>
                </div>

                {closedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 bg-gray-50 opacity-60"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5 text-gray-400">
                        {getIcon(alert.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-700">
                            {alert.title}
                          </h3>
                          {getStatusBadge(alert.status)}
                        </div>

                        <p className="text-sm text-gray-500">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
