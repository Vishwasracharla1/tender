import { FileText, BarChart3, TrendingUp, ShieldAlert, FileEdit, Award, LayoutDashboard, Activity, Plug, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  currentPage: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration';
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration') => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    {
      id: 'leadership' as const,
      label: 'Leadership Dashboard',
      icon: LayoutDashboard,
      description: 'Executive Overview',
    },
    {
      id: 'intake' as const,
      label: 'Tender Intake',
      icon: FileText,
      description: 'Upload & Validate',
    },
    {
      id: 'evaluation' as const,
      label: 'Evaluation Matrix',
      icon: BarChart3,
      description: 'Score & Compare',
    },
    {
      id: 'benchmark' as const,
      label: 'Benchmark Dashboard',
      icon: TrendingUp,
      description: 'Market Analysis',
    },
    {
      id: 'integrity' as const,
      label: 'Integrity Analytics',
      icon: ShieldAlert,
      description: 'Fraud Detection',
    },
    {
      id: 'justification' as const,
      label: 'Justification Composer',
      icon: FileEdit,
      description: 'Report Writing',
    },
    {
      id: 'award' as const,
      label: 'Award Simulation',
      icon: Award,
      description: 'Scenario Analysis',
    },
    {
      id: 'monitoring' as const,
      label: 'Agent Monitoring',
      icon: Activity,
      description: 'AI Performance',
    },
    {
      id: 'integration' as const,
      label: 'Integration Management',
      icon: Plug,
      description: 'System Integrations',
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-gray-600" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600" />
        )}
      </button>

      <aside
        className={`
          fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-40 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 pt-20 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-900">
              Tender Evaluation
            </h1>
            <p className="text-xs text-gray-500 mt-1">System Dashboard</p>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left
                    ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      isActive ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        isActive ? 'text-emerald-900' : 'text-gray-900'
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                <span className="text-xs font-semibold text-white">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">Evaluation Chair</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-20 z-30 lg:hidden"
        />
      )}
    </>
  );
}
