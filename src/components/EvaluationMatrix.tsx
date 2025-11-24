import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import evaluationCategories from '../data/evaluationCategories';
import { Sparkles, Edit2, BarChart3 } from 'lucide-react';

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
  const navigate = useNavigate();

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
    <div className="relative rounded-2xl border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className="relative px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-inner">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Evaluation Matrix
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Total Weight: {totalWeight.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-left">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-900">
                    Criteria
                  </span>
                </div>
              </th>
              <th className="px-4 py-4 text-center w-28">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Weight
                </span>
              </th>
              {vendors.map((vendor) => (
                <th key={vendor.id} className="px-4 py-4 text-center w-36">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {vendor.name}
                    </span>
                    <div className="w-12 h-1 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full"></div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {criteria.map((criterion) => (
              <tr key={criterion.id} className="hover:bg-slate-50 transition-all duration-200">
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      // try to find a matching category by exact match or by membership in subCategories
                      const exact = evaluationCategories.find((c) => c.category.toLowerCase() === criterion.name.toLowerCase());
                      const containing = evaluationCategories.find((c) => c.subCategories.some((s) => s.toLowerCase() === criterion.name.toLowerCase()));
                      const match = exact || containing || null;
                      if (match) {
                        navigate(`/categories/${encodeURIComponent(match.category)}`, { state: { subData: match.subCategories } });
                      } else {
                        // fallback: open categories page without data
                        navigate('/categories');
                      }
                    }}
                    className="text-left w-full"
                  >
                    <span className="text-sm font-semibold text-gray-900 underline hover:text-indigo-600">
                      {criterion.name}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-24">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={criterion.weight}
                        onChange={(e) =>
                          onWeightChange(criterion.id, parseFloat(e.target.value))
                        }
                        disabled={isLocked}
                        className="w-full h-2 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-emerald-500 [&::-webkit-slider-thumb]:to-teal-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                        style={{
                          background: `linear-gradient(to right, rgb(16, 185, 129) 0%, rgb(16, 185, 129) ${criterion.weight}%, rgb(229, 231, 235) ${criterion.weight}%, rgb(229, 231, 235) 100%)`
                        }}
                      />
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full border border-emerald-200">
                      {criterion.weight.toFixed(0)}%
                    </span>
                  </div>
                </td>
                {vendors.map((vendor) => {
                  const scoreData = getScore(criterion.id, vendor.id);
                  const cellKey = `${criterion.id}-${vendor.id}`;
                  const isEditing = editingCell === cellKey;
                  const score = scoreData?.score || 0;
                  const percentage = score;
                  const scoreColor = percentage >= 80 ? 'from-emerald-500 to-teal-500' : 
                                   percentage >= 60 ? 'from-blue-500 to-cyan-500' : 
                                   percentage >= 40 ? 'from-amber-500 to-orange-500' : 
                                   'from-rose-500 to-red-500';
                  const scoreBg = percentage >= 80 ? 'from-emerald-50 to-teal-50 border-emerald-200' : 
                                 percentage >= 60 ? 'from-blue-50 to-cyan-50 border-blue-200' : 
                                 percentage >= 40 ? 'from-amber-50 to-orange-50 border-amber-200' : 
                                 'from-rose-50 to-red-50 border-rose-200';

                  return (
                    <td key={vendor.id} className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <div
                          className={`
                            relative rounded-xl border-2 transition-all duration-200
                            ${isLocked
                              ? `bg-gradient-to-br ${scoreBg}`
                              : `bg-gradient-to-br ${scoreBg} hover:shadow-md hover:-translate-y-0.5 cursor-pointer`
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
                              className="w-full px-4 py-2.5 text-base font-bold text-center text-gray-900 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          ) : (
                            <div className="px-4 py-2.5 flex items-center justify-center gap-2">
                              <span className="text-base font-bold text-gray-900">
                                {scoreData?.score?.toFixed(1) || '0.0'}
                              </span>
                              {!isLocked && (
                                <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                              )}
                            </div>
                          )}
                        </div>

                        {scoreData?.isAiGenerated && (
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-inner">
                              <Sparkles className="w-2.5 h-2.5 text-white" />
                            </div>
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden max-w-[70px] shadow-inner">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 shadow-sm"
                                style={{
                                  width: `${(scoreData.aiConfidence || 0) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-blue-700">
                              {((scoreData.aiConfidence || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}

                        {!scoreData?.isAiGenerated && score > 0 && (
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                            <div
                              className={`h-full bg-gradient-to-r ${scoreColor} transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
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
