import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface ValidationItem {
  label: string;
  status: 'completed' | 'pending' | 'warning' | 'error';
}

interface ValidationPanelProps {
  items: ValidationItem[];
}

export function ValidationPanel({ items }: ValidationPanelProps) {
  const getIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-white" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-white" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-white" />;
      default:
        return <Info className="w-5 h-5 text-white" />;
    }
  };

  const getStatusTheme = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          iconBg: 'from-emerald-500 to-teal-500',
          cardBg: 'bg-gradient-to-br from-emerald-50 via-white to-emerald-100',
          border: 'border-emerald-200',
          text: 'text-emerald-900',
          labelBg: 'bg-emerald-100',
          labelText: 'text-emerald-700',
        };
      case 'warning':
        return {
          iconBg: 'from-amber-500 to-orange-500',
          cardBg: 'bg-gradient-to-br from-amber-50 via-white to-orange-100',
          border: 'border-amber-200',
          text: 'text-amber-900',
          labelBg: 'bg-amber-100',
          labelText: 'text-amber-700',
        };
      case 'error':
        return {
          iconBg: 'from-red-500 to-rose-500',
          cardBg: 'bg-gradient-to-br from-red-50 via-white to-rose-100',
          border: 'border-red-200',
          text: 'text-red-900',
          labelBg: 'bg-red-100',
          labelText: 'text-red-700',
        };
      default:
        return {
          iconBg: 'from-slate-500 to-slate-600',
          cardBg: 'bg-gradient-to-br from-slate-50 via-white to-slate-100',
          border: 'border-slate-200',
          text: 'text-slate-900',
          labelBg: 'bg-slate-100',
          labelText: 'text-slate-700',
        };
    }
  };

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-indigo-50 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className="relative px-6 py-4 border-b border-white/40 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-inner">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">
            Validation Checklist
          </h2>
        </div>
      </div>

      <div className="p-6 space-y-2">
        {items.map((item, index) => {
          const theme = getStatusTheme(item.status);
          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${theme.cardBg} ${theme.border} shadow-sm`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${theme.iconBg} flex items-center justify-center shadow-inner`}>
                {getIcon(item.status)}
              </div>
              <span className={`text-sm font-semibold ${theme.text}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
