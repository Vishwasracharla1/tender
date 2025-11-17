import { X, GitCompare, Sparkles, FileCheck } from 'lucide-react';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionTitle: string;
  aiDraft: string;
  finalContent: string;
}

export function ComparisonModal({ isOpen, onClose, sectionTitle, aiDraft, finalContent }: ComparisonModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.25)] max-w-6xl w-full max-h-[90vh] overflow-hidden border-2 border-slate-200">
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-b-2 border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-inner">
                <GitCompare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Compare: {sectionTitle}
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">Side-by-side version comparison</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/80 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x-2 divide-slate-200 overflow-hidden bg-white">
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-inner">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  AI Draft
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                Original Version
              </span>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="p-5 rounded-xl border-2 border-blue-200 bg-white shadow-sm">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {aiDraft || 'No AI draft available'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-inner">
                  <FileCheck className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  Final Content
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 shadow-sm">
                Current Version
              </span>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="p-5 rounded-xl border-2 border-emerald-200 bg-white shadow-sm">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {finalContent || 'No content yet'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t-2 border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
