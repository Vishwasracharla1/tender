import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { FileEdit, Award, TrendingUp, FileText, CheckCircle2, AlertCircle, Download, Edit, Building2, Filter, Send } from 'lucide-react';
import { fetchJustificationComposerV1Instances, JustificationComposerV1InstanceItem, callJustificationComposerV1Agent } from '../services/api';

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
  const [isEditing, setIsEditing] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  
  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedTenderName, setSelectedTenderName] = useState<string>('');
  const [instances, setInstances] = useState<JustificationComposerV1InstanceItem[]>([]);
  const [allInstances, setAllInstances] = useState<JustificationComposerV1InstanceItem[]>([]); // Store all instances for dropdown population
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<JustificationComposerV1InstanceItem | null>(null);

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
        
        // Find tenderId from selectedTenderName using allInstances
        if (selectedTenderName) {
          const tenderInstance = allInstances.find(i => {
            const tenderName = i.tenderName || i.tender || '';
            return tenderName === selectedTenderName;
          });

          if (tenderInstance) {
            // Backend may return tender id in different field formats (tenderId, tender_id, etc.)
            const tenderId =
              tenderInstance.tenderId ||
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (tenderInstance as any).tender_id ||
              // Fallbacks – in some schemas the tender id might be stored as generic id
              (typeof tenderInstance.id === 'string' ? tenderInstance.id : undefined);

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

  // Extract unique tender names from all instances
  const tenderNames = useMemo(() => {
    const tenders = new Set<string>();
    allInstances.forEach(instance => {
      const tenderName = instance.tenderName || instance.tender || '';
      if (tenderName && typeof tenderName === 'string') {
        tenders.add(tenderName.trim());
      }
    });
    return Array.from(tenders).sort();
  }, [allInstances]);

  // Update justification data when selected instance changes (from API instances)
  useEffect(() => {
    if (selectedInstance && selectedInstance.text) {
      const parsed = parseData(selectedInstance.text);
      if (parsed) {
        setJustificationData(parsed);
        setJsonInput(selectedInstance.text);
      }
    } else if (!selectedInstance) {
      // Clear data when no instance is selected
      setJustificationData({
        tenderId: '',
        schemaId: '',
        vendors: [],
      });
      setJsonInput('');
    }
  }, [selectedInstance]);

  // Handle agent submission
  const handleAgentSubmit = async () => {
    if (!selectedTenderName) {
      alert('Please select a tender name first');
      return;
    }

    // Find the tenderId from the selected tender name
    const tenderInstance = allInstances.find(i => {
      const tenderName = i.tenderName || i.tender || '';
      return tenderName === selectedTenderName;
    });

    if (!tenderInstance) {
      alert('Tender ID not found for the selected tender');
      return;
    }

    // Normalize tenderId from various possible field names
    const tenderId =
      tenderInstance.tenderId ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (tenderInstance as any).tender_id ||
      (typeof tenderInstance.id === 'string' ? tenderInstance.id : '');

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
          setJsonInput(responseText);
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

  const handleJsonUpdate = () => {
    try {
      const parsed = parseData(jsonInput);
      if (parsed) {
        setJustificationData(parsed);
        setIsEditing(false);
      } else {
        alert('Invalid JSON format. Please check your input.');
      }
    } catch (error) {
      alert('Invalid JSON format. Please check your input.');
      console.error('JSON parse error:', error);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(justificationData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `justification-v1-${justificationData.tenderId}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  {isEditing ? 'Cancel Edit' : 'Edit JSON'}
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
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

          {isEditing ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Edit JSON Data</h2>
                <button
                  onClick={handleJsonUpdate}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Update
                </button>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                spellCheck={false}
              />
            </div>
          ) : (
            <>
              {/* Summary Cards */}
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

              {/* Vendor Cards */}
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
          )}
        </main>
      </div>
    </>
  );
}

