import { Award, TrendingUp, AlertTriangle, Trophy, Users } from 'lucide-react';

interface VendorResult {
  vendorId: string;
  vendorName: string;
  rank: number;
  weightedScore: number;
  totalCost: number;
  valueScore: number;
  riskAssessment: number;
  recommendationStrength: number;
}

interface ScenarioOutcomesTableProps {
  scenarioName: string;
  scenarioType: 'best_value' | 'lowest_cost' | 'risk_adjusted';
  results: VendorResult[];
  onSelectWinner: (vendorId: string) => void;
}

export function ScenarioOutcomesTable({
  scenarioName,
  scenarioType,
  results,
  onSelectWinner,
}: ScenarioOutcomesTableProps) {
  const getScenarioConfig = () => {
    switch (scenarioType) {
      case 'best_value':
        return {
          gradient: 'from-blue-500 to-cyan-500',
          bg: 'from-blue-50 via-white to-cyan-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          badge: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          headerBg: 'from-blue-50 via-white to-cyan-50',
          rowBg: 'bg-gradient-to-r from-blue-50/50 to-cyan-50/30',
          progress: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          icon: Trophy,
        };
      case 'lowest_cost':
        return {
          gradient: 'from-emerald-500 to-teal-500',
          bg: 'from-emerald-50 via-white to-teal-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          badge: 'bg-gradient-to-r from-emerald-500 to-teal-500',
          headerBg: 'from-emerald-50 via-white to-teal-50',
          rowBg: 'bg-gradient-to-r from-emerald-50/50 to-teal-50/30',
          progress: 'bg-gradient-to-r from-emerald-500 to-teal-500',
          icon: TrendingUp,
        };
      case 'risk_adjusted':
        return {
          gradient: 'from-orange-500 to-amber-500',
          bg: 'from-orange-50 via-white to-amber-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          badge: 'bg-gradient-to-r from-orange-500 to-amber-500',
          headerBg: 'from-orange-50 via-white to-amber-50',
          rowBg: 'bg-gradient-to-r from-orange-50/50 to-amber-50/30',
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
          headerBg: 'from-gray-50 via-white to-slate-50',
          rowBg: 'bg-gray-50/50',
          progress: 'bg-gradient-to-r from-gray-500 to-slate-500',
          icon: Trophy,
        };
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 30) return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', gradient: 'from-emerald-500 to-teal-500' };
    if (risk < 60) return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', gradient: 'from-amber-500 to-orange-500' };
    return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', gradient: 'from-red-500 to-rose-500' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const config = getScenarioConfig();
  const HeaderIcon = config.icon;

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white via-slate-50/30 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className={`px-6 py-4 border-b-2 border-slate-200 bg-gradient-to-r ${config.headerBg} backdrop-blur-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
              <HeaderIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {scenarioName}
              </h3>
              <span className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1 text-xs font-bold text-white rounded-lg shadow-md ${config.badge}`}>
                {scenarioType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border-2 border-slate-200 shadow-sm">
            <Users className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-700">
              {results.length} vendors ranked
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className={`bg-gradient-to-r ${config.headerBg} border-b-2 ${config.border}`}>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                Total Cost
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                Risk
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {results.map((result, index) => {
              const riskColors = getRiskColor(result.riskAssessment);
              const isWinner = index === 0;
              return (
                <tr
                  key={result.vendorId}
                  className={`
                    ${isWinner ? config.rowBg : 'bg-white hover:bg-slate-50/50'}
                    transition-all duration-200 hover:shadow-sm
                  `}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {isWinner && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md">
                          <Trophy className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className={`text-sm font-black ${isWinner ? config.text : 'text-slate-900'}`}>
                        #{result.rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${isWinner ? config.text : 'text-slate-900'}`}>
                      {result.vendorName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-sm font-black text-slate-900 min-w-[3rem]">
                        {result.weightedScore.toFixed(1)}
                      </span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full ${config.progress} rounded-full shadow-sm`}
                          style={{ width: `${result.weightedScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-slate-900">
                      {formatCurrency(result.totalCost)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                        <TrendingUp className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-black text-emerald-700 min-w-[2rem]">
                        {result.valueScore.toFixed(0)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${riskColors.gradient} flex items-center justify-center shadow-sm`}>
                        <AlertTriangle className={`w-3.5 h-3.5 text-white`} />
                      </div>
                      <span className={`text-sm font-black ${riskColors.text} min-w-[2rem]`}>
                        {result.riskAssessment.toFixed(0)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isWinner && (
                      <button
                        onClick={() => onSelectWinner(result.vendorId)}
                        className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 ${config.badge}`}
                      >
                        <Award className="w-4 h-4" />
                        Recommend
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {results.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-sm font-semibold text-slate-500">No results available</p>
        </div>
      )}
    </div>
  );
}
