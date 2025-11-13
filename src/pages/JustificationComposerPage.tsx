import { useState, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { KPIWidget } from '../components/KPIWidget';
import { DocumentEditor } from '../components/DocumentEditor';
import { ComparisonModal } from '../components/ComparisonModal';
import { JustificationKPIModal } from '../components/JustificationKPIModal';
import { JustificationFooter } from '../components/JustificationFooter';
import { FileText, CheckCircle, BarChart3, Filter } from 'lucide-react';
import { RAK_DEPARTMENTS } from '../data/departments';
import { getTenderById, MOCK_TENDERS } from '../data/mockTenderData';

interface JustificationComposerPageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership') => void;
}

export function JustificationComposerPage({ onNavigate }: JustificationComposerPageProps) {
  const [tenderId, setTenderId] = useState('TND-2025-001');
  const [status, setStatus] = useState<'draft' | 'review' | 'finalized'>('draft');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTenders = useMemo(() => {
    return MOCK_TENDERS.filter(tender => {
      if (selectedDepartment !== 'all' && tender.department !== selectedDepartment) return false;
      if (selectedCategory !== 'all' && tender.category !== selectedCategory) return false;
      return true;
    });
  }, [selectedDepartment, selectedCategory]);

  const currentTender = useMemo(() => getTenderById(tenderId), [tenderId]);
  const [comparisonModal, setComparisonModal] = useState<{
    isOpen: boolean;
    sectionId: string;
    sectionTitle: string;
    aiDraft: string;
    finalContent: string;
  }>({
    isOpen: false,
    sectionId: '',
    sectionTitle: '',
    aiDraft: '',
    finalContent: '',
  });

  const [kpiModal, setKpiModal] = useState<{
    isOpen: boolean;
    type: 'coverage' | 'approval' | 'clarity';
  }>({
    isOpen: false,
    type: 'coverage',
  });

  const [sections, setSections] = useState([
    {
      id: '1',
      title: 'Technical Capability - Acme Corp',
      aiDraft: 'Acme Corp demonstrates strong technical capability through their extensive experience in enterprise software development. Their portfolio includes 15+ years of delivering scalable solutions to Fortune 500 companies. The vendor showcased proficiency in cloud infrastructure, microservices architecture, and DevOps practices. Their technical team comprises 120+ certified professionals with expertise in modern frameworks and technologies.\n\nKey strengths include:\n- AWS and Azure cloud certifications across the team\n- Proven track record with similar scale projects\n- Robust security implementation methodologies\n- Continuous integration/deployment pipelines\n\nThe vendor scored 88/100 in technical capability, placing them in the top tier of evaluated vendors.',
      finalContent: 'Acme Corp demonstrates strong technical capability through their extensive experience in enterprise software development. Their portfolio includes 15+ years of delivering scalable solutions to Fortune 500 companies. The vendor showcased proficiency in cloud infrastructure, microservices architecture, and DevOps practices. Their technical team comprises 120+ certified professionals with expertise in modern frameworks and technologies.\n\nKey strengths include:\n- AWS and Azure cloud certifications across the team\n- Proven track record with similar scale projects\n- Robust security implementation methodologies\n- Continuous integration/deployment pipelines\n\nThe vendor scored 88/100 in technical capability, placing them in the top tier of evaluated vendors.',
      isEdited: false,
      wordCount: 118,
      comments: [],
    },
    {
      id: '2',
      title: 'Financial Stability - Acme Corp',
      aiDraft: 'Acme Corp presents solid financial stability with consistent revenue growth over the past 5 years. Annual revenue of $45M demonstrates substantial market presence. The company maintains healthy profit margins (22%) and strong cash flow position. Credit rating of A+ indicates low financial risk.\n\nFinancial highlights:\n- Year-over-year growth: 15%\n- Debt-to-equity ratio: 0.3\n- Working capital: $12M\n- Industry-leading retention rates\n\nScore: 85/100',
      finalContent: 'Acme Corp presents exceptional financial stability with consistent revenue growth over the past 5 years, demonstrating resilience even during economic downturns. Annual revenue of $45M demonstrates substantial market presence and competitive positioning. The company maintains healthy profit margins (22%) and strong cash flow position, ensuring project sustainability.\n\nTheir credit rating of A+ from major agencies indicates low financial risk and strong fiscal management. This rating has been maintained consistently for 3+ years.\n\nFinancial highlights:\n- Year-over-year growth: 15% (above industry average of 8%)\n- Debt-to-equity ratio: 0.3 (well below industry standard)\n- Working capital: $12M (sufficient for project scale)\n- Client retention rates: 94% (industry-leading)\n\nBased on comprehensive financial analysis, Acme Corp scored 85/100 in financial stability.',
      isEdited: true,
      wordCount: 145,
      comments: [
        {
          id: 'c1',
          author: 'Sarah Chen',
          content: 'Should we add information about their insurance coverage?',
          timestamp: '2 hours ago',
          isResolved: false,
        },
        {
          id: 'c2',
          author: 'Michael Ross',
          content: 'The debt-to-equity ratio comparison is helpful context.',
          timestamp: '1 hour ago',
          isResolved: true,
        },
      ],
    },
    {
      id: '3',
      title: 'ESG Compliance - Acme Corp',
      aiDraft: 'Acme Corp shows commitment to ESG principles with ISO 14001 environmental certification. Carbon neutral operations by 2025. Diverse workforce with 40% representation in leadership.\n\nESG initiatives:\n- Renewable energy usage: 65%\n- Supplier diversity program\n- Community investment: 2% of profits\n- Gender pay equity certified\n\nScore: 78/100',
      finalContent: 'Acme Corp shows commitment to ESG principles with ISO 14001 environmental certification. Carbon neutral operations by 2025. Diverse workforce with 40% representation in leadership.\n\nESG initiatives:\n- Renewable energy usage: 65%\n- Supplier diversity program\n- Community investment: 2% of profits\n- Gender pay equity certified\n\nScore: 78/100',
      isEdited: false,
      wordCount: 68,
      comments: [],
    },
    {
      id: '4',
      title: 'Innovation & R&D - BuildTech Ltd',
      aiDraft: 'BuildTech Ltd invests heavily in R&D (18% of revenue) focusing on emerging technologies. Active participation in industry standards committees. Patent portfolio includes 25 granted patents in relevant domains.\n\nInnovation capabilities:\n- AI/ML research team\n- Quantum computing exploration\n- Open source contributions\n- University partnerships\n\nScore: 82/100',
      finalContent: 'BuildTech Ltd invests heavily in R&D (18% of revenue) focusing on emerging technologies. Active participation in industry standards committees. Patent portfolio includes 25 granted patents in relevant domains.\n\nInnovation capabilities:\n- AI/ML research team\n- Quantum computing exploration\n- Open source contributions\n- University partnerships\n\nScore: 82/100',
      isEdited: false,
      wordCount: 58,
      comments: [],
    },
  ]);

  const handleSectionUpdate = (sectionId: string, content: string) => {
    setSections(prev =>
      prev.map(section => {
        if (section.id === sectionId) {
          const words = content.trim().split(/\s+/).length;
          return {
            ...section,
            finalContent: content,
            isEdited: content !== section.aiDraft,
            wordCount: words,
          };
        }
        return section;
      })
    );
  };

  const handleAddComment = (sectionId: string, commentText: string) => {
    setSections(prev =>
      prev.map(section => {
        if (section.id === sectionId) {
          const newComment = {
            id: `c${Date.now()}`,
            author: 'Current User',
            content: commentText,
            timestamp: 'Just now',
            isResolved: false,
          };
          return {
            ...section,
            comments: [...section.comments, newComment],
          };
        }
        return section;
      })
    );
  };

  const handleCompare = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setComparisonModal({
        isOpen: true,
        sectionId: section.id,
        sectionTitle: section.title,
        aiDraft: section.aiDraft,
        finalContent: section.finalContent,
      });
    }
  };

  const handleFinalize = () => {
    setStatus('finalized');
    alert('Report has been finalized and is ready for export!');
  };

  const handleExportPDF = () => {
    alert('Exporting report as PDF...');
  };

  const totalSections = sections.length;
  const aiGeneratedSections = sections.filter(s => s.aiDraft.length > 0).length;
  const autoGenerationCoverage = (aiGeneratedSections / totalSections) * 100;

  const editedSections = sections.filter(s => s.isEdited).length;
  const approvalRate = ((totalSections - editedSections) / totalSections) * 100;

  const avgClarityScore = 82.5;

  const kpiModalData = {
    coverage: {
      total: totalSections,
      generated: aiGeneratedSections,
      manual: totalSections - aiGeneratedSections,
      percentage: autoGenerationCoverage,
      byVendor: [
        { vendor: 'Acme Corp', sections: 3, autoGenerated: 3 },
        { vendor: 'BuildTech Ltd', sections: 1, autoGenerated: 1 },
      ],
      recentActivity: [
        { date: '2 hours ago', section: 'Technical Capability - Acme Corp', type: 'auto' as const },
        { date: '3 hours ago', section: 'Financial Stability - Acme Corp', type: 'auto' as const },
        { date: '4 hours ago', section: 'ESG Compliance - Acme Corp', type: 'auto' as const },
        { date: '5 hours ago', section: 'Innovation & R&D - BuildTech Ltd', type: 'auto' as const },
      ],
    },
    approval: {
      total: totalSections,
      unchanged: totalSections - editedSections,
      edited: editedSections,
      percentage: approvalRate,
      editStats: {
        minor: 3,
        moderate: 1,
        major: 0,
      },
      topAccepted: [
        { section: 'Technical Capability', vendor: 'Acme Corp', score: 100 },
        { section: 'ESG Compliance', vendor: 'Acme Corp', score: 100 },
        { section: 'Innovation & R&D', vendor: 'BuildTech Ltd', score: 100 },
      ],
      topEdited: [
        { section: 'Financial Stability', vendor: 'Acme Corp', changes: 8 },
      ],
    },
    clarity: {
      average: avgClarityScore,
      highest: { section: 'Financial Stability - Acme Corp', score: 92, vendor: 'Acme Corp' },
      lowest: { section: 'Innovation & R&D - BuildTech Ltd', score: 78, vendor: 'BuildTech Ltd' },
      distribution: [
        { range: '90-100 (Excellent)', count: 1, percentage: 25 },
        { range: '80-89 (Very Good)', count: 2, percentage: 50 },
        { range: '70-79 (Good)', count: 1, percentage: 25 },
      ],
      readabilityMetrics: [
        { metric: 'Avg Sentence Length', value: '18 words', status: 'good' as const },
        { metric: 'Complex Words', value: '12%', status: 'good' as const },
        { metric: 'Passive Voice', value: '8%', status: 'good' as const },
        { metric: 'Reading Level', value: 'Grade 12', status: 'fair' as const },
      ],
    },
  };

  return (
    <>
      <Sidebar currentPage="justification" onNavigate={onNavigate} />
      <div className="min-h-screen bg-gray-50 pb-24 lg:pl-64">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Justification Composer
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  JustifyAI.Agent Active
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`
                    px-3 py-1 text-xs font-medium rounded-full border
                    ${status === 'finalized'
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : status === 'review'
                      ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
                      : 'text-blue-700 bg-blue-50 border-blue-200'
                    }
                  `}
                >
                  {status === 'finalized' ? 'Finalized' : status === 'review' ? 'In Review' : 'Draft'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Departments</option>
                  {RAK_DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Categories</option>
                  <option value="WORKS">Works & Construction</option>
                  <option value="GOODS">Goods & Equipment</option>
                  <option value="SERVICES">Services & Consulting</option>
                  <option value="MAINTENANCE">Maintenance & Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Tender
                </label>
                <select
                  value={tenderId}
                  onChange={(e) => setTenderId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {filteredTenders.map((tender) => (
                    <option key={tender.id} value={tender.id}>
                      {tender.id} - {tender.title}
                    </option>
                  ))}
                  {filteredTenders.length === 0 && (
                    <option value="">No tenders match filters</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div onClick={() => setKpiModal({ isOpen: true, type: 'coverage' })} className="cursor-pointer transition-transform hover:scale-105">
              <KPIWidget
                title="Auto-Generation Coverage"
                value={`${autoGenerationCoverage.toFixed(0)}%`}
                subtitle={`${aiGeneratedSections}/${totalSections} sections • Click for details`}
                icon={FileText}
                trend={{ value: '25%', isPositive: true }}
              />
            </div>

            <div onClick={() => setKpiModal({ isOpen: true, type: 'approval' })} className="cursor-pointer transition-transform hover:scale-105">
              <KPIWidget
                title="Approval Rate"
                value={`${approvalRate.toFixed(0)}%`}
                subtitle="Sections unchanged • Click for details"
                icon={CheckCircle}
                trend={{ value: '12%', isPositive: true }}
              />
            </div>

            <div onClick={() => setKpiModal({ isOpen: true, type: 'clarity' })} className="cursor-pointer transition-transform hover:scale-105">
              <KPIWidget
                title="Avg Clarity Score"
                value={avgClarityScore.toFixed(1)}
                subtitle="Readability index • Click for details"
                icon={BarChart3}
              />
            </div>
          </div>

          <DocumentEditor
            sections={sections}
            onSectionUpdate={handleSectionUpdate}
            onAddComment={handleAddComment}
            onCompare={handleCompare}
          />
        </main>

        <JustificationFooter
          tenderId={tenderId}
          phase="Justification Composition"
          status={status}
          onFinalize={handleFinalize}
          onExportPDF={handleExportPDF}
        />

        <ComparisonModal
          isOpen={comparisonModal.isOpen}
          onClose={() => setComparisonModal(prev => ({ ...prev, isOpen: false }))}
          sectionTitle={comparisonModal.sectionTitle}
          aiDraft={comparisonModal.aiDraft}
          finalContent={comparisonModal.finalContent}
        />

        <JustificationKPIModal
          isOpen={kpiModal.isOpen}
          onClose={() => setKpiModal(prev => ({ ...prev, isOpen: false }))}
          kpiType={kpiModal.type}
          data={kpiModalData}
        />
      </div>
    </>
  );
}
