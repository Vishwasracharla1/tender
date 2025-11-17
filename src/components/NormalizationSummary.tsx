import { TrendingUp, Package, Calendar } from 'lucide-react';

interface NormalizationEntry {
  category: string;
  original: string;
  normalized: string;
  count: number;
}

interface NormalizationSummaryProps {
  entries: NormalizationEntry[];
}

export function NormalizationSummary({ entries }: NormalizationSummaryProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Units':
        return <Package className="w-5 h-5 text-white" />;
      case 'Dates':
        return <Calendar className="w-5 h-5 text-white" />;
      default:
        return <TrendingUp className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-indigo-50 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className="relative px-6 py-4 border-b border-white/40 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-inner">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">
            Normalization Summary
          </h2>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {entries.map((entry, index) => {
            const isUnits = entry.category === 'Units';
            const isDates = entry.category === 'Dates';
            return (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${
                  isUnits
                    ? 'bg-gradient-to-br from-blue-50 via-white to-cyan-100 border-blue-200 shadow-sm'
                    : isDates
                    ? 'bg-gradient-to-br from-purple-50 via-white to-indigo-100 border-purple-200 shadow-sm'
                    : 'bg-gradient-to-br from-slate-50 via-white to-slate-100 border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-inner ${
                      isUnits
                        ? 'from-blue-500 to-cyan-500'
                        : isDates
                        ? 'from-purple-500 to-indigo-500'
                        : 'from-slate-500 to-slate-600'
                    }`}>
                      {getCategoryIcon(entry.category)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${
                        isUnits ? 'text-blue-700' : isDates ? 'text-purple-700' : 'text-slate-600'
                      }`}>
                        {entry.category}
                      </span>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        isUnits
                          ? 'text-blue-700 bg-blue-100 border-blue-200'
                          : isDates
                          ? 'text-purple-700 bg-purple-100 border-purple-200'
                          : 'text-slate-700 bg-slate-100 border-slate-200'
                      }`}>
                        {entry.count} instances
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className={`font-medium line-through ${
                        isUnits ? 'text-blue-600' : isDates ? 'text-purple-600' : 'text-slate-500'
                      }`}>
                        {entry.original}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className={`font-semibold ${
                        isUnits ? 'text-blue-900' : isDates ? 'text-purple-900' : 'text-slate-900'
                      }`}>
                        {entry.normalized}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
