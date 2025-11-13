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
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 transition-all ${
        onClick ? 'hover:border-emerald-300 hover:shadow-md cursor-pointer' : 'hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
          )}
        </div>

        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span
            className={`text-xs font-medium ${
              trend.isPositive ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-xs text-gray-500 ml-1">vs last week</span>
        </div>
      )}
    </div>
  );
}
