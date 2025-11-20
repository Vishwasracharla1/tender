import axios from 'axios';

// API Base URL
const API_BASE_URL = 'https://ig.gov-cloud.ai/pi-cohorts-service-dbaas/v1.0';

// Get authorization token from environment variables
const getAuthToken = (): string => {
  const token = import.meta.env.VITE_API_AUTHORIZATION_TOKEN;
  if (!token) {
    console.error('VITE_API_AUTHORIZATION_TOKEN is not set in environment variables');
    throw new Error('VITE_API_AUTHORIZATION_TOKEN is not set in environment variables');
  }
  return token;
};

// Get agent authorization token from environment variables (separate token for agent integration)
const getAgentAuthToken = (): string => {
  const token = import.meta.env.VITE_AGENT_AUTHORIZATION_TOKEN;
  if (!token) {
    console.error('VITE_AGENT_AUTHORIZATION_TOKEN is not set in environment variables');
    throw new Error('VITE_AGENT_AUTHORIZATION_TOKEN is not set in environment variables. Please set it in your .env file.');
  }
  return token;
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'accept': 'application/json',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Types for the API
export interface AdhocQueryRequest {
  type: 'TIDB';
  definition: string;
}

export interface ApiResponse<T> {
  status: string;
  msg: string;
  data: T[];
}

export interface ActiveTendersData {
  active_tenders: number;
  intake_total: number;
  intake_pending_validation: number;
  intake_normalized: number;
  evaluation_total: number;
  evaluation_scoring: number;
  evaluation_review: number;
  benchmark_total: number;
  benchmark_market_analysis: number;
  benchmark_outlier_review: number;
  award_total: number;
  award_final_approval: number;
  award_contract_prep: number;
  justification_total: number;
  total_estimated_value: number;
  avg_time_in_system: number;
}

export interface AvgEvalDurationData {
  avg_eval_duration: number;
  target_duration: number;
  time_saved_days: number;
  faster_pct: number;
  fastest_department_name: string;
  fastest_department_avg_days: number;
  slowest_department_name: string;
  slowest_department_avg_days: number;
  bottleneck_phase_avg_days: number;
  tenders_on_time: number;
  active_tenders: number;
}

export interface ComplianceRateData {
  compliance_rate_pct: number;
  compliant_tenders: number;
  total_tenders: number;
  policy_adherence_pct: number;
  risk_mitigation_pct: number;
  documentation_pct: number;
  timeline_compliance_pct: number;
  minor_issues: number;
}

export interface CriticalAlertItem {
  id: string;
  riskLevel: string;
  riskIntegrityScore: number;
  riskAlertMessage: string;
}

export interface CriticalAlertsData {
  critical_alerts: number;
  critical_alert_list: CriticalAlertItem[] | null;
  total_high_risk: number;
  resolved_today: number;
  avg_resolution_time: number | null;
}

/**
 * Execute an adhoc query against the cohorts service
 * Matches the pattern from the reference code for better Network tab visibility
 */
export const executeAdhocQuery = async <T = any>(
  query: AdhocQueryRequest
): Promise<T[]> => {
  try {
    console.log('Making API request to /cohorts/adhoc', { queryType: query.type });
    
    // Use explicit axios.post with full config to ensure Network tab visibility
    // This matches the reference code pattern
    const response = await axios.post<ApiResponse<T>>(
      `${API_BASE_URL}/cohorts/adhoc`,
      {
        type: query.type,
        definition: query.definition,
      },
      {
        headers: {
          'accept': 'application/json',
          'accept-language': 'en-US,en;q=0.9',
          'authorization': `Bearer ${getAuthToken()}`,
          'content-type': 'application/json',
          'origin': window.location.origin,
          'referer': window.location.href,
        },
      }
    );
    
    console.log('API response received:', response.data);
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.msg || 'Unknown error');
  } catch (error) {
    console.error('API Error:', error);
    if (axios.isAxiosError(error)) {
      const errorMessage = `API Error: ${error.response?.status} - ${error.response?.statusText} - ${error.message}`;
      console.error('Full error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: error.config,
        url: error.config?.url,
      });
      throw new Error(errorMessage);
    }
    throw error;
  }
};

