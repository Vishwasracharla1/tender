import { ArrowUpRight, CheckCircle } from 'lucide-react';

interface IntegrityFooterProps {
  tenderId: string;
  phase: string;
  openAlertCount: number;
  onEscalateAll: () => void;
  onClearAll: () => void;
}

export function IntegrityFooter({
  tenderId,
  phase,
  openAlertCount,
  onEscalateAll,
  onClearAll,
}: IntegrityFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs font-medium text-gray-500">Tender ID</p>
              <p className="text-sm font-semibold text-gray-900">{tenderId}</p>
            </div>

            <div className="h-8 w-px bg-gray-200" />

            <div>
              <p className="text-xs font-medium text-gray-500">Phase</p>
              <p className="text-sm font-semibold text-gray-900">{phase}</p>
            </div>

            <div className="h-8 w-px bg-gray-200" />

            <div>
              <p className="text-xs font-medium text-gray-500">Open Alerts</p>
              <p className={`text-sm font-semibold ${openAlertCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {openAlertCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClearAll}
              disabled={openAlertCount === 0}
              className={`
                inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors
                ${openAlertCount === 0
                  ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                }
              `}
            >
              <CheckCircle className="w-4 h-4" />
              Clear All
            </button>

            <button
              onClick={onEscalateAll}
              disabled={openAlertCount === 0}
              className={`
                inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm
                ${openAlertCount === 0
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-white bg-red-600 hover:bg-red-700'
                }
              `}
            >
              <ArrowUpRight className="w-4 h-4" />
              Escalate All to Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
