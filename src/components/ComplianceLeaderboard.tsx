import { Trophy, TrendingUp, Award } from 'lucide-react';

interface DepartmentCompliance {
  departmentName: string;
  complianceScore: number;
  totalTenders: number;
  compliantTenders: number;
  onTimeRate: number;
  policyAdherence: number;
  riskMitigation: number;
  rank: number;
}

interface ComplianceLeaderboardProps {
  data: DepartmentCompliance[];
}

export function ComplianceLeaderboard({ data }: ComplianceLeaderboardProps) {
  const sortedData = [...data].sort((a, b) => a.rank - b.rank);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <Award className="w-4 h-4 text-gray-400" />;
      case 3:
        return <Award className="w-4 h-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50';
    if (score >= 75) return 'text-blue-600 bg-blue-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            Department Compliance Leaderboard
          </h3>
          <span className="text-xs text-gray-500">
            {data.length} departments
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {sortedData.map((dept) => (
          <div
            key={dept.departmentName}
            className={`p-4 hover:bg-gray-50 transition-colors ${
              dept.rank <= 3 ? 'bg-blue-50/30' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 flex items-center justify-center">
                {dept.rank <= 3 ? (
                  <div className="flex items-center gap-1">
                    {getRankBadge(dept.rank)}
                    <span className="text-sm font-bold text-gray-900">
                      #{dept.rank}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-gray-500">
                    #{dept.rank}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {dept.departmentName}
                  </h4>
                  <span className={`px-2 py-1 text-sm font-bold rounded-lg ${getScoreColor(dept.complianceScore)}`}>
                    {dept.complianceScore.toFixed(0)}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-xs text-gray-600 mb-0.5">Tenders</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {dept.compliantTenders}/{dept.totalTenders}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-xs text-gray-600 mb-0.5">On-Time</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {dept.onTimeRate.toFixed(0)}%
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-xs text-gray-600 mb-0.5">Policy</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {dept.policyAdherence.toFixed(0)}%
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-xs text-gray-600 mb-0.5">Risk</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {dept.riskMitigation.toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${dept.complianceScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedData.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500">No compliance data available</p>
        </div>
      )}
    </div>
  );
}
