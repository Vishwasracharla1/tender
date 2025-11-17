import { X, Award, CheckCircle, Percent, TrendingUp, TrendingDown, BarChart3, Users } from 'lucide-react';

interface AwardSimulationKPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpiType: 'value' | 'reliability' | 'savings';
  data: {
    value?: {
      topVendor: string;
      index: number;
      ranking: { vendor: string; score: number; cost: number; rank: number }[];
      components: { name: string; weight: number; score: number }[];
      historical: { period: string; index: number }[];
    };
    reliability?: {
      overall: number;
      byVendor: { vendor: string; score: number; history: string; issues: number }[];
      factors: { factor: string; weight: number; status: 'excellent' | 'good' | 'fair' | 'poor' }[];
      prediction: { vendor: string; successRate: number; confidence: number }[];
    };
    savings?: {
      percentage: number;
      amount: number;
      marketAverage: number;
      selectedBid: number;
      breakdown: { category: string; saving: number; percentage: number }[];
      comparison: { vendor: string; bid: number; saving: number; savingPct: number }[];
    };
  };
}

export function AwardSimulationKPIModal({ isOpen, onClose, kpiType, data }: AwardSimulationKPIModalProps) {
  if (!isOpen) return null;

  const renderValueContent = () => {
    const valueData = data.value;
    if (!valueData) return null;

    return (
      <div className="space-y-6">
        <div className="relative rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 shadow-lg">
          <div className="text-center">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">Best Value Index</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">{valueData.index}</p>
            <p className="text-base font-bold text-emerald-700 mt-2">{valueData.topVendor}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Highest combined score across all criteria</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-inner">
              <Users className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Vendor Rankings</span>
          </h4>
          <div className="space-y-3">
            {valueData.ranking.map((vendor, idx) => (
              <div
                key={idx}
                className={`rounded-xl border-2 p-4 shadow-md hover:shadow-lg transition-all duration-200 ${
                  idx === 0
                    ? 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-emerald-200'
                    : idx === 1
                    ? 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-blue-200'
                    : 'bg-gradient-to-br from-slate-50 via-white to-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner ${
                        idx === 0
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
                          : idx === 1
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                          : 'bg-gradient-to-br from-slate-500 to-slate-600 text-white'
                      }`}
                    >
                      {vendor.rank}
                    </div>
                    <span className="text-sm font-bold text-gray-900">{vendor.vendor}</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">{vendor.score}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Total Cost: <span className="font-bold text-gray-900">${(vendor.cost / 1000000).toFixed(2)}M</span></span>
                  {idx === 0 && (
                    <span className="px-3 py-1 text-xs font-bold text-emerald-700 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg shadow-sm">
                      Recommended
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-inner">
              <BarChart3 className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Value Components</span>
          </h4>
          <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 shadow-md">
            <div className="space-y-3">
              {valueData.components.map((component, idx) => (
                <div key={idx} className="pb-3 border-b border-emerald-200/50 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-900">{component.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-600 bg-slate-100 px-2 py-1 rounded-md">Weight: {component.weight}%</span>
                      <span className="text-sm font-bold text-emerald-700">{component.score}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full h-3 transition-all duration-300"
                        style={{ width: `${component.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Historical Trend</span>
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {valueData.historical.map((period, idx) => (
              <div key={idx} className="rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 text-center shadow-md hover:shadow-lg transition-all duration-200">
                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">{period.period}</p>
                <p className="text-2xl font-bold text-gray-900">{period.index}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderReliabilityContent = () => {
    const reliabilityData = data.reliability;
    if (!reliabilityData) return null;

    return (
      <div className="space-y-6">
        <div className="relative rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 shadow-lg">
          <div className="text-center">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Overall Predicted Reliability</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">{reliabilityData.overall}%</p>
            <p className="text-xs text-blue-600 font-medium mt-1">Based on vendor history and risk analysis</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-inner">
              <Users className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Vendor Reliability Scores</span>
          </h4>
          <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 shadow-md">
            <div className="space-y-3">
              {reliabilityData.byVendor.map((vendor, idx) => (
                <div key={idx} className="pb-3 border-b border-blue-200/50 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-900">{vendor.vendor}</span>
                    <span className="text-xl font-bold text-gray-900">{vendor.score}%</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 shadow-inner">
                      <div
                        className={`rounded-full h-2 transition-all duration-300 ${
                          vendor.score >= 90
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                            : vendor.score >= 75
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                            : 'bg-gradient-to-r from-orange-500 to-amber-600'
                        }`}
                        style={{ width: `${vendor.score}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">{vendor.history}</span>
                    <span className={`px-2 py-1 rounded-md font-semibold ${
                      vendor.issues === 0 
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
                        : 'text-orange-700 bg-orange-50 border border-orange-200'
                    }`}>
                      {vendor.issues} issues
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-inner">
              <BarChart3 className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Reliability Factors</span>
          </h4>
          <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 shadow-md">
            <div className="space-y-2">
              {reliabilityData.factors.map((factor, idx) => (
                <div key={idx} className="flex items-center justify-between pb-3 border-b border-blue-200/50 last:border-b-0 last:pb-0">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900">{factor.factor}</p>
                    <p className="text-xs text-gray-600 mt-1 font-medium">Weight: {factor.weight}%</p>
                  </div>
                  <span
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border shadow-sm ${
                      factor.status === 'excellent'
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200'
                        : factor.status === 'good'
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200'
                        : factor.status === 'fair'
                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200'
                        : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200'
                    }`}
                  >
                    {factor.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Success Rate Predictions</span>
          </h4>
          <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 shadow-md">
            <div className="space-y-3">
              {reliabilityData.prediction.map((pred, idx) => (
                <div key={idx} className="pb-3 border-b border-blue-200/50 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-900">{pred.vendor}</span>
                    <span className="text-sm font-bold text-blue-700">{pred.successRate}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full h-2 transition-all duration-300"
                        style={{ width: `${pred.successRate}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 min-w-[80px] text-right">{pred.confidence}% confidence</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSavingsContent = () => {
    const savingsData = data.savings;
    if (!savingsData) return null;

    return (
      <div className="space-y-6">
        <div className="relative rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-lg">
          <div className="text-center">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">Total Cost Savings</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-1">{savingsData.percentage}%</p>
            <p className="text-lg font-bold text-amber-700 mt-2">
              ${(savingsData.amount / 1000000).toFixed(2)}M saved
            </p>
            <p className="text-xs text-amber-600 font-medium mt-1">Compared to market average pricing</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 shadow-md hover:shadow-lg transition-all duration-200">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Market Average</p>
            <p className="text-2xl font-bold text-blue-900">${(savingsData.marketAverage / 1000000).toFixed(2)}M</p>
          </div>
          <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 shadow-md hover:shadow-lg transition-all duration-200">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">Selected Bid</p>
            <p className="text-2xl font-bold text-emerald-900">${(savingsData.selectedBid / 1000000).toFixed(2)}M</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-inner">
              <BarChart3 className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Savings Breakdown</span>
          </h4>
          <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 shadow-md">
            <div className="space-y-3">
              {savingsData.breakdown.map((item, idx) => (
                <div key={idx} className="pb-3 border-b border-amber-200/50 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-900">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-amber-700">${(item.saving / 1000).toFixed(0)}K</span>
                      <span className="text-xs font-semibold text-gray-600 bg-slate-100 px-2 py-1 rounded-md">({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-full h-2 transition-all duration-300"
                        style={{ width: `${(item.saving / savingsData.amount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-inner">
              <TrendingDown className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Vendor Cost Comparison</span>
          </h4>
          <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 shadow-md">
            <div className="space-y-3">
              {savingsData.comparison.map((vendor, idx) => (
                <div
                  key={idx}
                  className={`pb-3 border-b last:border-b-0 last:pb-0 ${
                    vendor.saving > 0 
                      ? 'border-emerald-200/50' 
                      : 'border-red-200/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-900">{vendor.vendor}</span>
                    <span className="text-xl font-bold text-gray-900">${(vendor.bid / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${
                      vendor.saving > 0 ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                      {vendor.saving > 0 ? '↓' : '↑'} ${Math.abs(vendor.saving / 1000).toFixed(0)}K vs market
                    </span>
                    <span
                      className={`px-3 py-1.5 rounded-lg font-bold border shadow-sm ${
                        vendor.saving > 0
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200'
                          : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200'
                      }`}
                    >
                      {vendor.savingPct > 0 ? '+' : ''}{vendor.savingPct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getTitle = () => {
    switch (kpiType) {
      case 'value':
        return 'Best Value Index Details';
      case 'reliability':
        return 'Predicted Reliability Analysis';
      case 'savings':
        return 'Cost Savings Breakdown';
      default:
        return 'KPI Details';
    }
  };

  const getIcon = () => {
    switch (kpiType) {
      case 'value':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-inner">
            <Award className="w-5 h-5 text-white" />
          </div>
        );
      case 'reliability':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-inner">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        );
      case 'savings':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-inner">
            <Percent className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return null;
    }
  };

  const getHeaderGradient = () => {
    switch (kpiType) {
      case 'value':
        return 'from-emerald-50 via-white to-teal-50 border-emerald-200';
      case 'reliability':
        return 'from-blue-50 via-white to-indigo-50 border-blue-200';
      case 'savings':
        return 'from-amber-50 via-white to-orange-50 border-amber-200';
      default:
        return 'from-gray-50 via-white to-slate-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.25)] max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-slate-200">
        <div className={`bg-gradient-to-br ${getHeaderGradient()} border-b-2 px-6 py-5`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getIcon()}
              <div>
                <h3 className="text-lg font-bold text-gray-900">{getTitle()}</h3>
                <p className="text-xs text-gray-600 mt-0.5">Detailed analysis and insights</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/80 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
          {kpiType === 'value' && renderValueContent()}
          {kpiType === 'reliability' && renderReliabilityContent()}
          {kpiType === 'savings' && renderSavingsContent()}
        </div>
      </div>
    </div>
  );
}
