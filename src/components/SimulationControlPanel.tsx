import { Sliders, X, Settings2, Users } from 'lucide-react';

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
    { key: 'technical' as const, label: 'Technical Capability', color: 'blue', gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 via-white to-cyan-50', border: 'border-blue-200', text: 'text-blue-700', valueText: 'text-blue-900' },
    { key: 'financial' as const, label: 'Financial Stability', color: 'emerald', gradient: 'from-emerald-500 to-teal-500', bg: 'from-emerald-50 via-white to-teal-50', border: 'border-emerald-200', text: 'text-emerald-700', valueText: 'text-emerald-900' },
    { key: 'esg' as const, label: 'ESG Compliance', color: 'green', gradient: 'from-green-500 to-emerald-500', bg: 'from-green-50 via-white to-emerald-50', border: 'border-green-200', text: 'text-green-700', valueText: 'text-green-900' },
    { key: 'innovation' as const, label: 'Innovation & R&D', color: 'purple', gradient: 'from-purple-500 to-indigo-500', bg: 'from-purple-50 via-white to-indigo-50', border: 'border-purple-200', text: 'text-purple-700', valueText: 'text-purple-900' },
  ];

  const getSliderStyle = (color: string) => {
    switch (color) {
      case 'blue':
        return 'accent-blue-600';
      case 'emerald':
        return 'accent-emerald-600';
      case 'green':
        return 'accent-green-600';
      case 'purple':
        return 'accent-purple-600';
      default:
        return 'accent-blue-600';
    }
  };

  const getSliderGradient = (color: string, value: number) => {
    const colors: Record<string, string> = {
      blue: 'rgb(59, 130, 246)',
      emerald: 'rgb(16, 185, 129)',
      green: 'rgb(34, 197, 94)',
      purple: 'rgb(168, 85, 247)',
    };
    const colorValue = colors[color] || colors.blue;
    return `linear-gradient(to right, ${colorValue} 0%, ${colorValue} ${value}%, rgb(229, 231, 235) ${value}%, rgb(229, 231, 235) 100%)`;
  };

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white via-blue-50/30 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-white via-blue-50/50 to-white backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Simulation Controls
              </h2>
              <p className="text-xs text-slate-500">Adjust weights and exclusions</p>
            </div>
          </div>
          <span
            className={`px-4 py-2 text-sm font-bold rounded-xl border-2 shadow-sm ${
              isWeightValid
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200'
                : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200'
            }`}
          >
            Total: {totalWeight.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700">
              Category Weights
            </h3>
          </div>
          <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 shadow-md">
            <div className="space-y-4">
              {categories.map(({ key, label, gradient, bg, border, text, valueText, color }, index) => (
                <div key={key} className={index < categories.length - 1 ? 'pb-4 border-b border-blue-200/50' : ''}>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm font-bold ${text}`}>
                      {label}
                    </label>
                    <span className={`text-lg font-black ${valueText}`}>
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
                      className={`flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer ${getSliderStyle(color)} shadow-inner`}
                      style={{
                        background: getSliderGradient(color, weights[key])
                      }}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={weights[key]}
                      onChange={(e) => onWeightChange(key, Number(e.target.value))}
                      className={`w-20 px-3 py-2 text-sm font-bold ${valueText} border-2 ${border} rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!isWeightValid && (
            <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl shadow-sm">
              <p className="text-sm font-semibold text-red-700">
                ⚠️ Weights must total 100%. Current total: {totalWeight.toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t-2 border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700">
              Vendor Exclusions
            </h3>
          </div>
          <div className="space-y-3">
            {availableVendors.map((vendor) => {
              const isExcluded = excludedVendors.includes(vendor.id);
              return (
                <label
                  key={vendor.id}
                  className={`
                    flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md
                    ${isExcluded
                      ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 shadow-sm'
                      : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-blue-300 hover:from-blue-50/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isExcluded}
                      onChange={() => onToggleVendorExclusion(vendor.id)}
                      className="w-5 h-5 text-red-600 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer transition-all duration-200"
                    />
                    <span className={`text-sm font-bold ${isExcluded ? 'text-red-700' : 'text-slate-900'}`}>
                      {vendor.name}
                    </span>
                  </div>
                  {isExcluded && (
                    <span className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-700 bg-gradient-to-r from-red-100 to-rose-100 border border-red-300 rounded-lg shadow-sm">
                      <X className="w-3.5 h-3.5" />
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
