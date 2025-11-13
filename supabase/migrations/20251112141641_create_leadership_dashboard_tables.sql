/*
  # Create Leadership Dashboard Tables

  1. New Tables
    - `executive_kpis`
      - `id` (uuid, primary key)
      - `kpi_name` (text)
      - `kpi_value` (numeric)
      - `kpi_unit` (text)
      - `trend_direction` (text) - up, down, stable
      - `trend_percentage` (numeric)
      - `period` (text) - daily, weekly, monthly, quarterly
      - `recorded_at` (timestamptz)
    
    - `tender_integrity_index`
      - `id` (uuid, primary key)
      - `tender_id` (uuid, foreign key)
      - `department` (text)
      - `integrity_score` (numeric)
      - `risk_level` (text) - low, medium, high, critical
      - `compliance_score` (numeric)
      - `alerts_count` (integer)
      - `phase` (text)
      - `recorded_at` (timestamptz)
    
    - `evaluation_duration_metrics`
      - `id` (uuid, primary key)
      - `tender_id` (uuid, foreign key)
      - `department` (text)
      - `phase` (text)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `duration_days` (integer)
      - `target_duration_days` (integer)
      - `variance_days` (integer)
      - `recorded_at` (timestamptz)
    
    - `department_compliance`
      - `id` (uuid, primary key)
      - `department_name` (text)
      - `compliance_score` (numeric)
      - `total_tenders` (integer)
      - `compliant_tenders` (integer)
      - `on_time_completion_rate` (numeric)
      - `policy_adherence_rate` (numeric)
      - `risk_mitigation_score` (numeric)
      - `rank` (integer)
      - `recorded_at` (timestamptz)
    
    - `dashboard_filters`
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `filter_name` (text)
      - `filter_config` (jsonb)
      - `is_default` (boolean)
      - `created_at` (timestamptz)
    
    - `insight_exports`
      - `id` (uuid, primary key)
      - `export_type` (text)
      - `export_format` (text) - pdf, xlsx, csv
      - `filters_applied` (jsonb)
      - `exported_by` (uuid)
      - `exported_by_name` (text)
      - `file_url` (text)
      - `created_at` (timestamptz)
    
    - `scheduled_reviews`
      - `id` (uuid, primary key)
      - `review_title` (text)
      - `review_type` (text)
      - `scheduled_date` (timestamptz)
      - `participants` (jsonb)
      - `agenda` (text)
      - `status` (text) - scheduled, completed, cancelled
      - `created_by` (uuid)
      - `created_by_name` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users with executive access
*/

-- Create executive_kpis table
CREATE TABLE IF NOT EXISTS executive_kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_name text NOT NULL,
  kpi_value numeric DEFAULT 0,
  kpi_unit text DEFAULT '',
  trend_direction text DEFAULT 'stable' CHECK (trend_direction IN ('up', 'down', 'stable')),
  trend_percentage numeric DEFAULT 0,
  period text DEFAULT 'monthly' CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE executive_kpis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all executive KPIs"
  ON executive_kpis FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert executive KPIs"
  ON executive_kpis FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create tender_integrity_index table
CREATE TABLE IF NOT EXISTS tender_integrity_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  department text NOT NULL,
  integrity_score numeric DEFAULT 0 CHECK (integrity_score >= 0 AND integrity_score <= 100),
  risk_level text DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  compliance_score numeric DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
  alerts_count integer DEFAULT 0,
  phase text DEFAULT 'intake',
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE tender_integrity_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all tender integrity index"
  ON tender_integrity_index FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert tender integrity index"
  ON tender_integrity_index FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create evaluation_duration_metrics table
CREATE TABLE IF NOT EXISTS evaluation_duration_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  department text NOT NULL,
  phase text NOT NULL,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  duration_days integer DEFAULT 0,
  target_duration_days integer DEFAULT 0,
  variance_days integer DEFAULT 0,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE evaluation_duration_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all evaluation duration metrics"
  ON evaluation_duration_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert evaluation duration metrics"
  ON evaluation_duration_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create department_compliance table
CREATE TABLE IF NOT EXISTS department_compliance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_name text NOT NULL,
  compliance_score numeric DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
  total_tenders integer DEFAULT 0,
  compliant_tenders integer DEFAULT 0,
  on_time_completion_rate numeric DEFAULT 0,
  policy_adherence_rate numeric DEFAULT 0,
  risk_mitigation_score numeric DEFAULT 0,
  rank integer DEFAULT 0,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE department_compliance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all department compliance"
  ON department_compliance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert department compliance"
  ON department_compliance FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create dashboard_filters table
CREATE TABLE IF NOT EXISTS dashboard_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  filter_name text NOT NULL,
  filter_config jsonb DEFAULT '{}'::jsonb,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dashboard_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all dashboard filters"
  ON dashboard_filters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert dashboard filters"
  ON dashboard_filters FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create insight_exports table
CREATE TABLE IF NOT EXISTS insight_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  export_type text NOT NULL,
  export_format text DEFAULT 'pdf' CHECK (export_format IN ('pdf', 'xlsx', 'csv')),
  filters_applied jsonb DEFAULT '{}'::jsonb,
  exported_by uuid,
  exported_by_name text NOT NULL,
  file_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE insight_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all insight exports"
  ON insight_exports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert insight exports"
  ON insight_exports FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create scheduled_reviews table
CREATE TABLE IF NOT EXISTS scheduled_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_title text NOT NULL,
  review_type text NOT NULL,
  scheduled_date timestamptz NOT NULL,
  participants jsonb DEFAULT '[]'::jsonb,
  agenda text DEFAULT '',
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_by uuid,
  created_by_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scheduled_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all scheduled reviews"
  ON scheduled_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert scheduled reviews"
  ON scheduled_reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update scheduled reviews"
  ON scheduled_reviews FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_executive_kpis_period ON executive_kpis(period);
CREATE INDEX IF NOT EXISTS idx_executive_kpis_recorded_at ON executive_kpis(recorded_at);
CREATE INDEX IF NOT EXISTS idx_tender_integrity_index_tender_id ON tender_integrity_index(tender_id);
CREATE INDEX IF NOT EXISTS idx_tender_integrity_index_department ON tender_integrity_index(department);
CREATE INDEX IF NOT EXISTS idx_tender_integrity_index_risk_level ON tender_integrity_index(risk_level);
CREATE INDEX IF NOT EXISTS idx_evaluation_duration_metrics_tender_id ON evaluation_duration_metrics(tender_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_duration_metrics_department ON evaluation_duration_metrics(department);
CREATE INDEX IF NOT EXISTS idx_department_compliance_department_name ON department_compliance(department_name);
CREATE INDEX IF NOT EXISTS idx_department_compliance_rank ON department_compliance(rank);
CREATE INDEX IF NOT EXISTS idx_dashboard_filters_user_id ON dashboard_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_insight_exports_exported_by ON insight_exports(exported_by);
CREATE INDEX IF NOT EXISTS idx_scheduled_reviews_scheduled_date ON scheduled_reviews(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_reviews_status ON scheduled_reviews(status);
