import { Sidebar } from '../components/Sidebar';
import { EvaluationBreakdown } from '../components/EvaluationBreakdown';

interface EvaluationBreakdownPageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration' | 'tender-article' | 'tender-overview' | 'evaluation-breakdown') => void;
}

export function EvaluationBreakdownPage({ onNavigate }: EvaluationBreakdownPageProps) {
  return (
    <>
      <Sidebar currentPage="evaluation" onNavigate={onNavigate} />
      <div className="app-shell min-h-screen bg-gray-50 pb-24">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Evaluation Breakdown
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Detailed Evaluation Analysis
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <EvaluationBreakdown />
        </main>
      </div>
    </>
  );
}

