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
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-900 bg-emerald-50';
      case 'warning':
        return 'text-yellow-900 bg-yellow-50';
      case 'error':
        return 'text-red-900 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900">
          Validation Checklist
        </h2>
      </div>

      <div className="divide-y divide-gray-100">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0">
              {getIcon(item.status)}
            </div>
            <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
