import { Sliders, X } from 'lucide-react';

interface WeightConfig {
  technical: number;
  financial: number;
  esg: number;
  innovation: number;
}

interface SimulationControlPanelProps {
  weights: WeightConfig;
  onWeightChange: (category: keyof WeightConfig, value: number) => void;
  excludedVendors: string[];
  onToggleVendorExclusion: (vendorId: string) => void;
  availableVendors: { id: string; name: string }[];
}

export function SimulationControlPanel({
  weights,
  onWeightChange,
  excludedVendors,
  onToggleVendorExclusion,
  availableVendors,
}: SimulationControlPanelProps) {
  const totalWeight = Object.values(weights).reduce((sum, val) => sum + val, 0);
  const isWeightValid = Math.abs(totalWeight - 100) < 0.1;

  const categories = [
    { key: 'technical' as const, label: 'Technical Capability', color: 'blue' },
    { key: 'financial' as const, label: 'Financial Stability', color: 'emerald' },
    { key: 'esg' as const, label: 'ESG Compliance', color: 'green' },
    { key: 'innovation' as const, label: 'Innovation & R&D', color: 'purple' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-gray-600" />
            <h2 className="text-base font-semibold text-gray-900">
              Simulation Controls
            </h2>
          </div>
          <span
            className={`text-xs font-semibold ${
              isWeightValid ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            Total: {totalWeight.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Category Weights
          </h3>
          <div className="space-y-4">
            {categories.map(({ key, label, color }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    {label}
                  </label>
                  <span className="text-sm font-semibold text-gray-900">
                    {weights[key]}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights[key]}
                    onChange={(e) => onWeightChange(key, Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights[key]}
                    onChange={(e) => onWeightChange(key, Number(e.target.value))}
                    className="w-16 px-2 py-1 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            ))}
          </div>

          {!isWeightValid && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700">
                Weights must total 100%. Current total: {totalWeight.toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Vendor Exclusions
          </h3>
          <div className="space-y-2">
            {availableVendors.map((vendor) => {
              const isExcluded = excludedVendors.includes(vendor.id);
              return (
                <label
                  key={vendor.id}
                  className={`
                    flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors
                    ${isExcluded
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isExcluded}
                      onChange={() => onToggleVendorExclusion(vendor.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`text-sm font-medium ${isExcluded ? 'text-red-700' : 'text-gray-900'}`}>
                      {vendor.name}
                    </span>
                  </div>
                  {isExcluded && (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                      <X className="w-3 h-3" />
                      Excluded
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
