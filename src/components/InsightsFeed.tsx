import { AlertTriangle, TrendingUp, Lightbulb, CheckCircle } from 'lucide-react';

interface Insight {
  id: string;
  type: 'anomaly' | 'trend' | 'recommendation';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

interface InsightsFeedProps {
  insights: Insight[];
  onMarkAsRead: (id: string) => void;
}

export function InsightsFeed({ insights, onMarkAsRead }: InsightsFeedProps) {
  const getIcon = (type: string, severity: string) => {
    switch (type) {
      case 'anomaly':
        return <AlertTriangle className={`w-4 h-4 ${severity === 'critical' ? 'text-red-600' : 'text-yellow-600'}`} />;
      case 'trend':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'recommendation':
        return <Lightbulb className="w-4 h-4 text-emerald-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getBgColor = (severity: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-50';

    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900">
          AI Insights Feed
        </h2>
      </div>

      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {insights.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No insights at this time</p>
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 border transition-colors ${getBgColor(insight.severity, insight.isRead)} ${!insight.isRead ? 'border-l-4' : 'border-l-0'}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(insight.type, insight.severity)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`text-sm font-medium ${insight.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                      {insight.title}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTime(insight.timestamp)}
                    </span>
                  </div>

                  <p className={`text-sm ${insight.isRead ? 'text-gray-500' : 'text-gray-600'} mb-2`}>
                    {insight.description}
                  </p>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium uppercase tracking-wide ${
                      insight.type === 'anomaly' ? 'text-red-700' :
                      insight.type === 'trend' ? 'text-blue-700' :
                      'text-emerald-700'
                    }`}>
                      {insight.type}
                    </span>

                    {!insight.isRead && (
                      <button
                        onClick={() => onMarkAsRead(insight.id)}
                        className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
