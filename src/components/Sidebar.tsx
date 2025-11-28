import { FileText, BarChart3, TrendingUp, ShieldAlert, FileEdit, Award, LayoutDashboard, Activity, Plug, Menu, X, ClipboardList, FileSearch, LogOut, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface SidebarProps {
  currentPage: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration' | 'tender-article' | 'tender-overview' | 'evaluation-breakdown' | 'evaluation-recommendation' | 'admin';
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration' | 'tender-article' | 'tender-overview' | 'evaluation-breakdown' | 'evaluation-recommendation' | 'admin') => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>(['evaluation']);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, canReadPage } = useAuthStore();

  // Map page IDs to page names for permission checking
  const pageIdToPageName: Record<string, string> = {
    'admin': 'Admin panel',
    'leadership': 'Leadership Dashboard',
    'intake': 'Tender Intake',
    'tender-overview': 'Tender Overview',
    'tender-article': 'Tender Article',
    'evaluation': 'Evaluation Matrix',
    'evaluation-breakdown': 'Evaluation Breakdown',
    'evaluation-recommendation': 'Evaluation Recommendation',
    'benchmark': 'Benchmark Dashboard',
    'integrity': 'Integrity Analytics',
    'justification': 'Justification Composer',
    'award': 'Award Simulation',
    'monitoring': 'Agent Monitoring',
    'integration': 'Integration Management',
  };

  // Map routes to page IDs
  const routeToPageId: Record<string, string> = {
    '/': 'leadership',
    '/intake': 'intake',
    '/tender-overview': 'tender-overview',
    '/tender-article': 'tender-article',
    '/evaluation': 'evaluation',
    '/evaluation-breakdown': 'evaluation-breakdown',
    '/evaluation-recommendation': 'evaluation-recommendation',
    '/benchmark': 'benchmark',
    '/integrity': 'integrity',
    '/justification': 'justification',
    '/award': 'award',
    '/monitoring': 'monitoring',
    '/integration': 'integration',
    '/admin': 'admin',
  };

  // Get current page from route
  const activePageId = routeToPageId[location.pathname] || 'leadership';

  useEffect(() => {
    const updateOffset = () => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      const offset = isDesktop && isOpen ? '16rem' : '0px';
      document.documentElement.style.setProperty('--sidebar-offset', offset);
    };

    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => {
      document.documentElement.style.setProperty('--sidebar-offset', '0px');
      window.removeEventListener('resize', updateOffset);
    };
  }, [isOpen]);

  const menuItems = [
    {
      id: 'admin' as const,
      label: 'Admin Panel',
      icon: Settings,
      description: 'User & Role Management',
      path: '/admin',
    },
    {
      id: 'leadership' as const,
      label: 'Leadership Dashboard',
      icon: LayoutDashboard,
      description: 'Executive Overview',
      path: '/',
    },
    {
      id: 'intake' as const,
      label: 'Tender Intake',
      icon: FileText,
      description: 'Upload & Validate',
      path: '/intake',
    },
    {
      id: 'tender-overview' as const,
      label: 'Tender Overview',
      icon: FileSearch,
      description: 'Evaluation Framework',
      path: '/tender-overview',
    },
    {
      id: 'tender-article' as const,
      label: 'Tender Article',
      icon: ClipboardList,
      description: 'Procurement Dashboard',
      path: '/tender-article',
    },
    {
      id: 'evaluation' as const,
      label: 'Evaluation Matrix',
      icon: BarChart3,
      description: 'Score & Compare',
      path: '/evaluation',
      subMenu: [
        {
          id: 'evaluation-breakdown' as const,
          label: 'Evaluation Breakdown',
          path: '/evaluation-breakdown',
        },
        {
          id: 'evaluation-recommendation' as const,
          label: 'Evaluation Recommendation',
          path: '/evaluation-recommendation',
        },
      ],
    },
    {
    //   id: 'benchmark' as const,
    //   label: 'Benchmark Dashboard',
    //   icon: TrendingUp,
    //   description: 'Market Analysis',
    //   path: '/benchmark',
    // },
    // {
      id: 'integrity' as const,
      label: 'Integrity Analytics',
      icon: ShieldAlert,
      description: 'Fraud Detection',
      path: '/integrity',
    },
    {
      id: 'justification' as const,
      label: 'Justification Composer',
      icon: FileEdit,
      description: 'Report Writing',
      path: '/justification',
    },
    {
      id: 'award' as const,
      label: 'Award Simulation',
      icon: Award,
      description: 'Scenario Analysis',
      path: '/award',
    },
    {
      id: 'monitoring' as const,
      label: 'Agent Monitoring',
      icon: Activity,
      description: 'AI Performance',
      path: '/monitoring',
    },
    {
      id: 'integration' as const,
      label: 'Integration Management',
      icon: Plug,
      description: 'System Integrations',
      path: '/integration',
    },
  ];

  // Filter menu items based on user permissions
  const filteredMenuItems = menuItems.filter((item) => {
    const pageName = pageIdToPageName[item.id];
    if (!pageName) return true; // Show items without page name mapping
    
    // Admin Panel is accessible to all authenticated users
    if (item.id === 'admin') {
      return true;
    }
    
    // Check if user has read access to this page
    return canReadPage(pageName);
  }).map((item) => {
    // Also filter submenu items
    if (item.subMenu) {
      const filteredSubMenu = item.subMenu.filter((subItem) => {
        const subPageName = pageIdToPageName[subItem.id];
        if (!subPageName) return true;
        return canReadPage(subPageName);
      });
      
      return {
        ...item,
        subMenu: filteredSubMenu.length > 0 ? filteredSubMenu : undefined,
      };
    }
    return item;
  }).filter((item) => {
    // Remove parent items if all submenu items are filtered out
    if (item.subMenu && item.subMenu.length === 0) {
      return false;
    }
    return true;
  });

  const handleNavigation = (pageId: string, path: string) => {
    navigate(path);
    onNavigate(pageId as any);
  };

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
            {filteredMenuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activePageId === item.id || (item.subMenu && item.subMenu.some(sub => activePageId === sub.id));
              const isExpanded = expandedItems.includes(item.id);
              const hasSubMenu = item.subMenu && item.subMenu.length > 0;

              return (
                <div key={item.id}>
                  <div className={`
                    group flex w-full items-start gap-3 p-3 rounded-xl border
                    transition-all duration-300 transform
                    ${
                      isActive && activePageId === item.id
                        ? 'bg-white text-slate-900 border-sky-100 shadow-lg'
                        : 'bg-white/60 text-slate-500 border-white/80 hover:bg-white hover:border-sky-100 hover:text-slate-800'
                    }
                  `}
                  style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <button
                      onClick={() => handleNavigation(item.id, item.path)}
                      className="flex-1 flex items-start gap-3 text-left"
                    >
                      <Icon
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          isActive && activePageId === item.id ? 'text-sky-500' : 'text-slate-400 group-hover:text-sky-500 transition-colors'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            isActive && activePageId === item.id ? 'text-slate-900' : 'text-slate-700'
                          }`}
                        >
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </button>
                    {hasSubMenu && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedItems(prev => 
                            prev.includes(item.id) 
                              ? prev.filter(id => id !== item.id)
                              : [...prev, item.id]
                          );
                        }}
                        className="p-1 hover:bg-white/50 rounded transition-colors"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {hasSubMenu && isExpanded && (
                    <div className="ml-4 mt-2 space-y-1">
                      {item.subMenu.map((subItem) => {
                        const isSubActive = activePageId === subItem.id;
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => handleNavigation(subItem.id, subItem.path)}
                            className={`
                              w-full text-left px-4 py-2 rounded-lg text-sm transition-all duration-200
                              ${
                                isSubActive
                                  ? 'bg-sky-50 text-sky-700 font-medium border-l-2 border-sky-500'
                                  : 'text-slate-600 hover:bg-white hover:text-slate-800'
                              }
                            `}
                          >
                            {subItem.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/60 space-y-2">
            <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl shadow-lg">
              <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center border border-sky-100">
                <span className="text-xs font-semibold text-slate-700 tracking-wide">
                  {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.username || 'User'}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.role || (user?.piref_role && user.piref_role[0]?.rolename) || 'User'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 bg-white/70 hover:bg-white rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center border border-red-100 group-hover:from-red-100 group-hover:to-rose-100 transition-colors">
                <LogOut className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-sm font-semibold text-slate-900">Logout</span>
            </button>
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
