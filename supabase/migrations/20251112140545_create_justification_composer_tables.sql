/*
  # Create Justification Composer Tables

  1. New Tables
    - `justification_documents`
      - `id` (uuid, primary key)
      - `tender_id` (uuid, foreign key)
      - `title` (text)
      - `content` (jsonb) - Rich text content
      - `status` (text) - draft, review, finalized
      - `auto_generation_coverage` (numeric) - percentage
      - `clarity_score` (numeric) - readability index
      - `version` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `justification_sections`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key)
      - `criterion_id` (uuid, foreign key)
      - `vendor_id` (uuid, foreign key)
      - `section_title` (text)
      - `ai_draft` (text)
      - `final_content` (text)
      - `is_ai_generated` (boolean)
      - `is_edited` (boolean)
      - `word_count` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `justification_comments`
      - `id` (uuid, primary key)
      - `section_id` (uuid, foreign key)
      - `author_id` (uuid)
      - `author_name` (text)
      - `content` (text)
      - `position` (jsonb) - cursor position for inline comments
      - `is_resolved` (boolean)
      - `created_at` (timestamptz)
    
    - `justification_versions`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key)
      - `version_number` (integer)
      - `content_snapshot` (jsonb)
      - `changed_by` (uuid)
      - `change_summary` (text)
      - `created_at` (timestamptz)
    
    - `justification_approvals`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key)
      - `approved_by` (uuid)
      - `approver_name` (text)
      - `status` (text) - pending, approved, rejected
      - `notes` (text)
      - `approved_at` (timestamptz)
    
    - `justification_metrics`
      - `id` (uuid, primary key)
      - `tender_id` (uuid, foreign key)
      - `auto_generation_coverage` (numeric)
      - `approval_rate` (numeric)
      - `avg_clarity_score` (numeric)
      - `total_sections` (integer)
      - `ai_generated_sections` (integer)
      - `approved_sections` (integer)
      - `recorded_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create justification_documents table
CREATE TABLE IF NOT EXISTS justification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  title text NOT NULL,
  content jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'finalized')),
  auto_generation_coverage numeric DEFAULT 0,
  clarity_score numeric DEFAULT 0,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE justification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all justification documents"
  ON justification_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert justification documents"
  ON justification_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update justification documents"
  ON justification_documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create justification_sections table
CREATE TABLE IF NOT EXISTS justification_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES justification_documents(id) ON DELETE CASCADE,
  criterion_id uuid REFERENCES evaluation_criteria(id) ON DELETE SET NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  section_title text NOT NULL,
  ai_draft text DEFAULT '',
  final_content text DEFAULT '',
  is_ai_generated boolean DEFAULT false,
  is_edited boolean DEFAULT false,
  word_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE justification_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all justification sections"
  ON justification_sections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert justification sections"
  ON justification_sections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update justification sections"
  ON justification_sections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create justification_comments table
CREATE TABLE IF NOT EXISTS justification_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES justification_sections(id) ON DELETE CASCADE,
  author_id uuid,
  author_name text NOT NULL,
  content text NOT NULL,
  position jsonb DEFAULT '{}'::jsonb,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE justification_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all justification comments"
  ON justification_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert justification comments"
  ON justification_comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update justification comments"
  ON justification_comments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create justification_versions table
CREATE TABLE IF NOT EXISTS justification_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES justification_documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  content_snapshot jsonb DEFAULT '{}'::jsonb,
  changed_by uuid,
  change_summary text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE justification_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all justification versions"
  ON justification_versions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert justification versions"
  ON justification_versions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create justification_approvals table
CREATE TABLE IF NOT EXISTS justification_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES justification_documents(id) ON DELETE CASCADE,
  approved_by uuid,
  approver_name text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes text DEFAULT '',
  approved_at timestamptz
);

ALTER TABLE justification_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all justification approvals"
  ON justification_approvals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert justification approvals"
  ON justification_approvals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update justification approvals"
  ON justification_approvals FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create justification_metrics table
CREATE TABLE IF NOT EXISTS justification_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  auto_generation_coverage numeric DEFAULT 0,
  approval_rate numeric DEFAULT 0,
  avg_clarity_score numeric DEFAULT 0,
  total_sections integer DEFAULT 0,
  ai_generated_sections integer DEFAULT 0,
  approved_sections integer DEFAULT 0,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE justification_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all justification metrics"
  ON justification_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert justification metrics"
  ON justification_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_justification_documents_tender_id ON justification_documents(tender_id);
CREATE INDEX IF NOT EXISTS idx_justification_sections_document_id ON justification_sections(document_id);
CREATE INDEX IF NOT EXISTS idx_justification_sections_criterion_id ON justification_sections(criterion_id);
CREATE INDEX IF NOT EXISTS idx_justification_sections_vendor_id ON justification_sections(vendor_id);
CREATE INDEX IF NOT EXISTS idx_justification_comments_section_id ON justification_comments(section_id);
CREATE INDEX IF NOT EXISTS idx_justification_versions_document_id ON justification_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_justification_approvals_document_id ON justification_approvals(document_id);
CREATE INDEX IF NOT EXISTS idx_justification_metrics_tender_id ON justification_metrics(tender_id);
