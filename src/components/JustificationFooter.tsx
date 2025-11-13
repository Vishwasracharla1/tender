import { FileText, Download } from 'lucide-react';

interface JustificationFooterProps {
  tenderId: string;
  phase: string;
  status: 'draft' | 'review' | 'finalized';
  onFinalize: () => void;
  onExportPDF: () => void;
}

export function JustificationFooter({
  tenderId,
  phase,
  status,
  onFinalize,
  onExportPDF,
}: JustificationFooterProps) {
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
                <span
                  className={`
                    inline-block w-2 h-2 rounded-full
                    ${status === 'finalized' ? 'bg-emerald-600' : status === 'review' ? 'bg-yellow-600' : 'bg-gray-400'}
                  `}
                />
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {status}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExportPDF}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>

            <button
              onClick={onFinalize}
              disabled={status === 'finalized'}
              className={`
                inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm
                ${status === 'finalized'
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-white bg-blue-600 hover:bg-blue-700'
                }
              `}
            >
              <FileText className="w-4 h-4" />
              {status === 'finalized' ? 'Report Finalized' : 'Finalize Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
