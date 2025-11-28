import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Chatbot } from '../components/Chatbot';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import * as echarts from 'echarts';
import { RAK_DEPARTMENTS } from '../data/departments';
import { interactWithAgent, fetchSchemaInstances, type SchemaInstanceListItem } from '../services/api';
import { TrendingUp, FileText, Award, Shield, Clock, CheckCircle2, AlertCircle, FileSearch, AlertTriangle, Target, Lightbulb, FolderTree, BookOpen, List, Layers, Search } from 'lucide-react';
import '../styles/TenderEvaluationTable.css';

// Function to aggressively remove Jotform agent elements
const removeJotformAgent = () => {
  // Remove main container
  const jotformContainer = document.getElementById('JotformAgent-019aa102d4617a04838c7ef39132e1adea2b');
  if (jotformContainer) {
    jotformContainer.remove();
  }
  
  // Remove any elements with Jotform-related IDs or classes
  const selectors = [
    '[id*="Jotform"]',
    '[id*="jotform"]',
    '[class*="jotform"]',
    '[class*="agent-widget"]',
    '[class*="jf-agent"]',
  ];
  
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.remove();
    });
  });
  
  // Remove any iframes that might be Jotform agent
  document.querySelectorAll('iframe').forEach(iframe => {
    const src = iframe.getAttribute('src') || '';
    if (src.includes('noupe.com') || src.includes('jotform') || src.includes('agent')) {
      iframe.remove();
    }
  });
};

interface TenderOverviewPageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration' | 'tender-article' | 'tender-overview') => void;
}

// Agent Response Interfaces
interface AgentTenderOverview {
  tenderOverview: {
    header: {
      title: string;
      subtitle: string;
    };
    overview: {
      evaluationWeighting: {
        title: string;
        description: string;
        data: Array<{ name: string; value: number }>;
      };
      keyRequirements: {
        title: string;
        description: string;
        requirements: Array<{ 
          label: string; 
          value: string | { value?: string | number; unit?: string } 
        }>;
      };
      evaluationScoringSystem: {
        title: string;
        description: string;
        financialScoring: {
          title: string;
          rules: Array<string | { label?: string; description?: string }>;
        };
        technicalScoring: {
          title: string;
          rules: Array<string | { label?: string; description?: string }>;
        };
      };
    };
    financial: {
      title: string;
      weight: number;
      weightUnit: string;
      evaluationFactors: Array<{
        order: number;
        title: string;
        description: string;
      }>;
      disqualificationTriggers: string[];
    };
    technical: {
      title: string;
      weight: number;
      weightUnit: string;
      scoringScale: string;
      technicalCriteria: Array<{
        category: string;
        weight: number;
      }>;
      psdRequirements: string[];
      disqualificationTriggers: string[];
    };
    compliance: {
      title: string;
      description: string;
      generalSubmissionCompliance: string[];
      technicalComplianceRequirements: string[];
      technicalComplianceNote?: string;
      teamComplianceRequirements: Array<{
        title: string;
        description: string;
      }>;
      oracleLicensingCompliance: {
        note: string;
      };
    };
    support: {
      title: string;
      description: string;
      supportAvailability: {
        systemAvailabilityRequirement: number;
        unit: string;
      };
      supportHours: Array<{
        type: string;
        schedule: string;
      }>;
      incidentResponseTimes: Array<{
        priority: string;
        responseTime: string;
      }>;
      severityLevels: Array<{
        level: number;
        description: string;
      }>;
      backupAndDisasterRecovery: Array<{
        type: string;
        period: string;
      }>;
      reliabilityRequirement: string;
    };
  };
}

// Default/fallback data
const defaultWeightingData = [
  { name: 'Financial', value: 50 },
  { name: 'Technical', value: 50 }
];

const defaultTechnicalCriteria = [
  { category: 'Functional & Technical Requirements Compliance', weight: 30 },
  { category: 'Implementation Plan & Approach', weight: 10 },
  { category: 'Training Plan', weight: 15 },
  { category: 'Team Qualifications, Experience & Local Capability', weight: 30 },
  { category: 'Similar Experience & Business Case Alignment', weight: 15 }
];

const COLORS = ['#f97316', '#3b82f6', '#fb923c', '#60a5fa', '#fdba74']; // Orange-blue color scheme

// Technical Pie Chart Component using ECharts
const TechnicalPieChart = ({ 
  data, 
  activeCategories, 
  setActiveCategories 
}: { 
  data: Array<{ category: string; weight: number }>; 
  activeCategories: Set<string>; 
  setActiveCategories: (set: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.EChartsType | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!chartRef.current) {
      chartRef.current = echarts.init(containerRef.current, undefined, {
        renderer: "canvas",
      });
    }

    if (!data || data.length === 0) {
      chartRef.current?.clear();
      return;
    }

    const palette = [
      "#7c3aed", // purple
      "#22c55e", // green
      "#3b82f6", // blue
      "#f59e0b", // amber
      "#ef4444", // red
      "#06b6d4", // cyan
      "#8b5cf6", // violet
      "#10b981", // emerald
      "#ec4899", // pink
      "#6366f1", // indigo
    ];

    // Filter out hidden categories
    const filteredData = data.filter((item) => !activeCategories.has(item.category));

    // Build all pie data (including hidden ones for legend)
    const allPieData = data.map((item) => {
      const originalIndex = data.findIndex((d) => d.category === item.category);
      const isHidden = activeCategories.has(item.category);
      return {
        name: item.category,
        value: isHidden ? 0 : Number(item.weight || 0),
        itemStyle: { 
          color: palette[originalIndex % palette.length],
          opacity: isHidden ? 0 : 1
        },
      };
    });

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: "item",
        formatter: (p: any) => {
          if (p.value === 0) return '';
          const total = filteredData.reduce((sum, item) => sum + (item.weight || 0), 0);
          const percent = total > 0 ? ((p.value / total) * 100).toFixed(1) : 0;
          return `${p.name}: ${p.value}% (${percent}%)`;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#e0f2fe',
        borderWidth: 1,
        borderRadius: 12,
        textStyle: {
          color: '#1e293b',
          fontSize: 13
        },
        padding: [12, 16]
      },
      legend: {
        type: "scroll",
        top: 8,
        orient: "horizontal",
        left: 0,
        right: 0,
        data: data.map((item) => item.category),
        selected: Object.fromEntries(
          data.map((item) => [item.category, !activeCategories.has(item.category)])
        ),
      },
      series: [
        {
          name: "Weight Distribution",
          type: "pie",
          radius: ["35%", "70%"],
          center: ["50%", "55%"],
          avoidLabelOverlap: true,
          label: {
            show: false,
          },
          labelLine: { 
            show: false
          },
          data: allPieData,
          animationDuration: 450,
        } as echarts.SeriesOption,
      ],
    };

    chartRef.current.setOption(option, true);

    // Handle legend click - prevent default behavior and use our state
    const legendSelectHandler = (params: any) => {
      const selected = params.selected;
      setActiveCategories((prev) => {
        const newSet = new Set(prev);
        data.forEach((item) => {
          if (!selected[item.category]) {
            newSet.add(item.category);
          } else {
            newSet.delete(item.category);
          }
        });
        return newSet;
      });
    };

    // Remove old listener and add new one
    chartRef.current.off('legendselectchanged');
    chartRef.current.on('legendselectchanged', legendSelectHandler);

    const handleResize = () => chartRef.current?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [data, activeCategories, setActiveCategories]);

  return (
    <div className="bg-gradient-to-br from-white to-sky-50/30 rounded-2xl p-8 shadow-xl border border-sky-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Weight Distribution</h3>
        <p className="text-sm text-gray-600">Technical evaluation criteria breakdown</p>
      </div>
      <div ref={containerRef} className="w-full h-[500px] rounded-xl" />
    </div>
  );
};

