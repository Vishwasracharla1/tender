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
      card: 'bg-gradient-to-br from-teal-50 via-white to-cyan-100 border border-teal-100 shadow-[0_18px_40px_rgba(20,184,166,0.14)]',
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
      card: 'bg-gradient-to-br from-fuchsia-50 via-white to-pink-100 border border-fuchsia-100 shadow-[0_18px_40px_rgba(232,121,249,0.14)]',
      accent: 'from-fuchsia-400 via-pink-400 to-rose-400',
      iconBg: 'from-fuchsia-500 to-pink-500',
      iconColor: 'text-white',
      titleColor: 'text-fuchsia-700',
      valueColor: 'text-fuchsia-900',
      subtitleColor: 'text-fuchsia-700',
      trendBadge: 'bg-fuchsia-100 text-fuchsia-700',
      trendText: 'text-fuchsia-600',
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
        overflow-hidden rounded-2xl p-5 transition-all duration-300
        ${theme.card}
        ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${theme.titleColor}`}>
            {title}
          </p>
          <p className={`mt-2.5 text-2xl font-semibold leading-tight ${theme.valueColor}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`mt-1.5 text-xs font-medium ${theme.subtitleColor}`}>{subtitle}</p>
          )}
        </div>

        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.iconBg} flex items-center justify-center shadow-inner`}>
            <Icon className={`w-6 h-6 ${theme.iconColor}`} />
          </div>
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${theme.trendBadge}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className={`text-xs font-medium ${theme.trendText}`}>vs last week</span>
        </div>
      )}
    </div>
  );
}
