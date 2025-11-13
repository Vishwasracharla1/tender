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
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'Dates':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900">
          Normalization Summary
        </h2>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getCategoryIcon(entry.category)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">
                      {entry.category}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                      {entry.count} instances
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 line-through">
                      {entry.original}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium text-gray-900">
                      {entry.normalized}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
