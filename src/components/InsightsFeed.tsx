import { AlertTriangle, TrendingUp, Lightbulb, CheckCircle, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

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
  const [hoveredInsight, setHoveredInsight] = useState<string | null>(null);

  const getIcon = (type: string, severity: string) => {
    const iconClass = "w-5 h-5 text-white";
    switch (type) {
      case 'anomaly':
        if (severity === 'critical') {
          return (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-inner">
              <AlertTriangle className={iconClass} />
            </div>
          );
        }
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-inner">
            <AlertTriangle className={iconClass} />
          </div>
        );
      case 'trend':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-inner">
            <TrendingUp className={iconClass} />
          </div>
        );
      case 'recommendation':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-inner">
            <Lightbulb className={iconClass} />
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

  const getCardStyle = (severity: string, isRead: boolean, isHovered: boolean) => {
    if (isRead) {
      return {
        bg: 'bg-gradient-to-br from-slate-50 via-white to-slate-50',
        border: 'border-slate-200',
        shadow: isHovered ? 'shadow-md' : 'shadow-sm'
      };
    }

    switch (severity) {
      case 'critical':
        return {
          bg: isHovered 
            ? 'bg-gradient-to-br from-red-50 via-white to-rose-50' 
            : 'bg-gradient-to-br from-red-50/80 via-white to-rose-50/60',
          border: 'border-red-200',
          shadow: isHovered ? 'shadow-lg shadow-red-100/50' : 'shadow-md shadow-red-50/50'
        };
      case 'warning':
        return {
          bg: isHovered 
            ? 'bg-gradient-to-br from-amber-50 via-white to-yellow-50' 
            : 'bg-gradient-to-br from-amber-50/80 via-white to-yellow-50/60',
          border: 'border-amber-200',
          shadow: isHovered ? 'shadow-lg shadow-amber-100/50' : 'shadow-md shadow-amber-50/50'
        };
      default:
        return {
          bg: isHovered 
            ? 'bg-gradient-to-br from-blue-50 via-white to-cyan-50' 
            : 'bg-gradient-to-br from-blue-50/80 via-white to-cyan-50/60',
          border: 'border-blue-200',
          shadow: isHovered ? 'shadow-lg shadow-blue-100/50' : 'shadow-md shadow-blue-50/50'
        };
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'anomaly':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold text-red-700 bg-red-100 rounded-md border border-red-300 uppercase tracking-wider shadow-sm">
            ANOMALY
          </span>
        );
      case 'trend':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold text-blue-700 bg-blue-100 rounded-md border border-blue-300 uppercase tracking-wider shadow-sm">
            TREND
          </span>
        );
      case 'recommendation':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-md border border-emerald-300 uppercase tracking-wider shadow-sm">
            RECOMMENDATION
          </span>
        );
      default:
        return null;
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
    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-purple-50/20 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden max-h-[600px] flex flex-col">
      <div className="relative px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-inner">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              AI Insights Feed
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Real-time market intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 rounded-lg border border-purple-200">
            {insights.filter(i => !i.isRead).length} New
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 min-h-0">
        {insights.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">No insights at this time</p>
            <p className="text-xs text-gray-500 mt-1">AI is analyzing market data...</p>
          </div>
        ) : (
          insights.map((insight) => {
            const isHovered = hoveredInsight === insight.id;
            const cardStyle = getCardStyle(insight.severity, insight.isRead, isHovered);
            
            return (
              <div
                key={insight.id}
                onMouseEnter={() => setHoveredInsight(insight.id)}
                onMouseLeave={() => setHoveredInsight(null)}
                className={`
                  relative rounded-xl border-2 p-4 transition-all duration-300
                  ${cardStyle.bg} ${cardStyle.border} ${cardStyle.shadow}
                  ${!insight.isRead ? 'border-l-4' : ''}
                  ${isHovered ? 'scale-[1.02] -translate-y-0.5' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getIcon(insight.type, insight.severity)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className={`text-sm font-bold leading-tight ${insight.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                        {insight.title}
                      </h3>
                      <span className="text-[10px] font-semibold text-gray-500 whitespace-nowrap bg-white/80 px-2 py-1 rounded-md border border-gray-200">
                        {formatTime(insight.timestamp)}
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed mb-3 ${insight.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                      {insight.description}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getTypeBadge(insight.type)}
                        {!insight.isRead && (
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                      </div>

                      {!insight.isRead && (
                        <button
                          onClick={() => onMarkAsRead(insight.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-white border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-sm flex items-center gap-1.5"
                        >
                          <X className="w-3 h-3" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Accent line for unread items */}
                {!insight.isRead && (
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                    insight.severity === 'critical' ? 'bg-gradient-to-b from-red-500 to-rose-600' :
                    insight.severity === 'warning' ? 'bg-gradient-to-b from-amber-500 to-orange-600' :
                    'bg-gradient-to-b from-blue-500 to-cyan-600'
                  }`}></div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