/**
 * Get active tenders data
 * This is the query for the "Active Tenders" card
 */
export const getActiveTendersData = async (): Promise<ActiveTendersData> => {
  const query: AdhocQueryRequest = {
    type: 'TIDB',
    definition: `SELECT 
      SUM(CASE WHEN status IN ('Intake','Under Evaluation','Benchmark','Justification','Awarded') THEN 1 ELSE 0 END) AS active_tenders,
      SUM(CASE WHEN status='Intake' THEN 1 ELSE 0 END) AS intake_total,
      SUM(CASE WHEN status='Intake' AND stageDetail='PENDING_VALIDATION' THEN 1 ELSE 0 END) AS intake_pending_validation,
      SUM(CASE WHEN status='Intake' AND stageDetail='NORMALIZED' THEN 1 ELSE 0 END) AS intake_normalized,
      SUM(CASE WHEN status='Under Evaluation' THEN 1 ELSE 0 END) AS evaluation_total,
      SUM(CASE WHEN status='Under Evaluation' AND stageDetail='SCORING' THEN 1 ELSE 0 END) AS evaluation_scoring,
      SUM(CASE WHEN status='Under Evaluation' AND stageDetail='REVIEW' THEN 1 ELSE 0 END) AS evaluation_review,
      SUM(CASE WHEN status='Benchmark' THEN 1 ELSE 0 END) AS benchmark_total,
      SUM(CASE WHEN status='Benchmark' AND stageDetail='MARKET_ANALYSIS' THEN 1 ELSE 0 END) AS benchmark_market_analysis,
      SUM(CASE WHEN status='Benchmark' AND stageDetail='OUTLIER_REVIEW' THEN 1 ELSE 0 END) AS benchmark_outlier_review,
      SUM(CASE WHEN status='Awarded' THEN 1 ELSE 0 END) AS award_total,
      SUM(CASE WHEN status='Awarded' AND stageDetail='FINAL_APPROVAL' THEN 1 ELSE 0 END) AS award_final_approval,
      SUM(CASE WHEN status='Awarded' AND stageDetail='CONTRACT_PREP' THEN 1 ELSE 0 END) AS award_contract_prep,
      SUM(CASE WHEN status='Justification' THEN 1 ELSE 0 END) AS justification_total,
      SUM(budgetAmount) AS total_estimated_value,
      AVG(DATEDIFF(CURRENT_DATE(), publicationDate)) AS avg_time_in_system
    FROM t_691ac4c219be331b9bebe030_t;`,
  };

  const results = await executeAdhocQuery<ActiveTendersData>(query);
  
  if (results.length === 0) {
    throw new Error('No data returned from API');
  }
  
  return results[0];
};

/**
 * Get average evaluation duration data
 * This is the query for the "Avg Eval Duration" card
 */
