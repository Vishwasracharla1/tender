import { Download, Calendar } from 'lucide-react';

interface LeadershipFooterProps {
  onExportInsights: () => void;
  onScheduleReview: () => void;
}

export function LeadershipFooter({
  onExportInsights,
  onScheduleReview,
}: LeadershipFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs font-medium text-gray-500">Dashboard</p>
              <p className="text-sm font-semibold text-gray-900">Executive Overview</p>
            </div>

            <div className="h-8 w-px bg-gray-200" />

            <div>
              <p className="text-xs font-medium text-gray-500">Agent</p>
              <p className="text-sm font-semibold text-gray-900">GovernAI.Agent</p>
            </div>

            <div className="h-8 w-px bg-gray-200" />

            <div>
              <p className="text-xs font-medium text-gray-500">Last Updated</p>
              <p className="text-sm font-semibold text-gray-900">Just now</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onScheduleReview}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Schedule Review
            </button>

            <button
              onClick={onExportInsights}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
