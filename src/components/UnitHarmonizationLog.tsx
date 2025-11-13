import { ArrowRight } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  field: string;
  originalValue: string;
  normalizedValue: string;
  vendor: string;
}

interface UnitHarmonizationLogProps {
  entries: LogEntry[];
}

export function UnitHarmonizationLog({ entries }: UnitHarmonizationLogProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900">
          Unit Harmonization Logs
        </h2>
      </div>

      <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">No harmonization logs yet</p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <div key={index} className="p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-16">
                  <span className="text-xs text-gray-500 font-mono">
                    {formatTime(entry.timestamp)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-900">
                      {entry.field}
                    </span>
                    <span className="text-xs text-gray-500">
                      • {entry.vendor}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-0.5 rounded">
                      {entry.originalValue}
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded">
                      {entry.normalizedValue}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
