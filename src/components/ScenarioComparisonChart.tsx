import { GitBranch, Award, DollarSign, AlertTriangle } from 'lucide-react';

interface ScenarioData {
  name: string;
  type: 'best_value' | 'lowest_cost' | 'risk_adjusted';
  topVendor: string;
  score: number;
  cost: number;
  valueIndex: number;
  risk: number;
}

interface ScenarioComparisonChartProps {
  scenarios: ScenarioData[];
}

export function ScenarioComparisonChart({ scenarios }: ScenarioComparisonChartProps) {
  const maxScore = Math.max(...scenarios.map(s => s.score));
  const maxCost = Math.max(...scenarios.map(s => s.cost));

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'best_value':
        return {
          gradient: 'from-blue-500 to-cyan-500',
          bg: 'from-blue-50 via-white to-cyan-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          badge: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          progress: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          icon: Award,
        };
      case 'lowest_cost':
        return {
          gradient: 'from-emerald-500 to-teal-500',
          bg: 'from-emerald-50 via-white to-teal-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          badge: 'bg-gradient-to-r from-emerald-500 to-teal-500',
          progress: 'bg-gradient-to-r from-emerald-500 to-teal-500',
          icon: DollarSign,
        };
      case 'risk_adjusted':
        return {
          gradient: 'from-orange-500 to-amber-500',
          bg: 'from-orange-50 via-white to-amber-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          badge: 'bg-gradient-to-r from-orange-500 to-amber-500',
          progress: 'bg-gradient-to-r from-orange-500 to-amber-500',
          icon: AlertTriangle,
        };
      default:
        return {
          gradient: 'from-gray-500 to-slate-500',
          bg: 'from-gray-50 via-white to-slate-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          badge: 'bg-gradient-to-r from-gray-500 to-slate-500',
          progress: 'bg-gradient-to-r from-gray-500 to-slate-500',
          icon: GitBranch,
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white via-indigo-50/30 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-white via-indigo-50/50 to-white backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Scenario Comparison
            </h3>
            <p className="text-xs text-slate-500">Compare award scenarios</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-5">
          {scenarios.map((scenario) => {
            const config = getTypeConfig(scenario.type);
            const Icon = config.icon;
            return (
              <div
                key={scenario.name}
                className={`rounded-xl border-2 ${config.border} bg-gradient-to-br ${config.bg} p-5 shadow-md hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">
                        {scenario.name}
                      </h4>
                      <p className="text-xs text-slate-600">
                        Winner: <span className="font-bold text-slate-900">{scenario.topVendor}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md ${config.badge}`}>
                    {scenario.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Score</span>
                      <span className="text-sm font-black text-slate-900">
                        {scenario.score.toFixed(1)}/100
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full ${config.progress} rounded-full shadow-sm`}
                        style={{ width: `${(scenario.score / maxScore) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Cost</span>
                      <span className="text-sm font-black text-slate-900">
                        {formatCurrency(scenario.cost)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-slate-500 to-slate-600 rounded-full shadow-sm"
                        style={{ width: `${(scenario.cost / maxCost) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Value Index</span>
                      <span className="text-sm font-black text-emerald-700">
                        {scenario.valueIndex.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm"
                        style={{ width: `${scenario.valueIndex}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Risk Level</span>
                      <span className={`text-sm font-black ${
                        scenario.risk < 30 ? 'text-emerald-700' : scenario.risk < 60 ? 'text-amber-700' : 'text-red-700'
                      }`}>
                        {scenario.risk.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full shadow-sm ${
                          scenario.risk < 30
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            : scenario.risk < 60
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                            : 'bg-gradient-to-r from-red-500 to-rose-500'
                        }`}
                        style={{ width: `${scenario.risk}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t-2 border-slate-200">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-sm">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md"></div>
              <span className="text-xs font-bold text-blue-700">Best Value</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 shadow-sm">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md"></div>
              <span className="text-xs font-bold text-emerald-700">Lowest Cost</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 shadow-sm">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-md"></div>
              <span className="text-xs font-bold text-orange-700">Risk Adjusted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
