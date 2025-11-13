import { Award, TrendingUp, AlertTriangle } from 'lucide-react';

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
  const getScenarioColor = () => {
    switch (scenarioType) {
      case 'best_value':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'lowest_cost':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'risk_adjusted':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'text-emerald-600';
    if (risk < 60) return 'text-yellow-600';
    return 'text-red-600';
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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {scenarioName}
            </h3>
            <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full border ${getScenarioColor()}`}>
              {scenarioType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {results.length} vendors ranked
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Vendor
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Score
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Total Cost
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Value
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Risk
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.map((result, index) => (
              <tr
                key={result.vendorId}
                className={`
                  ${index === 0 ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}
                  transition-colors
                `}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <Award className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className={`text-sm font-semibold ${index === 0 ? 'text-blue-700' : 'text-gray-900'}`}>
                      #{result.rank}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${index === 0 ? 'text-blue-700' : 'text-gray-900'}`}>
                    {result.vendorName}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {result.weightedScore.toFixed(1)}
                    </span>
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${result.weightedScore}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(result.totalCost)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-600">
                      {result.valueScore.toFixed(0)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <AlertTriangle className={`w-3 h-3 ${getRiskColor(result.riskAssessment)}`} />
                    <span className={`text-sm font-semibold ${getRiskColor(result.riskAssessment)}`}>
                      {result.riskAssessment.toFixed(0)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {index === 0 && (
                    <button
                      onClick={() => onSelectWinner(result.vendorId)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Award className="w-3 h-3" />
                      Recommend
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {results.length === 0 && (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-gray-500">No results available</p>
        </div>
      )}
    </div>
  );
}
