import { AlertTriangle, UserX } from 'lucide-react';
import { useState } from 'react';

interface FlaggedEvaluator {
  id: string;
  name: string;
  department: string;
  biasScore: number;
  alertCount: number;
  reason: string;
}

interface FlaggedEvaluatorsListProps {
  evaluators: FlaggedEvaluator[];
}

export function FlaggedEvaluatorsList({ evaluators }: FlaggedEvaluatorsListProps) {
  const [hoveredEvaluator, setHoveredEvaluator] = useState<string | null>(null);

  const getBiasColor = (score: number) => {
    if (score > 70) return {
      text: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200',
      gradient: 'from-red-50 via-white to-rose-50',
      badge: 'text-red-700 bg-red-100 border-red-300',
      progress: 'bg-gradient-to-r from-red-500 to-rose-600',
      iconBg: 'from-red-500 to-rose-600'
    };
    if (score > 40) return {
      text: 'text-orange-700',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      gradient: 'from-orange-50 via-white to-amber-50',
      badge: 'text-orange-700 bg-orange-100 border-orange-300',
      progress: 'bg-gradient-to-r from-orange-500 to-amber-600',
      iconBg: 'from-orange-500 to-amber-600'
    };
    return {
      text: 'text-yellow-700',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      gradient: 'from-yellow-50 via-white to-amber-50',
      badge: 'text-yellow-700 bg-yellow-100 border-yellow-300',
      progress: 'bg-gradient-to-r from-yellow-500 to-amber-600',
      iconBg: 'from-yellow-500 to-amber-600'
    };
  };

  const getBiasLabel = (score: number) => {
    if (score > 70) return 'Critical';
    if (score > 40) return 'High';
    return 'Moderate';
  };

  if (evaluators.length === 0) {
    return (
      <div className="relative rounded-2xl border border-red-200 bg-gradient-to-br from-white via-red-50/30 to-rose-50 shadow-[0_20px_45px_rgba(239,68,68,0.12)] overflow-hidden">
        <div className="relative px-6 py-4 border-b border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-inner">
              <UserX className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Red List - Flagged Evaluators</h2>
              <p className="text-xs text-gray-500 mt-0.5">Evaluators requiring oversight</p>
            </div>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center mx-auto mb-4">
            <UserX className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-sm font-medium text-gray-700">No flagged evaluators in this selection</p>
          <p className="text-xs text-gray-500 mt-1">All evaluators are within acceptable bias thresholds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-red-200 bg-gradient-to-br from-white via-red-50/30 to-rose-50 shadow-[0_20px_45px_rgba(239,68,68,0.12)] overflow-hidden h-full flex flex-col max-h-[600px]">
      <div className="relative px-6 py-4 border-b border-red-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-inner">
            <UserX className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Red List - Flagged Evaluators</h2>
            <p className="text-xs text-gray-500 mt-0.5">Evaluators requiring oversight</p>
          </div>
        </div>
        <span className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-lg border border-red-300 shadow-sm">
          {evaluators.length} flagged
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 min-h-0">
        {evaluators.map((evaluator) => {
          const colors = getBiasColor(evaluator.biasScore);
          const isHovered = hoveredEvaluator === evaluator.id;
          
          return (
            <div
              key={evaluator.id}
              onMouseEnter={() => setHoveredEvaluator(evaluator.id)}
              onMouseLeave={() => setHoveredEvaluator(null)}
              className={`
                relative rounded-xl border-2 p-4 transition-all duration-300
                bg-gradient-to-br ${colors.gradient}
                ${colors.border}
                ${isHovered ? 'shadow-lg scale-[1.02] -translate-y-0.5' : 'shadow-md'}
                border-l-4
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-bold text-gray-900">
                      {evaluator.name}
                    </h3>
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border shadow-sm ${colors.badge}`}>
                      {getBiasLabel(evaluator.biasScore)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2 text-xs">
                    <span className="font-medium text-gray-700">{evaluator.department}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-600">{evaluator.alertCount} active alerts</span>
                  </div>

                  <p className="text-xs leading-relaxed text-gray-700 mb-3">
                    {evaluator.reason}
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">Bias Score:</span>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full ${colors.progress} rounded-full transition-all duration-300`}
                          style={{ width: `${evaluator.biasScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-900 min-w-[50px] text-right">
                        {evaluator.biasScore}/100
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.iconBg} flex items-center justify-center shadow-inner flex-shrink-0`}>
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 py-4 border-t border-red-200/50 flex-shrink-0">
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="font-semibold">Note:</span> Evaluators are flagged based on bias scores above 40/100 and patterns of suspicious scoring behavior. Consider recusal from future evaluations or additional oversight.
        </p>
      </div>
    </div>
  );
}