export const getAvgEvalDurationData = async (): Promise<AvgEvalDurationData> => {
  const query: AdhocQueryRequest = {
    type: 'TIDB',
    definition: `SELECT AVG(DATEDIFF(evaluationEndDate, evaluationStartDate)) AS avg_eval_duration, 40 AS target_duration, (40 - AVG(DATEDIFF(evaluationEndDate, evaluationStartDate))) AS time_saved_days, ROUND(((40 - AVG(DATEDIFF(evaluationEndDate, evaluationStartDate))) / 40) * 100,1) AS faster_pct, (SELECT name FROM t_691ac3bc19be331b9bebe02e_t d WHERE d.name=(SELECT d2.name FROM t_691ac4c219be331b9bebe030_t t2 JOIN t_691ac3bc19be331b9bebe02e_t d2 ON t2.departmentId=d2.id WHERE t2.evaluationEndDate IS NOT NULL GROUP BY t2.departmentId ORDER BY AVG(DATEDIFF(t2.evaluationEndDate, t2.evaluationStartDate)) ASC LIMIT 1)) AS fastest_department_name, (SELECT AVG(DATEDIFF(t.evaluationEndDate, t.evaluationStartDate)) FROM t_691ac4c219be331b9bebe030_t t WHERE t.departmentId=(SELECT t2.departmentId FROM t_691ac4c219be331b9bebe030_t t2 WHERE t2.evaluationEndDate IS NOT NULL GROUP BY t2.departmentId ORDER BY AVG(DATEDIFF(t2.evaluationEndDate, t2.evaluationStartDate)) ASC LIMIT 1)) AS fastest_department_avg_days, (SELECT name FROM t_691ac3bc19be331b9bebe02e_t d WHERE d.name=(SELECT d2.name FROM t_691ac4c219be331b9bebe030_t t2 JOIN t_691ac3bc19be331b9bebe02e_t d2 ON t2.departmentId=d2.id WHERE t2.evaluationEndDate IS NOT NULL GROUP BY t2.departmentId ORDER BY AVG(DATEDIFF(t2.evaluationEndDate, t2.evaluationStartDate)) DESC LIMIT 1)) AS slowest_department_name, (SELECT AVG(DATEDIFF(t.evaluationEndDate, t.evaluationStartDate)) FROM t_691ac4c219be331b9bebe030_t t WHERE t.departmentId=(SELECT t2.departmentId FROM t_691ac4c219be331b9bebe030_t t2 WHERE t2.evaluationEndDate IS NOT NULL GROUP BY t2.departmentId ORDER BY AVG(DATEDIFF(t2.evaluationEndDate,t2.evaluationStartDate)) DESC LIMIT 1)) AS slowest_department_avg_days, (SELECT AVG(CASE WHEN t.evaluationEndDate IS NOT NULL THEN DATEDIFF(t.evaluationEndDate, t.evaluationStartDate) ELSE DATEDIFF(CURRENT_DATE(), t.evaluationStartDate) END) FROM t_691ac4c219be331b9bebe030_t t WHERE t.status='Under Evaluation') AS bottleneck_phase_avg_days, (SELECT SUM(CASE WHEN t.awardDate!='' AND t.submissionDeadline!='' AND t.awardDate<=t.submissionDeadline THEN 1 ELSE 0 END) FROM t_691ac4c219be331b9bebe030_t t WHERE t.status='Awarded') AS tenders_on_time, (SELECT COUNT(*) FROM t_691ac4c219be331b9bebe030_t t WHERE t.status IN ('Intake','Under Evaluation','Benchmark','Justification','Awarded')) AS active_tenders FROM t_691ac4c219be331b9bebe030_t;`,
  };

  const results = await executeAdhocQuery<AvgEvalDurationData>(query);
  
  if (results.length === 0) {
    throw new Error('No data returned from API');
  }
  
  return results[0];
};

/**
 * Get compliance rate data
 * This is the query for the "Compliance Rate" card
 */
export const getComplianceRateData = async (): Promise<ComplianceRateData> => {
  const query: AdhocQueryRequest = {
    type: 'TIDB',
    definition: `SELECT (SUM(CASE WHEN isCompliant=TRUE THEN 1 ELSE 0 END)*100.0/COUNT(*)) AS compliance_rate_pct, SUM(CASE WHEN isCompliant=TRUE THEN 1 ELSE 0 END) AS compliant_tenders, COUNT(*) AS total_tenders, AVG(policyAdherenceScore) AS policy_adherence_pct, AVG(riskMitigationScore) AS risk_mitigation_pct, (SUM(CASE WHEN isDocumentComplete=TRUE THEN 1 ELSE 0 END)*100.0/COUNT(*)) AS documentation_pct, (SUM(CASE WHEN awardDate!='' AND submissionDeadline!='' AND awardDate<=submissionDeadline THEN 1 ELSE 0 END)*100.0/COUNT(*)) AS timeline_compliance_pct, SUM(minorIssuesCount) AS minor_issues FROM t_691ac4c219be331b9bebe030_t;`,
  };

  const results = await executeAdhocQuery<ComplianceRateData>(query);
  
  if (results.length === 0) {
    throw new Error('No data returned from API');
  }
  
  return results[0];
};

/**
 * Get critical alerts data
 * This is the query for the "Critical Alerts" card
 */
