import { createBrowserRouter, Navigate, useNavigate } from "react-router-dom";
import { TenderIntakePage } from "../pages/TenderIntakePage";
import { EvaluationMatrixPage } from "../pages/EvaluationMatrixPage";
import { BenchmarkDashboardPage } from "../pages/BenchmarkDashboardPage";
import { IntegrityAnalyticsPage } from "../pages/IntegrityAnalyticsPage";
import { JustificationComposerPage } from "../pages/JustificationComposerPage";
import { AwardSimulationPage } from "../pages/AwardSimulationPage";
import { LeadershipDashboardPage } from "../pages/LeadershipDashboardPage";
import { AgentMonitoringPage } from "../pages/AgentMonitoringPage";
import { IntegrationManagementPage } from "../pages/IntegrationManagementPage";
import { TenderArticlePage } from "../pages/TenderArticlePage";
import { TenderOverviewPage } from "../pages/TenderOverviewPage";
import CategoryList from "../pages/CategoryList";
import CategoryDetails from "../pages/CategoryDetail";

// Helper function
const createNavigateHandler = (navigate: ReturnType<typeof useNavigate>) => {
  return (page: string) => {
    const pathMap: Record<string, string> = {
      leadership: "/",
      intake: "/intake",
      "tender-overview": "/tender-overview",
      "tender-article": "/tender-article",
      evaluation: "/evaluation",
      benchmark: "/benchmark",
      integrity: "/integrity",
      justification: "/justification",
      award: "/award",
      monitoring: "/monitoring",
      integration: "/integration",
    };
    navigate(pathMap[page] || "/");
  };
};

// Wrapper HOC
const withNavigation = (Component: any) => {
  return () => {
    const navigate = useNavigate();
    const handleNavigate = createNavigateHandler(navigate);
    return <Component onNavigate={handleNavigate} />;
  };
};

// Wrapper versions of pages
const LeadershipDashboardWrapper = withNavigation(LeadershipDashboardPage);
const TenderIntakeWrapper = withNavigation(TenderIntakePage);
const TenderOverviewWrapper = withNavigation(TenderOverviewPage);
const TenderArticleWrapper = withNavigation(TenderArticlePage);
const EvaluationMatrixWrapper = withNavigation(EvaluationMatrixPage);
const BenchmarkDashboardWrapper = withNavigation(BenchmarkDashboardPage);
const IntegrityAnalyticsWrapper = withNavigation(IntegrityAnalyticsPage);
const JustificationComposerWrapper = withNavigation(JustificationComposerPage);
const AwardSimulationWrapper = withNavigation(AwardSimulationPage);
const AgentMonitoringWrapper = withNavigation(AgentMonitoringPage);
const IntegrationManagementWrapper = withNavigation(IntegrationManagementPage);

// ROUTES
export const router = createBrowserRouter([
  { path: "/", element: <LeadershipDashboardWrapper /> },
  { path: "/intake", element: <TenderIntakeWrapper /> },
  { path: "/tender-overview", element: <TenderOverviewWrapper /> },
  { path: "/tender-article", element: <TenderArticleWrapper /> },
  { path: "/evaluation", element: <EvaluationMatrixWrapper /> },
  { path: "/benchmark", element: <BenchmarkDashboardWrapper /> },
  { path: "/integrity", element: <IntegrityAnalyticsWrapper /> },
  { path: "/justification", element: <JustificationComposerWrapper /> },
  { path: "/award", element: <AwardSimulationWrapper /> },
  { path: "/monitoring", element: <AgentMonitoringWrapper /> },
  { path: "/integration", element: <IntegrationManagementWrapper /> },

  // Category routes
  { path: "/categories", element: <CategoryList /> },
  { path: "/categories/:categoryName", element: <CategoryDetails /> },

  { path: "*", element: <Navigate to="/" replace /> },
]);
