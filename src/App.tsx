import { useState } from 'react';
import { TenderIntakePage } from './pages/TenderIntakePage';
import { EvaluationMatrixPage } from './pages/EvaluationMatrixPage';
import { BenchmarkDashboardPage } from './pages/BenchmarkDashboardPage';
import { IntegrityAnalyticsPage } from './pages/IntegrityAnalyticsPage';
import { JustificationComposerPage } from './pages/JustificationComposerPage';
import { AwardSimulationPage } from './pages/AwardSimulationPage';
import { LeadershipDashboardPage } from './pages/LeadershipDashboardPage';
import { AgentMonitoringPage } from './pages/AgentMonitoringPage';
import { IntegrationManagementPage } from './pages/IntegrationManagementPage';

type Page = 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('leadership');

  if (currentPage === 'integration') {
    return <IntegrationManagementPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'monitoring') {
    return <AgentMonitoringPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'leadership') {
    return <LeadershipDashboardPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'award') {
    return <AwardSimulationPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'justification') {
    return <JustificationComposerPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'integrity') {
    return <IntegrityAnalyticsPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'benchmark') {
    return <BenchmarkDashboardPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'evaluation') {
    return <EvaluationMatrixPage onNavigate={setCurrentPage} />;
  }

  return <TenderIntakePage onNavigate={setCurrentPage} />;
}

export default App;
