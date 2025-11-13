import { AlertCircle, MessageSquare } from 'lucide-react';

interface StickyFooterProps {
  tenderId: string;
  phase: string;
  onRequestClarification: () => void;
  onProceedToEvaluation: () => void;
}

export function StickyFooter({
  tenderId,
  phase,
  onRequestClarification,
  onProceedToEvaluation,
}: StickyFooterProps) {
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
              <p className="text-sm font-semibold text-gray-900 capitalize">{phase}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRequestClarification}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Request Clarification
            </button>

            <button
              onClick={onProceedToEvaluation}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Proceed to Evaluation
              <AlertCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
