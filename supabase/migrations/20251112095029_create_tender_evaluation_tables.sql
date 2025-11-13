/*
  # Create Tender Evaluation System Tables

  1. New Tables
    - `tenders`
      - `id` (uuid, primary key)
      - `tender_id` (text, unique identifier)
      - `title` (text)
      - `phase` (text) - Current phase of tender
      - `status` (text) - draft, in_validation, validated, in_evaluation, completed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `tender_documents`
      - `id` (uuid, primary key)
      - `tender_id` (uuid, foreign key)
      - `filename` (text)
      - `file_type` (text) - PDF, XLS, ZIP
      - `file_size` (bigint)
      - `upload_status` (text) - uploading, processing, validated, error
      - `validation_status` (text)
      - `uploaded_at` (timestamptz)
    
    - `validation_logs`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key)
      - `log_type` (text) - info, warning, error
      - `message` (text)
      - `details` (jsonb)
      - `created_at` (timestamptz)
    
    - `vendors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `created_at` (timestamptz)
    
    - `vendor_submissions`
      - `id` (uuid, primary key)
      - `tender_id` (uuid, foreign key)
      - `vendor_id` (uuid, foreign key)
      - `submission_data` (jsonb)
      - `normalized_data` (jsonb)
      - `error_count` (integer)
      - `validation_time` (integer) - in seconds
      - `created_at` (timestamptz)
    
    - `kpi_metrics`
      - `id` (uuid, primary key)
      - `tender_id` (uuid, foreign key)
      - `metric_type` (text) - validation_rate, error_count, avg_time
      - `metric_value` (numeric)
      - `metadata` (jsonb)
      - `recorded_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage tender data
*/

-- Create tenders table
CREATE TABLE IF NOT EXISTS tenders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id text UNIQUE NOT NULL,
  title text NOT NULL,
  phase text DEFAULT 'intake' NOT NULL,
  status text DEFAULT 'draft' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all tenders"
  ON tenders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert tenders"
  ON tenders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update tenders"
  ON tenders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete tenders"
  ON tenders FOR DELETE
  TO authenticated
  USING (true);

-- Create tender_documents table
CREATE TABLE IF NOT EXISTS tender_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_type text NOT NULL,
  file_size bigint DEFAULT 0,
  upload_status text DEFAULT 'uploading',
  validation_status text DEFAULT 'pending',
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE tender_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all tender documents"
  ON tender_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert tender documents"
  ON tender_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update tender documents"
  ON tender_documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete tender documents"
  ON tender_documents FOR DELETE
  TO authenticated
  USING (true);

-- Create validation_logs table
CREATE TABLE IF NOT EXISTS validation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES tender_documents(id) ON DELETE CASCADE,
  log_type text DEFAULT 'info' NOT NULL,
  message text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE validation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all validation logs"
  ON validation_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert validation logs"
  ON validation_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert vendors"
  ON vendors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update vendors"
  ON vendors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create vendor_submissions table
CREATE TABLE IF NOT EXISTS vendor_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  submission_data jsonb DEFAULT '{}'::jsonb,
  normalized_data jsonb DEFAULT '{}'::jsonb,
  error_count integer DEFAULT 0,
  validation_time integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vendor_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all vendor submissions"
  ON vendor_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert vendor submissions"
  ON vendor_submissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update vendor submissions"
  ON vendor_submissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create kpi_metrics table
CREATE TABLE IF NOT EXISTS kpi_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  metric_value numeric NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE kpi_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all kpi metrics"
  ON kpi_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert kpi metrics"
  ON kpi_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tender_documents_tender_id ON tender_documents(tender_id);
CREATE INDEX IF NOT EXISTS idx_validation_logs_document_id ON validation_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_vendor_submissions_tender_id ON vendor_submissions(tender_id);
CREATE INDEX IF NOT EXISTS idx_vendor_submissions_vendor_id ON vendor_submissions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_tender_id ON kpi_metrics(tender_id);