export const getCriticalAlertsData = async (): Promise<CriticalAlertsData> => {
  const query: AdhocQueryRequest = {
    type: 'TIDB',
    definition: `SELECT (SELECT COUNT(*) FROM t_691ac4c219be331b9bebe030_t WHERE riskLevel='Critical') AS critical_alerts,(SELECT JSON_ARRAYAGG(JSON_OBJECT('id',id,'riskLevel',riskLevel,'riskIntegrityScore',riskIntegrityScore,'riskAlertMessage',riskAlertMessage)) FROM (SELECT * FROM t_691ac4c219be331b9bebe030_t WHERE riskLevel='Critical' ORDER BY riskIntegrityScore DESC LIMIT 3) AS top_critical) AS critical_alert_list,(SELECT COUNT(*) FROM t_691ac4c219be331b9bebe030_t WHERE riskLevel IN ('Critical','High')) AS total_high_risk,(SELECT COUNT(*) FROM t_691ac4c219be331b9bebe030_t WHERE riskAlertResolved=TRUE AND DATE(riskUpdatedAt)=CURRENT_DATE()) AS resolved_today,(SELECT AVG(DATEDIFF(riskUpdatedAt,riskCreatedAt)) FROM t_691ac4c219be331b9bebe030_t WHERE riskAlertResolved=TRUE AND riskLevel IN ('Critical','High')) AS avg_resolution_time;`,
  };

  const results = await executeAdhocQuery<CriticalAlertsData>(query);
  
  if (results.length === 0) {
    throw new Error('No data returned from API');
  }
  
  const data = results[0];
  
  // Parse the JSON string if critical_alert_list is a string
  if (data.critical_alert_list && typeof data.critical_alert_list === 'string') {
    try {
      data.critical_alert_list = JSON.parse(data.critical_alert_list);
    } catch (e) {
      console.warn('Failed to parse critical_alert_list JSON:', e);
      data.critical_alert_list = null;
    }
  }
  
  return data;
};

/**
 * Content Service API - File Upload
 * Uploads files to the content service and returns CDN URL
 */
const CONTENT_SERVICE_BASE_URL = 'https://ig.gov-cloud.ai/mobius-content-service/v1.0';

// Get content service token (can be same as API token or separate)
const getContentServiceToken = (): string => {
  const token = import.meta.env.VITE_CONTENT_SERVICE_TOKEN || import.meta.env.VITE_API_AUTHORIZATION_TOKEN;
  if (!token) {
    console.error('Content service token is not set in environment variables');
    throw new Error('Content service token is not set in environment variables');
  }
  return token;
};

export interface FileUploadResponse {
  cdn_url: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  [key: string]: any;
}

/**
 * Upload a file to the content service
 * @param file - The file to upload
 * @param filePath - Optional file path parameter (defaults to 'CMS')
 * @returns Promise with CDN URL and file information
 */
