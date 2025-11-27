// Benchmark Agent API Service with 30-second caching

interface BenchmarkAgentRequest {
  agentId: string;
  query: string;
  userId: string;
  fileUrl: string[];
}

interface BenchmarkAgentResponse {
  // Define based on actual API response structure
  [key: string]: any;
}

interface CacheEntry {
  data: BenchmarkAgentResponse;
  timestamp: number;
}

// Cache storage (30 seconds TTL)
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30 * 1000; // 30 seconds in milliseconds

// Get authorization token from environment or use the provided one
const getAuthToken = (): string => {
  // Try to get from environment variable first
  const envToken = import.meta.env.VITE_BENCHMARK_AGENT_TOKEN;
  if (envToken) {
    return envToken;
  }
  
  // Fallback to the provided token (should be moved to env in production)
  return 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI3Ny1NUVdFRTNHZE5adGlsWU5IYmpsa2dVSkpaWUJWVmN1UmFZdHl5ejFjIn0.eyJleHAiOjE3MjYxODIzMzEsImlhdCI6MTcyNjE0NjMzMSwianRpIjoiOGVlZTU1MDctNGVlOC00NjE1LTg3OWUtNTVkMjViMjQ2MGFmIiwiaXNzIjoiaHR0cDovL2tleWNsb2FrLmtleWNsb2FrLnN2Yy5jbHVzdGVyLmxvY2FsOjgwODAvcmVhbG1zL21hc3RlciIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJmNzFmMzU5My1hNjdhLTQwYmMtYTExYS05YTQ0NjY4YjQxMGQiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJIT0xBQ1JBQ1kiLCJzZXNzaW9uX3N0YXRlIjoiYmI1ZjJkMzktYTQ3ZC00MjI0LWFjZGMtZTdmNzQwNDc2OTgwIiwibmFtZSI6ImtzYW14cCBrc2FteHAiLCJnaXZlbl9uYW1lIjoia3NhbXhwIiwiZmFtaWx5X25hbWUiOiJrc2FteHAiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJwYXNzd29yZF90ZW5hbnRfa3NhbXhwQG1vYml1c2R0YWFzLmFpIiwiZW1haWwiOiJwYXNzd29yZF90ZW5hbnRfa3NhbXhwQG1vYml1c2R0YWFzLmFpIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiLyoiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtbWFzdGVyIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7IkhPTEFDUkFDWSI6eyJyb2xlcyI6WyJIT0xBQ1JBQ1lfVVNFUiJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwic2lkIjoiYmI1ZjJkMzktYTQ3ZC00MjI0LWFjZGMtZTdmNzQwNDc2OTgwIiwidGVuYW50SWQiOiJmNzFmMzU5My1hNjdhLTQwYmMtYTExYS05YTQ0NjY4YjQxMGQiLCJyZXF1ZXN0ZXJUeXBlIjoiVEVOQU5UIn0=.FXeDyHBhlG9L4_NCeSyHEaNEBVmhFpfSBqlcbhHaPaoydhKcA0BfuyHgxg_32kQk6z5S9IQ7nVKS2ybtOvwo0WyLWwLQchSq7Noa7LooHIMzmeWMQb_bLKtbaOti59zwIdS8CkfGaXut7RUQKISQVWmbUGsVJQa2JkG6Ng_QN0y5hFVksMWPZiXVsofQkJXHXV1CQ3gabhhHKo3BqlJwzpsCKLDfg1-4PmSl1Wqbw03Ef2yolroj5i8FoeHukOQPkwCUHrrNw-ilIp917nqZa89YbCMtDjWyaj8pEH7GJR5vMZPE2WcJPn5dSA1IHVunfatEB1cDAitaFjVNWNnddQ';
};

/**
 * Generate cache key from request parameters
 */
const generateCacheKey = (request: BenchmarkAgentRequest): string => {
  return `${request.agentId}_${request.query}_${request.userId}_${request.fileUrl.join(',')}`;
};

/**
 * Check if cache entry is still valid
 */
const isCacheValid = (entry: CacheEntry): boolean => {
  return Date.now() - entry.timestamp < CACHE_TTL;
};

/**
 * Call Benchmark Agent API
 */
