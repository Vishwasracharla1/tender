import { useState } from 'react';
import { Sparkles, Edit2 } from 'lucide-react';

interface Criterion {
  id: string;
  name: string;
  weight: number;
}

interface Vendor {
  id: string;
  name: string;
}

interface Score {
  criterionId: string;
  vendorId: string;
  score: number;
  aiConfidence: number;
  isAiGenerated: boolean;
}

interface EvaluationMatrixProps {
  criteria: Criterion[];
  vendors: Vendor[];
  scores: Score[];
  isLocked: boolean;
  onWeightChange: (criterionId: string, weight: number) => void;
  onScoreChange: (criterionId: string, vendorId: string, score: number) => void;
}

export function EvaluationMatrix({
  criteria,
  vendors,
  scores,
  isLocked,
  onWeightChange,
  onScoreChange,
}: EvaluationMatrixProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const getScore = (criterionId: string, vendorId: string): Score | undefined => {
    return scores.find(
      (s) => s.criterionId === criterionId && s.vendorId === vendorId
    );
  };

  const handleScoreClick = (criterionId: string, vendorId: string) => {
    if (!isLocked) {
      setEditingCell(`${criterionId}-${vendorId}`);
    }
  };

  const handleScoreChange = (
    criterionId: string,
    vendorId: string,
    value: string
  ) => {
    const numValue = Math.min(100, Math.max(0, parseFloat(value) || 0));
    onScoreChange(criterionId, vendorId, numValue);
  };

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-900">
                    Criteria
                  </span>
                  <span className="text-xs text-gray-500">
                    Total: {totalWeight.toFixed(0)}%
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 text-center w-24">
                <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  Weight
                </span>
              </th>
              {vendors.map((vendor) => (
                <th key={vendor.id} className="px-4 py-3 text-center w-32">
                  <span className="text-sm font-semibold text-gray-900">
                    {vendor.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {criteria.map((criterion, idx) => (
              <tr key={criterion.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <span className="text-sm font-medium text-gray-900">
                    {criterion.name}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={criterion.weight}
                      onChange={(e) =>
                        onWeightChange(criterion.id, parseFloat(e.target.value))
                      }
                      disabled={isLocked}
                      className="w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-xs font-medium text-gray-700">
                      {criterion.weight.toFixed(0)}%
                    </span>
                  </div>
                </td>
                {vendors.map((vendor) => {
                  const scoreData = getScore(criterion.id, vendor.id);
                  const cellKey = `${criterion.id}-${vendor.id}`;
                  const isEditing = editingCell === cellKey;

                  return (
                    <td key={vendor.id} className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <div
                          className={`
                            relative rounded-lg border transition-colors
                            ${isLocked
                              ? 'bg-gray-50 border-gray-200'
                              : 'bg-white border-gray-300 hover:border-emerald-500 cursor-pointer'
                            }
                          `}
                          onClick={() => handleScoreClick(criterion.id, vendor.id)}
                        >
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={scoreData?.score || 0}
                              onChange={(e) =>
                                handleScoreChange(
                                  criterion.id,
                                  vendor.id,
                                  e.target.value
                                )
                              }
                              onBlur={() => setEditingCell(null)}
                              autoFocus
                              className="w-full px-3 py-2 text-sm font-medium text-center text-gray-900 bg-white border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          ) : (
                            <div className="px-3 py-2 flex items-center justify-center gap-1">
                              <span className="text-sm font-medium text-gray-900">
                                {scoreData?.score?.toFixed(1) || '0.0'}
                              </span>
                              {!isLocked && (
                                <Edit2 className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                          )}
                        </div>

                        {scoreData?.isAiGenerated && (
                          <div className="flex items-center gap-1 justify-center">
                            <Sparkles className="w-3 h-3 text-blue-600" />
                            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden max-w-[60px]">
                              <div
                                className="h-full bg-blue-600 transition-all"
                                style={{
                                  width: `${(scoreData.aiConfidence || 0) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {((scoreData.aiConfidence || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
