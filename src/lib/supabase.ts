import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type TenderStatus = 'draft' | 'in_validation' | 'validated' | 'in_evaluation' | 'completed';
export type TenderPhase = 'intake' | 'validation' | 'evaluation' | 'award';
export type UploadStatus = 'uploading' | 'processing' | 'validated' | 'error';
export type ValidationStatus = 'pending' | 'passed' | 'failed' | 'warning';
export type LogType = 'info' | 'warning' | 'error';

export interface Tender {
  id: string;
  tender_id: string;
  title: string;
  phase: TenderPhase;
  status: TenderStatus;
  created_at: string;
  updated_at: string;
}

export interface TenderDocument {
  id: string;
  tender_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  upload_status: UploadStatus;
  validation_status: ValidationStatus;
  uploaded_at: string;
}

export interface ValidationLog {
  id: string;
  document_id: string;
  log_type: LogType;
  message: string;
  details: Record<string, any>;
  created_at: string;
}

export interface KPIMetric {
  id: string;
  tender_id: string;
  metric_type: string;
  metric_value: number;
  metadata: Record<string, any>;
  recorded_at: string;
}