export const callBenchmarkAgent = async (
  tenderId: string = 'RAK_01',
  fileUrls: string[] = []
): Promise<BenchmarkAgentResponse> => {
  const request: BenchmarkAgentRequest = {
    agentId: '019aba84-4e85-79d5-800c-7aede8d8dce0',
    query: `TenderId: ${tenderId}`,
    userId: 'gaian@123',
    fileUrl: fileUrls.length > 0 ? fileUrls : [
      'https://cdn.gov-cloud.ai//_ENC(nIw4FQRwLOQd0b8T2HcImBUJ5a9zjZEImv/UhJi8/+yUl7Ez+m0qAiCCaOJbNgi5)/CMS/b8788a8b-31da-4098-bd4c-eec676addd8c_$$_V1_Cognizants\'s%20Response%20to%20RAK%20S4HANA%20Implementation%20RFP_Commercial%20Response-Final.pdf',
      'https://cdn.gov-cloud.ai//_ENC(nIw4FQRwLOQd0b8T2HcImBUJ5a9zjZEImv/UhJi8/+yUl7Ez+m0qAiCCaOJbNgi5)/CMS/019fc85b-20d3-4777-a359-0caca6180be7_$$_V1_RFP_CSD_PSD%20of%20Ras%20Al%20Khaimah-%20v1.1.docx',
      'https://cdn.gov-cloud.ai//_ENC(nIw4FQRwLOQd0b8T2HcImBUJ5a9zjZEImv/UhJi8/+yUl7Ez+m0qAiCCaOJbNgi5)/CMS/f442a7b7-7b49-4cae-bf53-6b93c653a809_$$_V1_Commercial%20Proposal%20-20%20Feb%202020.pdf',
      'https://cdn.gov-cloud.ai//_ENC(nIw4FQRwLOQd0b8T2HcImBUJ5a9zjZEImv/UhJi8/+yUl7Ez+m0qAiCCaOJbNgi5)/CMS/06e51e2b-b0f7-42e0-86f2-58a066b10c9d_$$_V1_Edraky%20commercial%20proposal%20to%20RAK%20PSD%201.4.pdf',
      'https://cdn.gov-cloud.ai//_ENC(nIw4FQRwLOQd0b8T2HcImBUJ5a9zjZEImv/UhJi8/+yUl7Ez+m0qAiCCaOJbNgi5)/CMS/f27c66c9-8368-47e5-9057-f9e347957938_$$_V1_tycons_financial_proposal.pdf'
    ]
  };

  // Generate cache key
  const cacheKey = generateCacheKey(request);

  // Check cache first
  const cachedEntry = cache.get(cacheKey);
  if (cachedEntry && isCacheValid(cachedEntry)) {
    const age = Math.floor((Date.now() - cachedEntry.timestamp) / 1000);
    const remaining = Math.floor((CACHE_TTL - (Date.now() - cachedEntry.timestamp)) / 1000);
    console.log(`✅ Using cached benchmark agent response (age: ${age}s, remaining: ${remaining}s)`);
    return cachedEntry.data;
  }
  
  if (cachedEntry && !isCacheValid(cachedEntry)) {
    const age = Math.floor((Date.now() - cachedEntry.timestamp) / 1000);
    console.log(`⏰ Cache expired (age: ${age}s, TTL: 30s). Making new API call...`);
    cache.delete(cacheKey); // Remove expired entry
  }

  // Make API call
  try {
    const response = await fetch('https://ig.gov-cloud.ai/bob-service-aof/v1.0/agent/interact', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Agent API error: ${response.status} ${response.statusText}`);
    }

    const data: BenchmarkAgentResponse = await response.json();

    // Store in cache
    const timestamp = Date.now();
    cache.set(cacheKey, {
      data,
      timestamp
    });

    console.log(`💾 Benchmark agent response cached for 30 seconds (expires at ${new Date(timestamp + CACHE_TTL).toLocaleTimeString()})`);
    return data;
  } catch (error) {
    console.error('Error calling benchmark agent:', error);
    throw error;
  }
};

/**
 * Clear cache (useful for testing or manual refresh)
 */
export const clearBenchmarkCache = (): void => {
  cache.clear();
  console.log('Benchmark agent cache cleared');
};

