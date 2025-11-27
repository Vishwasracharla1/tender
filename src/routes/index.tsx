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

// Helper function to create navigation handler
const createNavigateHandler = (navigate: ReturnType<typeof useNavigate>) => {
  return (page: string) => {
    const pathMap: Record<string, string> = {
      'leadership': '/',
      'intake': '/intake',
      'tender-overview': '/tender-overview',
      'tender-article': '/tender-article',
      'evaluation': '/evaluation',
      'evaluation-breakdown': '/evaluation-breakdown',
      'evaluation-recommendation': '/evaluation-recommendation',
      'benchmark': '/benchmark',
      'integrity': '/integrity',
      'justification': '/justification',
      'award': '/award',
      'monitoring': '/monitoring',
      'integration': '/integration',
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LeadershipDashboardWrapper />,
  },
  {
    path: '/intake',
    element: <TenderIntakeWrapper />,
  },
  {
    path: '/tender-overview',
    element: <TenderOverviewWrapper />,
  },
  {
    path: '/tender-article',
    element: <TenderArticleWrapper />,
  },
  {
    path: '/evaluation',
    element: <EvaluationMatrixWrapper />,
  },
  {
    path: '/evaluation-breakdown',
    element: <EvaluationBreakdownWrapper />,
  },
  {
    path: '/evaluation-recommendation',
    element: <EvaluationRecommendationWrapper />,
  },
  {
    path: '/company/:companyName',
    element: <CompanyDetailWrapper />,
  },
  {
    path: '/benchmark',
    element: <BenchmarkDashboardWrapper />,
  },
  {
    path: '/integrity',
    element: <IntegrityAnalyticsWrapper />,
  },
  {
    path: '/justification',
    element: <JustificationComposerWrapper />,
  },
  {
    path: '/award',
    element: <AwardSimulationWrapper />,
  },
  {
    path: '/monitoring',
    element: <AgentMonitoringWrapper />,
  },
  {
    path: '/integration',
    element: <IntegrationManagementWrapper />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
