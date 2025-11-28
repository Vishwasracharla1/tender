import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  pageName?: string; // Optional page name for permission checking
}

// Map routes to page names for permission checking
const routeToPageName: Record<string, string> = {
  '/': 'Leadership Dashboard',
  '/intake': 'Tender Intake',
  '/tender-overview': 'Tender Overview',
  '/tender-article': 'Tender Article',
  '/evaluation': 'Evaluation Matrix',
  '/evaluation-breakdown': 'Evaluation Breakdown',
  '/evaluation-recommendation': 'Evaluation Recommendation',
  '/benchmark': 'Benchmark Dashboard',
  '/integrity': 'Integrity Analytics',
  '/justification': 'Justification Composer',
  '/award': 'Award Simulation',
  '/monitoring': 'Agent Monitoring',
  '/integration': 'Integration Management',
  '/admin': 'Admin panel',
};

export function ProtectedRoute({ children, pageName }: ProtectedRouteProps) {
  const { isAuthenticated, canReadPage, getFirstAccessibleRoute } = useAuthStore();
  const location = useLocation();

  // Check authentication first
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Determine page name from prop or route
  const currentPageName = pageName || routeToPageName[location.pathname];

  // If page name is found, check permissions
  // Admin Panel is accessible to all authenticated users, so skip permission check
  if (currentPageName && !currentPageName.toLowerCase().includes('admin')) {
    if (!canReadPage(currentPageName)) {
      // Get first accessible route and redirect there
      const accessibleRoute = getFirstAccessibleRoute();
      
      if (accessibleRoute) {
        // Redirect to first accessible page
        return <Navigate to={accessibleRoute} replace />;
      }
      
      // If no accessible pages, show access denied
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Required permission: <code className="bg-gray-100 px-2 py-1 rounded">{currentPageName}_read</code>
            </p>
            <p className="text-xs text-gray-400">
              You don't have access to any pages. Please contact your administrator.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

