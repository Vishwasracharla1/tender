import { Trophy, TrendingUp, Award, FileText, Clock, Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  }),
};

const metricPalette = {
  tenders: {
    card: 'bg-gradient-to-br from-indigo-50 via-white to-indigo-100 border border-indigo-100',
    iconBg: 'from-indigo-500 to-purple-500',
    iconColor: 'text-white',
    titleColor: 'text-indigo-700',
    valueColor: 'text-indigo-900',
    icon: FileText,
  },
  onTime: {
    card: 'bg-gradient-to-br from-sky-50 via-white to-blue-100 border border-sky-100',
    iconBg: 'from-sky-500 to-blue-500',
    iconColor: 'text-white',
    titleColor: 'text-sky-700',
    valueColor: 'text-sky-900',
    icon: Clock,
  },
  policy: {
    card: 'bg-gradient-to-br from-violet-50 via-white to-purple-100 border border-violet-100',
    iconBg: 'from-violet-500 to-purple-500',
    iconColor: 'text-white',
    titleColor: 'text-violet-700',
    valueColor: 'text-violet-900',
    icon: Shield,
  },
  risk: {
    card: 'bg-gradient-to-br from-amber-50 via-white to-orange-100 border border-amber-100',
    iconBg: 'from-amber-500 to-orange-500',
    iconColor: 'text-white',
    titleColor: 'text-amber-700',
    valueColor: 'text-amber-900',
    icon: AlertTriangle,
  },
};

const shimmerVariants = {
  initial: { x: '-100%' },
  animate: {
    x: '150%',
    transition: {
      repeat: Infinity,
      duration: 2.8,
      ease: 'linear' as const,
    },
  },
};

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
    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-indigo-50 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <motion.div
          className="absolute inset-y-0 -left-1/3 w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent blur-3xl"
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
        />
      </div>

      <div className="relative px-6 py-4 border-b border-white/40 flex items-center justify-between backdrop-blur-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
            Live Compliance Pulse
          </p>
          <h3 className="text-lg font-bold text-slate-900">
            Department Compliance Leaderboard
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Updated moments ago
          </div>
          <span className="px-3 py-1 rounded-full bg-white/70 border border-indigo-100 text-slate-800 font-semibold shadow-sm">
            {data.length} departments
          </span>
        </div>
      </div>

      <div className="relative divide-y divide-white/40">
        {sortedData.map((dept, index) => (
          <motion.div
            key={dept.departmentName}
            className={`group relative px-6 py-4 transition-all duration-300 ${dept.rank <= 3 ? 'bg-gradient-to-r from-indigo-50/70 via-white to-transparent' : 'bg-white/90'} hover:shadow-lg hover:-translate-y-0.5`}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl border border-white/60 bg-white shadow-inner flex flex-col items-center justify-center text-slate-700 font-bold">
                {dept.rank <= 3 ? (
                  <div className="flex items-center gap-1 text-sm">
                    {getRankBadge(dept.rank)}
                    <span>#{dept.rank}</span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-slate-500">
                    #{dept.rank}
                  </span>
                )}
                <span className="text-[10px] tracking-wide text-slate-400">
                  Rank
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Division
                    </p>
                    <h4 className="text-base font-semibold text-slate-900">
                      {dept.departmentName}
                    </h4>
                  </div>
                  <div className={`px-3 py-1.5 text-base font-black rounded-2xl shadow-inner border ${getScoreColor(dept.complianceScore)}`}>
                    {dept.complianceScore.toFixed(0)}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    {
                      key: 'tenders' as const,
                      label: 'Tenders',
                      value: `${dept.compliantTenders}/${dept.totalTenders}`,
                    },
                    {
                      key: 'onTime' as const,
                      label: 'On-Time',
                      value: `${dept.onTimeRate.toFixed(0)}%`,
                    },
                    {
                      key: 'policy' as const,
                      label: 'Policy',
                      value: `${dept.policyAdherence.toFixed(0)}%`,
                    },
                    {
                      key: 'risk' as const,
                      label: 'Risk',
                      value: `${dept.riskMitigation.toFixed(0)}%`,
                    },
                  ].map((metric) => {
                    const theme = metricPalette[metric.key];
                    const Icon = theme.icon;
                    return (
                      <div
                        key={metric.key}
                        className={`rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 ${theme.card}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${theme.titleColor}`}>
                              {metric.label}
                            </p>
                            <p className={`mt-2 text-xl font-semibold leading-tight ${theme.valueColor}`}>
                              {metric.value}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.iconBg} flex items-center justify-center shadow-inner`}>
                              <Icon className={`w-5 h-5 ${theme.iconColor}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Compliance trajectory</span>
                    <span className="font-semibold text-slate-700">
                      {dept.complianceScore.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 border border-white/70 overflow-hidden relative">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 shadow-md"
                      style={{ width: `${dept.complianceScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
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
