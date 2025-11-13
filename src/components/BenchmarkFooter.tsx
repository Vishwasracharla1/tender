import { CheckCircle, RefreshCw } from 'lucide-react';

interface BenchmarkFooterProps {
  tenderId: string;
  phase: string;
  isApproved: boolean;
  onApproveBenchmarks: () => void;
  onRecompute: () => void;
}

export function BenchmarkFooter({
  tenderId,
  phase,
  isApproved,
  onApproveBenchmarks,
  onRecompute,
}: BenchmarkFooterProps) {
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
              <p className="text-xs font-medium text-gray-500">Status</p>
              <p className={`text-sm font-semibold ${isApproved ? 'text-emerald-600' : 'text-yellow-600'}`}>
                {isApproved ? 'Approved' : 'Under Review'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRecompute}
              disabled={isApproved}
              className={`
                inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors
                ${isApproved
                  ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                  : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <RefreshCw className="w-4 h-4" />
              Recompute
            </button>

            <button
              onClick={onApproveBenchmarks}
              disabled={isApproved}
              className={`
                inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm
                ${isApproved
                  ? 'text-white bg-emerald-600 opacity-50 cursor-not-allowed'
                  : 'text-white bg-emerald-600 hover:bg-emerald-700'
                }
              `}
            >
              <CheckCircle className="w-4 h-4" />
              {isApproved ? 'Benchmarks Approved' : 'Approve Benchmarks'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