// Helper function to parse agent response JSON from text field
const parseAgentResponse = (response: any): AgentTenderOverview | null => {
  try {
    if (!response || !response.text) {
      return null;
    }

    let jsonText = response.text;
    
    // Remove markdown code block markers if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Try to parse the JSON
    const parsed = JSON.parse(jsonText);
    
    if (parsed.tenderOverview) {
      return parsed as AgentTenderOverview;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing agent response:', error);
    return null;
  }
};

// Helper function to parse second agent response for table data
const parseTableAgentResponse = (response: any): any | null => {
  try {
    if (!response || !response.text) {
      return null;
    }

    let jsonText = response.text;
    
    // Remove markdown code block markers if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (error) {
    console.error('Error parsing table agent response:', error);
    return null;
  }
};

const parseRecommendationsAgentResponse = (response: any): any | null => {
  try {
    if (!response || !response.text) {
      return null;
    }

    let jsonText = response.text;
    
    // Remove markdown code block markers if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (error) {
    console.error('Error parsing recommendations agent response:', error);
    return null;
  }
};

// Helper function to parse document classification agent response
const parseDocumentClassificationAgentResponse = (response: any): any | null => {
  try {
    if (!response || !response.text) {
      return null;
    }

    let jsonText = response.text;
    
    // Remove markdown code block markers if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsed = JSON.parse(jsonText);
    
    // Map the agent response to the expected documentClassificationData structure
    if (parsed && typeof parsed === 'object') {
      const mappedData: any = {};
      
      // Process each document type (RFP, SOW, BOQ, BOM, BOS)
      ['RFP', 'SOW', 'BOQ', 'BOM', 'BOS'].forEach((docType) => {
        const docData = parsed[docType];
        if (!docData) {
          mappedData[docType] = {
            present: 'no',
            raw_text: 'not_found',
            structured_fields: {}
          };
          return;
        }
        
        const isPresent = docData.present === 'yes';
        
        if (!isPresent) {
          mappedData[docType] = {
            present: 'no',
            raw_text: 'not_found',
            structured_fields: {}
          };
          return;
        }
        
        // Map RFP structure
        if (docType === 'RFP') {
          const structuredFields: any = {};
          // Map all possible RFP fields from agent response
          if (docData.project_introduction) structuredFields.project_introduction = docData.project_introduction;
          if (docData.introduction) structuredFields.introduction = docData.introduction;
          if (docData.definitions) structuredFields.definitions = docData.definitions;
          if (docData.instructions_to_bidders) structuredFields.instructions_to_bidders = docData.instructions_to_bidders;
          if (docData.administrative_requirements) structuredFields.administrative_requirements = docData.administrative_requirements;
          if (docData.eligibility_PQC_requirements) structuredFields.eligibility_PQC_requirements = docData.eligibility_PQC_requirements;
          if (docData.technical_evaluation_criteria) structuredFields.technical_evaluation_criteria = docData.technical_evaluation_criteria;
          if (docData.financial_evaluation_criteria) structuredFields.financial_evaluation_criteria = docData.financial_evaluation_criteria;
          if (docData.proposal_submission_instructions) structuredFields.proposal_submission_instructions = docData.proposal_submission_instructions;
          if (docData.commercial_terms_and_conditions) structuredFields.commercial_terms_and_conditions = docData.commercial_terms_and_conditions;
          if (docData.general_terms_conditions) structuredFields.general_terms_conditions = docData.general_terms_conditions;
          if (docData.functional_requirements_matrix) structuredFields.functional_requirements_matrix = docData.functional_requirements_matrix;
          if (docData.technical_requirements_matrix) structuredFields.technical_requirements_matrix = docData.technical_requirements_matrix;
          if (docData.fee_schedule_summary) structuredFields.fee_schedule_summary = docData.fee_schedule_summary;
          if (docData.boq_summary_reference) structuredFields.boq_summary_reference = docData.boq_summary_reference;
          // Handle appendices_list (new format) or appendices (old format)
          if (docData.appendices_list && Array.isArray(docData.appendices_list) && docData.appendices_list.length > 0) {
            structuredFields.appendices = docData.appendices_list;
          } else if (docData.appendices && Array.isArray(docData.appendices) && docData.appendices.length > 0) {
            structuredFields.appendices = docData.appendices;
          }
          // Legacy fields for backward compatibility
          if (docData.PQC) structuredFields.PQC = docData.PQC;
          if (docData.evaluation_criteria) structuredFields.evaluation_criteria = docData.evaluation_criteria;
          if (docData.submission_requirements) structuredFields.submission_requirements = docData.submission_requirements;
          if (docData.technical_proposal) structuredFields.technical_proposal = docData.technical_proposal;
          if (docData.financial_proposal) structuredFields.financial_proposal = docData.financial_proposal;
          
          mappedData[docType] = {
            present: 'yes',
            raw_text: docData.project_introduction || docData.introduction || '',
            structured_fields: structuredFields
          };
        }
        
        // Map SOW structure
        if (docType === 'SOW') {
          const structuredFields: any = {};
          // Map all possible SOW fields from agent response
          if (docData.high_level_scope) structuredFields.high_level_scope = docData.high_level_scope;
          if (docData.detailed_scope) structuredFields.detailed_scope = docData.detailed_scope;
          if (docData.summary) structuredFields.summary = docData.summary; // Legacy support
          if (docData.modules_or_functional_areas && Array.isArray(docData.modules_or_functional_areas) && docData.modules_or_functional_areas.length > 0) {
            structuredFields.modules_or_functional_areas = docData.modules_or_functional_areas;
          }
          if (docData.modules && Array.isArray(docData.modules) && docData.modules.length > 0) {
            structuredFields.modules = docData.modules; // Legacy support
          }
          if (docData.departments_covered && Array.isArray(docData.departments_covered) && docData.departments_covered.length > 0) {
            structuredFields.departments_covered = docData.departments_covered;
          }
          if (docData.departments && Array.isArray(docData.departments) && docData.departments.length > 0) {
            structuredFields.departments = docData.departments; // Legacy support
          }
          if (docData.in_scope_tasks && Array.isArray(docData.in_scope_tasks) && docData.in_scope_tasks.length > 0) {
            structuredFields.in_scope_tasks = docData.in_scope_tasks;
          }
          if (docData.in_scope && Array.isArray(docData.in_scope) && docData.in_scope.length > 0) {
            structuredFields.in_scope = docData.in_scope; // Legacy support
          }
          if (docData.out_of_scope_tasks && Array.isArray(docData.out_of_scope_tasks) && docData.out_of_scope_tasks.length > 0) {
            structuredFields.out_of_scope_tasks = docData.out_of_scope_tasks;
          }
          if (docData.out_of_scope && Array.isArray(docData.out_of_scope) && docData.out_of_scope.length > 0) {
            structuredFields.out_of_scope = docData.out_of_scope; // Legacy support
          }
          if (docData.deliverables && Array.isArray(docData.deliverables) && docData.deliverables.length > 0) {
            structuredFields.deliverables = docData.deliverables;
          }
          if (docData.training_plan) structuredFields.training_plan = docData.training_plan;
          if (docData.support_services) structuredFields.support_services = docData.support_services;
          if (docData.integration_requirements && Array.isArray(docData.integration_requirements) && docData.integration_requirements.length > 0) {
            structuredFields.integration_requirements = docData.integration_requirements;
          }
          if (docData.integrations && Array.isArray(docData.integrations) && docData.integrations.length > 0) {
            structuredFields.integrations = docData.integrations; // Legacy support
          }
          if (docData.implementation_approach) structuredFields.implementation_approach = docData.implementation_approach;
          if (docData.system_capabilities) structuredFields.system_capabilities = docData.system_capabilities;
          if (docData.functional_requirements) structuredFields.functional_requirements = docData.functional_requirements;
          if (docData.technical_requirements) structuredFields.technical_requirements = docData.technical_requirements;
          if (docData.compliance_tables_reference) structuredFields.compliance_tables_reference = docData.compliance_tables_reference;
          
          mappedData[docType] = {
            present: 'yes',
            raw_text: docData.high_level_scope || docData.summary || '',
            structured_fields: structuredFields
          };
        }
        
        // Map BOQ structure
        if (docType === 'BOQ') {
          if (isPresent) {
            const structuredFields: any = {};
            if (docData.items && Array.isArray(docData.items) && docData.items.length > 0) {
              structuredFields.items = docData.items;
            }
            if (docData.categories_identified && Array.isArray(docData.categories_identified) && docData.categories_identified.length > 0) {
              structuredFields.categories_identified = docData.categories_identified;
            }
            if (docData.boq_total) structuredFields.boq_total = docData.boq_total;
            
            mappedData[docType] = {
              present: 'yes',
              raw_text: docData.boq_total || '',
              structured_fields: structuredFields
            };
          } else {
            mappedData[docType] = {
              present: 'no',
              raw_text: 'not_found',
              structured_fields: {}
            };
          }
        }
        
        // Map BOM, BOS (currently not supported in agent response structure)
        if (['BOM', 'BOS'].includes(docType)) {
          // If present is yes but no structured data, still mark as present but with empty fields
          if (isPresent) {
            mappedData[docType] = {
              present: 'yes',
              raw_text: '',
              structured_fields: {}
            };
          } else {
            mappedData[docType] = {
              present: 'no',
              raw_text: 'not_found',
              structured_fields: {}
            };
          }
        }
      });
      
      return mappedData;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing document classification agent response:', error);
    return null;
  }
};

const getFileNameWithoutExtension = (filename: string) => {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return filename;
  return filename.substring(0, lastDotIndex);
};

// Table data interfaces
interface TableRow {
  scoringArea?: string;
  weight?: string;
  requirementGroup?: string;
  requirementIds?: string;
  description: string;
  evidenceRequired?: string;
  requirement?: string;
}

// Helper function to transform agent table data to TableRow format
const transformAgentDataToTableRows = (agentData: any): {
  financialEvaluation: TableRow[];
  technicalEvaluationA21: TableRow[];
  technicalEvaluationA22: TableRow[];
  technicalEvaluationA23: TableRow[];
  technicalEvaluationA24: TableRow[];
  technicalEvaluationA25: TableRow[];
  mandatoryCompliance: TableRow[];
  supportSLA: TableRow[];
} => {
  // Default/fallback data
  const defaults = {
    financialEvaluation: [
      {
        scoringArea: 'Financial Evaluation',
        weight: '50%',
        requirementGroup: 'BOQ Completeness',
        requirementIds: 'Appendix 7 BOQ lines',
        description: 'All BOQ items must match RFP scope (licenses, manpower, workshops, training, support)',
        evidenceRequired: 'Completed BOQ, Pricing Workbook'
      }
    ],
    technicalEvaluationA21: [],
    technicalEvaluationA22: [],
    technicalEvaluationA23: [],
    technicalEvaluationA24: [],
    technicalEvaluationA25: [],
    mandatoryCompliance: [],
    supportSLA: []
  };

  if (!agentData) return defaults;

  // Transform A1_Financial_Evaluation
  const financialEvaluation: TableRow[] = [];
  if (agentData.A1_Financial_Evaluation?.sections) {
    agentData.A1_Financial_Evaluation.sections.forEach((section: any) => {
      if (section.requirements && Array.isArray(section.requirements)) {
        section.requirements.forEach((req: any, reqIdx: number) => {
          financialEvaluation.push({
            scoringArea: reqIdx === 0 ? section.scoring_area || 'Financial Evaluation' : '',
            weight: reqIdx === 0 ? section.weight || '' : '',
            requirementGroup: req.group || '',
            requirementIds: Array.isArray(req.requirement_ids) ? req.requirement_ids.join(', ') : (req.requirement_ids || 'N/A'),
            description: req.description || '',
            evidenceRequired: req.evidence_required || ''
          });
        });
      }
    });
  }

  // Transform A2_Technical_Evaluation
  const technicalEvaluationA21: TableRow[] = [];
  const technicalEvaluationA22: TableRow[] = [];
  const technicalEvaluationA23: TableRow[] = [];
  const technicalEvaluationA24: TableRow[] = [];
  const technicalEvaluationA25: TableRow[] = [];

  if (agentData.A2_Technical_Evaluation?.subsections) {
    const subsections = agentData.A2_Technical_Evaluation.subsections;
    
    // A2.1
    if (subsections.A2_1_Functional_Technical_Compliance?.requirements) {
      const reqs = Array.isArray(subsections.A2_1_Functional_Technical_Compliance.requirements) 
        ? subsections.A2_1_Functional_Technical_Compliance.requirements 
        : [];
      reqs.forEach((req: any, idx: number) => {
        technicalEvaluationA21.push({
          weight: idx === 0 ? (subsections.A2_1_Functional_Technical_Compliance.weight || '30%') : '',
          requirementGroup: req.group || '',
          requirementIds: Array.isArray(req.requirement_ids) ? req.requirement_ids.join(', ') : (req.requirement_ids || 'N/A'),
          description: req.description || '',
          evidenceRequired: req.evidence_required || ''
        });
      });
    }

    // A2.2
    if (subsections.A2_2_Implementation_Plan?.requirements) {
      const reqs = Array.isArray(subsections.A2_2_Implementation_Plan.requirements) 
        ? subsections.A2_2_Implementation_Plan.requirements 
        : [];
      reqs.forEach((req: any, idx: number) => {
        technicalEvaluationA22.push({
          weight: idx === 0 ? (subsections.A2_2_Implementation_Plan.weight || '10%') : '',
          requirementGroup: req.group || '',
          requirementIds: Array.isArray(req.requirement_ids) ? req.requirement_ids.join(', ') : (req.requirement_ids || 'N/A'),
          description: req.description || '',
          evidenceRequired: req.evidence_required || ''
        });
      });
    }

    // A2.3
    if (subsections.A2_3_Training_Plan?.requirements) {
      const reqs = Array.isArray(subsections.A2_3_Training_Plan.requirements) 
        ? subsections.A2_3_Training_Plan.requirements 
        : [];
      reqs.forEach((req: any, idx: number) => {
        technicalEvaluationA23.push({
          weight: idx === 0 ? (subsections.A2_3_Training_Plan.weight || '15%') : '',
          requirementGroup: req.group || '',
          requirementIds: Array.isArray(req.requirement_ids) ? req.requirement_ids.join(', ') : (req.requirement_ids || 'N/A'),
          description: req.description || '',
          evidenceRequired: req.evidence_required || ''
        });
      });
    }

    // A2.4
    if (subsections.A2_4_Team_Qualifications) {
      const a24 = subsections.A2_4_Team_Qualifications;
      if (typeof a24.requirements === 'string') {
        technicalEvaluationA24.push({
          weight: a24.weight || '30%',
          requirementGroup: 'Team Qualifications',
          requirementIds: 'N/A',
          description: a24.requirements,
          evidenceRequired: a24.evidence_required || ''
        });
      } else if (Array.isArray(a24.requirements)) {
        a24.requirements.forEach((req: any, idx: number) => {
          technicalEvaluationA24.push({
            weight: idx === 0 ? (a24.weight || '30%') : '',
            requirementGroup: req.group || 'Team Qualifications',
            requirementIds: Array.isArray(req.requirement_ids) ? req.requirement_ids.join(', ') : (req.requirement_ids || 'N/A'),
            description: req.description || '',
            evidenceRequired: req.evidence_required || ''
          });
        });
      }
    }

    // A2.5
    if (subsections.A2_5_Similar_Project_Experience) {
      const a25 = subsections.A2_5_Similar_Project_Experience;
      if (typeof a25.requirements === 'string') {
        technicalEvaluationA25.push({
          weight: a25.weight || '15%',
          requirementGroup: 'Similar Project Experience',
          requirementIds: 'N/A',
          description: a25.requirements,
          evidenceRequired: a25.evidence_required || ''
        });
      } else if (Array.isArray(a25.requirements)) {
        a25.requirements.forEach((req: any, idx: number) => {
          technicalEvaluationA25.push({
            weight: idx === 0 ? (a25.weight || '15%') : '',
            requirementGroup: req.group || 'Similar Project Experience',
            requirementIds: Array.isArray(req.requirement_ids) ? req.requirement_ids.join(', ') : (req.requirement_ids || 'N/A'),
            description: req.description || '',
            evidenceRequired: req.evidence_required || ''
          });
        });
      }
    }
  }

  // Transform A3_Mandatory_Compliance
  const mandatoryCompliance: TableRow[] = [];
  if (agentData.A3_Mandatory_Compliance?.requirements && Array.isArray(agentData.A3_Mandatory_Compliance.requirements)) {
    agentData.A3_Mandatory_Compliance.requirements.forEach((req: any) => {
      mandatoryCompliance.push({
        requirementGroup: req.group || '',
        requirementIds: Array.isArray(req.requirement_ids) ? req.requirement_ids.join(', ') : (req.requirement_ids || 'N/A'),
        description: req.description || '',
        evidenceRequired: req.evidence_required || ''
      });
    });
  }

  // Transform A4_Support_and_SLA
  const supportSLA: TableRow[] = [];
  if (agentData.A4_Support_and_SLA?.requirements && Array.isArray(agentData.A4_Support_and_SLA.requirements)) {
    agentData.A4_Support_and_SLA.requirements.forEach((req: any) => {
      supportSLA.push({
        requirement: req.sla || '',
        description: req.requirement || '',
        evidenceRequired: req.evidence_required || ''
      });
    });
  }

  return {
    financialEvaluation: financialEvaluation.length > 0 ? financialEvaluation : defaults.financialEvaluation,
    technicalEvaluationA21: technicalEvaluationA21.length > 0 ? technicalEvaluationA21 : defaults.technicalEvaluationA21,
    technicalEvaluationA22: technicalEvaluationA22.length > 0 ? technicalEvaluationA22 : defaults.technicalEvaluationA22,
    technicalEvaluationA23: technicalEvaluationA23.length > 0 ? technicalEvaluationA23 : defaults.technicalEvaluationA23,
    technicalEvaluationA24: technicalEvaluationA24.length > 0 ? technicalEvaluationA24 : defaults.technicalEvaluationA24,
    technicalEvaluationA25: technicalEvaluationA25.length > 0 ? technicalEvaluationA25 : defaults.technicalEvaluationA25,
    mandatoryCompliance: mandatoryCompliance.length > 0 ? mandatoryCompliance : defaults.mandatoryCompliance,
    supportSLA: supportSLA.length > 0 ? supportSLA : defaults.supportSLA
  };
};

// Tender Evaluation Table View Component
const TenderEvaluationTableView = ({ agentTableData }: { agentTableData?: any }) => {
  // Transform agent data to table format, or use defaults
  const transformedData = agentTableData ? transformAgentDataToTableRows(agentTableData) : null;

  const financialEvaluation: TableRow[] = transformedData?.financialEvaluation || [
    {
      scoringArea: 'Financial Evaluation',
      weight: '50%',
      requirementGroup: 'BOQ Completeness',
      requirementIds: 'Appendix 7 BOQ lines',
      description: 'All BOQ items must match RFP scope (licenses, manpower, workshops, training, support)',
      evidenceRequired: 'Completed BOQ, Pricing Workbook'
    },
    {
      scoringArea: '',
      weight: '',
      requirementGroup: 'Market Benchmark Comparison',
      requirementIds: 'N/A',
      description: 'PSD compares your hours/rates vs standard Oracle Primavera/Unifier benchmarks',
      evidenceRequired: 'Fully itemized price sheet'
    },
    {
      scoringArea: '',
      weight: '',
      requirementGroup: 'Licensing Compliance',
      requirementIds: 'Provided Oracle Pricing',
      description: 'Licensing fees must match PSD-defined prices',
      evidenceRequired: 'Correct license cost pitch'
    },
    {
      scoringArea: '',
      weight: '',
      requirementGroup: 'Pricing Formula',
      requirementIds: 'N/A',
      description: 'Lowest price = 100 points; others proportionally lower',
      evidenceRequired: 'Signed commercial bid'
    },
    {
      scoringArea: '',
      weight: '',
      requirementGroup: 'Financial Documentation',
      requirementIds: 'Legal/Financial Docs',
      description: 'Company registration, VAT, 3-year financials',
      evidenceRequired: 'PDF attachments'
    },
    {
      scoringArea: 'Disqualification',
      weight: '0%',
      requirementGroup: 'Mandatory Docs',
      requirementIds: 'N/A',
      description: 'Missing financial documents',
      evidenceRequired: 'Attached files'
    },
    {
      scoringArea: '',
      weight: '',
      requirementGroup: 'Scope Mismatch',
      requirementIds: 'N/A',
      description: 'BOQ inconsistent with scope',
      evidenceRequired: 'Consistency check'
    }
  ];

  const technicalEvaluationA21: TableRow[] = transformedData?.technicalEvaluationA21 || [
    {
      weight: '30%',
      requirementGroup: 'Process Requirements',
      requirementIds: 'PM-1 … PM-26',
      description: 'Project governance, workflow triggers, PMO rules',
      evidenceRequired: 'Compliance matrix'
    },
    {
      weight: '',
      requirementGroup: 'Functional Requirements',
      requirementIds: 'All Functional IDs',
      description: 'Unifier modules, PPM, dashboards, workflows',
      evidenceRequired: 'YES/NO compliance'
    },
    {
      weight: '',
      requirementGroup: 'Technical Requirements',
      requirementIds: 'Sections 1.01–10.xx',
      description: 'Environment, DR, Backup, Security, SSO, Integrations',
      evidenceRequired: 'Architecture diagrams'
    },
    {
      weight: '',
      requirementGroup: 'Integration Requirements',
      requirementIds: 'INT-xx',
      description: 'SAP, CTS, ESRI, Infor, DMS, Primavera',
      evidenceRequired: 'Integration design'
    },
    {
      weight: '',
      requirementGroup: 'Security Requirements',
      requirementIds: 'SE-xx',
      description: 'Access control, encryption, SSO',
      evidenceRequired: 'Security model'
    },
    {
      weight: '',
      requirementGroup: 'Deliverables',
      requirementIds: 'D1–D29',
      description: 'All 29 deliverables listed in RFP',
      evidenceRequired: 'Deliverables tracker'
    },
    {
      weight: '',
      requirementGroup: 'Analytics Requirements',
      requirementIds: 'BI-xx',
      description: 'Dashboards, KPIs, metrics',
      evidenceRequired: 'Dashboard samples'
    },
    {
      weight: '',
      requirementGroup: 'Workflow Requirements',
      requirementIds: '50 workflows',
      description: 'Workflow automation',
      evidenceRequired: 'BPMN/Flowcharts'
    }
  ];

  const technicalEvaluationA22: TableRow[] = transformedData?.technicalEvaluationA22 || [
    {
      weight: '10%',
      requirementGroup: 'Methodology',
      requirementIds: '',
      description: 'Assessment → Design → Config → UAT → Go-Live → O&M',
      evidenceRequired: 'Methodology slides'
    },
    {
      weight: '',
      requirementGroup: 'Timeline',
      requirementIds: '',
      description: 'Gantt chart with 2-week sprints',
      evidenceRequired: 'Excel/PDF timeline'
    },
    {
      weight: '',
      requirementGroup: 'Governance',
      requirementIds: '',
      description: 'RACI, RAID Log, PMO model',
      evidenceRequired: 'Project governance model'
    },
    {
      weight: '',
      requirementGroup: 'Risk Management',
      requirementIds: '',
      description: 'Proactive mitigation',
      evidenceRequired: 'Risk register'
    },
    {
      weight: '',
      requirementGroup: 'Quality Assurance',
      requirementIds: '',
      description: 'UAT strategy, Acceptance',
      evidenceRequired: 'QA plan'
    }
  ];

  const technicalEvaluationA23: TableRow[] = transformedData?.technicalEvaluationA23 || [
    {
      weight: '15%',
      requirementGroup: 'Training Coverage',
      requirementIds: 'TR-xx',
      description: '100% basic, 30% advanced, 25% contractors',
      evidenceRequired: 'Training calendar'
    },
    {
      weight: '',
      requirementGroup: 'Delivery',
      requirementIds: 'N/A',
      description: 'Max 15 pax/session',
      evidenceRequired: 'Trainer list'
    },
    {
      weight: '',
      requirementGroup: 'Training Content',
      requirementIds: '',
      description: 'Videos & manuals - 10 process videos + user/admin manuals',
      evidenceRequired: 'Samples'
    }
  ];

  const technicalEvaluationA24: TableRow[] = transformedData?.technicalEvaluationA24 || [
    {
      weight: '30%',
      requirementGroup: 'Certifications',
      requirementIds: '',
      description: 'Oracle Implementation Specialist',
      evidenceRequired: 'Certificates'
    },
    {
      weight: '',
      requirementGroup: 'Experience',
      requirementIds: '',
      description: 'Integration Lead: 8+ years & 3 projects',
      evidenceRequired: 'CVs'
    },
    {
      weight: '',
      requirementGroup: 'Cohesion',
      requirementIds: '',
      description: 'Team worked together (Unifier/P6/OBIEE)',
      evidenceRequired: 'Reference letters'
    },
    {
      weight: '',
      requirementGroup: 'Local Presence',
      requirementIds: '',
      description: 'Onsite capability',
      evidenceRequired: 'Organization chart'
    }
  ];

  const technicalEvaluationA25: TableRow[] = transformedData?.technicalEvaluationA25 || [
    {
      weight: '15%',
      requirementGroup: 'Public Sector Experience',
      requirementIds: '',
      description: '2 UAE/MENA government projects',
      evidenceRequired: 'Case studies'
    },
    {
      weight: '',
      requirementGroup: 'Project Types',
      requirementIds: '',
      description: 'Unifier, P6, OBIEE implementations',
      evidenceRequired: 'Case studies'
    },
    {
      weight: '',
      requirementGroup: 'Benefit Alignment',
      requirementIds: '',
      description: 'Business case realization',
      evidenceRequired: 'Write-ups'
    }
  ];

  const mandatoryCompliance: TableRow[] = transformedData?.mandatoryCompliance || [
    {
      requirementGroup: 'Submission',
      requirementIds: 'N/A',
      description: 'Arabic + English, sealed envelopes',
      evidenceRequired: 'Technical + Financial proposals'
    },
    {
      requirementGroup: 'Appendices',
      requirementIds: '1–9',
      description: 'All mandatory forms completed',
      evidenceRequired: 'Signed appendices'
    },
    {
      requirementGroup: 'Licensing',
      requirementIds: 'N/A',
      description: 'Match PSD pricing',
      evidenceRequired: 'BOQ'
    },
    {
      requirementGroup: 'Compliance Matrices',
      requirementIds: 'All',
      description: 'Empty cell = "NO"',
      evidenceRequired: 'Completed compliance matrix'
    },
    {
      requirementGroup: 'Bid Validity',
      requirementIds: 'N/A',
      description: '3 months',
      evidenceRequired: 'Proposal'
    }
  ];

  const supportSLA: TableRow[] = transformedData?.supportSLA || [
    {
      requirement: 'Availability',
      description: '99.5% uptime',
      evidenceRequired: 'SLA document'
    },
    {
      requirement: 'Response Time',
      description: 'Sev-1: 0–8 hrs, Sev-2: ≤48 hrs',
      evidenceRequired: 'Support plan'
    },
    {
      requirement: 'Backup',
      description: '7-day, 4-week, 12-month, 7-year retention',
      evidenceRequired: 'DR plan'
    },
    {
      requirement: 'Support Hours',
      description: 'Regular 7–2, Extended 2–10, Sat 9–2',
      evidenceRequired: 'Support schedule'
    }
  ];

  interface Column {
    key: string;
    header: string;
    className?: string;
  }

  const renderTable = (data: TableRow[], columns: Column[], sectionTitle: string, sectionSubtitle = '') => {
    return (
      <div className="section-container">
        <h2 className="section-title">{sectionTitle}</h2>
        {sectionSubtitle && <h3 className="section-subtitle">{sectionSubtitle}</h3>}
        <div className="table-wrapper">
          <table className="evaluation-table">
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className={col.className || ''}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIdx) => {
                const isDisqualification = row.scoringArea && (
                  row.scoringArea.toLowerCase().includes('disqualification') || 
                  row.scoringArea === 'Disqualification'
                );
                return (
                  <tr key={rowIdx} className={isDisqualification ? 'disqualification-row' : ''}>
                    {columns.map((col, colIdx) => {
                      const cellValue = row[col.key as keyof TableRow];
                      // Handle object values (like {value, unit}) and convert to string
                      let displayValue: string;
                      if (cellValue === null || cellValue === undefined) {
                        displayValue = '';
                      } else if (typeof cellValue === 'object') {
                        // Handle object with value/unit structure
                        const obj = cellValue as { value?: string | number; unit?: string };
                        if ('value' in obj && 'unit' in obj) {
                          displayValue = `${obj.value || ''}${obj.unit || ''}`.trim();
                        } else {
                          displayValue = String(cellValue);
                        }
                      } else {
                        displayValue = String(cellValue);
                      }
                      
                      return (
                        <td key={colIdx} className={col.className || ''} style={{ color: '#1f2937' }}>
                          {displayValue}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="tender-evaluation-container">
      {/* A1. FINANCIAL EVALUATION */}
      {renderTable(
        financialEvaluation,
        [
          { key: 'scoringArea', header: 'Scoring Area', className: 'col-scoring-area' },
          { key: 'weight', header: 'Weight', className: 'col-weight' },
          { key: 'requirementGroup', header: 'Requirement Group', className: 'col-requirement-group' },
          { key: 'requirementIds', header: 'Requirement IDs', className: 'col-requirement-ids' },
          { key: 'description', header: 'Description', className: 'col-description' },
          { key: 'evidenceRequired', header: 'Evidence Required', className: 'col-evidence' }
        ],
        'A1. FINANCIAL EVALUATION (50%)'
      )}

      {/* A2. TECHNICAL EVALUATION */}
      <div className="section-container">
        <h2 className="section-title">A2. TECHNICAL EVALUATION (50%)</h2>
        
        {/* A2.1 */}
        {renderTable(
          technicalEvaluationA21,
          [
            { key: 'weight', header: 'Weight', className: 'col-weight' },
            { key: 'requirementGroup', header: 'Requirement Group', className: 'col-requirement-group' },
            { key: 'requirementIds', header: 'Requirement IDs', className: 'col-requirement-ids' },
            { key: 'description', header: 'Description', className: 'col-description' },
            { key: 'evidenceRequired', header: 'Evidence Required', className: 'col-evidence' }
          ],
          '',
          'A2.1 Functional & Technical Requirements Compliance (30%)'
        )}

        {/* A2.2 */}
        {renderTable(
          technicalEvaluationA22,
          [
            { key: 'weight', header: 'Weight', className: 'col-weight' },
            { key: 'requirementGroup', header: 'Requirement Group', className: 'col-requirement-group' },
            { key: 'requirementIds', header: 'Requirement IDs', className: 'col-requirement-ids' },
            { key: 'description', header: 'Description', className: 'col-description' },
            { key: 'evidenceRequired', header: 'Evidence Required', className: 'col-evidence' }
          ],
          '',
          'A2.2 Implementation Plan & Approach (10%)'
        )}

        {/* A2.3 */}
        {renderTable(
          technicalEvaluationA23,
          [
            { key: 'weight', header: 'Weight', className: 'col-weight' },
            { key: 'requirementGroup', header: 'Requirement Group', className: 'col-requirement-group' },
            { key: 'requirementIds', header: 'Requirement IDs', className: 'col-requirement-ids' },
            { key: 'description', header: 'Description', className: 'col-description' },
            { key: 'evidenceRequired', header: 'Evidence Required', className: 'col-evidence' }
          ],
          '',
          'A2.3 Training Plan (15%)'
        )}

        {/* A2.4 */}
        {renderTable(
          technicalEvaluationA24,
          [
            { key: 'weight', header: 'Weight', className: 'col-weight' },
            { key: 'requirementGroup', header: 'Requirement Group', className: 'col-requirement-group' },
            { key: 'requirementIds', header: 'Requirement IDs', className: 'col-requirement-ids' },
            { key: 'description', header: 'Description', className: 'col-description' },
            { key: 'evidenceRequired', header: 'Evidence Required', className: 'col-evidence' }
          ],
          '',
          'A2.4 Team Qualifications (30%)'
        )}

        {/* A2.5 */}
        {renderTable(
          technicalEvaluationA25,
          [
            { key: 'weight', header: 'Weight', className: 'col-weight' },
            { key: 'requirementGroup', header: 'Requirement Group', className: 'col-requirement-group' },
            { key: 'requirementIds', header: 'Requirement IDs', className: 'col-requirement-ids' },
            { key: 'description', header: 'Description', className: 'col-description' },
            { key: 'evidenceRequired', header: 'Evidence Required', className: 'col-evidence' }
          ],
          '',
          'A2.5 Similar Project Experience (15%)'
        )}
      </div>

      {/* A3. MANDATORY COMPLIANCE */}
      {renderTable(
        mandatoryCompliance,
        [
          { key: 'requirementGroup', header: 'Requirement Group', className: 'col-requirement-group' },
          { key: 'requirementIds', header: 'Requirement IDs', className: 'col-requirement-ids' },
          { key: 'description', header: 'Description', className: 'col-description' },
          { key: 'evidenceRequired', header: 'Evidence Required', className: 'col-evidence' }
        ],
        'A3. Mandatory Compliance (Pass/Fail)'
      )}

      {/* A4. SUPPORT & SLA REQUIREMENTS */}
      {renderTable(
        supportSLA,
        [
          { key: 'requirement', header: 'SLA', className: 'col-requirement-group' },
          { key: 'description', header: 'Requirement', className: 'col-description' },
          { key: 'evidenceRequired', header: 'Evidence Required', className: 'col-evidence' }
        ],
        'A4. Support & SLA Requirements'
      )}
    </div>
  );
};

export function TenderOverviewPage({ onNavigate }: TenderOverviewPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [isDepartmentSelected, setIsDepartmentSelected] = useState(false);
  const [schemaInstances, setSchemaInstances] = useState<SchemaInstanceListItem[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [departmentSearch, setDepartmentSearch] = useState<string>('');
  const [documentSearch, setDocumentSearch] = useState<string>('');
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState<boolean>(false);
  const [showDocumentDropdown, setShowDocumentDropdown] = useState<boolean>(false);
  const departmentDropdownRef = useRef<HTMLDivElement>(null);
  const documentDropdownRef = useRef<HTMLDivElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [agentData, setAgentData] = useState<AgentTenderOverview | null>(null);
  const [tableAgentData, setTableAgentData] = useState<any>(null);
  const [recommendationsData, setRecommendationsData] = useState<any>(null);
  const [documentClassificationData, setDocumentClassificationData] = useState<any>(null);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());

  // Cache key for sessionStorage
  const CACHE_KEY = 'tenderOverviewCache';
  const CACHE_DURATION = 30000; // 30 seconds in milliseconds

  // Document classification data will be loaded from agent API only

  // Load cached data on mount
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const cacheData = JSON.parse(cached);
        const now = Date.now();
        const cacheAge = now - cacheData.timestamp;
        
        if (cacheAge < CACHE_DURATION) {
          // Restore cached data
          if (cacheData.selectedDepartment) setSelectedDepartment(cacheData.selectedDepartment);
          if (cacheData.selectedDocument) setSelectedDocument(cacheData.selectedDocument);
          if (cacheData.isDepartmentSelected) setIsDepartmentSelected(cacheData.isDepartmentSelected);
          if (cacheData.agentData) setAgentData(cacheData.agentData);
          if (cacheData.tableAgentData) setTableAgentData(cacheData.tableAgentData);
          if (cacheData.recommendationsData) setRecommendationsData(cacheData.recommendationsData);
          if (cacheData.documentClassificationData) setDocumentClassificationData(cacheData.documentClassificationData);
          console.log('✅ Restored cached data from sessionStorage');
        } else {
          // Cache expired, clear it
          sessionStorage.removeItem(CACHE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
  }, []);

  // Save data to cache whenever it changes
  useEffect(() => {
    if (isDepartmentSelected && selectedDepartment) {
      try {
        const cacheData = {
          timestamp: Date.now(),
          selectedDepartment,
          selectedDocument,
          isDepartmentSelected,
          agentData,
          tableAgentData,
          recommendationsData,
          documentClassificationData,
        };
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (error) {
        console.error('Error saving cache:', error);
      }
    }
  }, [selectedDepartment, selectedDocument, isDepartmentSelected, agentData, tableAgentData, recommendationsData]);

  // Clear cache after 30 seconds
  useEffect(() => {
    if (isDepartmentSelected) {
      const timeout = setTimeout(() => {
        sessionStorage.removeItem(CACHE_KEY);
        console.log('🗑️ Cache cleared after 30 seconds');
      }, CACHE_DURATION);

      return () => clearTimeout(timeout);
    }
  }, [isDepartmentSelected]);

  // Fetch schema instances on component mount
  useEffect(() => {
    const loadSchemaInstances = async () => {
      setIsLoadingDocuments(true);
      setDocumentsError(null);
      try {
        const instances = await fetchSchemaInstances(10);
        setSchemaInstances(instances);
        console.log('✅ Loaded schema instances:', instances);
      } catch (error) {
        console.error('❌ Error loading schema instances:', error);
        setDocumentsError(error instanceof Error ? error.message : 'Failed to load documents');
      } finally {
        setIsLoadingDocuments(false);
      }
    };

    loadSchemaInstances();
  }, []);

  // Aggressively remove Jotform agent on this page
  useEffect(() => {
    // Remove immediately
    removeJotformAgent();
    
    // Keep checking and removing periodically
    const interval = setInterval(() => {
      removeJotformAgent();
    }, 100);
    
    // Also observe DOM changes to remove any new Jotform elements
    const observer = new MutationObserver(() => {
      removeJotformAgent();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target as Node)) {
        setShowDepartmentDropdown(false);
      }
      if (documentDropdownRef.current && !documentDropdownRef.current.contains(event.target as Node)) {
        setShowDocumentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const hasDocuments = schemaInstances.length > 0;
  const isSubmitDisabled = !selectedDepartment || (hasDocuments && !selectedDocument) || isSubmitting;

  // Filter departments based on search input
  const filteredDepartments = departmentSearch.trim()
    ? RAK_DEPARTMENTS.filter(dept =>
        dept.name.toLowerCase().includes(departmentSearch.toLowerCase().trim())
      )
    : RAK_DEPARTMENTS;

  // Filter documents based on search input
  const filteredDocuments = documentSearch.trim() && hasDocuments
    ? schemaInstances.filter(instance => {
        const filename = getFileNameWithoutExtension(instance.filename);
        return filename.toLowerCase().includes(documentSearch.toLowerCase().trim());
      })
    : schemaInstances;

  const handleDepartmentSelect = (departmentName: string) => {
    setSelectedDepartment(departmentName);
    setDepartmentSearch('');
    setShowDepartmentDropdown(false);
  };

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocument(documentId);
    setDocumentSearch('');
    setShowDocumentDropdown(false);
  };

  const handleDepartmentSearch = () => {
    if (!departmentSearch.trim()) {
      setShowDepartmentDropdown(true);
      return;
    }
    
    // If there's exactly one match, select it
    if (filteredDepartments.length === 1) {
      handleDepartmentSelect(filteredDepartments[0].name);
    } else if (filteredDepartments.length > 1) {
      // Show dropdown if multiple matches
      setShowDepartmentDropdown(true);
    } else {
      // No matches
      alert(`Department "${departmentSearch}" not found. Please try again.`);
      setDepartmentSearch('');
    }
  };

  const handleDocumentSearch = () => {
    if (!hasDocuments || isLoadingDocuments) return;
    
    if (!documentSearch.trim()) {
      setShowDocumentDropdown(true);
      return;
    }
    
    // If there's exactly one match, select it
    if (filteredDocuments.length === 1) {
      handleDocumentSelect(filteredDocuments[0].id.toString());
    } else if (filteredDocuments.length > 1) {
      // Show dropdown if multiple matches
      setShowDocumentDropdown(true);
    } else {
      // No matches
      alert(`Document "${documentSearch}" not found. Please try again.`);
      setDocumentSearch('');
    }
  };

  const handleSubmit = async () => {
    if (isSubmitDisabled) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Get CDN URL from selected schema instance
      const fileUrls: string[] = [];
      
      if (hasDocuments && selectedDocument) {
        // Find the selected document from schema instances
        const selectedInstance = schemaInstances.find(instance => 
          instance.id.toString() === selectedDocument || instance.id === selectedDocument
        );
        
        // Extract CDN URLs - support both cdnUrls (array) and cdnurl (legacy)
        if (selectedInstance?.cdnUrls && Array.isArray(selectedInstance.cdnUrls) && selectedInstance.cdnUrls.length > 0) {
          // New format: cdnUrls is an array
          fileUrls.push(...selectedInstance.cdnUrls);
        } else if (selectedInstance?.cdnurl) {
          // Legacy format: cdnurl is a single string
          fileUrls.push(selectedInstance.cdnurl);
        } else {
          throw new Error('CDN URL not found for selected document');
        }
      } else if (!hasDocuments) {
        throw new Error('No documents available. Please ensure documents are uploaded to the schema.');
      } else {
        throw new Error('Please select a document');
      }

      if (fileUrls.length === 0) {
        throw new Error('No CDN URL found for the selected document');
      }

      // Call all four agents in parallel
      console.log('🤖 Calling all four agents in parallel...');
      const secondAgentId = 'f47e4077-61c3-40e3-8c62-0613da775370';
      const recommendationsAgentId = '8f0afca7-8388-4ce3-900c-ad6cbb552217';
      const documentClassificationAgentId = 'ab028399-ce39-47ac-a003-68a4c2d30407';
      
      const [response1, response2, response3, response4] = await Promise.all([
        interactWithAgent(selectedDepartment, fileUrls),
        interactWithAgent(selectedDepartment, fileUrls, secondAgentId),
        interactWithAgent(selectedDepartment, fileUrls, recommendationsAgentId),
        interactWithAgent(selectedDepartment, fileUrls, documentClassificationAgentId)
      ]);
      
      console.log('✅ First agent response received:', response1);
      console.log('✅ Second agent response received:', response2);
      console.log('✅ Third agent (recommendations) response received:', response3);
      console.log('✅ Fourth agent (document classification) response received:', response4);
      
      // Parse and store first agent response data (main tender overview data)
      const parsedData = parseAgentResponse(response1);
      if (parsedData) {
        setAgentData(parsedData);
        console.log('✅ Parsed first agent data:', parsedData);
      } else {
        console.warn('⚠️ Could not parse first agent response, using default data');
      }
      
      // Parse and store second agent response for table data
      const parsedTableData = parseTableAgentResponse(response2);
      if (parsedTableData) {
        setTableAgentData(parsedTableData);
        console.log('✅ Parsed second agent table data:', parsedTableData);
      } else {
        console.warn('⚠️ Could not parse second agent response for table');
      }
      
      // Parse and store third agent response for recommendations data
      const parsedRecommendationsData = parseRecommendationsAgentResponse(response3);
      if (parsedRecommendationsData) {
        setRecommendationsData(parsedRecommendationsData);
        console.log('✅ Parsed recommendations agent data:', parsedRecommendationsData);
      } else {
        console.warn('⚠️ Could not parse recommendations agent response');
      }
      
      // Parse and store fourth agent response for document classification data
      const parsedDocumentClassificationData = parseDocumentClassificationAgentResponse(response4);
      if (parsedDocumentClassificationData) {
        setDocumentClassificationData(parsedDocumentClassificationData);
        console.log('✅ Parsed document classification agent data:', parsedDocumentClassificationData);
      } else {
        console.warn('⚠️ Could not parse document classification agent response');
        setDocumentClassificationData(null);
      }
      
      // Show the main content after successful submission
      setIsDepartmentSelected(true);
    } catch (error) {
      console.error('Error calling agent:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit to agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Department Selection Screen
  if (!isDepartmentSelected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar 
          currentPage="tender-overview" 
          onNavigate={onNavigate as (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration' | 'tender-article' | 'tender-overview') => void} 
        />
        
        <main className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 flex items-center justify-center" style={{ marginLeft: 'var(--sidebar-offset, 0px)' }}>
          <div className="w-full max-w-2xl px-6 py-12">
            {/* Heading */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Tender Overview
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-sky-400 to-blue-400 mx-auto rounded-full"></div>
            </div>

            {/* Department Selection Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-10">
              <div className="mb-8">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="department-search" className="block text-lg font-semibold text-gray-800 mb-3 text-center">
                      Select Department
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1" ref={departmentDropdownRef}>
                        <input
                          id="department-search"
                          type="text"
                          value={departmentSearch}
                          onChange={(e) => {
                            setDepartmentSearch(e.target.value);
                            setShowDepartmentDropdown(true);
                          }}
                          onFocus={() => setShowDepartmentDropdown(true)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleDepartmentSearch();
                            }
                          }}
                          placeholder="Type to search department..."
                          className="w-full px-4 py-4 pl-12 text-base border-2 border-sky-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200 bg-white text-gray-900 hover:border-sky-400 shadow-sm"
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        
                        {/* Dropdown List */}
                        {showDepartmentDropdown && filteredDepartments.length > 0 && (
                          <div className="absolute z-50 w-full mt-2 bg-white border-2 border-sky-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                            {filteredDepartments.map((dept) => (
                              <div
                                key={dept.id}
                                onClick={() => handleDepartmentSelect(dept.name)}
                                className="px-4 py-3 hover:bg-sky-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                              >
                                <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleDepartmentSearch}
                        className="px-6 py-4 bg-gradient-to-r from-sky-400 to-blue-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2"
                      >
                        <Search className="w-5 h-5" />
                        Search
                      </button>
                    </div>
                    {selectedDepartment && (
                      <div className="mt-3 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                        <p className="text-sm text-gray-700">
                          Selected: <span className="font-semibold text-sky-600">{selectedDepartment}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="document-search" className="block text-lg font-semibold text-gray-800 mb-3 text-center">
                      Select Document
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1" ref={documentDropdownRef}>
                        <input
                          id="document-search"
                          type="text"
                          value={documentSearch}
                          onChange={(e) => {
                            setDocumentSearch(e.target.value);
                            setShowDocumentDropdown(true);
                          }}
                          onFocus={() => {
                            if (hasDocuments && !isLoadingDocuments) {
                              setShowDocumentDropdown(true);
                            }
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleDocumentSearch();
                            }
                          }}
                          placeholder={isLoadingDocuments ? 'Loading documents...' : hasDocuments ? 'Type to search document...' : 'No documents available'}
                          disabled={!hasDocuments || isLoadingDocuments}
                          className={`w-full px-4 py-4 pl-12 text-base border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white ${hasDocuments && !isLoadingDocuments ? 'border-sky-300 text-gray-900 focus:ring-2 focus:ring-sky-400 focus:border-transparent hover:border-sky-400 shadow-sm' : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'}`}
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        
                        {/* Dropdown List */}
                        {showDocumentDropdown && hasDocuments && !isLoadingDocuments && filteredDocuments.length > 0 && (
                          <div className="absolute z-50 w-full mt-2 bg-white border-2 border-sky-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                            {filteredDocuments.map((instance) => {
                              const filename = getFileNameWithoutExtension(instance.filename);
                              return (
                                <div
                                  key={instance.id}
                                  onClick={() => handleDocumentSelect(instance.id.toString())}
                                  className="px-4 py-3 hover:bg-sky-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                                >
                                  <p className="text-sm font-medium text-gray-900">{filename}</p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleDocumentSearch}
                        disabled={!hasDocuments || isLoadingDocuments}
                        className={`px-6 py-4 font-semibold rounded-xl transition-all duration-200 transform flex items-center gap-2 ${
                          hasDocuments && !isLoadingDocuments
                            ? 'bg-gradient-to-r from-sky-400 to-blue-400 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Search className="w-5 h-5" />
                        Search
                      </button>
                    </div>
                    {isLoadingDocuments && (
                      <p className="mt-2 text-xs text-gray-500 text-center">
                        Loading documents from schema...
                      </p>
                    )}
                    {documentsError && (
                      <p className="mt-2 text-xs text-red-500 text-center">
                        {documentsError}
                      </p>
                    )}
                    {selectedDocument && (
                      <div className="mt-3 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                        <p className="text-sm text-gray-700">
                          Selected: <span className="font-semibold text-sky-600">
                            {getFileNameWithoutExtension(schemaInstances.find(instance => 
                              instance.id.toString() === selectedDocument || instance.id === selectedDocument
                            )?.filename || 'Selected')}
                          </span>
                        </p>
                      </div>
                    )}
                    {hasDocuments && !selectedDocument && !isLoadingDocuments && (
                      <p className="mt-2 text-xs text-gray-500 text-center">
                        Search and select a document to continue.
                      </p>
                    )}
                    {!hasDocuments && !isLoadingDocuments && !documentsError && (
                      <p className="mt-2 text-xs text-gray-500 text-center">
                        No documents found. Upload files in Tender Intake to see them here.
                      </p>
                    )}
                  </div>
                </div>
                {(selectedDepartment || selectedDocument) && (
                  <div className="mt-3 text-sm text-gray-600 text-center space-y-1">
                    {selectedDepartment && (
                      <p>
                        Department: <span className="font-semibold text-sky-600">{selectedDepartment}</span>
                      </p>
                    )}
                    {selectedDocument && (
                      <p>
                        Document: <span className="font-semibold text-sky-600">
                          {getFileNameWithoutExtension(schemaInstances.find(instance => 
                            instance.id.toString() === selectedDocument || instance.id === selectedDocument
                          )?.filename || 'Selected')}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">{submitError}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                  className={`
                    px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 transform
                    ${!isSubmitDisabled
                      ? 'bg-gradient-to-r from-sky-400 to-blue-400 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Please select a department and document to view the tender evaluation framework
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main Content (shown after department selection)
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        currentPage="tender-overview" 
        onNavigate={onNavigate as (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration' | 'tender-article' | 'tender-overview') => void} 
      />
      
      <main className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 p-4 md:p-8" style={{ marginLeft: 'var(--sidebar-offset, 0px)' }}>
        <div className="mx-auto max-w-7xl">
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-2xl shadow-xl p-8 mb-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">
                      Tender Overview
                    </h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm mt-4">
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                      <Award className="w-4 h-4" />
                      <span className="font-medium">Department:</span>
                      <span className="font-semibold">{selectedDepartment}</span>
                    </div>
                    {selectedDocument && (
                      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">Document:</span>
                        <span className="font-semibold">
                          {getFileNameWithoutExtension(schemaInstances.find(instance => 
                            instance.id.toString() === selectedDocument || instance.id === selectedDocument
                          )?.filename || 'Selected')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsDepartmentSelected(false);
                    setSelectedDepartment('');
                    setSelectedDocument('');
                    setAgentData(null);
                    setTableAgentData(null);
                    // Clear cache when changing department
                    sessionStorage.removeItem(CACHE_KEY);
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-blue-800 bg-white rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  Change Department
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Main Tabs */}
          <div className="w-full mb-8">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-2">
              <nav className="flex gap-2 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview', icon: TrendingUp },
                  { id: 'overview-table', label: 'Overview Table', icon: FileText },
                  { id: 'financial', label: 'Financial', icon: Award },
                  { id: 'technical', label: 'Technical', icon: Shield },
                  { id: 'compliance', label: 'Compliance', icon: CheckCircle2 },
                  { id: 'support', label: 'Support', icon: Clock },
                  { id: 'analysis', label: 'Recommendations', icon: Lightbulb },
                  { id: 'document-classification', label: 'Document Classification', icon: FolderTree }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg transition-all duration-200 relative
                        ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-sky-400 to-blue-400 text-white shadow-lg transform scale-105'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Enhanced Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Enhanced Evaluation Weighting */}
                <div className="bg-gradient-to-br from-white to-sky-50/30 rounded-2xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-400 to-blue-400 p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold">
                        {agentData?.tenderOverview?.overview?.evaluationWeighting?.title || 'Evaluation Weighting'}
                      </h2>
                    </div>
                    <p className="text-sky-100 text-sm">
                      {agentData?.tenderOverview?.overview?.evaluationWeighting?.description || 'Overall criteria distribution'}
                    </p>
                  </div>
                  <div className="p-8 bg-white/50">
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={agentData?.tenderOverview?.overview?.evaluationWeighting?.data || defaultWeightingData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name} ${value}%`}
                          outerRadius={110}
                          innerRadius={40}
                          fill="#8884d8"
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={800}
                        >
                          {(agentData?.tenderOverview?.overview?.evaluationWeighting?.data || defaultWeightingData).map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Enhanced Key Requirements */}
                <div className="bg-gradient-to-br from-white to-sky-50/30 rounded-2xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-400 to-blue-400 p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold">
                        {agentData?.tenderOverview?.overview?.keyRequirements?.title || 'Key Requirements'}
                      </h2>
                    </div>
                    <p className="text-sky-100 text-sm">
                      {agentData?.tenderOverview?.overview?.keyRequirements?.description || 'Mandatory qualifications'}
                    </p>
                  </div>
                  <div className="p-6 space-y-4 bg-white/50">
                    {(agentData?.tenderOverview?.overview?.keyRequirements?.requirements || [
                      { label: 'Named Users (Year 1)', value: '20' },
                      { label: 'Analytics Licenses', value: '20' },
                      { label: 'Project Duration', value: '36 months' },
                      { label: 'Sprint Cycles', value: '2 weeks' },
                      { label: 'Minimum Company Experience', value: '10 years' }
                    ]).map((req, index, array) => {
                      // Handle both string values and object values with {value, unit}
                      let displayValue: string;
                      if (typeof req.value === 'string') {
                        displayValue = req.value;
                      } else if (req.value && typeof req.value === 'object' && 'value' in req.value) {
                        const valueObj = req.value as { value?: string | number; unit?: string };
                        displayValue = `${valueObj.value || ''}${valueObj.unit || ''}`.trim();
                      } else {
                        displayValue = String(req.value || '');
                      }
                      
                      return (
                        <div 
                          key={index} 
                          className={`flex items-center justify-between p-4 rounded-xl bg-white/80 hover:bg-white transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] ${index < array.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                          <span className="text-sm font-semibold text-gray-800">{req.label}</span>
                          <span className="px-4 py-2 text-base font-bold text-sky-600 bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-200 rounded-lg shadow-sm">
                            {displayValue}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Enhanced Evaluation Scoring Overview */}
              <div className="bg-gradient-to-br from-white via-sky-50 to-white rounded-2xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="bg-gradient-to-r from-sky-400 to-blue-400 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Award className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold">
                      {agentData?.tenderOverview?.overview?.evaluationScoringSystem?.title || 'Evaluation Scoring System'}
                    </h2>
                  </div>
                  <p className="text-sky-100 text-sm">
                    {agentData?.tenderOverview?.overview?.evaluationScoringSystem?.description || 'Comprehensive scoring methodology'}
                  </p>
                </div>
                <div className="p-8 bg-white/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div 
                      onClick={() => setActiveTab('financial')}
                      className="space-y-4 p-6 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-100 hover:shadow-lg hover:border-sky-300 cursor-pointer transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-sky-400 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {agentData?.tenderOverview?.overview?.evaluationScoringSystem?.financialScoring?.title || 'Financial Scoring'}
                        </h3>
                      </div>
                      <ul className="space-y-3 text-sm">
                        {(agentData?.tenderOverview?.overview?.evaluationScoringSystem?.financialScoring?.rules || [
                          'Lowest bidder: 100 points',
                          'Others: Scored proportionally based on price difference',
                          'Example: AED 10x = 100%, AED 12x = 80%, AED 14x = 60%'
                        ]).map((rule, index) => {
                          // Handle both string rules and object rules with {label, description}
                          const ruleText = typeof rule === 'string' 
                            ? rule 
                            : (rule && typeof rule === 'object' && 'description' in rule
                              ? `${(rule as { label?: string; description?: string }).label || ''}: ${(rule as { label?: string; description?: string }).description || ''}`.trim()
                              : String(rule || ''));
                          
                          return (
                            <li key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors">
                              <span className="text-sky-600 font-bold mt-0.5 text-lg">•</span>
                              <span className="text-gray-700 leading-relaxed">{ruleText}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <div 
                      onClick={() => setActiveTab('technical')}
                      className="space-y-4 p-6 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-100 hover:shadow-lg hover:border-sky-300 cursor-pointer transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-sky-400 rounded-lg">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {agentData?.tenderOverview?.overview?.evaluationScoringSystem?.technicalScoring?.title || 'Technical Scoring'}
                        </h3>
                      </div>
                      <ul className="space-y-3 text-sm">
                        {(agentData?.tenderOverview?.overview?.evaluationScoringSystem?.technicalScoring?.rules || [
                          'Scale: 1–10 for each category',
                          'Weighted: Based on importance of each criterion',
                          'Pass/Fail: Compliance requirements are mandatory'
                        ]).map((rule, index) => {
                          // Handle both string rules and object rules with {label, description}
                          const ruleText = typeof rule === 'string' 
                            ? rule 
                            : (rule && typeof rule === 'object' && 'description' in rule
                              ? `${(rule as { label?: string; description?: string }).label || ''}: ${(rule as { label?: string; description?: string }).description || ''}`.trim()
                              : String(rule || ''));
                          
                          return (
                            <li key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors">
                              <span className="text-sky-600 font-bold mt-0.5 text-lg">•</span>
                              <span className="text-gray-700 leading-relaxed">{ruleText}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Overview Table Tab */}
          {activeTab === 'overview-table' && (
            <div className="space-y-6">
              <TenderEvaluationTableView agentTableData={tableAgentData} />
            </div>
          )}

          {/* Enhanced Financial Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="bg-gradient-to-br from-white to-sky-50/30 rounded-2xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="bg-gradient-to-r from-sky-400 to-blue-400 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">
                        {agentData?.tenderOverview?.financial?.title || 'Financial Evaluation Criteria'}
                      </h2>
                      <p className="text-sky-100 text-sm mt-1">
                        Weight: {agentData?.tenderOverview?.financial?.weight || 50}{(() => {
                          const unit = agentData?.tenderOverview?.financial?.weightUnit || '%';
                          return unit.toLowerCase() === 'percentage' || unit.toLowerCase() === 'percent' ? '%' : unit;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-8 bg-white/50">
                  <div>
                    <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                      <div className="p-1.5 bg-sky-400 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      Evaluation Factors
                    </h3>
                    <div className="space-y-4">
                      {(agentData?.tenderOverview?.financial?.evaluationFactors || [
                        { order: 1, title: 'Completeness of Supporting Company Documentation', description: 'All required financial documents must be submitted' },
                        { order: 2, title: 'BOQ Alignment with Scope', description: 'Bill of Quantities components must match defined scope of work' },
                        { order: 3, title: 'Benchmark Comparison', description: 'Design, Configuration, Testing & UAT, Training, Staffing, Oracle License & Support Fees' }
                      ]).map((factor, index, array) => (
                        <div 
                          key={factor.order || index} 
                          className={`flex items-start gap-4 p-5 rounded-xl bg-gradient-to-r from-white to-sky-50/50 border border-sky-100 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.01] ${index < array.length - 1 ? 'border-b-2 border-sky-200' : ''}`}
                        >
                          <span className="px-3 py-1.5 text-sm font-bold bg-gradient-to-r from-sky-400 to-blue-400 text-white rounded-lg shadow-md flex-shrink-0">
                            {factor.order || index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 mb-1">{factor.title}</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{factor.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                      <div className="p-1.5 bg-red-600 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                      Disqualification Triggers
                    </h3>
                    <div className="space-y-3">
                      {(agentData?.tenderOverview?.financial?.disqualificationTriggers || [
                        'Missing mandatory financial documents',
                        'Major mismatch between BOQ and scope',
                        'Unrealistic, unbalanced, or non-compliant pricing'
                      ]).map((trigger, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border-2 border-red-200 hover:border-red-300 hover:shadow-md transition-all duration-200">
                          <span className="text-red-600 font-bold text-lg mt-0.5">✕</span>
                          <span className="text-sm font-medium text-gray-800 leading-relaxed">{trigger}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Technical Tab */}
          {activeTab === 'technical' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="bg-gradient-to-br from-white to-sky-50/30 rounded-2xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="bg-gradient-to-r from-sky-400 to-blue-400 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">
                        {agentData?.tenderOverview?.technical?.title || 'Technical Evaluation Criteria'}
                      </h2>
                      <p className="text-sky-100 text-sm mt-1">
                        Weight: {agentData?.tenderOverview?.technical?.weight || 50}{(() => {
                          const unit = agentData?.tenderOverview?.technical?.weightUnit || '%';
                          return unit.toLowerCase() === 'percentage' || unit.toLowerCase() === 'percent' ? '%' : unit;
                        })()} - {agentData?.tenderOverview?.technical?.scoringScale || 'Scored 1-10 per category'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-8 bg-white/50">
                  <div className="space-y-4">
                    {(agentData?.tenderOverview?.technical?.technicalCriteria || defaultTechnicalCriteria).map((criterion, index) => (
                      <div key={index} className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-white to-sky-50/50 border border-sky-100 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.01]">
                        <span className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-sky-400 to-blue-400 text-white rounded-lg shadow-md flex-shrink-0">
                          {criterion.weight}%
                        </span>
                        <p className="font-semibold text-gray-900 text-base">{criterion.category}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-100">
                    <h3 className="text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
                      <div className="p-1.5 bg-sky-400 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      What PSD Looks For
                    </h3>
                    <ul className="space-y-3">
                      {(agentData?.tenderOverview?.technical?.psdRequirements || [
                        'End-to-end methodology completeness (Assessment → Design → Config → UAT → Go-Live → Support)',
                        'Alignment with Oracle / Primavera implementation standards',
                        'Experience with KPI, ERM, GRC, PPM modules',
                        'Solid timeline, governance model, and execution roadmap',
                        'Structured training approach (Basic → Advanced → TTT → Video-based)'
                      ]).map((req, index) => (
                        <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/80 hover:bg-white transition-colors">
                          <span className="text-sky-600 font-bold mt-0.5 text-lg">✓</span>
                          <span className="text-sm text-gray-700 leading-relaxed">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
                      <div className="p-1.5 bg-red-600 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                      Disqualification Triggers
                    </h3>
                    <div className="space-y-3">
                      {(agentData?.tenderOverview?.technical?.disqualificationTriggers || [
                        'Major gaps between proposal and RFP requirements',
                        'Missing responses in any mandatory compliance matrix',
                        'Weak team (no certifications, insufficient experience, unrelated projects)'
                      ]).map((trigger, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border-2 border-red-200 hover:border-red-300 hover:shadow-md transition-all duration-200">
                          <span className="text-red-600 font-bold text-lg mt-0.5">✕</span>
                          <span className="text-sm font-medium text-gray-800 leading-relaxed">{trigger}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Compliance Tab */}
          {activeTab === 'compliance' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="bg-gradient-to-br from-white to-sky-50/30 rounded-2xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="bg-gradient-to-r from-sky-400 to-blue-400 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">
                        {agentData?.tenderOverview?.compliance?.title || 'Mandatory Compliance Requirements'}
                      </h2>
                      <p className="text-sky-100 text-sm mt-1">
                        {agentData?.tenderOverview?.compliance?.description || 'Pass/Fail - Non-Negotiable'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-8 bg-white/50">
                  <div>
                    <h3 className="text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
                      <div className="p-1.5 bg-sky-400 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      General Submission Compliance
                    </h3>
                    <div className="space-y-3">
                      {(agentData?.tenderOverview?.compliance?.generalSubmissionCompliance || [
                        'Proposal submitted in Arabic + English',
                        'Separate sealed envelopes for Technical & Financial proposals',
                        'Acknowledgement of Receipt (Appendix 1) submitted',
                        'All Appendices 1–9 fully completed',
                        'Proposal validity: 3 months'
                      ]).map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200 hover:shadow-md transition-all duration-200">
                          <span className="text-sky-600 font-bold text-lg">✓</span>
                          <span className="text-sm font-medium text-gray-800">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
                      <div className="p-1.5 bg-sky-400 rounded-lg">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      Technical Compliance Requirements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(agentData?.tenderOverview?.compliance?.technicalComplianceRequirements || [
                        'Process Requirements', 'Functional Requirements', 'Technical Requirements', 
                        'Deliverables Requirements', 'Other RFP Requirements', 'Sub-Consultants', 
                        'Project Team', 'CVs', 'Project Experience'
                      ]).map((req, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-sky-300 hover:shadow-md transition-all duration-200">
                          <span className="text-sm font-medium text-gray-800">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
                      <div className="p-1.5 bg-sky-400 rounded-lg">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      Team Compliance Requirements
                    </h3>
                    <div className="space-y-3">
                      {(agentData?.tenderOverview?.compliance?.teamComplianceRequirements || [
                        { title: 'Oracle Implementation Specialist Certifications', description: 'Mandatory requirement' },
                        { title: 'Integration Consultant', description: '8+ years experience + 3 successful implementations' },
                        { title: 'Key Team Member History', description: 'Evidence that key team members previously worked together on Unifier, P6, OBIEE' }
                      ]).map((req, index) => (
                        <div key={index} className="p-5 border-2 border-sky-200 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 hover:shadow-lg transition-all duration-200">
                          <p className="font-bold text-base text-gray-900 mb-1">{req.title}</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{req.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
                      <div className="p-1.5 bg-sky-500 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                      Oracle Licensing Compliance
                    </h3>
                    <div className="p-5 bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-300 rounded-xl shadow-md">
                      <p className="text-base font-bold text-gray-900">
                        {agentData?.tenderOverview?.compliance?.oracleLicensingCompliance?.note || 'All costs must match PSD-provided Oracle pricing (non-negotiable)'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Support Tab */}
          {activeTab === 'support' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="bg-gradient-to-br from-white to-sky-50/30 rounded-2xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="bg-gradient-to-r from-sky-400 to-blue-400 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">
                        {agentData?.tenderOverview?.support?.title || 'Support & Service Level Agreements'}
                      </h2>
                      <p className="text-sky-100 text-sm mt-1">
                        {agentData?.tenderOverview?.support?.description || 'Operational requirements and SLAs'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-8 bg-white/50">
                  <div>
                    <h3 className="text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
                      <div className="p-1.5 bg-sky-400 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      Support Availability
                    </h3>
                    <div className="space-y-4">
                      <div className="p-6 bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 rounded-xl shadow-md">
                        <p className="font-semibold text-sm mb-3 text-gray-700 uppercase tracking-wide">System Availability Requirement</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
                          {(() => {
                            const availability = agentData?.tenderOverview?.support?.supportAvailability;
                            if (!availability) return '99.5%';
                            
                            // Normalize unit function
                            const normalizeUnit = (unit: string | undefined) => {
                              if (!unit) return '%';
                              if (typeof unit !== 'string') return '%';
                              const normalized = unit.toLowerCase().trim();
                              if (normalized === 'percentage' || normalized === 'percent') return '%';
                              return unit;
                            };
                            
                            // Handle string directly
                            if (typeof availability === 'string') {
                              return (availability as string).includes('%') ? availability : `${availability}%`;
                            }
                            
                            // Handle number directly
                            if (typeof availability === 'number') {
                              return `${availability}%`;
                            }
                            
                            // Handle object - check if it's the systemAvailabilityRequirement object itself
                            if (typeof availability === 'object' && availability !== null) {
                              // First check if availability itself has a value property (it's the object with {value, unit})
                              if ('value' in availability) {
                                const value = (availability as { value?: number | string; unit?: string }).value;
                                if (value !== null && value !== undefined) {
                                  const unit = normalizeUnit((availability as { value?: number | string; unit?: string }).unit);
                                  return `${value}${unit}`;
                                }
                              }
                              
                              // Check if it has systemAvailabilityRequirement property that contains the object
                              if ('systemAvailabilityRequirement' in availability) {
                                const sysAvail = (availability as { systemAvailabilityRequirement?: any; unit?: string }).systemAvailabilityRequirement;
                                if (sysAvail !== null && sysAvail !== undefined) {
                                  // If systemAvailabilityRequirement is an object with value property
                                  if (typeof sysAvail === 'object' && 'value' in sysAvail) {
                                    const value = (sysAvail as { value?: number | string; unit?: string }).value;
                                    if (value !== null && value !== undefined) {
                                      const unit = normalizeUnit((sysAvail as { value?: number | string; unit?: string }).unit || (availability as { unit?: string }).unit);
                                      return `${value}${unit}`;
                                    }
                                  } else if (typeof sysAvail === 'number' || typeof sysAvail === 'string') {
                                    // If systemAvailabilityRequirement is directly a number or string
                                    const unit = normalizeUnit((availability as { unit?: string }).unit);
                                    return `${sysAvail}${unit}`;
                                  }
                                }
                              }
                            }
                            
                            return '99.5%';
                          })()}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <p className="font-bold text-base text-gray-900 mb-3">Support Hours:</p>
                        <div className="space-y-3">
                          {(agentData?.tenderOverview?.support?.supportHours || [
                            { type: 'Regular', schedule: '7:00 AM – 2:00 PM (Sun–Thu)' },
                            { type: 'Extended', schedule: '2:00 PM – 10:00 PM (Sun–Thu), Saturdays 9:00 AM – 2:00 PM' },
                            { type: 'Maintenance window', schedule: '4:00 PM – 6:00 PM (First Sunday monthly)' }
                          ]).map((hour, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-sky-300 hover:shadow-md transition-all duration-200">
                              <span className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-sky-400 to-blue-400 text-white rounded-lg flex-shrink-0">
                                {hour.type}
                              </span>
                              <span className="text-sm font-medium text-gray-800">{hour.schedule}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
                      <div className="p-1.5 bg-sky-500 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                      Incident Response Times
                    </h3>
                    <div className="space-y-3">
                      {(agentData?.tenderOverview?.support?.incidentResponseTimes || [
                        { priority: 'High', responseTime: '0–8 hours during business hours' },
                        { priority: 'Medium', responseTime: 'Within 48 hours' }
                      ]).map((incident, index) => (
                        <div key={index} className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                          incident.priority === 'High' 
                            ? 'bg-gradient-to-r from-sky-50 to-blue-50 border-sky-300' 
                            : 'bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200'
                        }`}>
                          <span className="font-bold text-base text-gray-900">{incident.priority} Priority</span>
                          <span className={`px-4 py-2 text-sm font-bold rounded-lg shadow-sm ${
                            incident.priority === 'High' 
                              ? 'bg-sky-500 text-white' 
                              : 'bg-sky-400 text-white'
                          }`}>
                            {incident.responseTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
                      <div className="p-1.5 bg-sky-400 rounded-lg">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      Severity Levels
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(agentData?.tenderOverview?.support?.severityLevels || [
                        { level: 1, description: 'Total Outage' },
                        { level: 2, description: 'Severe Degradation' },
                        { level: 3, description: 'Minor Service Impact' },
                        { level: 4, description: 'Information / Clarification' }
                      ]).map((severity, index) => (
                        <div key={index} className="flex items-start gap-4 p-5 bg-white rounded-xl border-2 border-gray-200 hover:border-sky-300 hover:shadow-md transition-all duration-200">
                          <span className="px-4 py-2 text-base font-bold bg-gradient-to-r from-sky-400 to-blue-400 text-white rounded-lg shadow-md flex-shrink-0">
                            {severity.level}
                          </span>
                          <p className="font-semibold text-base text-gray-900 pt-1">{severity.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
                      <div className="p-1.5 bg-sky-400 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      Backup & Disaster Recovery
                    </h3>
                    <div className="space-y-3">
                      {(agentData?.tenderOverview?.support?.backupAndDisasterRecovery || [
                        { type: 'Daily backup retention', period: '7 days' },
                        { type: 'Weekly backup retention', period: '4 weeks' },
                        { type: 'Monthly backup retention', period: '12 months' },
                        { type: 'Annual backup retention', period: '7 years' }
                      ]).map((backup, index) => (
                        <div key={index} className="flex items-center justify-between p-5 bg-gradient-to-r from-white to-sky-50/50 rounded-xl border-2 border-sky-200 hover:shadow-md transition-all duration-200">
                          <span className="font-bold text-base text-gray-900">{backup.type}</span>
                          <span className="px-4 py-2 text-sm font-semibold bg-sky-100 text-sky-800 rounded-lg border border-sky-300">
                            {backup.period}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {agentData?.tenderOverview?.support?.reliabilityRequirement && (
                    <div className="p-6 bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-300 rounded-xl shadow-md">
                      <p className="text-base font-bold text-gray-900">
                        <span className="text-sky-600">Reliability Requirement:</span> {agentData.tenderOverview.support.reliabilityRequirement}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'analysis' && (
            <RecommendationsTab recommendationsData={recommendationsData} />
          )}

          {/* Document Classification Tab */}
          {activeTab === 'document-classification' && (
            <DocumentClassificationTab documentClassificationData={documentClassificationData} />
          )}
        </div>
      </main>
      
      {/* Chatbot Component - Only on Tender Overview Page */}
      <Chatbot department={selectedDepartment} document={selectedDocument} />
    </div>
  );
}

// Recommendations Tab Component
interface RecommendationsTabProps {
  recommendationsData: any | null;
}

function RecommendationsTab({ recommendationsData }: RecommendationsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'completeness' | 'gaps' | 'risks' | 'recommendations'>('completeness');
  
  // Use API data from agent
  const analysisData = recommendationsData;

  // Show loading/empty state if no data available
  if (!analysisData) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center">
          <p className="text-gray-500">No recommendations data available. Please submit the form to load data from the agent.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Sub-tabs Navigation */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-2">
        <nav className="flex gap-2 overflow-x-auto">
          {[
            { id: 'completeness', label: 'Completeness Assessment', icon: Target },
            { id: 'gaps', label: 'Gap Categories', icon: FileSearch },
            { id: 'risks', label: 'Critical Risks', icon: AlertTriangle },
            { id: 'recommendations', label: 'Recommendations', icon: Lightbulb }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg transition-all duration-200 relative
                  ${
                    activeSubTab === tab.id
                      ? 'bg-gradient-to-r from-sky-400 to-blue-400 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${activeSubTab === tab.id ? 'text-white' : 'text-gray-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Completeness Assessment Sub-tab */}
      {activeSubTab === 'completeness' && analysisData?.completenessAssessment && (
        <div className="animate-in fade-in duration-500">
              {/* Completeness Assessment Section */}
              <div className="bg-gradient-to-br from-white to-sky-50/30 rounded-2xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="bg-gradient-to-r from-sky-400 to-blue-400 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Target className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold">Completeness Assessment</h2>
                  </div>
                </div>
                <div className="p-6 bg-white/50">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-lg font-semibold text-gray-900">Overall Score</p>
                      <div className="flex items-center gap-3">
                        <div className="relative w-32 h-32">
                          <svg className="transform -rotate-90 w-32 h-32">
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="none"
                              className="text-gray-200"
                            />
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="none"
                              strokeDasharray={`${((analysisData.completenessAssessment?.overallScore || 0) / 100) * 351.86} 351.86`}
                              className="text-sky-500"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900">{analysisData.completenessAssessment?.overallScore || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-base text-gray-700 leading-relaxed">{analysisData.completenessAssessment?.summary || 'No summary available'}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysisData.completenessAssessment?.missingSections && analysisData.completenessAssessment.missingSections.length > 0 && (
                      <div className="bg-gradient-to-br from-red-50 via-white to-red-50/50 rounded-xl border-2 border-red-200 p-5 hover:shadow-lg transition-shadow duration-200 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-200/20 to-transparent rounded-full blur-2xl"></div>
                        <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2 relative z-10">
                          <div className="p-2 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg shadow-lg ring-2 ring-white/50">
                            <AlertTriangle className="w-5 h-5 text-white drop-shadow-sm" />
                          </div>
                          <span className="bg-gradient-to-r from-red-900 via-red-800 to-red-700 bg-clip-text text-transparent">Missing Sections</span>
                        </h3>
                        <ul className="space-y-2 relative z-10">
                          {analysisData.completenessAssessment.missingSections.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 hover:bg-white/50 p-1.5 rounded-lg -ml-1.5 transition-colors duration-200">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-500 to-rose-500 flex-shrink-0"></span>
                              <span className="text-sm text-red-800 leading-relaxed flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisData.completenessAssessment?.weakSections && analysisData.completenessAssessment.weakSections.length > 0 && (
                      <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50/50 rounded-xl border-2 border-orange-200 p-5 hover:shadow-lg transition-shadow duration-200 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-200/20 to-transparent rounded-full blur-2xl"></div>
                        <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center gap-2 relative z-10">
                          <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-lg ring-2 ring-white/50">
                            <AlertCircle className="w-5 h-5 text-white drop-shadow-sm" />
                          </div>
                          <span className="bg-gradient-to-r from-orange-900 via-orange-800 to-orange-700 bg-clip-text text-transparent">Weak Sections</span>
                        </h3>
                        <ul className="space-y-2 relative z-10">
                          {analysisData.completenessAssessment.weakSections.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 hover:bg-white/50 p-1.5 rounded-lg -ml-1.5 transition-colors duration-200">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex-shrink-0"></span>
                              <span className="text-sm text-orange-800 leading-relaxed flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisData.completenessAssessment?.unclearSections && analysisData.completenessAssessment.unclearSections.length > 0 && (
                      <div className="bg-gradient-to-br from-yellow-50 via-white to-yellow-50/50 rounded-xl border-2 border-yellow-200 p-5 hover:shadow-lg transition-shadow duration-200 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-200/20 to-transparent rounded-full blur-2xl"></div>
                        <h3 className="text-lg font-bold text-yellow-900 mb-3 flex items-center gap-2 relative z-10">
                          <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg shadow-lg ring-2 ring-white/50">
                            <AlertCircle className="w-5 h-5 text-white drop-shadow-sm" />
                          </div>
                          <span className="bg-gradient-to-r from-yellow-900 via-yellow-800 to-yellow-700 bg-clip-text text-transparent">Unclear Sections</span>
                        </h3>
                        <ul className="space-y-2 relative z-10">
                          {analysisData.completenessAssessment.unclearSections.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 hover:bg-white/50 p-1.5 rounded-lg -ml-1.5 transition-colors duration-200">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex-shrink-0"></span>
                              <span className="text-sm text-yellow-800 leading-relaxed flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisData.completenessAssessment?.outdatedContent && analysisData.completenessAssessment.outdatedContent.length > 0 && (
                      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/50 rounded-xl border-2 border-blue-200 p-5 hover:shadow-lg transition-shadow duration-200 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-2xl"></div>
                        <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2 relative z-10">
                          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-lg ring-2 ring-white/50">
                            <Clock className="w-5 h-5 text-white drop-shadow-sm" />
                          </div>
                          <span className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 bg-clip-text text-transparent">Outdated Content</span>
                        </h3>
                        <ul className="space-y-2 relative z-10">
                          {analysisData.completenessAssessment.outdatedContent.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 hover:bg-white/50 p-1.5 rounded-lg -ml-1.5 transition-colors duration-200">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex-shrink-0"></span>
                              <span className="text-sm text-blue-800 leading-relaxed flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
        </div>
      )}

      {/* Gap Categories Sub-tab */}
      {activeSubTab === 'gaps' && analysisData?.gapCategories && (
        <div className="animate-in fade-in duration-500">
              {/* Gap Categories Section */}
              <div className="bg-gradient-to-br from-white to-sky-50/30 rounded-2xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="bg-gradient-to-r from-sky-400 to-blue-400 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <FileSearch className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold">Gap Categories</h2>
                  </div>
                </div>
                <div className="p-6 bg-white/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(analysisData.gapCategories || {}).map(([category, items], idx) => {
                      const itemsArray = items as string[];
                      
                      // Color variations for different categories
                      const colorVariants = [
                        { bg: 'from-emerald-500 to-teal-500', iconBg: 'from-emerald-400 to-teal-400', border: 'border-emerald-200', hoverBorder: 'hover:border-emerald-400', bullet: 'text-emerald-600' },
                        { bg: 'from-violet-500 to-purple-500', iconBg: 'from-violet-400 to-purple-400', border: 'border-violet-200', hoverBorder: 'hover:border-violet-400', bullet: 'text-violet-600' },
                        { bg: 'from-amber-500 to-orange-500', iconBg: 'from-amber-400 to-orange-400', border: 'border-amber-200', hoverBorder: 'hover:border-amber-400', bullet: 'text-amber-600' },
                        { bg: 'from-rose-500 to-pink-500', iconBg: 'from-rose-400 to-pink-400', border: 'border-rose-200', hoverBorder: 'hover:border-rose-400', bullet: 'text-rose-600' },
                        { bg: 'from-indigo-500 to-blue-500', iconBg: 'from-indigo-400 to-blue-400', border: 'border-indigo-200', hoverBorder: 'hover:border-indigo-400', bullet: 'text-indigo-600' },
                        { bg: 'from-cyan-500 to-sky-500', iconBg: 'from-cyan-400 to-sky-400', border: 'border-cyan-200', hoverBorder: 'hover:border-cyan-400', bullet: 'text-cyan-600' },
                        { bg: 'from-lime-500 to-green-500', iconBg: 'from-lime-400 to-green-400', border: 'border-lime-200', hoverBorder: 'hover:border-lime-400', bullet: 'text-lime-600' },
                        { bg: 'from-fuchsia-500 to-pink-500', iconBg: 'from-fuchsia-400 to-pink-400', border: 'border-fuchsia-200', hoverBorder: 'hover:border-fuchsia-400', bullet: 'text-fuchsia-600' },
                        { bg: 'from-blue-500 to-indigo-500', iconBg: 'from-blue-400 to-indigo-400', border: 'border-blue-200', hoverBorder: 'hover:border-blue-400', bullet: 'text-blue-600' },
                      ];
                      const colorScheme = colorVariants[idx % colorVariants.length];
                      
                      return itemsArray.length > 0 && (
                        <div key={category} className={`p-5 bg-gradient-to-br from-white via-white to-slate-50/50 border-2 ${colorScheme.border} ${colorScheme.hoverBorder} rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}>
                          {/* Subtle gradient overlay */}
                          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorScheme.bg} opacity-5 rounded-full blur-2xl`}></div>
                          
                          <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2 relative z-10">
                            <div className={`p-1.5 bg-gradient-to-br ${colorScheme.bg} rounded-lg shadow-lg ring-2 ring-white/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                              <FileText className="w-4 h-4 text-white drop-shadow-sm" />
                            </div>
                            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">{category}</span>
                          </h3>
                          <ul className="space-y-2 relative z-10">
                            {itemsArray.map((item: string, index: number) => (
                              <li key={index} className="flex items-start gap-3 hover:bg-white/50 p-2 rounded-lg -ml-2 transition-all duration-200 group/item">
                                <span className={`mt-1.5 w-2 h-2 rounded-full bg-gradient-to-r ${colorScheme.bg} flex-shrink-0 group-hover/item:scale-150 group-hover/item:shadow-lg transition-all duration-300`}></span>
                                <span className="text-sm text-gray-700 leading-relaxed flex-1">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
        </div>
      )}

      {/* Critical Risks Sub-tab */}
      {activeSubTab === 'risks' && analysisData?.criticalRisks && (
        <div className="animate-in fade-in duration-500">
              {/* Critical Risks Section */}
              <div className="bg-gradient-to-br from-white via-slate-50/30 to-rose-50/30 rounded-2xl border-2 border-gray-200/60 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden backdrop-blur-sm relative group">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-200/10 via-red-200/5 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-200/10 via-amber-200/5 to-transparent rounded-full blur-3xl"></div>
                
                <div className="bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 p-5 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]"></div>
                  <div className="relative flex items-center gap-3">
                    <div className="p-2.5 bg-white/25 rounded-xl backdrop-blur-md shadow-xl ring-2 ring-white/20 group-hover:scale-110 transition-transform duration-300">
                      <AlertTriangle className="w-5 h-5 drop-shadow-md" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-0.5 drop-shadow-sm">Critical Risks</h2>
                      <p className="text-xs text-white/95 font-medium">Risk Impact Assessment</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-white/80 via-white/60 to-white/80 backdrop-blur-sm relative">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                    {analysisData.criticalRisks?.highImpactRisks && analysisData.criticalRisks.highImpactRisks.length > 0 && (
                      <div className="bg-gradient-to-br from-red-50 via-white to-red-50/50 backdrop-blur-sm rounded-xl border-2 border-red-300 p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-200/20 to-transparent rounded-full blur-2xl"></div>
                        <h3 className="text-base font-bold text-red-900 mb-3 flex items-center gap-2 relative z-10">
                          <div className="p-2 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg shadow-lg ring-2 ring-white/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            <AlertTriangle className="w-4 h-4 text-white drop-shadow-sm" />
                          </div>
                          <span className="bg-gradient-to-r from-red-900 via-red-800 to-red-700 bg-clip-text text-transparent">High Impact</span>
                        </h3>
                        <ul className="space-y-2 relative z-10">
                          {analysisData.criticalRisks.highImpactRisks.map((risk: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 hover:bg-white/50 p-1.5 rounded-lg -ml-1.5 transition-all duration-200 group/item">
                              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-500 to-rose-500 flex-shrink-0 group-hover/item:scale-150 group-hover/item:shadow-lg transition-all duration-300"></span>
                              <span className="text-xs text-red-800 leading-relaxed flex-1">{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisData.criticalRisks?.mediumImpactRisks && analysisData.criticalRisks.mediumImpactRisks.length > 0 && (
                      <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50/50 backdrop-blur-sm rounded-xl border-2 border-orange-300 p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-200/20 to-transparent rounded-full blur-2xl"></div>
                        <h3 className="text-base font-bold text-orange-900 mb-3 flex items-center gap-2 relative z-10">
                          <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-lg ring-2 ring-white/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            <AlertCircle className="w-4 h-4 text-white drop-shadow-sm" />
                          </div>
                          <span className="bg-gradient-to-r from-orange-900 via-orange-800 to-orange-700 bg-clip-text text-transparent">Medium Impact</span>
                        </h3>
                        <ul className="space-y-2 relative z-10">
                          {analysisData.criticalRisks.mediumImpactRisks.map((risk: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 hover:bg-white/50 p-1.5 rounded-lg -ml-1.5 transition-all duration-200 group/item">
                              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex-shrink-0 group-hover/item:scale-150 group-hover/item:shadow-lg transition-all duration-300"></span>
                              <span className="text-xs text-orange-800 leading-relaxed flex-1">{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisData.criticalRisks?.lowImpactRisks && analysisData.criticalRisks.lowImpactRisks.length > 0 && (
                      <div className="bg-gradient-to-br from-yellow-50 via-white to-yellow-50/50 backdrop-blur-sm rounded-xl border-2 border-yellow-300 p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-200/20 to-transparent rounded-full blur-2xl"></div>
                        <h3 className="text-base font-bold text-yellow-900 mb-3 flex items-center gap-2 relative z-10">
                          <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg shadow-lg ring-2 ring-white/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            <AlertCircle className="w-4 h-4 text-white drop-shadow-sm" />
                          </div>
                          <span className="bg-gradient-to-r from-yellow-900 via-yellow-800 to-yellow-700 bg-clip-text text-transparent">Low Impact</span>
                        </h3>
                        <ul className="space-y-2 relative z-10">
                          {analysisData.criticalRisks.lowImpactRisks.map((risk: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 hover:bg-white/50 p-1.5 rounded-lg -ml-1.5 transition-all duration-200 group/item">
                              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex-shrink-0 group-hover/item:scale-150 group-hover/item:shadow-lg transition-all duration-300"></span>
                              <span className="text-xs text-yellow-800 leading-relaxed flex-1">{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
        </div>
      )}

      {/* Recommendations Sub-tab */}
      {activeSubTab === 'recommendations' && (
        <div>
              {/* Recommendations Section */}
              <div className="bg-gradient-to-br from-white to-sky-50/30 rounded-2xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="bg-gradient-to-r from-sky-400 to-blue-400 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold">Recommendations</h2>
                  </div>
                </div>
                <div className="p-6 bg-white/50">
                  {analysisData?.recommendations && Object.keys(analysisData.recommendations).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(analysisData.recommendations || {}).map(([category, items], idx) => {
                        const itemsArray = items as string[];
                        
                        // Color variations for different recommendations
                        const colorVariants = [
                          { bg: 'from-emerald-500 to-teal-500', iconBg: 'from-emerald-400 to-teal-400', border: 'border-emerald-200', hoverBorder: 'hover:border-emerald-400', bullet: 'text-emerald-600' },
                          { bg: 'from-violet-500 to-purple-500', iconBg: 'from-violet-400 to-purple-400', border: 'border-violet-200', hoverBorder: 'hover:border-violet-400', bullet: 'text-violet-600' },
                          { bg: 'from-amber-500 to-orange-500', iconBg: 'from-amber-400 to-orange-400', border: 'border-amber-200', hoverBorder: 'hover:border-amber-400', bullet: 'text-amber-600' },
                          { bg: 'from-rose-500 to-pink-500', iconBg: 'from-rose-400 to-pink-400', border: 'border-rose-200', hoverBorder: 'hover:border-rose-400', bullet: 'text-rose-600' },
                          { bg: 'from-indigo-500 to-blue-500', iconBg: 'from-indigo-400 to-blue-400', border: 'border-indigo-200', hoverBorder: 'hover:border-indigo-400', bullet: 'text-indigo-600' },
                          { bg: 'from-cyan-500 to-sky-500', iconBg: 'from-cyan-400 to-sky-400', border: 'border-cyan-200', hoverBorder: 'hover:border-cyan-400', bullet: 'text-cyan-600' },
                          { bg: 'from-lime-500 to-green-500', iconBg: 'from-lime-400 to-green-400', border: 'border-lime-200', hoverBorder: 'hover:border-lime-400', bullet: 'text-lime-600' },
                          { bg: 'from-fuchsia-500 to-pink-500', iconBg: 'from-fuchsia-400 to-pink-400', border: 'border-fuchsia-200', hoverBorder: 'hover:border-fuchsia-400', bullet: 'text-fuchsia-600' },
                          { bg: 'from-blue-500 to-indigo-500', iconBg: 'from-blue-400 to-indigo-400', border: 'border-blue-200', hoverBorder: 'hover:border-blue-400', bullet: 'text-blue-600' },
                        ];
                        const colorScheme = colorVariants[idx % colorVariants.length];
                        
                        return itemsArray.length > 0 && (
                          <div key={category} className={`p-5 bg-gradient-to-br from-white via-white to-slate-50/50 border-2 ${colorScheme.border} ${colorScheme.hoverBorder} rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}>
                            {/* Subtle gradient overlay */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorScheme.bg} opacity-5 rounded-full blur-2xl`}></div>
                            
                            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2 relative z-10">
                              <div className={`p-1.5 bg-gradient-to-br ${colorScheme.bg} rounded-lg shadow-lg ring-2 ring-white/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                <CheckCircle2 className="w-4 h-4 text-white drop-shadow-sm" />
                              </div>
                              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                                {(() => {
                                  // Handle common acronyms and special cases
                                  const acronyms: Record<string, string> = {
                                    'KPIs': 'KPIs',
                                    'SLAs': 'SLAs',
                                    'missingSLAs': 'Missing SLAs',
                                    'O&M/DR/cyber/AI/automationModules': 'O&M/DR/Cyber/AI/Automation Modules',
                                    'Support/SLA': 'Support/SLA'
                                  };
                                  
                                  if (acronyms[category]) {
                                    return acronyms[category];
                                  }
                                  
                                  // Handle camelCase - add space before capital letters, but preserve acronyms
                                  return category
                                    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase
                                    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // Add space between acronym and word
                                    .replace(/\b(SL)\s+(As)\b/gi, 'SLAs') // Fix "SL As" to "SLAs"
                                    .replace(/\b(K)\s+(P)\s+(Is?)\b/gi, 'KPIs') // Fix "K P Is" to "KPIs"
                                    .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
                                })()}
                              </span>
                            </h3>
                            <ul className="space-y-2 relative z-10">
                              {itemsArray.map((item: string, index: number) => (
                                <li key={index} className="flex items-start gap-3 hover:bg-white/50 p-2 rounded-lg -ml-2 transition-all duration-200 group/item">
                                  <span className={`mt-1.5 w-2 h-2 rounded-full bg-gradient-to-r ${colorScheme.bg} flex-shrink-0 group-hover/item:scale-150 group-hover/item:shadow-lg transition-all duration-300`}></span>
                                  <span className="text-sm text-gray-700 leading-relaxed flex-1">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center">
                      <p className="text-gray-500">No recommendations data available. Please submit the form to load data from the agent.</p>
                    </div>
                  )}
                </div>
              </div>
        </div>
      )}
    </div>
  );
}

// Document Classification Tab Component
interface DocumentClassificationTabProps {
  documentClassificationData: any | null;
}

function DocumentClassificationTab({ documentClassificationData }: DocumentClassificationTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'RFP' | 'SOW' | 'BOQ' | 'BOM' | 'BOS'>('RFP');
  
  // Use API data (from agent) or fallback to JSON data
  const classificationData = documentClassificationData;

  // Show loading/empty state if no data available
  if (!classificationData) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center">
          <p className="text-gray-500">No document classification data available. Please load data to view classification.</p>
        </div>
      </div>
    );
  }

  const documentTypes = [
    { id: 'RFP', label: 'RFP', icon: FileText, color: 'from-blue-500 to-cyan-500' },
    { id: 'SOW', label: 'SOW', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
    { id: 'BOQ', label: 'BOQ', icon: List, color: 'from-green-500 to-emerald-500' },
    { id: 'BOM', label: 'BOM', icon: Layers, color: 'from-orange-500 to-amber-500' },
    { id: 'BOS', label: 'BOS', icon: FileText, color: 'from-indigo-500 to-blue-500' },
  ];

  const currentDoc = classificationData[activeSubTab];

  return (
    <div className="space-y-6">
      {/* Sub-tabs Navigation */}
      <div className="bg-gradient-to-br from-white via-slate-50/50 to-white rounded-2xl shadow-xl border border-gray-200/80 p-4">
        <nav className="flex gap-3 overflow-x-auto scrollbar-hide">
          {documentTypes.map((tab) => {
            const Icon = tab.icon;
            const docData = classificationData[tab.id];
            const hasData = docData && docData.present === 'yes' && docData.structured_fields && Object.keys(docData.structured_fields).length > 0;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (hasData) {
                    setActiveSubTab(tab.id as any);
                  }
                }}
                disabled={!hasData}
                title={!hasData ? `${tab.label} document is not present in the uploaded file.` : ''}
                className={`
                  flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold rounded-xl transition-colors duration-200 relative
                  ${isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-xl ring-2 ring-white/30`
                    : hasData
                      ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer border-2 border-gray-200 hover:border-gray-300'
                      : 'text-gray-400 opacity-60 cursor-default border-2 border-gray-100'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : hasData ? 'text-gray-600' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
                {!hasData && <span className="ml-1 text-xs font-normal opacity-75">(N/A)</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Document Content */}
      {currentDoc && currentDoc.present === 'yes' && currentDoc.structured_fields && Object.keys(currentDoc.structured_fields).length > 0 ? (
        <div>
          {/* Structured Fields Section */}
          {currentDoc.structured_fields ? (
            <div className="bg-gradient-to-br from-white via-slate-50/30 to-blue-50/30 rounded-2xl border-2 border-gray-200/60 shadow-xl overflow-hidden relative">
              <div className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 p-6 text-white relative">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/25 rounded-xl shadow-lg">
                    <FolderTree className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{activeSubTab} - Structured Fields</h2>
                    <p className="text-sm text-white/90 font-medium">Document Classification & Analysis</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white space-y-5">
                    {Object.entries(currentDoc.structured_fields).map(([key, value], idx) => {
                      // Skip empty arrays and objects
                      if (Array.isArray(value) && value.length === 0) return null;
                      if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return null;
                      if (value === '' || value === null) return null;

                      const isAppendices = key === 'appendices';
                      const fieldLabel = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

                      // Color variations for different fields
                      const colorVariants = [
                        { bg: 'from-emerald-500 to-teal-500', iconBg: 'from-emerald-400 to-teal-400', border: 'border-emerald-200', hoverBorder: 'hover:border-emerald-400' },
                        { bg: 'from-violet-500 to-purple-500', iconBg: 'from-violet-400 to-purple-400', border: 'border-violet-200', hoverBorder: 'hover:border-violet-400' },
                        { bg: 'from-amber-500 to-orange-500', iconBg: 'from-amber-400 to-orange-400', border: 'border-amber-200', hoverBorder: 'hover:border-amber-400' },
                        { bg: 'from-rose-500 to-pink-500', iconBg: 'from-rose-400 to-pink-400', border: 'border-rose-200', hoverBorder: 'hover:border-rose-400' },
                        { bg: 'from-indigo-500 to-blue-500', iconBg: 'from-indigo-400 to-blue-400', border: 'border-indigo-200', hoverBorder: 'hover:border-indigo-400' },
                        { bg: 'from-cyan-500 to-sky-500', iconBg: 'from-cyan-400 to-sky-400', border: 'border-cyan-200', hoverBorder: 'hover:border-cyan-400' },
                      ];
                      const colorScheme = colorVariants[idx % colorVariants.length];

                      return (
                        <div key={key} className={`bg-white rounded-xl border-2 ${colorScheme.border} p-5 hover:shadow-lg transition-shadow duration-200`}>
                          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <div className={`p-2 bg-gradient-to-br ${colorScheme.bg} rounded-lg shadow-md`}>
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <span>{fieldLabel}</span>
                          </h3>
                          <div className="text-sm text-gray-700 leading-relaxed">
                            {Array.isArray(value) ? (
                              isAppendices ? (
                                <div className="space-y-3">
                                  {value.map((item: any, index: number) => {
                                    const itemText = typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item);
                                    // Extract "APPENDIX X" or "Appendix X" pattern if it exists
                                    const appendixMatch = itemText.match(/^(APPENDIX|Appendix)\s+(\d+)[\s\-–—]/i);
                                    if (appendixMatch) {
                                      // If already has APPENDIX prefix, use it
                                      const appendixPrefix = appendixMatch[0].trim();
                                      const restOfText = itemText.substring(appendixMatch[0].length).trim();
                                      return (
                                        <div key={index} className={`border-l-4 ${colorScheme.border} pl-4 py-2 bg-slate-50 rounded-r-lg`}>
                                          <div className="text-base">
                                            <span className={`font-bold text-gray-900`}>{appendixPrefix}</span>
                                            {restOfText && <span className="text-gray-700 font-normal ml-2"> - {restOfText}</span>}
                                          </div>
                                        </div>
                                      );
                                    } else {
                                      // If no APPENDIX prefix, add it (APPENDIX 1, APPENDIX 2, etc.)
                                      const appendixNumber = index + 1;
                                      const appendixPrefix = `APPENDIX ${appendixNumber}`;
                                      return (
                                        <div key={index} className={`border-l-4 ${colorScheme.border} pl-4 py-2 bg-slate-50 rounded-r-lg`}>
                                          <div className="text-base">
                                            <span className={`font-bold text-gray-900`}>{appendixPrefix}</span>
                                            {itemText && <span className="text-gray-700 font-normal ml-2"> - {itemText}</span>}
                                          </div>
                                        </div>
                                      );
                                    }
                                  })}
                                </div>
                              ) : (
                                <ul className="space-y-2">
                                  {value.map((item: any, index: number) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${colorScheme.bg} flex-shrink-0`}></span>
                                      <span className="text-gray-700 leading-relaxed flex-1">{typeof item === 'object' ? JSON.stringify(item, null, 2) : item}</span>
                                    </li>
                                  ))}
                                </ul>
                              )
                            ) : typeof value === 'object' && value !== null ? (
                              <div className="space-y-3">
                                {Object.entries(value).map(([subKey, subValue]) => (
                                  <div key={subKey} className={`pl-4 border-l-4 ${colorScheme.border} bg-slate-50 rounded-r-lg py-2`}>
                                    <div className="font-semibold text-gray-800 mb-1 text-base">
                                      {subKey.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:
                                    </div>
                                    <div className="text-gray-600">
                                      {Array.isArray(subValue) ? (
                                        <ul className="space-y-1.5">
                                          {(subValue as any[]).map((item: any, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2">
                                              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${colorScheme.bg} flex-shrink-0`}></span>
                                              <span className="flex-1">{typeof item === 'object' ? JSON.stringify(item, null, 2) : item}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : typeof subValue === 'object' && subValue !== null ? (
                                        <pre className={`whitespace-pre-wrap text-xs bg-slate-50 p-3 rounded-lg border ${colorScheme.border} font-mono`}>
                                          {JSON.stringify(subValue, null, 2)}
                                        </pre>
                                      ) : (
                                        <span className="leading-relaxed">{String(subValue)}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap leading-relaxed text-gray-700 bg-slate-50 p-3 rounded-lg border border-gray-100">{String(value)}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center">
                  <p className="text-gray-500">No {activeSubTab} structured fields available.</p>
                </div>
              )}
        </div>
      ) : currentDoc && currentDoc.present === 'no' ? (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-12 text-center animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-5">
            <div className="p-5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-inner">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold text-gray-800">{activeSubTab} document is not present in the uploaded file.</p>
              <p className="text-sm text-gray-500">This document type was not found in the analyzed file.</p>
            </div>
          </div>
        </div>
      ) : !currentDoc ? (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-12 text-center animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-5">
            <div className="p-5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-inner">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold text-gray-800">{activeSubTab} document is not present in the uploaded file.</p>
              <p className="text-sm text-gray-500">This document type was not found in the analyzed file.</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
