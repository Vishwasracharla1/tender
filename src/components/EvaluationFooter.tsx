import { Lock, Send } from 'lucide-react';

interface EvaluationFooterProps {
  tenderId: string;
  phase: string;
  isLocked: boolean;
  isChair: boolean;
  onLockMatrix: () => void;
  onSendToBenchmarking: () => void;
}

export function EvaluationFooter({
  tenderId,
  phase,
  isLocked,
  isChair,
  onLockMatrix,
  onSendToBenchmarking,
}: EvaluationFooterProps) {
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
              <div className="flex items-center gap-2">
                {isLocked && <Lock className="w-3 h-3 text-red-600" />}
                <p className={`text-sm font-semibold ${isLocked ? 'text-red-600' : 'text-emerald-600'}`}>
                  {isLocked ? 'Locked' : 'Editable'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isChair && (
              <button
                onClick={onLockMatrix}
                disabled={isLocked}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors
                  ${isLocked
                    ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <Lock className="w-4 h-4" />
                Lock Matrix
              </button>
            )}

            <button
              onClick={onSendToBenchmarking}
              disabled={!isLocked}
              className={`
                inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm
                ${isLocked
                  ? 'text-white bg-emerald-600 hover:bg-emerald-700'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                }
              `}
            >
              <Send className="w-4 h-4" />
              Send to Benchmarking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