export const uploadFileToCDN = async (
  file: File,
  filePath: string = 'CMS'
): Promise<FileUploadResponse> => {
  const token = getContentServiceToken();
  
  const formData = new FormData();
  formData.append('file', file);

  const url = `${CONTENT_SERVICE_BASE_URL}/content/upload?filePath=${filePath}`;

  console.log('Uploading file to CDN:', {
    filename: file.name,
    size: file.size,
    type: file.type,
    url,
  });

  try {
    const response = await axios.post<FileUploadResponse>(url, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('File upload response:', response.data);

    // Helper function to construct full CDN URL if it's a relative path
    const constructFullCDNUrl = (url: string): string => {
      if (!url) return url;
      
      // If it's already a full URL (starts with http:// or https://), return as is
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      
      // If it's a relative path (starts with /), construct full URL
      if (url.startsWith('/')) {
        return `https://cdn.gov-cloud.ai${url}`;
      }
      
      // Otherwise, assume it's a relative path and prepend the base URL
      return `https://cdn.gov-cloud.ai/${url}`;
    };

    // The API might return the CDN URL in different formats
    // Extract and construct full URL - check cdnurl (lowercase, no underscore) first as per API response
    let cdnUrl = '';
    const data = response.data as any;
    
    // Check cdnurl (lowercase, no underscore) first - this is the primary format from the API
    if (data.cdnurl) {
      cdnUrl = data.cdnurl;
    } else if (data.cdn_url) {
      cdnUrl = data.cdn_url;
    } else if (data.cdnUrl) {
      cdnUrl = data.cdnUrl;
    } else if (data.url) {
      cdnUrl = data.url;
    } else if (data.fileUrl) {
      cdnUrl = data.fileUrl;
    } else if (typeof response.data === 'string') {
      cdnUrl = response.data;
    }
    
    // Construct full CDN URL if needed
    const fullCDNUrl = constructFullCDNUrl(cdnUrl);
    
    console.log('CDN URL processing:', {
      original: cdnUrl,
      full: fullCDNUrl,
    });
    
    return {
      ...response.data,
      cdn_url: fullCDNUrl,
    };
  } catch (error) {
    console.error('Error uploading file to CDN:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      throw new Error(
        `File upload failed: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
};

// Agent Interaction API
export interface AgentInteractionRequest {
  agentId: string;
  query: string;
  referenceId: string;
  sessionId: string;
  fileUrl: string[];
}

export interface AgentInteractionResponse {
  status?: string;
  msg?: string;
  data?: any;
  [key: string]: any;
}

const AGENT_API_BASE_URL = 'https://ig.gov-cloud.ai/agent-orchestration-framework-fastapi';

export const interactWithAgent = async (
  departmentName: string,
  fileUrls: string[],
  agentId?: string
): Promise<AgentInteractionResponse> => {
  const token = getAgentAuthToken();
  
  // Default agent ID for tender overview
  const defaultAgentId = 'a1faf585-78de-454f-9fea-7a39ec55e52f';
  const targetAgentId = agentId || defaultAgentId;
  
  const requestData: AgentInteractionRequest = {
    agentId: targetAgentId,
    query: `Department Name: ${departmentName}`,
    referenceId: '',
    sessionId: '',
    fileUrl: fileUrls,
  };

  console.log('🤖 Calling Agent API:', {
    url: `${AGENT_API_BASE_URL}/agent/interact`,
    agentId: targetAgentId,
    department: departmentName,
    fileCount: fileUrls.length,
    fileUrls: fileUrls,
  });

  try {
    const response = await axios.post<AgentInteractionResponse>(
      `${AGENT_API_BASE_URL}/agent/interact`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Agent API Response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Agent API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        agentId: targetAgentId,
      });
      throw new Error(`Agent API error: ${error.response?.data?.msg || error.message}`);
    }
    throw error;
  }
};

// Chatbot Agent Interaction API
export interface ChatbotAgentRequest {
  agentId: string;
  query: string;
  sessionId: string;
  caller: string; // Required along with sessionId (API requires either referenceId OR both caller and sessionId)
  fileUrl?: string[]; // Optional file URLs
}

export const interactWithChatbotAgent = async (
  query: string,
  fileUrls: string[] = [],
  sessionId: string = '',
  agentId: string = 'ec6def5e-b900-4afa-828a-33c2313ccbce'
): Promise<AgentInteractionResponse> => {
  const token = getAgentAuthToken();
  
  // Generate caller ID if not provided (can be user ID, email, or any identifier)
  const caller = 'chatbot-user'; // You can customize this or get from user context
  
  // Ensure sessionId is provided (generate if empty)
  const finalSessionId = sessionId || crypto.randomUUID();
  
  const requestData: ChatbotAgentRequest = {
    agentId: agentId,
    query: query,
    sessionId: finalSessionId,
    caller: caller,
    ...(fileUrls.length > 0 && { fileUrl: fileUrls }),
  };

  console.log('💬 Calling Chatbot Agent API:', {
    url: `${AGENT_API_BASE_URL}/agent/interact`,
    agentId: agentId,
    query: query,
    fileCount: fileUrls.length,
    sessionId: sessionId,
  });

  try {
    const response = await axios.post<AgentInteractionResponse>(
      `${AGENT_API_BASE_URL}/agent/interact`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'en-US,en;q=0.9',
        },
      }
    );

    console.log('✅ Chatbot Agent API Response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Chatbot Agent API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        agentId: agentId,
      });
      throw new Error(`Chatbot Agent API error: ${error.response?.data?.msg || error.message}`);
    }
    throw error;
  }
};

// Schema Instance API - Ingest uploaded file data
export interface SchemaInstanceData {
  id?: string | number | null;
  filename: string;
  cdnUrls?: string | string[];
}

export interface SchemaInstanceRequest {
  data: SchemaInstanceData[];
}

export interface SchemaInstanceResponse {
  status?: string;
  msg?: string;
  data?: any;
  [key: string]: any;
}

const SCHEMA_API_BASE_URL = 'https://igs.gov-cloud.ai/pi-entity-instances-service/v2.0';
const SCHEMA_ID = '691d9ee2e7db832feb59b79f';

// Ingest single file to schema
export const ingestFileToSchema = async (
  filename: string,
  cdnUrl: string
): Promise<SchemaInstanceResponse> => {
  return ingestFilesToSchema([{ filename, cdnUrl }]);
};

// Ingest multiple files to schema
export const ingestFilesToSchema = async (
  files: Array<{ filename: string; cdnUrl: string }>
): Promise<SchemaInstanceResponse> => {
  const token = getAuthToken();
  
  const requestData: SchemaInstanceRequest = {
    data: files.map((file) => ({
      id: crypto.randomUUID(),
      filename: file.filename,
      cdnUrls: [file.cdnUrl], // Array of CDN URLs (single file = array with one URL)
    })),
  };

  console.log('📤 Ingesting files to schema:', {
    url: `${SCHEMA_API_BASE_URL}/schemas/${SCHEMA_ID}/instances`,
    fileCount: files.length,
    files: files.map(f => ({ filename: f.filename, cdnUrl: f.cdnUrl })),
  });

  try {
    const response = await axios.post<SchemaInstanceResponse>(
      `${SCHEMA_API_BASE_URL}/schemas/${SCHEMA_ID}/instances`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': 'application/json, text/plain, */*',
        },
      }
    );

    console.log('✅ Schema ingestion response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Schema ingestion error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(`Schema ingestion failed: ${error.response?.data?.msg || error.message}`);
    }
    throw error;
  }
};

// Schema Instance List API - Fetch instances from schema
export interface SchemaInstanceListItem {
  id: string | number;
  filename: string;
  cdnurl?: string; // Legacy field (singular)
  cdnUrls?: string[]; // New field (array)
  [key: string]: any;
}

export interface SchemaInstanceListResponse {
  status?: string;
  msg?: string;
  data?: SchemaInstanceListItem[];
  content?: SchemaInstanceListItem[];
  [key: string]: any;
}

export interface SchemaInstanceListRequest {
  dbType: 'TIDB';
}

/**
 * Fetch schema instances list
 * @param size - Number of instances to fetch (default: 10)
 * @returns Promise with list of schema instances
 */
export const fetchSchemaInstances = async (
  size: number = 10
): Promise<SchemaInstanceListItem[]> => {
  const token = getAuthToken();
  
  const requestData: SchemaInstanceListRequest = {
    dbType: 'TIDB',
  };

  console.log('📥 Fetching schema instances:', {
    url: `${SCHEMA_API_BASE_URL}/schemas/${SCHEMA_ID}/instances/list?size=${size}`,
  });

  try {
    const response = await axios.post<SchemaInstanceListResponse>(
      `${SCHEMA_API_BASE_URL}/schemas/${SCHEMA_ID}/instances/list?size=${size}`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'en-US,en;q=0.9',
          'origin': window.location.origin,
          'referer': window.location.href,
        },
      }
    );

    console.log('✅ Schema instances response:', response.data);
    
    // Handle different response formats
    if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data.content && Array.isArray(response.data.content)) {
      return response.data.content;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Schema instances fetch error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(`Failed to fetch schema instances: ${error.response?.data?.msg || error.message}`);
    }
    throw error;
  }
};

