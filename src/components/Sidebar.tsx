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
          group fixed left-0 top-0 h-screen z-40 shadow-2xl transition-all duration-300
          bg-gradient-to-b from-sky-100 via-slate-50 to-white text-slate-800
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64 hover:w-72
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 pt-20 border-b border-white/30">
            <h1 className="text-lg font-semibold text-slate-900">
              Tender Evaluation
            </h1>
            <p className="text-xs text-slate-500 mt-1">System Dashboard</p>
          </div>

          <nav className="sidebar-scroll flex-1 p-4 space-y-3 overflow-y-auto pr-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    group flex w-full items-start gap-3 p-3 rounded-xl border text-left
                    transition-all duration-300 transform
                    ${
                      isActive
                        ? 'bg-white text-slate-900 border-sky-100 shadow-lg'
                        : 'bg-white/60 text-slate-500 border-white/80 hover:bg-white hover:border-sky-100 hover:text-slate-800 hover:-translate-y-0.5 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100'
                    }
                  `}
                  style={{ animationDelay: `${index * 60}ms` }}
                  data-active={isActive}
                >
                  <Icon
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      isActive ? 'text-sky-500' : 'text-slate-400 group-hover:text-sky-500 transition-colors'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        isActive ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/60">
            <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl shadow-lg">
              <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center border border-sky-100">
                <span className="text-xs font-semibold text-slate-700 tracking-wide">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">John Doe</p>
                <p className="text-xs text-slate-500">Evaluation Chair</p>
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
