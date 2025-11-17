import { AlertTriangle } from 'lucide-react';

interface VendorError {
  vendor: string;
  errorCount: number;
  maxErrors: number;
}

interface VendorErrorHeatmapProps {
  data: VendorError[];
}

export function VendorErrorHeatmap({ data }: VendorErrorHeatmapProps) {
  const getIntensityColor = (count: number, max: number) => {
    const ratio = count / max;
    if (ratio === 0) return 'from-emerald-500 to-teal-500';
    if (ratio < 0.25) return 'from-amber-400 to-yellow-500';
    if (ratio < 0.5) return 'from-orange-400 to-amber-500';
    if (ratio < 0.75) return 'from-red-400 to-orange-500';
    return 'from-red-500 to-rose-600';
  };

  const getBarBg = (count: number, max: number) => {
    const ratio = count / max;
    if (ratio === 0) return 'bg-emerald-50';
    if (ratio < 0.25) return 'bg-amber-50';
    if (ratio < 0.5) return 'bg-orange-50';
    if (ratio < 0.75) return 'bg-red-50';
    return 'bg-red-100';
  };

  const maxErrors = Math.max(...data.map(d => d.errorCount), 1);
  const totalErrors = data.reduce((sum, d) => sum + d.errorCount, 0);

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-indigo-50 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className="relative px-6 py-4 border-b border-white/40 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-inner">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Errors by Vendor
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{totalErrors} total errors</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {data.map((item, index) => {
            const gradient = getIntensityColor(item.errorCount, maxErrors);
            const barBg = getBarBg(item.errorCount, maxErrors);
            const percentage = maxErrors > 0 ? (item.errorCount / maxErrors) * 100 : 0;
            
            return (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${barBg} border-slate-200 shadow-sm`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {item.vendor}
                    </p>
                  </div>
                  <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${
                    item.errorCount === 0 
                      ? 'text-emerald-700 bg-emerald-100 border border-emerald-200' 
                      : 'text-red-700 bg-red-100 border border-red-200'
                  }`}>
                    {item.errorCount}
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500 shadow-inner`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-white/40">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">0 errors</span>
            <span className="font-medium">{maxErrors} errors</span>
          </div>
        </div>
      </div>
    </div>
  );
}
