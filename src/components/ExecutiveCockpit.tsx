import { TrendingUp, TrendingDown, DollarSign, Users, FileText, Clock, Shield, Award } from 'lucide-react';

interface CockpitMetric {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: typeof TrendingUp;
  color: string;
  insight: string;
}

interface ExecutiveCockpitProps {
  dateRange: string;
  department: string;
}

export function ExecutiveCockpit({ dateRange, department }: ExecutiveCockpitProps) {
  const metrics: CockpitMetric[] = [
    {
      title: 'Total Procurement Value',
      value: 'AED 847.2M',
      change: 18.5,
      changeLabel: 'vs last period',
      icon: DollarSign,
      color: 'blue',
      insight: '18.5% increase driven by infrastructure projects',
    },
    {
      title: 'Active Tenders',
      value: '142',
      change: 12.3,
      changeLabel: 'vs last period',
      icon: FileText,
      color: 'emerald',
      insight: '142 tenders in progress, 89% on schedule',
    },
    {
      title: 'Vendor Participation',
      value: '1,847',
      change: 24.1,
      changeLabel: 'unique vendors',
      icon: Users,
      color: 'purple',
      insight: '24% growth in vendor base, strong SME participation',
    },
    {
      title: 'Avg Evaluation Time',
      value: '23 days',
      change: -15.8,
      changeLabel: 'reduction',
      icon: Clock,
      color: 'orange',
      insight: '16% faster than target, AI acceleration working',
    },
    {
      title: 'Compliance Score',
      value: '94.7%',
      change: 3.2,
      changeLabel: 'improvement',
      icon: Shield,
      color: 'green',
      insight: 'Best compliance rate in 3 years',
    },
    {
      title: 'Cost Savings',
      value: 'AED 42.3M',
      change: 28.4,
      changeLabel: 'vs estimates',
      icon: Award,
      color: 'cyan',
      insight: 'AED 42.3M saved through competitive bidding',
    },
    {
      title: 'Transparency Index',
      value: '97.2%',
      change: 5.1,
      changeLabel: 'improvement',
      icon: TrendingUp,
      color: 'indigo',
      insight: 'Highest transparency score across GCC',
    },
    {
      title: 'Integrity Alerts',
      value: '7',
      change: -42.3,
      changeLabel: 'reduction',
      icon: Shield,
      color: 'red',
      insight: '42% reduction in integrity alerts, AI detection working',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-200', icon: 'text-blue-600' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-200', icon: 'text-emerald-600' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-900', border: 'border-purple-200', icon: 'text-purple-600' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-900', border: 'border-orange-200', icon: 'text-orange-600' },
      green: { bg: 'bg-green-50', text: 'text-green-900', border: 'border-green-200', icon: 'text-green-600' },
      cyan: { bg: 'bg-cyan-50', text: 'text-cyan-900', border: 'border-cyan-200', icon: 'text-cyan-600' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-900', border: 'border-indigo-200', icon: 'text-indigo-600' },
      red: { bg: 'bg-red-50', text: 'text-red-900', border: 'border-red-200', icon: 'text-red-600' },
    };
    return colors[color];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Executive Cockpit</h2>
          <p className="text-sm text-gray-500 mt-1">
            Real-time overview for {dateRange}
            {department && ` • ${department}`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live data
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const colors = getColorClasses(metric.color);
          const isPositive = metric.change > 0;
          const showTrend = metric.title !== 'Integrity Alerts' ? isPositive : !isPositive;

          return (
            <div
              key={index}
              className={`${colors.bg} border ${colors.border} rounded-lg p-4 hover:shadow-md transition-all cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 ${colors.bg} rounded-lg border ${colors.border}`}>
                  <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                <div className="flex items-center gap-1">
                  {showTrend ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      showTrend ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <h3 className="text-xs font-medium text-gray-600 mb-1">
                  {metric.title}
                </h3>
                <p className={`text-2xl font-bold ${colors.text}`}>
                  {metric.value}
                </p>
              </div>

              <p className="text-xs text-gray-500 mb-2">{metric.changeLabel}</p>

              <div className={`${colors.bg} border ${colors.border} rounded p-2 mt-3`}>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {metric.insight}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
