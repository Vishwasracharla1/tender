import { AlertTriangle, UserX } from 'lucide-react';

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
  const getBiasColor = (score: number) => {
    if (score > 70) return 'text-red-700 bg-red-50 border-red-200';
    if (score > 40) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-yellow-700 bg-yellow-50 border-yellow-200';
  };

  const getBiasLabel = (score: number) => {
    if (score > 70) return 'Critical';
    if (score > 40) return 'High';
    return 'Moderate';
  };

  if (evaluators.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserX className="w-5 h-5 text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900">Red List - Flagged Evaluators</h2>
        </div>
        <div className="text-center py-8">
          <UserX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No flagged evaluators in this selection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UserX className="w-5 h-5 text-red-600" />
          <h2 className="text-base font-semibold text-gray-900">Red List - Flagged Evaluators</h2>
        </div>
        <span className="px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-full border border-red-200">
          {evaluators.length} flagged
        </span>
      </div>

      <div className="space-y-3">
        {evaluators.map((evaluator) => (
          <div
            key={evaluator.id}
            className={`p-4 rounded-lg border-l-4 ${getBiasColor(evaluator.biasScore)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {evaluator.name}
                  </h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getBiasColor(evaluator.biasScore)}`}>
                    {getBiasLabel(evaluator.biasScore)}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2 text-xs text-gray-600">
                  <span>{evaluator.department}</span>
                  <span className="text-gray-300">•</span>
                  <span>{evaluator.alertCount} active alerts</span>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  {evaluator.reason}
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Bias Score:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${evaluator.biasScore > 70 ? 'bg-red-600' : evaluator.biasScore > 40 ? 'bg-orange-600' : 'bg-yellow-600'}`}
                        style={{ width: `${evaluator.biasScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-900">
                      {evaluator.biasScore}/100
                    </span>
                  </div>
                </div>
              </div>

              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Evaluators are flagged based on bias scores above 40/100 and patterns of suspicious scoring behavior.
          Consider recusal from future evaluations or additional oversight.
        </p>
      </div>
    </div>
  );
}
