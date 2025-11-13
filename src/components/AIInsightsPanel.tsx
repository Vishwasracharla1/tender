import { Brain, Sparkles, AlertTriangle, TrendingUp, CheckCircle, Info } from 'lucide-react';

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
}

interface AIInsightsPanelProps {
  department: string;
  dateRange: string;
}

export function AIInsightsPanel({ department, dateRange }: AIInsightsPanelProps) {
  const insights: Insight[] = [
    {
      id: '1',
      type: 'success',
      title: 'Procurement Efficiency Improvement',
      description: 'Water Management department reduced evaluation time by 34% through optimized processes.',
      recommendation: 'Share best practices with Roads & Construction department which is 18% slower than average.',
      confidence: 94,
      impact: 'high',
    },
    {
      id: '2',
      type: 'warning',
      title: 'Vendor Concentration Risk',
      description: '42% of IT tenders awarded to the same 3 vendors in the last 6 months.',
      recommendation: 'Broaden vendor outreach to increase competition. Target 5-8 qualified vendors per tender.',
      confidence: 87,
      impact: 'medium',
    },
    {
      id: '3',
      type: 'critical',
      title: 'Budget Overrun Alert',
      description: 'Healthcare department has exceeded Q2 procurement budget by AED 2.3M (8.7%).',
      recommendation: 'Immediate review required. Consider consolidating remaining tenders or requesting budget adjustment.',
      confidence: 99,
      impact: 'high',
    },
    {
      id: '4',
      type: 'info',
      title: 'Seasonal Pattern Detected',
      description: 'Infrastructure tenders show 28% higher completion rates when issued in Q1-Q2 vs Q3-Q4.',
      recommendation: 'Plan critical infrastructure tenders for early in the year to maximize success rates.',
      confidence: 82,
      impact: 'medium',
    },
    {
      id: '5',
      type: 'success',
      title: 'Cost Optimization Achievement',
      description: 'Waste Management saved AED 4.2M through competitive bidding, 15% above target.',
      recommendation: 'Document procurement strategy as case study for other departments to replicate.',
      confidence: 96,
      impact: 'high',
    },
    {
      id: '6',
      type: 'warning',
      title: 'Compliance Documentation Gap',
      description: '14 tenders missing complete environmental impact assessments required by policy.',
      recommendation: 'Enforce mandatory checklist at tender intake phase. Consider automated validation.',
      confidence: 91,
      impact: 'medium',
    },
  ];

  const getTypeConfig = (type: Insight['type']) => {
    const configs = {
      success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: CheckCircle,
        iconColor: 'text-green-600',
        badge: 'bg-green-100 text-green-700 border-green-200',
      },
      warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: AlertTriangle,
        iconColor: 'text-yellow-600',
        badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      },
      info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: Info,
        iconColor: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700 border-blue-200',
      },
      critical: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: AlertTriangle,
        iconColor: 'text-red-600',
        badge: 'bg-red-100 text-red-700 border-red-200',
      },
    };
    return configs[type];
  };

  const getImpactColor = (impact: Insight['impact']) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-orange-600',
      low: 'text-gray-600',
    };
    return colors[impact];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              AI-Powered Insights
              <Sparkles className="w-4 h-4 text-purple-500" />
            </h2>
            <p className="text-sm text-gray-500">
              Generated for {dateRange}
              {department && ` • ${department}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-full border border-purple-200">
            {insights.length} Insights
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => {
          const config = getTypeConfig(insight.type);
          const Icon = config.icon;

          return (
            <div
              key={insight.id}
              className={`${config.bg} border ${config.border} rounded-lg p-4 hover:shadow-md transition-all`}
            >
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 p-2 bg-white rounded-lg border ${config.border}`}>
                  <Icon className={`w-5 h-5 ${config.iconColor}`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {insight.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium ${config.badge} rounded-full border capitalize`}
                      >
                        {insight.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium capitalize ${getImpactColor(
                          insight.impact
                        )}`}
                      >
                        {insight.impact} impact
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    {insight.description}
                  </p>

                  <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          Recommendation
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {insight.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">AI Confidence:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              insight.confidence >= 90
                                ? 'bg-green-500'
                                : insight.confidence >= 75
                                ? 'bg-yellow-500'
                                : 'bg-orange-500'
                            } transition-all`}
                            style={{ width: `${insight.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-700">
                          {insight.confidence}%
                        </span>
                      </div>
                    </div>

                    <button className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
