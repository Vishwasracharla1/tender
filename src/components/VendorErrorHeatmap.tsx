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
    if (ratio === 0) return 'bg-emerald-50 text-emerald-900';
    if (ratio < 0.25) return 'bg-yellow-100 text-yellow-900';
    if (ratio < 0.5) return 'bg-orange-100 text-orange-900';
    if (ratio < 0.75) return 'bg-red-100 text-red-900';
    return 'bg-red-200 text-red-900';
  };

  const maxErrors = Math.max(...data.map(d => d.errorCount), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900">
          Errors by Vendor
        </h2>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 gap-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.vendor}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-24 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${getIntensityColor(item.errorCount, maxErrors)}`}
                    style={{ width: `${(item.errorCount / maxErrors) * 100}%` }}
                  />
                </div>
                <span className={`text-sm font-medium w-8 text-right ${
                  item.errorCount === 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {item.errorCount}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>0 errors</span>
            <span>{maxErrors} errors</span>
          </div>
        </div>
      </div>
    </div>
  );
}
