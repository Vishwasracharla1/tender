import { useState, useEffect, useMemo, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Award, TrendingUp, FileText, CheckCircle2, AlertCircle, Building2, Filter, Send } from 'lucide-react';
import { fetchJustificationComposerV1Instances, JustificationComposerV1InstanceItem, callJustificationComposerV1Agent } from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface JustificationComposerV1PageProps {
  onNavigate: (
    page:
      | 'intake'
      | 'evaluation'
      | 'benchmark'
      | 'integrity'
      | 'justification'
      | 'award'
      | 'leadership'
      | 'monitoring'
      | 'integration'
      | 'tender-article'
      | 'tender-overview'
      | 'tender-prebidding'
      | 'evaluation-breakdown'
      | 'evaluation-recommendation'
      | 'evaluation-gov-tender'
      | 'evaluation-matrix-vendor'
      | 'admin'
      | 'vendor-intake'
      | 'justification-composer-v1'
  ) => void;
}

interface VendorData {
  rank: number;
  vendor: string;
  evaluationScore: number;
  pointsForScore: string[];
  reasonSummary: string;
}

interface JustificationData {
  tenderId: string;
  schemaId: string;
  vendors: VendorData[];
}

export function JustificationComposerV1Page({ onNavigate }: JustificationComposerV1PageProps) {
  // Parse the JSON from the text field
  const parseData = (responseText: string): JustificationData | null => {
    try {
      const parsed = JSON.parse(responseText);
      return parsed;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null;
    }
  };

  // Initialize with empty data - will be populated from agent response
  const [justificationData, setJustificationData] = useState<JustificationData>({
    tenderId: '',
    schemaId: '',
    vendors: [],
  });
  
  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedTenderName, setSelectedTenderName] = useState<string>('');
  const [instances, setInstances] = useState<JustificationComposerV1InstanceItem[]>([]);
  const [allInstances, setAllInstances] = useState<JustificationComposerV1InstanceItem[]>([]); // Store all instances for dropdown population
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<JustificationComposerV1InstanceItem | null>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  // Fetch all instances on mount to populate dropdowns
  useEffect(() => {
    const loadAllInstances = async () => {
      try {
        const data = await fetchJustificationComposerV1Instances(100);
        setAllInstances(data);
      } catch (error) {
        console.error('Failed to fetch all instances:', error);
      }
    };

    loadAllInstances();
  }, []);

  // Fetch filtered instances when filters change
  useEffect(() => {
    const loadInstances = async () => {
      setIsLoading(true);
      try {
        const filters: { department?: string; tenderId?: string } = {};
        if (selectedDepartment) filters.department = selectedDepartment;
        
        // Find tenderId from selectedTenderName using allInstances.
        // IMPORTANT: match BOTH tender name and department so we don't
        // accidentally pick a tender from another department.
        if (selectedTenderName) {
          const tenderInstance = allInstances.find(i => {
            const tenderName = (i.tenderName || i.tender || '').trim();
            const dept = (i.department || '').trim();
            return (
              tenderName === selectedTenderName &&
              (!selectedDepartment || dept === selectedDepartment)
            );
          });

          if (tenderInstance) {
            // IMPORTANT: Use the business tenderId field only (not the instance row id)
            const tenderId =
              tenderInstance.tenderId ||
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (tenderInstance as any).tender_id;

            if (tenderId) {
              filters.tenderId = String(tenderId);
            }
          }
        }
        
        const data = await fetchJustificationComposerV1Instances(100, Object.keys(filters).length > 0 ? filters : undefined);
        setInstances(data);
        
        // Auto-select first instance if none selected or if current selection is not in results
        if (data.length > 0) {
          const currentSelectedExists = selectedInstance && data.find(i => i.id === selectedInstance.id);
          if (!currentSelectedExists) {
            setSelectedInstance(data[0]);
          }
        } else {
          setSelectedInstance(null);
        }
      } catch (error) {
        console.error('Failed to fetch instances:', error);
        setInstances([]);
        setSelectedInstance(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadInstances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDepartment, selectedTenderName, allInstances]);

  // Extract unique department names from all instances
  const departmentNames = useMemo(() => {
    const departments = new Set<string>();
    allInstances.forEach(instance => {
      const dept = instance.department || '';
      if (dept && typeof dept === 'string') {
        departments.add(dept.trim());
      }
    });
    return Array.from(departments).sort();
  }, [allInstances]);

  // Extract unique tender names from all instances, filtered by selected department
  const tenderNames = useMemo(() => {
    const tenders = new Set<string>();
    allInstances.forEach(instance => {
      const tenderName = instance.tenderName || instance.tender || '';
      const dept = (instance.department || '').trim();

      // If a department is selected, only include tenders from that department
      if (selectedDepartment && dept !== selectedDepartment) {
        return;
      }

      if (tenderName && typeof tenderName === 'string') {
        tenders.add(tenderName.trim());
      }
    });
    return Array.from(tenders).sort();
  }, [allInstances, selectedDepartment]);

  // Update justification data when selected instance changes (from API instances)
  useEffect(() => {
    if (selectedInstance && selectedInstance.text) {
      const parsed = parseData(selectedInstance.text);
      if (parsed) {
        setJustificationData(parsed);
      }
    } else if (!selectedInstance) {
      // Clear data when no instance is selected
      setJustificationData({
        tenderId: '',
        schemaId: '',
        vendors: [],
      });
    }
  }, [selectedInstance]);

  // Handle agent submission
  const handleAgentSubmit = async () => {
    if (!selectedTenderName) {
      alert('Please select a tender name first');
      return;
    }

    // Find the tenderId from the selected tender name
    // IMPORTANT: match BOTH tender name and department
    const tenderInstance = allInstances.find(i => {
      const tenderName = (i.tenderName || i.tender || '').trim();
      const dept = (i.department || '').trim();
      return (
        tenderName === selectedTenderName &&
        (!selectedDepartment || dept === selectedDepartment)
      );
    });

    if (!tenderInstance) {
      alert('Tender ID not found for the selected tender');
      return;
    }

    // Normalize tenderId from various possible field names
    // IMPORTANT: Use the business tenderId field only (not the instance row id)
    const tenderId =
      tenderInstance.tenderId ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (tenderInstance as any).tender_id ||
      '';

    if (!tenderId) {
      alert('Tender ID not found for the selected tender');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await callJustificationComposerV1Agent(String(tenderId));
      
      console.log('Agent response:', response);
      
      // The agent response has a "text" field containing the JSON string
      // Format: { "text": "{\"tenderId\":\"...\",\"schemaId\":\"...\",\"vendors\":[...]}" }
      let responseText = '';
      
      if (response.text) {
        // Direct text field
        responseText = response.text;
      } else if (response.data?.text) {
        // Nested in data.text
        responseText = response.data.text;
      } else if (typeof response.data === 'string') {
        // Data is a string
        responseText = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Check if data has a text field
        if (response.data.text) {
          responseText = response.data.text;
        } else {
          // Try to stringify the whole data object
          responseText = JSON.stringify(response.data);
        }
      }

      if (responseText) {
        // Parse the JSON string from the text field
        const parsed = parseData(responseText);
        if (parsed) {
          setJustificationData(parsed);
        } else {
          console.error('Failed to parse response text:', responseText);
          alert('Failed to parse agent response. Please check the console for details.');
        }
      } else {
        console.error('No text field found in response:', response);
        alert('Invalid response format from agent. Please check the console for details.');
      }
    } catch (error) {
      console.error('Error calling agent:', error);
      alert('Failed to call agent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportPDF = async () => {
    if (justificationData.vendors.length === 0) {
      alert('No vendor data available to export. Please generate justification data first.');
      return;
    }

    if (!pdfContentRef.current) {
      alert('Error: Could not find content to export.');
      return;
    }

    try {
      // Show loading state
      const exportButton = document.querySelector('[data-pdf-export]') as HTMLButtonElement;
      if (exportButton) {
        exportButton.disabled = true;
        exportButton.textContent = 'Generating PDF...';
      }

      // Temporarily make the container visible and positioned for capture
      const container = pdfContentRef.current;
      
      // Check if container has content
      if (!container || container.children.length === 0) {
        alert('Error: PDF content is empty. Please ensure vendor data is loaded.');
        if (exportButton) {
          exportButton.disabled = false;
          exportButton.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>Export PDF';
        }
        return;
      }

      const originalStyles: Record<string, string> = {
        position: container.style.position || '',
        left: container.style.left || '',
        top: container.style.top || '',
        opacity: container.style.opacity || '',
        visibility: container.style.visibility || '',
        zIndex: container.style.zIndex || '',
        width: container.style.width || '',
        height: container.style.height || '',
        backgroundColor: container.style.backgroundColor || '',
      };

      // Make container fully visible for html2canvas
      container.style.position = 'absolute';
      container.style.left = '0px';
      container.style.top = '0px';
      container.style.opacity = '1';
      container.style.visibility = 'visible';
      container.style.zIndex = '99999';
      container.style.width = '1200px';
      container.style.backgroundColor = '#f9fafb';
      container.style.maxWidth = 'none';
      container.style.overflow = 'visible';

      // Force layout recalculation
      void container.offsetWidth;
      
      // Wait for browser to render
      await new Promise(resolve => setTimeout(resolve, 300));

      // Capture the content as canvas with high quality
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f9fafb',
        width: container.scrollWidth,
        height: container.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure cloned document has all styles
          const clonedContainer = clonedDoc.querySelector(`[data-pdf-content]`);
          if (clonedContainer) {
            (clonedContainer as HTMLElement).style.position = 'relative';
            (clonedContainer as HTMLElement).style.visibility = 'visible';
            (clonedContainer as HTMLElement).style.opacity = '1';
          }
        },
      });

      // Check if canvas was created successfully
      if (!canvas) {
        throw new Error('Failed to create canvas.');
      }
      
      if (canvas.width === 0 || canvas.height === 0) {
        console.error('Canvas dimensions are zero:', { width: canvas.width, height: canvas.height });
        throw new Error('Canvas is empty - content may not be visible or rendered.');
      }
      
      console.log('Canvas captured successfully:', { width: canvas.width, height: canvas.height });

      // Restore original styles
      container.style.position = originalStyles.position || '';
      container.style.left = originalStyles.left || '';
      container.style.top = originalStyles.top || '';
      container.style.opacity = originalStyles.opacity || '';
      container.style.visibility = originalStyles.visibility || '';
      container.style.zIndex = originalStyles.zIndex || '';
      container.style.width = originalStyles.width || '';
      container.style.height = originalStyles.height || '';
      container.style.backgroundColor = originalStyles.backgroundColor || '';

      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate PDF dimensions (A4 format)
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const margin = 10;
      const contentWidth = pdfWidth - 2 * margin;
      
      // Calculate image aspect ratio and scaled height
      const imgAspectRatio = imgHeight / imgWidth;
      const contentHeight = contentWidth * imgAspectRatio;

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Add image to PDF - simple single-page approach first
      const pageHeight = pdfHeight - 2 * margin;
      
      // Check if content fits on one page
      if (contentHeight <= pageHeight) {
        // Single page - add image directly
        doc.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
      } else {
        // Multi-page: add first page
        const firstPageHeight = pageHeight;
        const img = new Image();
        img.src = imgData;
        
        await new Promise<void>((resolve) => {
          img.onload = () => {
            // First page - show top portion
            const firstPageCanvas = document.createElement('canvas');
            firstPageCanvas.width = imgWidth;
            firstPageCanvas.height = Math.ceil((firstPageHeight / contentHeight) * imgHeight);
            const firstPageCtx = firstPageCanvas.getContext('2d');
            
            if (firstPageCtx) {
              firstPageCtx.drawImage(img, 0, 0, imgWidth, firstPageCanvas.height);
              const firstPageData = firstPageCanvas.toDataURL('image/png', 1.0);
              doc.addImage(firstPageData, 'PNG', margin, margin, contentWidth, firstPageHeight);
            }
            
            // Add remaining pages
            let sourceY = firstPageCanvas.height;
            let remainingHeight = contentHeight - firstPageHeight;
            
            while (remainingHeight > 0) {
              doc.addPage();
              const pageContentHeight = Math.min(remainingHeight, pageHeight);
              const sourceHeight = (pageContentHeight / contentHeight) * imgHeight;
              
              const pageCanvas = document.createElement('canvas');
              pageCanvas.width = imgWidth;
              pageCanvas.height = Math.ceil(sourceHeight);
              const pageCtx = pageCanvas.getContext('2d');
              
              if (pageCtx && sourceHeight > 0) {
                pageCtx.drawImage(img, 0, sourceY, imgWidth, sourceHeight);
                const pageData = pageCanvas.toDataURL('image/png', 1.0);
                doc.addImage(pageData, 'PNG', margin, margin, contentWidth, pageContentHeight);
              }
              
              sourceY += sourceHeight;
              remainingHeight -= pageHeight;
            }
            
            resolve();
          };
          img.onerror = () => {
            // Fallback: just add full image on one page
            doc.addImage(imgData, 'PNG', margin, margin, contentWidth, Math.min(contentHeight, pageHeight));
            resolve();
          };
        });
      }

      // Save the PDF
      const fileName = `justification-v1-${justificationData.tenderId || 'report'}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      // Reset button
      if (exportButton) {
        exportButton.disabled = false;
        exportButton.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>Export PDF';
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
      const exportButton = document.querySelector('[data-pdf-export]') as HTMLButtonElement;
      if (exportButton) {
        exportButton.disabled = false;
        exportButton.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>Export PDF';
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-br from-orange-300 to-orange-500 text-white';
    return 'bg-gray-200 text-gray-700';
  };

  const averageScore =
    justificationData.vendors.length > 0
      ? justificationData.vendors.reduce((sum, v) => sum + v.evaluationScore, 0) /
        justificationData.vendors.length
      : 0;

  return (
    <>
      <Sidebar currentPage="justification-composer-v1" onNavigate={onNavigate} />
      <div className="app-shell min-h-screen bg-gray-50 pb-24">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Justification Composer V1</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Tender ID: {justificationData.tenderId || 'N/A'} • Schema: {justificationData.schemaId || 'N/A'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  data-pdf-export
                  onClick={handleExportPDF}
                  disabled={justificationData.vendors.length === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-4 h-4" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Filter Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    // Clear tender selection when department changes so dropdown options realign
                    setSelectedTenderName('');
                    setSelectedInstance(null);
                  }}
                  disabled={isLoading}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Departments</option>
                  {departmentNames.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tender Name
                </label>
                <select
                  value={selectedTenderName}
                  onChange={(e) => {
                    setSelectedTenderName(e.target.value);
                    setSelectedInstance(null);
                  }}
                  disabled={isLoading}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Tenders</option>
                  {tenderNames.map((tenderName) => (
                    <option key={tenderName} value={tenderName}>
                      {tenderName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAgentSubmit}
                  disabled={isLoading || isSubmitting || !selectedTenderName}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>

          <>
              {/* PDF Printable Container - Hidden but styled for PDF export */}
              {/* PDF Printable Container - Hidden but accessible for html2canvas */}
              {/* PDF Export Container - Hidden but rendered for html2canvas */}
              <div
                ref={pdfContentRef}
                data-pdf-content
                style={{ 
                  position: 'absolute',
                  left: '-9999px',
                  top: 0,
                  width: '1200px',
                  backgroundColor: '#f9fafb',
                  padding: '32px',
                }}
              >
                {/* PDF Header */}
                <div className="mb-8 pb-6 border-b-2 border-gray-300">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Justification Composer V1</h1>
                  <p className="text-base text-gray-600">
                    {(selectedDepartment || selectedInstance?.department) && (
                      <span>Department: {selectedDepartment || selectedInstance?.department} • </span>
                    )}
                    {selectedTenderName && <span>Tender: {selectedTenderName} • </span>}
                    Tender ID: {justificationData.tenderId || 'N/A'} • Schema: {justificationData.schemaId || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {justificationData.vendors.length}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-indigo-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Average Score</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {averageScore.toFixed(1)}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Top Ranked</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {justificationData.vendors[0]?.vendor.split(' ')[0] || 'N/A'}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <Award className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vendor Cards for PDF */}
                <div className="space-y-6">
                  {justificationData.vendors.map((vendor, index) => (
                    <div
                      key={`pdf-${index}`}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${getRankBadge(
                                vendor.rank
                              )}`}
                            >
                              #{vendor.rank}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{vendor.vendor}</h3>
                              <p className="text-sm text-gray-500 mt-1">Rank {vendor.rank} Vendor</p>
                            </div>
                          </div>
                          <div
                            className={`px-4 py-2 rounded-lg border font-semibold ${getScoreColor(
                              vendor.evaluationScore
                            )}`}
                          >
                            Score: {vendor.evaluationScore}
                          </div>
                        </div>

                        {/* Points for Score */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Key Points
                          </h4>
                          <ul className="space-y-2">
                            {vendor.pointsForScore.map((point, pointIndex) => (
                              <li
                                key={pointIndex}
                                className="flex items-start gap-3 text-sm text-gray-600 pl-2"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Reason Summary */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Summary
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{vendor.reasonSummary}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visible UI - Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {justificationData.vendors.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Score</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {averageScore.toFixed(1)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Top Ranked</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {justificationData.vendors[0]?.vendor.split(' ')[0] || 'N/A'}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <Award className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Visible UI - Vendor Cards */}
              <div className="space-y-6">
                {justificationData.vendors.map((vendor, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${getRankBadge(
                              vendor.rank
                            )}`}
                          >
                            #{vendor.rank}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{vendor.vendor}</h3>
                            <p className="text-sm text-gray-500 mt-1">Rank {vendor.rank} Vendor</p>
                          </div>
                        </div>
                        <div
                          className={`px-4 py-2 rounded-lg border font-semibold ${getScoreColor(
                            vendor.evaluationScore
                          )}`}
                        >
                          Score: {vendor.evaluationScore}
                        </div>
                      </div>

                      {/* Points for Score */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Key Points
                        </h4>
                        <ul className="space-y-2">
                          {vendor.pointsForScore.map((point, pointIndex) => (
                            <li
                              key={pointIndex}
                              className="flex items-start gap-3 text-sm text-gray-600 pl-2"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Reason Summary */}
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Summary
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{vendor.reasonSummary}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {justificationData.vendors.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Vendor Data</h3>
                  <p className="text-sm text-gray-500">
                    Select a tender name from the filter above and click "Submit" to generate justification data from the agent.
                  </p>
                </div>
              )}
          </>
        </main>
      </div>
    </>
  );
}

