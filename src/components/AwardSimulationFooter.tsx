import { Award, FileText } from 'lucide-react';

interface AwardSimulationFooterProps {
  tenderId: string;
  phase: string;
  selectedScenario: string;
  selectedVendor: string;
  onRecommendAward: () => void;
  onGenerateReport: () => void;
  hasPermission: boolean;
}

export function AwardSimulationFooter({
  tenderId,
  phase,
  selectedScenario,
  selectedVendor,
  onRecommendAward,
  onGenerateReport,
  hasPermission,
}: AwardSimulationFooterProps) {
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
              <p className="text-xs font-medium text-gray-500">Active Scenario</p>
              <p className="text-sm font-semibold text-gray-900">{selectedScenario || 'None'}</p>
            </div>

            {selectedVendor && (
              <>
                <div className="h-8 w-px bg-gray-200" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Recommended Vendor</p>
                  <p className="text-sm font-semibold text-blue-700">{selectedVendor}</p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!hasPermission && (
              <span className="px-3 py-2 text-xs font-medium text-red-700 bg-red-50 rounded-lg border border-red-200">
                Evaluation Chair Only
              </span>
            )}

            <button
              onClick={onGenerateReport}
              disabled={!hasPermission || !selectedVendor}
              className={`
                inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors
                ${!hasPermission || !selectedVendor
                  ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                  : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              <FileText className="w-4 h-4" />
              Generate Final Report
            </button>

            <button
              onClick={onRecommendAward}
              disabled={!hasPermission || !selectedVendor}
              className={`
                inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm
                ${!hasPermission || !selectedVendor
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-white bg-blue-600 hover:bg-blue-700'
                }
              `}
            >
              <Award className="w-4 h-4" />
              Recommend Award
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
