import { X, Award, CheckCircle, Percent, TrendingUp, TrendingDown, BarChart3, AlertCircle, Users } from 'lucide-react';

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
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-emerald-900 mb-2">Best Value Index</p>
            <p className="text-5xl font-bold text-emerald-900">{valueData.index}</p>
            <p className="text-lg font-medium text-emerald-700 mt-2">{valueData.topVendor}</p>
            <p className="text-xs text-emerald-600 mt-1">Highest combined score across all criteria</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-600" />
            Vendor Rankings
          </h4>
          <div className="space-y-2">
            {valueData.ranking.map((vendor, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-4 ${
                  idx === 0
                    ? 'bg-emerald-50 border-emerald-200'
                    : idx === 1
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        idx === 0
                          ? 'bg-emerald-600 text-white'
                          : idx === 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}
                    >
                      {vendor.rank}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{vendor.vendor}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{vendor.score}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Total Cost: ${(vendor.cost / 1000000).toFixed(2)}M</span>
                  {idx === 0 && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                      Recommended
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-600" />
            Value Components
          </h4>
          <div className="space-y-3">
            {valueData.components.map((component, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-900">{component.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Weight: {component.weight}%</span>
                    <span className="text-sm font-bold text-gray-900">{component.score}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 rounded-full h-2"
                      style={{ width: `${component.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            Historical Trend
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {valueData.historical.map((period, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                <p className="text-xs font-medium text-gray-600 mb-1">{period.period}</p>
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
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-blue-900 mb-2">Overall Predicted Reliability</p>
            <p className="text-5xl font-bold text-blue-900">{reliabilityData.overall}%</p>
            <p className="text-xs text-blue-600 mt-2">Based on vendor history and risk analysis</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-600" />
            Vendor Reliability Scores
          </h4>
          <div className="space-y-2">
            {reliabilityData.byVendor.map((vendor, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{vendor.vendor}</span>
                  <span className="text-lg font-bold text-gray-900">{vendor.score}%</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`rounded-full h-2 ${
                        vendor.score >= 90
                          ? 'bg-emerald-600'
                          : vendor.score >= 75
                          ? 'bg-blue-600'
                          : 'bg-orange-600'
                      }`}
                      style={{ width: `${vendor.score}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{vendor.history}</span>
                  <span className={`${vendor.issues === 0 ? 'text-emerald-600' : 'text-orange-600'} font-medium`}>
                    {vendor.issues} issues
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-600" />
            Reliability Factors
          </h4>
          <div className="space-y-2">
            {reliabilityData.factors.map((factor, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900">{factor.factor}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Weight: {factor.weight}%</p>
                </div>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    factor.status === 'excellent'
                      ? 'bg-emerald-100 text-emerald-700'
                      : factor.status === 'good'
                      ? 'bg-blue-100 text-blue-700'
                      : factor.status === 'fair'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {factor.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            Success Rate Predictions
          </h4>
          <div className="space-y-2">
            {reliabilityData.prediction.map((pred, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-900">{pred.vendor}</span>
                  <span className="text-sm font-bold text-gray-900">{pred.successRate}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 rounded-full h-1.5"
                      style={{ width: `${pred.successRate}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{pred.confidence}% confidence</span>
                </div>
              </div>
            ))}
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
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-purple-900 mb-2">Total Cost Savings</p>
            <p className="text-5xl font-bold text-purple-900">{savingsData.percentage}%</p>
            <p className="text-2xl font-semibold text-purple-700 mt-2">
              ${(savingsData.amount / 1000000).toFixed(2)}M saved
            </p>
            <p className="text-xs text-purple-600 mt-2">Compared to market average pricing</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-medium text-blue-900 mb-2">Market Average</p>
            <p className="text-2xl font-bold text-blue-900">${(savingsData.marketAverage / 1000000).toFixed(2)}M</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-xs font-medium text-emerald-900 mb-2">Selected Bid</p>
            <p className="text-2xl font-bold text-emerald-900">${(savingsData.selectedBid / 1000000).toFixed(2)}M</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-600" />
            Savings Breakdown
          </h4>
          <div className="space-y-2">
            {savingsData.breakdown.map((item, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-900">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-purple-700">${(item.saving / 1000).toFixed(0)}K</span>
                    <span className="text-xs text-gray-600">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 rounded-full h-2"
                      style={{ width: `${(item.saving / savingsData.amount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-gray-600" />
            Vendor Cost Comparison
          </h4>
          <div className="space-y-2">
            {savingsData.comparison.map((vendor, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-3 ${
                  vendor.saving > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{vendor.vendor}</span>
                  <span className="text-lg font-bold text-gray-900">${(vendor.bid / 1000000).toFixed(2)}M</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={vendor.saving > 0 ? 'text-emerald-700' : 'text-red-700'}>
                    {vendor.saving > 0 ? '↓' : '↑'} ${Math.abs(vendor.saving / 1000).toFixed(0)}K vs market
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-medium ${
                      vendor.saving > 0
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
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
        return <Award className="w-5 h-5 text-emerald-600" />;
      case 'reliability':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'savings':
        return <Percent className="w-5 h-5 text-purple-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getIcon()}
              <h3 className="text-lg font-semibold text-gray-900">{getTitle()}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {kpiType === 'value' && renderValueContent()}
          {kpiType === 'reliability' && renderReliabilityContent()}
          {kpiType === 'savings' && renderSavingsContent()}
        </div>
      </div>
    </div>
  );
}
