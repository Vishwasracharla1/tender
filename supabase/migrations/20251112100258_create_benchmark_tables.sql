/*
  # Create Benchmark Dashboard Tables

  1. New Tables
    - `benchmarks`
      - `id` (uuid, primary key)
      - `tender_id` (uuid, foreign key)
      - `category` (text) - material, labor, equipment, etc.
      - `item_name` (text)
      - `market_median` (numeric)
      - `market_min` (numeric)
      - `market_max` (numeric)
      - `std_deviation` (numeric)
      - `sample_size` (integer)
      - `created_at` (timestamptz)
    
    - `price_points`
      - `id` (uuid, primary key)
      - `benchmark_id` (uuid, foreign key)
      - `vendor_id` (uuid, foreign key)
      - `quoted_price` (numeric)
      - `is_outlier` (boolean)
      - `deviation_percentage` (numeric)
      - `outlier_flag_status` (text) - pending, accepted, rejected
      - `created_at` (timestamptz)
    
    - `benchmark_insights`
      - `id` (uuid, primary key)
      - `tender_id` (uuid, foreign key)
      - `insight_type` (text) - anomaly, trend, recommendation
      - `severity` (text) - info, warning, critical
      - `title` (text)
      - `description` (text)
      - `metadata` (jsonb)
      - `is_read` (boolean)
      - `created_at` (timestamptz)
    
    - `benchmark_approvals`
      - `id` (uuid, primary key)
      - `tender_id` (uuid, foreign key)
      - `approved_by` (uuid)
      - `status` (text) - pending, approved, rejected
      - `notes` (text)
      - `approved_at` (timestamptz)
    
    - `benchmark_metrics`
      - `id` (uuid, primary key)
      - `tender_id` (uuid, foreign key)
      - `avg_price_deviation` (numeric)
      - `outlier_count` (integer)
      - `accuracy_score` (numeric)
      - `recorded_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create benchmarks table
CREATE TABLE IF NOT EXISTS benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  category text NOT NULL,
  item_name text NOT NULL,
  market_median numeric DEFAULT 0,
  market_min numeric DEFAULT 0,
  market_max numeric DEFAULT 0,
  std_deviation numeric DEFAULT 0,
  sample_size integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all benchmarks"
  ON benchmarks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert benchmarks"
  ON benchmarks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update benchmarks"
  ON benchmarks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create price_points table
CREATE TABLE IF NOT EXISTS price_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_id uuid REFERENCES benchmarks(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  quoted_price numeric NOT NULL,
  is_outlier boolean DEFAULT false,
  deviation_percentage numeric DEFAULT 0,
  outlier_flag_status text DEFAULT 'pending' CHECK (outlier_flag_status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE price_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all price points"
  ON price_points FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert price points"
  ON price_points FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update price points"
  ON price_points FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create benchmark_insights table
CREATE TABLE IF NOT EXISTS benchmark_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('anomaly', 'trend', 'recommendation')),
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  title text NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE benchmark_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all benchmark insights"
  ON benchmark_insights FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert benchmark insights"
  ON benchmark_insights FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update benchmark insights"
  ON benchmark_insights FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create benchmark_approvals table
CREATE TABLE IF NOT EXISTS benchmark_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  approved_by uuid,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes text DEFAULT '',
  approved_at timestamptz
);

ALTER TABLE benchmark_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all benchmark approvals"
  ON benchmark_approvals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert benchmark approvals"
  ON benchmark_approvals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update benchmark approvals"
  ON benchmark_approvals FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create benchmark_metrics table
CREATE TABLE IF NOT EXISTS benchmark_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  avg_price_deviation numeric DEFAULT 0,
  outlier_count integer DEFAULT 0,
  accuracy_score numeric DEFAULT 0,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE benchmark_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all benchmark metrics"
  ON benchmark_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert benchmark metrics"
  ON benchmark_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_benchmarks_tender_id ON benchmarks(tender_id);
CREATE INDEX IF NOT EXISTS idx_price_points_benchmark_id ON price_points(benchmark_id);
CREATE INDEX IF NOT EXISTS idx_price_points_vendor_id ON price_points(vendor_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_insights_tender_id ON benchmark_insights(tender_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_approvals_tender_id ON benchmark_approvals(tender_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_metrics_tender_id ON benchmark_metrics(tender_id);
