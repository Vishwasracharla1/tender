import { X, LucideIcon } from 'lucide-react';

interface KPIDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: LucideIcon;
  mainValue: string | number;
  details: {
    label: string;
    value: string | number;
    description?: string;
  }[];
}

export function KPIDetailModal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  mainValue,
  details,
}: KPIDetailModalProps) {
  if (!isOpen) return null;

  type Theme = {
    container: string;
    iconWrap: string;
    iconColor: string;
    titleColor: string;
    valueColor: string;
    detailBg: string;
    detailTitle: string;
    detailValue: string;
    detailText: string;
  };

  const themeCatalog: Record<string, Theme> = {
    emerald: {
      container: 'from-emerald-50 via-white to-emerald-100',
      iconWrap: 'from-emerald-400 to-teal-400',
      iconColor: 'text-white',
      titleColor: 'text-emerald-700',
      valueColor: 'text-emerald-900',
      detailBg: 'from-white via-emerald-50/80 to-emerald-100/70',
      detailTitle: 'text-emerald-800',
      detailValue: 'text-emerald-900',
      detailText: 'text-emerald-700',
    },
    amber: {
      container: 'from-amber-50 via-white to-yellow-100',
      iconWrap: 'from-amber-400 to-orange-400',
      iconColor: 'text-white',
      titleColor: 'text-amber-700',
      valueColor: 'text-amber-900',
      detailBg: 'from-white via-amber-50/80 to-yellow-100/70',
      detailTitle: 'text-amber-800',
      detailValue: 'text-amber-900',
      detailText: 'text-amber-700',
    },
    fuchsia: {
      container: 'from-sky-50 via-white to-cyan-100',
      iconWrap: 'from-sky-400 to-blue-400',
      iconColor: 'text-white',
      titleColor: 'text-sky-700',
      valueColor: 'text-sky-900',
      detailBg: 'from-white via-sky-50/80 to-blue-100/70',
      detailTitle: 'text-sky-800',
      detailValue: 'text-sky-900',
      detailText: 'text-sky-700',
    },
    indigo: {
      container: 'from-indigo-50 via-white to-purple-100',
      iconWrap: 'from-indigo-400 to-purple-400',
      iconColor: 'text-white',
      titleColor: 'text-indigo-700',
      valueColor: 'text-indigo-900',
      detailBg: 'from-white via-indigo-50/90 to-purple-50/90',
      detailTitle: 'text-indigo-800',
      detailValue: 'text-indigo-900',
      detailText: 'text-indigo-600',
    },
    sky: {
      container: 'from-sky-50 via-white to-cyan-100',
      iconWrap: 'from-sky-400 to-blue-400',
      iconColor: 'text-white',
      titleColor: 'text-sky-700',
      valueColor: 'text-sky-900',
      detailBg: 'from-white via-sky-50/90 to-blue-50/80',
      detailTitle: 'text-sky-800',
      detailValue: 'text-sky-900',
      detailText: 'text-sky-600',
    },
    rose: {
      container: 'from-rose-50 via-white to-amber-100',
      iconWrap: 'from-rose-400 to-amber-400',
      iconColor: 'text-white',
      titleColor: 'text-rose-700',
      valueColor: 'text-rose-900',
      detailBg: 'from-white via-rose-50/90 to-amber-50/80',
      detailTitle: 'text-rose-800',
      detailValue: 'text-rose-900',
      detailText: 'text-rose-600',
    },
    slate: {
      container: 'from-white via-slate-50 to-slate-100',
      iconWrap: 'from-slate-500 to-slate-700',
      iconColor: 'text-white',
      titleColor: 'text-slate-800',
      valueColor: 'text-slate-900',
      detailBg: 'from-white via-slate-50/90 to-slate-100/80',
      detailTitle: 'text-slate-700',
      detailValue: 'text-slate-900',
      detailText: 'text-slate-500',
    },
  };

  const themeRules: { keywords: string[]; theme: Theme }[] = [
    { keywords: ['processing time saved', 'time saved'], theme: themeCatalog.emerald },
    { keywords: ['active tender', 'active vendor', 'vendor analytics'], theme: themeCatalog.emerald },
    { keywords: ['bid value', 'avg bid', 'saving'], theme: themeCatalog.amber },
    { keywords: ['top performer', 'performer', 'top vendor'], theme: themeCatalog.fuchsia },
    { keywords: ['duration', 'time'], theme: themeCatalog.indigo },
    { keywords: ['compliance', 'alignment'], theme: themeCatalog.sky },
    { keywords: ['alert', 'risk'], theme: themeCatalog.rose },
  ];

  const normalizedTitle = title.toLowerCase();
  const matchedRule =
    themeRules.find((rule) =>
      rule.keywords.some((keyword) => normalizedTitle.includes(keyword))
    ) ?? null;

  const theme = matchedRule?.theme ?? themeCatalog.slate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/20 backdrop-blur"
        onClick={onClose}
      />

      <div
        className={`
          relative rounded-3xl border border-white/40 shadow-[0_35px_100px_rgba(15,23,42,0.25)] max-w-xl w-full mx-4
          max-h-[90vh] overflow-hidden backdrop-blur-xl bg-gradient-to-br ${theme.container}
        `}
      >
        <div className="sticky top-0 bg-white/60 backdrop-blur px-6 py-5 flex items-center justify-between border-b border-white/50">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.iconWrap} flex items-center justify-center shadow-inner`}>
              <Icon className={`w-6 h-6 ${theme.iconColor}`} />
            </div>
            <div>
              <p className={`text-xs font-semibold tracking-[0.3em] uppercase ${theme.titleColor}`}>
                Insight
              </p>
              <h2 className={`text-xl font-semibold ${theme.titleColor}`}>{title}</h2>
              <p className={`text-3xl font-bold mt-1 ${theme.valueColor}`}>{mainValue}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/70 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {details.map((detail, index) => (
            <div
              key={index}
              className={`
                rounded-2xl border border-white/60 p-4 flex items-center justify-between gap-4
                bg-gradient-to-br ${theme.detailBg} shadow-[0_15px_35px_rgba(15,23,42,0.08)]
              `}
            >
              <div className="flex-1">
                <p className={`text-xs font-semibold tracking-wide ${theme.detailTitle}`}>
                  {detail.label}
                </p>
                {detail.description && (
                  <p className={`text-sm font-medium mt-1 ${theme.detailText}`}>
                    {detail.description}
                  </p>
                )}
              </div>
              <span className={`text-xl font-semibold ${theme.detailValue}`}>
                {detail.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
