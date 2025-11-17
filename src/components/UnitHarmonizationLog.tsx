import { ArrowRight, RefreshCw } from 'lucide-react';

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
    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-indigo-50 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className="relative px-6 py-4 border-b border-white/40 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-inner">
            <RefreshCw className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Unit Harmonization Logs
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{entries.length} recent entries</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-h-64 overflow-y-auto space-y-2">
        {entries.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">No harmonization logs yet</p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <div 
              key={index} 
              className="p-4 rounded-xl bg-gradient-to-br from-white via-slate-50 to-white border border-slate-200 hover:border-cyan-300 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-inner">
                    <span className="text-xs font-bold text-white">
                      {formatTime(entry.timestamp).split(':')[0]}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-900">
                      {entry.field}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium text-cyan-700 bg-cyan-100 rounded-full border border-cyan-200">
                      {entry.vendor}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 font-mono bg-gradient-to-br from-slate-100 to-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-semibold">
                      {entry.originalValue}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center shadow-inner">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-emerald-700 font-mono bg-gradient-to-br from-emerald-50 to-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold">
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
