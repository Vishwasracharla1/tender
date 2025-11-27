import { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { KPIWidget } from '../components/KPIWidget';
import { DocumentEditor } from '../components/DocumentEditor';
import { ComparisonModal } from '../components/ComparisonModal';
import { JustificationKPIModal } from '../components/JustificationKPIModal';
import { JustificationFooter } from '../components/JustificationFooter';
import { FileText, CheckCircle, BarChart3, Filter } from 'lucide-react';
import { RAK_DEPARTMENTS } from '../data/departments';
import { getTenderById, MOCK_TENDERS } from '../data/mockTenderData';
import { fetchJustificationInstances, JustificationInstanceItem, callJustificationAgent } from '../services/api';

interface JustificationComposerPageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership') => void;
}

export function JustificationComposerPage({ onNavigate }: JustificationComposerPageProps) {
  const [tenderId, setTenderId] = useState('TND-2025-001');
  const [status, setStatus] = useState<'draft' | 'review' | 'finalized'>('draft');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]); // Store all selected documents
  const [justificationInstances, setJustificationInstances] = useState<JustificationInstanceItem[]>([]);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [sections, setSections] = useState<Array<{
    id: string;
    title: string;
    aiDraft: string;
    finalContent: string;
    isEdited: boolean;
    wordCount: number;
    comments: Array<{
      id: string;
      author: string;
      content: string;
      timestamp: string;
      isResolved: boolean;
    }>;
  }>>([]);

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
  const autoGenerationCoverage = totalSections > 0 ? (aiGeneratedSections / totalSections) * 100 : 0;

  const editedSections = sections.filter(s => s.isEdited).length;
  const approvalRate = totalSections > 0 ? ((totalSections - editedSections) / totalSections) * 100 : 0;

  const avgClarityScore = 82.5;

  // Fetch justification instances from API
  useEffect(() => {
    const loadInstances = async () => {
      setIsLoadingInstances(true);
      try {
        const instances = await fetchJustificationInstances(1000);
        setJustificationInstances(instances);
      } catch (error) {
        console.error('Failed to fetch justification instances:', error);
        // Fallback to empty array on error
        setJustificationInstances([]);
      } finally {
        setIsLoadingInstances(false);
      }
    };

    loadInstances();
  }, []);

  // Extract unique company names from API instances
  const companyNames = useMemo(() => {
    const companies = new Set<string>();
    justificationInstances.forEach(instance => {
      // Try different possible field names for company name
      const companyName = instance.companyName || instance.company_name || instance.company || '';
      if (companyName && typeof companyName === 'string' && companyName.trim()) {
        companies.add(companyName.trim());
      }
    });
    return Array.from(companies).sort();
  }, [justificationInstances]);

  // Extract document names from API instances, filtered by selected company
  const documentNames = useMemo(() => {
    const documents = new Map<string, { name: string; companyName: string | null }>();
    
    justificationInstances.forEach(instance => {
      // Try different possible field names for document name
      const docName = instance.name || instance.documentName || instance.document_name || instance.filename || '';
      const companyName = instance.companyName || instance.company_name || instance.company || null;
      
      if (docName && typeof docName === 'string' && docName.trim()) {
        const key = docName.trim();
        // Only add if not already added, or if this one has a company name
        if (!documents.has(key) || companyName) {
          documents.set(key, {
            name: key,
            companyName: companyName && typeof companyName === 'string' ? companyName.trim() : null
          });
        }
      }
    });
    
    return Array.from(documents.values());
  }, [justificationInstances]);

  // Filter documents based on selected company
  const filteredDocuments = useMemo(() => {
    if (!selectedCompany) {
      // If no company selected, show all documents
      return documentNames.map(doc => doc.name);
    }
    
    // If "All" is selected, show only documents with no company name
    if (selectedCompany === 'all') {
      return documentNames
        .filter(doc => !doc.companyName || doc.companyName === null || doc.companyName === '')
        .map(doc => doc.name);
    }
    
    // Show documents that match the selected company OR have no company name
    return documentNames
      .filter(doc => !doc.companyName || doc.companyName === selectedCompany)
      .map(doc => doc.name);
  }, [documentNames, selectedCompany]);

  // Set default company on mount
  useEffect(() => {
    if (!selectedCompany && companyNames.length > 0) {
      setSelectedCompany(companyNames[0]);
    }
  }, [companyNames, selectedCompany]);

  // Automatically select all matching documents when company is selected
  useEffect(() => {
    if (selectedCompany && filteredDocuments.length > 0) {
      // Automatically select all documents for the selected company
      setSelectedDocuments(filteredDocuments);
      console.log('Auto-selected documents for company:', selectedCompany, filteredDocuments);
    } else if (!selectedCompany) {
      // If no company selected, clear document selection
      setSelectedDocuments([]);
    }
  }, [selectedCompany, filteredDocuments]);

  // Extract CDN URLs from selected documents
  const getCdnUrlsForSelectedDocuments = useMemo(() => {
    const cdnUrls: string[] = [];
    
    selectedDocuments.forEach(docName => {
      // Find the instance that matches this document name
      const instance = justificationInstances.find(inst => {
        const instDocName = inst.name || inst.documentName || inst.document_name || inst.filename || '';
        return instDocName.trim() === docName;
      });
      
      if (instance) {
        // Try different possible field names for CDN URL
        let cdnUrl = instance.cdnUrl || instance.cdnurl || instance.fileUrl || '';
        
        // Handle array of URLs
        if (!cdnUrl && instance.cdnUrls) {
          if (Array.isArray(instance.cdnUrls)) {
            cdnUrl = instance.cdnUrls[0] || '';
          } else if (typeof instance.cdnUrls === 'string') {
            cdnUrl = instance.cdnUrls;
          }
        }
        
        // Handle fileUrls array
        if (!cdnUrl && instance.fileUrls) {
          if (Array.isArray(instance.fileUrls)) {
            cdnUrl = instance.fileUrls[0] || '';
          } else if (typeof instance.fileUrls === 'string') {
            cdnUrl = instance.fileUrls;
          }
        }
        
        if (cdnUrl && typeof cdnUrl === 'string' && cdnUrl.trim()) {
          cdnUrls.push(cdnUrl.trim());
        }
      }
    });
    
    return cdnUrls;
  }, [selectedDocuments, justificationInstances]);

  // Build query based on company selection
  const buildAgentQuery = (company: string): string => {
    if (company === 'all') {
      return 'TenderId: RAK_01. Generate the overall technical capability of each company.';
    } else {
      return `TenderId: RAK_01. Generate the technical capability of ${company}.`;
    }
  };

  // Parse agent response and extract company name from text
  const extractCompanyNameFromText = (text: string, selectedCompany: string): string => {
    if (selectedCompany !== 'all') {
      return selectedCompany;
    }
    
    // Try to extract company name from the text (first company name mentioned)
    // Look for patterns like "CompanyName demonstrates" or "CompanyName LLC" etc.
    const companyMatch = text.match(/^([A-Z][a-zA-Z\s&]+(?:LLC|Ltd|Inc|Corp|Corporation|Limited)?)\s+(?:demonstrates|presents|shows|has)/i);
    if (companyMatch) {
      return companyMatch[1].trim();
    }
    
    // Fallback: try to find any company name from our list
    for (const company of companyNames) {
      if (text.includes(company)) {
        return company;
      }
    }
    
    return 'All Companies';
  };

  // Parse agent response and create sections
  const parseAgentResponse = (response: any, selectedCompany: string): Array<{
    id: string;
    title: string;
    aiDraft: string;
    finalContent: string;
    isEdited: boolean;
    wordCount: number;
    comments: Array<{
      id: string;
      author: string;
      content: string;
      timestamp: string;
      isResolved: boolean;
    }>;
  }> => {
    const newSections: Array<{
      id: string;
      title: string;
      aiDraft: string;
      finalContent: string;
      isEdited: boolean;
      wordCount: number;
      comments: Array<{
        id: string;
        author: string;
        content: string;
        timestamp: string;
        isResolved: boolean;
      }>;
    }> = [];

    // Extract text from response (handle various response formats)
    let responseText = '';
    if (typeof response === 'string') {
      responseText = response;
    } else if (response?.text) {
      responseText = response.text;
    } else if (response?.data?.text) {
      responseText = response.data.text;
    } else if (response?.data) {
      responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    } else if (response?.message) {
      responseText = response.message;
    }
    
    if (!responseText || typeof responseText !== 'string') {
      console.warn('No text found in agent response', response);
      return newSections;
    }

    // If "All" is selected, the response might contain multiple companies
    // For now, we'll create one section per response
    // If the response contains multiple companies, we can split it later
    
    if (selectedCompany === 'all') {
      // Split response by company if it contains multiple companies
      // For now, treat the entire response as one section
      const companyName = extractCompanyNameFromText(responseText, selectedCompany);
      const wordCount = responseText.trim().split(/\s+/).length;
      
      newSections.push({
        id: `section-${Date.now()}`,
        title: `Technical Capability - ${companyName}`,
        aiDraft: responseText,
        finalContent: responseText,
        isEdited: false,
        wordCount: wordCount,
        comments: [],
      });
    } else {
      // Single company selected
      const wordCount = responseText.trim().split(/\s+/).length;
      
      newSections.push({
        id: `section-${Date.now()}`,
        title: `Technical Capability - ${selectedCompany}`,
        aiDraft: responseText,
        finalContent: responseText,
        isEdited: false,
        wordCount: wordCount,
        comments: [],
      });
    }

    return newSections;
  };

  // Handle submit button click
  const handleSubmit = async () => {
    if (!selectedCompany || selectedDocuments.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const query = buildAgentQuery(selectedCompany);
      const cdnUrls = getCdnUrlsForSelectedDocuments;
      
      console.log('Submitting to agent:', {
        query,
        company: selectedCompany,
        documentCount: selectedDocuments.length,
        cdnUrlCount: cdnUrls.length,
        cdnUrls
      });

      const response = await callJustificationAgent(query, cdnUrls);
      
      console.log('Agent response:', response);
      
      // Parse response and update sections
      const newSections = parseAgentResponse(response, selectedCompany);
      
      if (newSections.length > 0) {
        // Replace existing sections with new ones
        setSections(newSections);
      }
    } catch (error) {
      console.error('Error calling agent:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate vendor statistics from sections
  const vendorStats = useMemo(() => {
    const stats = new Map<string, { sections: number; autoGenerated: number }>();
    
    sections.forEach(section => {
      // Extract vendor name from section title (format: "Section Name - Vendor Name")
      const match = section.title.match(/-\s*(.+)$/);
      if (match) {
        const vendor = match[1].trim();
        const current = stats.get(vendor) || { sections: 0, autoGenerated: 0 };
        current.sections++;
        if (section.aiDraft.length > 0) {
          current.autoGenerated++;
        }
        stats.set(vendor, current);
      }
    });
    
    return Array.from(stats.entries()).map(([vendor, data]) => ({
      vendor,
      sections: data.sections,
      autoGenerated: data.autoGenerated,
    }));
  }, [sections]);

  const kpiModalData = {
    coverage: {
      total: totalSections,
      generated: aiGeneratedSections,
      manual: totalSections - aiGeneratedSections,
      percentage: autoGenerationCoverage,
      byVendor: vendorStats,
      recentActivity: sections
        .filter(s => s.aiDraft.length > 0)
        .slice(0, 4)
        .map((section, index) => ({
          date: `${index + 1} hour${index !== 0 ? 's' : ''} ago`,
          section: section.title,
          type: 'auto' as const,
        })),
    },
    approval: {
      total: totalSections,
      unchanged: totalSections - editedSections,
      edited: editedSections,
      percentage: approvalRate,
      editStats: {
        minor: sections.filter(s => s.isEdited && s.wordCount < 100).length,
        moderate: sections.filter(s => s.isEdited && s.wordCount >= 100 && s.wordCount < 200).length,
        major: sections.filter(s => s.isEdited && s.wordCount >= 200).length,
      },
      topAccepted: sections
        .filter(s => !s.isEdited)
        .slice(0, 3)
        .map(section => {
          const match = section.title.match(/-\s*(.+)$/);
          return {
            section: section.title.split(' - ')[0],
            vendor: match ? match[1] : 'Unknown',
            score: 100,
          };
        }),
      topEdited: sections
        .filter(s => s.isEdited)
        .map(section => {
          const match = section.title.match(/-\s*(.+)$/);
          return {
            section: section.title.split(' - ')[0],
            vendor: match ? match[1] : 'Unknown',
            changes: Math.abs(section.finalContent.length - section.aiDraft.length),
          };
        })
        .sort((a, b) => b.changes - a.changes)
        .slice(0, 3),
    },
    clarity: {
      average: avgClarityScore,
      highest: sections.length > 0 ? {
        section: sections[0].title,
        score: 92,
        vendor: sections[0].title.split(' - ')[1] || 'Unknown',
      } : { section: 'N/A', score: 0, vendor: 'N/A' },
      lowest: sections.length > 0 ? {
        section: sections[sections.length - 1].title,
        score: 78,
        vendor: sections[sections.length - 1].title.split(' - ')[1] || 'Unknown',
      } : { section: 'N/A', score: 0, vendor: 'N/A' },
      distribution: [
        { range: '90-100 (Excellent)', count: Math.floor(totalSections * 0.25), percentage: 25 },
        { range: '80-89 (Very Good)', count: Math.floor(totalSections * 0.5), percentage: 50 },
        { range: '70-79 (Good)', count: Math.floor(totalSections * 0.25), percentage: 25 },
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
      <div className="app-shell min-h-screen bg-gray-50 pb-24">
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
          <div className="relative rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 shadow-[0_20px_45px_rgba(59,130,246,0.12)] overflow-hidden p-6 mb-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-inner">
                <Filter className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wider">Filters</h2>
                <p className="text-xs text-blue-600 mt-0.5">Personalize the Report View</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wider">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:border-blue-300"
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
                <label className="block text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:border-blue-300"
                >
                  <option value="all">All Categories</option>
                  <option value="WORKS">Works & Construction</option>
                  <option value="GOODS">Goods & Equipment</option>
                  <option value="SERVICES">Services & Consulting</option>
                  <option value="MAINTENANCE">Maintenance & Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wider">
                  Tender
                </label>
                <select
                  value={tenderId}
                  onChange={(e) => setTenderId(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:border-blue-300"
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

          {/* Company Selection Dropdown */}
          <div className="mb-6">
            <div className="flex items-end gap-4">
              <div className="flex-1 max-w-md">
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  Company Name
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => {
                    setSelectedCompany(e.target.value);
                  }}
                  disabled={isLoadingInstances}
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all duration-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {isLoadingInstances ? 'Loading...' : 'Select Company'}
                  </option>
                  <option value="all">All</option>
                  {companyNames.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                  {!isLoadingInstances && companyNames.length === 0 && (
                    <option value="" disabled>No companies available</option>
                  )}
                </select>
              </div>
              <div>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedCompany || selectedDocuments.length === 0 || isLoadingInstances || isSubmitting}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>

          {sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-white/60 text-center text-gray-500">
              <FileText className="w-10 h-10 text-indigo-500 mb-4" />
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Select a company name and click Submit to generate justification sections.
              </p>
              <p className="text-xs text-gray-500">
                Once the AI creates a draft, your sections will appear here for review and editing.
              </p>
            </div>
          ) : (
            <DocumentEditor
              sections={sections}
              onSectionUpdate={handleSectionUpdate}
              onAddComment={handleAddComment}
              onCompare={handleCompare}
            />
          )}
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
