import { LucideIcon } from 'lucide-react';

interface KPIWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export function KPIWidget({ title, value, subtitle, icon: Icon, trend, onClick }: KPIWidgetProps) {
  const normalizedTitle = title.toLowerCase();

  const themes: Record<
    string,
    {
      card: string;
      accent: string;
      iconBg: string;
      iconColor: string;
      titleColor: string;
      valueColor: string;
      subtitleColor: string;
      trendBadge: string;
      trendText: string;
    }
  > = {
    'active tenders': {
      card: 'bg-gradient-to-br from-emerald-50 via-white to-emerald-100 border border-emerald-100 shadow-[0_18px_40px_rgba(5,150,105,0.15)]',
      accent: 'from-emerald-400 via-emerald-300 to-teal-400',
      iconBg: 'from-emerald-500 to-teal-500',
      iconColor: 'text-white',
      titleColor: 'text-emerald-700',
      valueColor: 'text-emerald-900',
      subtitleColor: 'text-emerald-700',
      trendBadge: 'bg-emerald-100 text-emerald-700',
      trendText: 'text-emerald-600',
    },
    'avg eval duration': {
      card: 'bg-gradient-to-br from-violet-50 via-white to-indigo-100 border border-violet-100 shadow-[0_18px_40px_rgba(109,40,217,0.14)]',
      accent: 'from-violet-400 via-indigo-400 to-purple-400',
      iconBg: 'from-indigo-500 to-purple-500',
      iconColor: 'text-white',
      titleColor: 'text-indigo-700',
      valueColor: 'text-indigo-900',
      subtitleColor: 'text-indigo-700',
      trendBadge: 'bg-indigo-100 text-indigo-700',
      trendText: 'text-indigo-600',
    },
    'compliance rate': {
      card: 'bg-gradient-to-br from-sky-50 via-white to-blue-100 border border-sky-100 shadow-[0_18px_40px_rgba(14,165,233,0.14)]',
      accent: 'from-sky-400 via-blue-400 to-cyan-400',
      iconBg: 'from-sky-500 to-blue-500',
      iconColor: 'text-white',
      titleColor: 'text-blue-700',
      valueColor: 'text-blue-900',
      subtitleColor: 'text-blue-700',
      trendBadge: 'bg-sky-100 text-sky-700',
      trendText: 'text-sky-600',
    },
    'critical alerts': {
      card: 'bg-gradient-to-br from-rose-50 via-white to-amber-100 border border-rose-100 shadow-[0_18px_40px_rgba(239,68,68,0.12)]',
      accent: 'from-rose-400 via-orange-400 to-amber-400',
      iconBg: 'from-rose-500 to-orange-500',
      iconColor: 'text-white',
      titleColor: 'text-rose-700',
      valueColor: 'text-rose-900',
      subtitleColor: 'text-rose-700',
      trendBadge: 'bg-rose-100 text-rose-700',
      trendText: 'text-rose-600',
    },
    'active vendors': {
      card: 'bg-gradient-to-br from-emerald-50 via-white to-emerald-100 border border-emerald-100 shadow-[0_18px_40px_rgba(5,150,105,0.15)]',
      
      accent: 'from-teal-400 via-cyan-400 to-emerald-400',
      iconBg: 'from-teal-500 to-cyan-500',
      iconColor: 'text-white',
      titleColor: 'text-teal-700',
      valueColor: 'text-teal-900',
      subtitleColor: 'text-teal-700',
      trendBadge: 'bg-teal-100 text-teal-700',
      trendText: 'text-teal-600',
    },
    'avg bid value': {
      card: 'bg-gradient-to-br from-amber-50 via-white to-yellow-100 border border-amber-100 shadow-[0_18px_40px_rgba(245,158,11,0.16)]',
      accent: 'from-amber-400 via-yellow-400 to-orange-400',
      iconBg: 'from-amber-500 to-orange-500',
      iconColor: 'text-white',
      titleColor: 'text-amber-700',
      valueColor: 'text-amber-900',
      subtitleColor: 'text-amber-700',
      trendBadge: 'bg-amber-100 text-amber-700',
      trendText: 'text-amber-600',
    },
    'top performer': {
      card: 'bg-gradient-to-br from-sky-50 via-white to-blue-100 border border-sky-100 shadow-[0_18px_40px_rgba(14,165,233,0.14)]',
      accent: 'from-sky-400 via-blue-400 to-cyan-400',
      iconBg: 'from-sky-500 to-blue-500',
      iconColor: 'text-white',
      titleColor: 'text-blue-700',
      valueColor: 'text-blue-900',
      subtitleColor: 'text-blue-700',
      trendBadge: 'bg-sky-100 text-sky-700',
      trendText: 'text-sky-600',
    },
    'risk vendors': {
      card: 'bg-gradient-to-br from-rose-50 via-white to-red-100 border border-red-100 shadow-[0_18px_40px_rgba(248,113,113,0.14)]',
      accent: 'from-red-400 via-rose-400 to-orange-400',
      iconBg: 'from-red-500 to-rose-500',
      iconColor: 'text-white',
      titleColor: 'text-red-700',
      valueColor: 'text-red-900',
      subtitleColor: 'text-red-700',
      trendBadge: 'bg-red-100 text-red-700',
      trendText: 'text-red-600',
    },
    'bids validated': {
      card: 'bg-gradient-to-br from-emerald-50 via-white to-emerald-100 border border-emerald-100 shadow-[0_18px_40px_rgba(5,150,105,0.15)]',
      accent: 'from-emerald-400 via-emerald-300 to-teal-400',
      iconBg: 'from-emerald-500 to-teal-500',
      iconColor: 'text-white',
      titleColor: 'text-emerald-700',
      valueColor: 'text-emerald-900',
      subtitleColor: 'text-emerald-700',
      trendBadge: 'bg-emerald-100 text-emerald-700',
      trendText: 'text-emerald-600',
    },
    'avg validation time': {
      card: 'bg-gradient-to-br from-violet-50 via-white to-indigo-100 border border-violet-100 shadow-[0_18px_40px_rgba(109,40,217,0.14)]',
      accent: 'from-violet-400 via-indigo-400 to-purple-400',
      iconBg: 'from-indigo-500 to-purple-500',
      iconColor: 'text-white',
      titleColor: 'text-indigo-700',
      valueColor: 'text-indigo-900',
      subtitleColor: 'text-indigo-700',
      trendBadge: 'bg-indigo-100 text-indigo-700',
      trendText: 'text-indigo-600',
    },
    'total errors': {
      card: 'bg-gradient-to-br from-rose-50 via-white to-amber-100 border border-rose-100 shadow-[0_18px_40px_rgba(239,68,68,0.12)]',
      accent: 'from-rose-400 via-orange-400 to-amber-400',
      iconBg: 'from-rose-500 to-orange-500',
      iconColor: 'text-white',
      titleColor: 'text-rose-700',
      valueColor: 'text-rose-900',
      subtitleColor: 'text-rose-700',
      trendBadge: 'bg-rose-100 text-rose-700',
      trendText: 'text-rose-600',
    },
    'weight alignment': {
      card: 'bg-gradient-to-br from-blue-50 via-white to-cyan-100 border border-blue-100 shadow-[0_18px_40px_rgba(37,99,235,0.15)]',
      accent: 'from-blue-400 via-cyan-400 to-blue-400',
      iconBg: 'from-blue-500 to-cyan-500',
      iconColor: 'text-white',
      titleColor: 'text-blue-700',
      valueColor: 'text-blue-900',
      subtitleColor: 'text-blue-700',
      trendBadge: 'bg-blue-100 text-blue-700 border border-blue-200',
      trendText: 'text-blue-600',
    },
    'evaluator variance': {
      card: 'bg-gradient-to-br from-purple-50 via-white to-purple-100 border border-purple-200 shadow-[0_18px_40px_rgba(147,51,234,0.15)]',
      accent: 'from-purple-400 via-purple-500 to-purple-400',
      iconBg: 'from-purple-500 to-purple-600',
      iconColor: 'text-white',
      titleColor: 'text-purple-700',
      valueColor: 'text-purple-900',
      subtitleColor: 'text-purple-700',
      trendBadge: 'bg-purple-100 text-purple-700 border border-purple-200',
      trendText: 'text-purple-600',
    },
    'processing time saved': {
      card: 'bg-gradient-to-br from-emerald-50 via-white to-teal-100 border border-emerald-100 shadow-[0_18px_40px_rgba(5,150,105,0.15)]',
      accent: 'from-emerald-400 via-teal-400 to-emerald-400',
      iconBg: 'from-emerald-500 to-teal-500',
      iconColor: 'text-white',
      titleColor: 'text-emerald-700',
      valueColor: 'text-emerald-900',
      subtitleColor: 'text-emerald-700',
      trendBadge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      trendText: 'text-emerald-600',
    },
    'avg price deviation': {
      card: 'bg-gradient-to-br from-orange-50 via-white to-amber-100 border border-orange-100 shadow-[0_18px_40px_rgba(249,115,22,0.15)]',
      accent: 'from-orange-400 via-amber-400 to-orange-400',
      iconBg: 'from-orange-500 to-amber-500',
      iconColor: 'text-white',
      titleColor: 'text-orange-700',
      valueColor: 'text-orange-900',
      subtitleColor: 'text-orange-700',
      trendBadge: 'bg-orange-100 text-orange-700 border border-orange-200',
      trendText: 'text-orange-600',
    },
    'outlier count': {
      card: 'bg-gradient-to-br from-rose-50 via-white to-red-100 border border-rose-100 shadow-[0_18px_40px_rgba(239,68,68,0.15)]',
      accent: 'from-rose-400 via-red-400 to-rose-400',
      iconBg: 'from-rose-500 to-red-500',
      iconColor: 'text-white',
      titleColor: 'text-rose-700',
      valueColor: 'text-rose-900',
      subtitleColor: 'text-rose-700',
      trendBadge: 'bg-rose-100 text-rose-700 border border-rose-200',
      trendText: 'text-rose-600',
    },
    'benchmark accuracy': {
      card: 'bg-gradient-to-br from-blue-50 via-white to-cyan-100 border border-blue-100 shadow-[0_18px_40px_rgba(37,99,235,0.15)]',
      accent: 'from-blue-400 via-cyan-400 to-blue-400',
      iconBg: 'from-blue-500 to-cyan-500',
      iconColor: 'text-white',
      titleColor: 'text-blue-700',
      valueColor: 'text-blue-900',
      subtitleColor: 'text-blue-700',
      trendBadge: 'bg-blue-100 text-blue-700 border border-blue-200',
      trendText: 'text-blue-600',
    },
    'avg bias score': {
      card: 'bg-gradient-to-br from-slate-50 via-white to-slate-100 border border-slate-200 shadow-[0_18px_40px_rgba(15,23,42,0.12)]',
      accent: 'from-slate-400 via-slate-500 to-slate-400',
      iconBg: 'from-slate-500 to-slate-700',
      iconColor: 'text-white',
      titleColor: 'text-slate-700',
      valueColor: 'text-slate-900',
      subtitleColor: 'text-slate-600',
      trendBadge: 'bg-slate-100 text-slate-700 border border-slate-200',
      trendText: 'text-slate-600',
    },
    'collusion probability': {
      card: 'bg-gradient-to-br from-red-50 via-white to-rose-100 border border-red-200 shadow-[0_18px_40px_rgba(239,68,68,0.15)]',
      accent: 'from-red-400 via-rose-400 to-red-400',
      iconBg: 'from-red-500 to-rose-600',
      iconColor: 'text-white',
      titleColor: 'text-red-700',
      valueColor: 'text-red-900',
      subtitleColor: 'text-red-700',
      trendBadge: 'bg-red-100 text-red-700 border border-red-200',
      trendText: 'text-red-600',
    },
    'resolution rate': {
      card: 'bg-gradient-to-br from-emerald-50 via-white to-teal-100 border border-emerald-100 shadow-[0_18px_40px_rgba(5,150,105,0.15)]',
      accent: 'from-emerald-400 via-teal-400 to-emerald-400',
      iconBg: 'from-emerald-500 to-teal-500',
      iconColor: 'text-white',
      titleColor: 'text-emerald-700',
      valueColor: 'text-emerald-900',
      subtitleColor: 'text-emerald-700',
      trendBadge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      trendText: 'text-emerald-600',
    },
    'auto-generation coverage': {
      card: 'bg-gradient-to-br from-blue-50 via-white to-indigo-100 border border-blue-100 shadow-[0_18px_40px_rgba(37,99,235,0.15)]',
      accent: 'from-blue-400 via-indigo-400 to-blue-400',
      iconBg: 'from-blue-500 to-indigo-500',
      iconColor: 'text-white',
      titleColor: 'text-blue-700',
      valueColor: 'text-blue-900',
      subtitleColor: 'text-blue-700',
      trendBadge: 'bg-blue-100 text-blue-700 border border-blue-200',
      trendText: 'text-blue-600',
    },
    'approval rate': {
      card: 'bg-gradient-to-br from-emerald-50 via-white to-teal-100 border border-emerald-100 shadow-[0_18px_40px_rgba(5,150,105,0.15)]',
      accent: 'from-emerald-400 via-teal-400 to-emerald-400',
      iconBg: 'from-emerald-500 to-teal-500',
      iconColor: 'text-white',
      titleColor: 'text-emerald-700',
      valueColor: 'text-emerald-900',
      subtitleColor: 'text-emerald-700',
      trendBadge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      trendText: 'text-emerald-600',
    },
    'avg clarity score': {
      card: 'bg-gradient-to-br from-purple-50 via-white to-violet-100 border border-purple-100 shadow-[0_18px_40px_rgba(147,51,234,0.15)]',
      accent: 'from-purple-400 via-violet-400 to-purple-400',
      iconBg: 'from-purple-500 to-violet-500',
      iconColor: 'text-white',
      titleColor: 'text-purple-700',
      valueColor: 'text-purple-900',
      subtitleColor: 'text-purple-700',
      trendBadge: 'bg-purple-100 text-purple-700 border border-purple-200',
      trendText: 'text-purple-600',
    },
    'best value index': {
      card: 'bg-gradient-to-br from-emerald-50 via-white to-teal-100 border border-emerald-100 shadow-[0_18px_40px_rgba(5,150,105,0.15)]',
      accent: 'from-emerald-400 via-teal-400 to-emerald-400',
      iconBg: 'from-emerald-500 to-teal-500',
      iconColor: 'text-white',
      titleColor: 'text-emerald-700',
      valueColor: 'text-emerald-900',
      subtitleColor: 'text-emerald-700',
      trendBadge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      trendText: 'text-emerald-600',
    },
    'predicted reliability': {
      card: 'bg-gradient-to-br from-blue-50 via-white to-indigo-100 border border-blue-100 shadow-[0_18px_40px_rgba(37,99,235,0.15)]',
      accent: 'from-blue-400 via-indigo-400 to-blue-400',
      iconBg: 'from-blue-500 to-indigo-500',
      iconColor: 'text-white',
      titleColor: 'text-blue-700',
      valueColor: 'text-blue-900',
      subtitleColor: 'text-blue-700',
      trendBadge: 'bg-blue-100 text-blue-700 border border-blue-200',
      trendText: 'text-blue-600',
    },
    'cost saving': {
      card: 'bg-gradient-to-br from-amber-50 via-white to-orange-100 border border-amber-100 shadow-[0_18px_40px_rgba(245,158,11,0.15)]',
      accent: 'from-amber-400 via-orange-400 to-amber-400',
      iconBg: 'from-amber-500 to-orange-500',
      iconColor: 'text-white',
      titleColor: 'text-amber-700',
      valueColor: 'text-amber-900',
      subtitleColor: 'text-amber-700',
      trendBadge: 'bg-amber-100 text-amber-700 border border-amber-200',
      trendText: 'text-amber-600',
    },
    'active agents': {
      card: 'bg-gradient-to-br from-blue-50 via-white to-cyan-100 border border-blue-100 shadow-[0_18px_40px_rgba(37,99,235,0.15)]',
      accent: 'from-blue-400 via-cyan-400 to-blue-400',
      iconBg: 'from-blue-500 to-cyan-500',
      iconColor: 'text-white',
      titleColor: 'text-blue-700',
      valueColor: 'text-blue-900',
      subtitleColor: 'text-blue-700',
      trendBadge: 'bg-blue-100 text-blue-700 border border-blue-200',
      trendText: 'text-blue-600',
    },
    'tasks processed': {
      card: 'bg-gradient-to-br from-purple-50 via-white to-indigo-100 border border-purple-100 shadow-[0_18px_40px_rgba(147,51,234,0.15)]',
      accent: 'from-purple-400 via-indigo-400 to-purple-400',
      iconBg: 'from-purple-500 to-indigo-500',
      iconColor: 'text-white',
      titleColor: 'text-purple-700',
      valueColor: 'text-purple-900',
      subtitleColor: 'text-purple-700',
      trendBadge: 'bg-purple-100 text-purple-700 border border-purple-200',
      trendText: 'text-purple-600',
    },
    'avg success rate': {
      card: 'bg-gradient-to-br from-emerald-50 via-white to-teal-100 border border-emerald-100 shadow-[0_18px_40px_rgba(5,150,105,0.15)]',
      accent: 'from-emerald-400 via-teal-400 to-emerald-400',
      iconBg: 'from-emerald-500 to-teal-500',
      iconColor: 'text-white',
      titleColor: 'text-emerald-700',
      valueColor: 'text-emerald-900',
      subtitleColor: 'text-emerald-700',
      trendBadge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      trendText: 'text-emerald-600',
    },
    'total integrations': {
      card: 'bg-gradient-to-br from-indigo-50 via-white to-purple-100 border border-indigo-100 shadow-[0_18px_40px_rgba(99,102,241,0.15)]',
      accent: 'from-indigo-400 via-purple-400 to-indigo-400',
      iconBg: 'from-indigo-500 to-purple-500',
      iconColor: 'text-white',
      titleColor: 'text-indigo-700',
      valueColor: 'text-indigo-900',
      subtitleColor: 'text-indigo-700',
      trendBadge: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
      trendText: 'text-indigo-600',
    },
    'records synced': {
      card: 'bg-gradient-to-br from-blue-50 via-white to-cyan-100 border border-blue-100 shadow-[0_18px_40px_rgba(37,99,235,0.15)]',
      accent: 'from-blue-400 via-cyan-400 to-blue-400',
      iconBg: 'from-blue-500 to-cyan-500',
      iconColor: 'text-white',
      titleColor: 'text-blue-700',
      valueColor: 'text-blue-900',
      subtitleColor: 'text-blue-700',
      trendBadge: 'bg-blue-100 text-blue-700 border border-blue-200',
      trendText: 'text-blue-600',
    },
    'system types': {
      card: 'bg-gradient-to-br from-violet-50 via-white to-purple-100 border border-violet-100 shadow-[0_18px_40px_rgba(139,92,246,0.15)]',
      accent: 'from-violet-400 via-purple-400 to-violet-400',
      iconBg: 'from-violet-500 to-purple-500',
      iconColor: 'text-white',
      titleColor: 'text-violet-700',
      valueColor: 'text-violet-900',
      subtitleColor: 'text-violet-700',
      trendBadge: 'bg-violet-100 text-violet-700 border border-violet-200',
      trendText: 'text-violet-600',
    },
    'avg sync time': {
      card: 'bg-gradient-to-br from-slate-50 via-white to-slate-100 border border-slate-200 shadow-[0_18px_40px_rgba(15,23,42,0.12)]',
      accent: 'from-slate-400 via-slate-500 to-slate-400',
      iconBg: 'from-slate-500 to-slate-700',
      iconColor: 'text-white',
      titleColor: 'text-slate-700',
      valueColor: 'text-slate-900',
      subtitleColor: 'text-slate-600',
      trendBadge: 'bg-slate-100 text-slate-700 border border-slate-200',
      trendText: 'text-slate-600',
    },
    default: {
      card: 'bg-white border border-gray-200 shadow-[0_18px_40px_rgba(15,23,42,0.08)]',
      accent: 'from-slate-300 via-slate-200 to-slate-400',
      iconBg: 'from-slate-600 to-slate-800',
      iconColor: 'text-white',
      titleColor: 'text-slate-600',
      valueColor: 'text-slate-900',
      subtitleColor: 'text-slate-600',
      trendBadge: 'bg-slate-100 text-slate-700',
      trendText: 'text-slate-600',
    },
  };

  const theme = themes[normalizedTitle] ?? themes.default;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-6 transition-all duration-300
        ${theme.card}
        ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl' : 'hover:shadow-xl'}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${theme.titleColor} mb-2`}>
            {title}
          </p>
          <p className={`text-3xl font-bold leading-tight ${theme.valueColor} mb-1`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs font-medium ${theme.subtitleColor}`}>{subtitle}</p>
          )}
        </div>

        <div className="flex-shrink-0 ml-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${theme.iconBg} flex items-center justify-center shadow-inner`}>
            <Icon className={`w-7 h-7 ${theme.iconColor}`} />
          </div>
        </div>
      </div>

      {trend && (
        <div className="mt-5 flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border ${theme.trendBadge}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className={`text-xs font-medium ${theme.trendText}`}>vs last week</span>
        </div>
      )}
    </div>
  );
}
