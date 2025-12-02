import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import ProcurementDashboard from '../components/ProcurementDashboard';

interface TenderArticlePageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration' | 'tender-article' | 'tender-overview' | 'tender-prebidding') => void;
}

export function TenderArticlePage({ onNavigate }: TenderArticlePageProps) {
  const [tenderId] = useState('TND-2025-003 - IT Equipment Procurement');
  const [phase] = useState('Procurement Overview');

  return (
    <>
      <Sidebar currentPage="tender-article" onNavigate={onNavigate} />
      <div className="app-shell min-h-screen bg-gray-50 pb-24">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Procurement Dashboard
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                    GovernAI.Agent Active
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-gray-500">
                    Tender: <span className="font-medium text-gray-900">{tenderId}</span>
                  </p>
                  <span className="text-gray-300">•</span>
                  <p className="text-sm text-gray-500">
                    Phase: <span className="font-medium text-gray-900">{phase}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg border border-blue-200">
                  Executive Access
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <ProcurementDashboard />
        </main>
      </div>
    </>
  );
}

