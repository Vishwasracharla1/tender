import { createBrowserRouter, Navigate, useNavigate } from 'react-router-dom';
import { TenderIntakePage } from '../pages/TenderIntakePage';
import { EvaluationMatrixPage } from '../pages/EvaluationMatrixPage';
import { BenchmarkDashboardPage } from '../pages/BenchmarkDashboardPage';
import { IntegrityAnalyticsPage } from '../pages/IntegrityAnalyticsPage';
import { JustificationComposerPage } from '../pages/JustificationComposerPage';
import { AwardSimulationPage } from '../pages/AwardSimulationPage';
import { LeadershipDashboardPage } from '../pages/LeadershipDashboardPage';
import { AgentMonitoringPage } from '../pages/AgentMonitoringPage';
import { IntegrationManagementPage } from '../pages/IntegrationManagementPage';
import { TenderArticlePage } from '../pages/TenderArticlePage';
import { TenderOverviewPage } from '../pages/TenderOverviewPage';
import { EvaluationBreakdownPage } from '../pages/EvaluationBreakdownPage';
import { EvaluationRecommendationPage } from '../pages/EvaluationRecommendationPage';
import { CompanyDetailPage } from '../pages/CompanyDetailPage';
import { LoginPage } from '../pages/LoginPage';
import { AdminPanelPage } from '../pages/AdminPanelPage';
import { VendorIntakePage } from '../pages/VendorIntakePage';
import { ProtectedRoute } from '../components/ProtectedRoute';

  // Helper function to create navigation handler
  const createNavigateHandler = (navigate: ReturnType<typeof useNavigate>) => {
    return (page: string) => {
      const pathMap: Record<string, string> = {
        'leadership': '/',
        'intake': '/intake',
        'tender-overview': '/tender-overview',
        'tender-article': '/tender-article',
        'vendor-intake': '/vendor-intake',
        'evaluation': '/evaluation',
        'evaluation-breakdown': '/evaluation-breakdown',
        'evaluation-recommendation': '/evaluation-recommendation',
        'benchmark': '/benchmark',
        'integrity': '/integrity',
        'justification': '/justification',
        'award': '/award',
        'monitoring': '/monitoring',
        'integration': '/integration',
        'admin': '/admin',
      };
      const path = pathMap[page] || '/';
      navigate(path);
    };
  };

// Wrapper components to handle navigation
const LeadershipDashboardWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = createNavigateHandler(navigate);
  return <LeadershipDashboardPage onNavigate={handleNavigate} />;
};

const TenderIntakeWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = createNavigateHandler(navigate);
  return <TenderIntakePage onNavigate={handleNavigate} />;
};

const TenderOverviewWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = createNavigateHandler(navigate);
  return <TenderOverviewPage onNavigate={handleNavigate} />;
};

const TenderArticleWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = createNavigateHandler(navigate);
  return <TenderArticlePage onNavigate={handleNavigate} />;
};

const EvaluationMatrixWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = createNavigateHandler(navigate);
  return <EvaluationMatrixPage onNavigate={handleNavigate} />;
};

const BenchmarkDashboardWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = createNavigateHandler(navigate);
  return <BenchmarkDashboardPage onNavigate={handleNavigate} />;
};

const IntegrityAnalyticsWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = createNavigateHandler(navigate);
  return <IntegrityAnalyticsPage onNavigate={handleNavigate} />;
};

const JustificationComposerWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = createNavigateHandler(navigate);
  return <JustificationComposerPage onNavigate={handleNavigate} />;
};

const AwardSimulationWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = createNavigateHandler(navigate);
  return <AwardSimulationPage onNavigate={handleNavigate} />;
};

const AgentMonitoringWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = createNavigateHandler(navigate);
  return <AgentMonitoringPage onNavigate={handleNavigate} />;
};

const IntegrationManagementWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = createNavigateHandler(navigate);
  return <IntegrationManagementPage onNavigate={handleNavigate} />;
};

const EvaluationBreakdownWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = createNavigateHandler(navigate);
  return <EvaluationBreakdownPage onNavigate={handleNavigate} />;
};

const EvaluationRecommendationWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = createNavigateHandler(navigate);
  return <EvaluationRecommendationPage onNavigate={handleNavigate} />;
};

const CompanyDetailWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = createNavigateHandler(navigate);
  return <CompanyDetailPage onNavigate={handleNavigate} />;
};

const AdminPanelWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = createNavigateHandler(navigate);
  return <AdminPanelPage onNavigate={handleNavigate} />;
};

const VendorIntakeWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = createNavigateHandler(navigate);
  return <VendorIntakePage onNavigate={handleNavigate} />;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />, // Public route - accessible without authentication
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <LeadershipDashboardWrapper />
      </ProtectedRoute>
    ),
  },
  {
    path: '/intake',
    element: (
      <ProtectedRoute>
        <TenderIntakeWrapper />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tender-overview',
    element: (
      <ProtectedRoute>
        <TenderOverviewWrapper />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tender-article',
    element: (
      <ProtectedRoute>
        <TenderArticleWrapper />
      </ProtectedRoute>
    ),
  },
  {
    path: '/evaluation',
    element: (
      <ProtectedRoute>
        <EvaluationMatrixWrapper />
      </ProtectedRoute>
    ),
  },
  {
    path: '/evaluation-breakdown',
    element: (
      <ProtectedRoute>
        <EvaluationBreakdownWrapper />
      </ProtectedRoute>
    ),
  },
  {
    path: '/evaluation-recommendation',
    element: (
      <ProtectedRoute>
        <EvaluationRecommendationWrapper />
      </ProtectedRoute>
    ),
  },
  {
    path: '/company/:companyName',
    element: (
      <ProtectedRoute>
        <CompanyDetailWrapper />
      </ProtectedRoute>
    ),
  },
  {
    path: '/benchmark',
    element: (
      <ProtectedRoute>
        <BenchmarkDashboardWrapper />
      </ProtectedRoute>
    ),
  },
  {
    path: '/integrity',
    element: (
      <ProtectedRoute>
        <IntegrityAnalyticsWrapper />
      </ProtectedRoute>
    ),
  },
  {
    path: '/justification',
    element: (
      <ProtectedRoute>
        <JustificationComposerWrapper />
      </ProtectedRoute>
    ),
  },
  {
    path: '/award',
    element: (
      <ProtectedRoute>
        <AwardSimulationWrapper />
      </ProtectedRoute>
    ),
  },
  {
    path: '/monitoring',
    element: (
      <ProtectedRoute>
        <AgentMonitoringWrapper />
      </ProtectedRoute>
    ),
  },
  {
    path: '/integration',
    element: (
      <ProtectedRoute>
        <IntegrationManagementWrapper />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminPanelWrapper />
      </ProtectedRoute>
    ),
  },
  {
    path: '/vendor-intake',
    element: (
      <ProtectedRoute>
        <VendorIntakeWrapper />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
