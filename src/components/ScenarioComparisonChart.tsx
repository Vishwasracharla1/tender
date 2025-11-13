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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'best_value':
        return 'bg-blue-600';
      case 'lowest_cost':
        return 'bg-emerald-600';
      case 'risk_adjusted':
        return 'bg-orange-600';
      default:
        return 'bg-gray-600';
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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-base font-semibold text-gray-900">
          Scenario Comparison
        </h3>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {scenarios.map((scenario) => (
            <div key={scenario.name} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {scenario.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Winner: <span className="font-medium text-gray-900">{scenario.topVendor}</span>
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getTypeColor(scenario.type)}`}>
                  {scenario.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Score</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {scenario.score.toFixed(1)}/100
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getTypeColor(scenario.type)}`}
                      style={{ width: `${(scenario.score / maxScore) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Cost</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {formatCurrency(scenario.cost)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-600"
                      style={{ width: `${(scenario.cost / maxCost) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Value Index</span>
                    <span className="text-xs font-semibold text-emerald-600">
                      {scenario.valueIndex.toFixed(0)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600"
                      style={{ width: `${scenario.valueIndex}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Risk Level</span>
                    <span className={`text-xs font-semibold ${
                      scenario.risk < 30 ? 'text-emerald-600' : scenario.risk < 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {scenario.risk.toFixed(0)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        scenario.risk < 30 ? 'bg-emerald-600' : scenario.risk < 60 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${scenario.risk}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span className="text-gray-600">Best Value</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-600 rounded"></div>
              <span className="text-gray-600">Lowest Cost</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-600 rounded"></div>
              <span className="text-gray-600">Risk Adjusted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
