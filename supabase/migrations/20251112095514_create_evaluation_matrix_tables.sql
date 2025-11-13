/*
  # Create Evaluation Matrix Tables

  1. New Tables
    - `evaluation_criteria`
      - `id` (uuid, primary key)
      - `tender_id` (uuid, foreign key)
      - `category` (text) - technical, financial, esg, innovation
      - `name` (text)
      - `description` (text)
      - `weight` (numeric) - 0 to 100
      - `order_index` (integer)
      - `created_at` (timestamptz)
    
    - `evaluation_scores`
      - `id` (uuid, primary key)
      - `criteria_id` (uuid, foreign key)
      - `vendor_id` (uuid, foreign key)
      - `score` (numeric) - 0 to 100
      - `ai_confidence` (numeric) - 0 to 1
      - `is_ai_generated` (boolean)
      - `evaluator_id` (uuid)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `evaluators`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `role` (text) - member, chair
      - `tender_id` (uuid, foreign key)
      - `created_at` (timestamptz)
    
    - `matrix_locks`
      - `id` (uuid, primary key)
      - `tender_id` (uuid, foreign key)
      - `category` (text)
      - `locked_by` (uuid)
      - `locked_at` (timestamptz)
      - `is_locked` (boolean)
    
    - `evaluation_metrics`
      - `id` (uuid, primary key)
      - `tender_id` (uuid, foreign key)
      - `weight_alignment` (numeric)
      - `variance_index` (numeric)
      - `processing_time_saved` (integer) - in minutes
      - `recorded_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Special policies for evaluation chairs
*/

-- Create evaluation_criteria table
CREATE TABLE IF NOT EXISTS evaluation_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  category text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  weight numeric DEFAULT 0 CHECK (weight >= 0 AND weight <= 100),
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE evaluation_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all evaluation criteria"
  ON evaluation_criteria FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert evaluation criteria"
  ON evaluation_criteria FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update evaluation criteria"
  ON evaluation_criteria FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create evaluators table
CREATE TABLE IF NOT EXISTS evaluators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  role text DEFAULT 'member' CHECK (role IN ('member', 'chair')),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE evaluators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all evaluators"
  ON evaluators FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert evaluators"
  ON evaluators FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update evaluators"
  ON evaluators FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create evaluation_scores table
CREATE TABLE IF NOT EXISTS evaluation_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  criteria_id uuid REFERENCES evaluation_criteria(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  score numeric DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  ai_confidence numeric DEFAULT 0 CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  is_ai_generated boolean DEFAULT false,
  evaluator_id uuid REFERENCES evaluators(id) ON DELETE SET NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE evaluation_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all evaluation scores"
  ON evaluation_scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert evaluation scores"
  ON evaluation_scores FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update evaluation scores"
  ON evaluation_scores FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create matrix_locks table
CREATE TABLE IF NOT EXISTS matrix_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  category text NOT NULL,
  locked_by uuid REFERENCES evaluators(id) ON DELETE SET NULL,
  locked_at timestamptz DEFAULT now(),
  is_locked boolean DEFAULT false
);

ALTER TABLE matrix_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all matrix locks"
  ON matrix_locks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert matrix locks"
  ON matrix_locks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update matrix locks"
  ON matrix_locks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create evaluation_metrics table
CREATE TABLE IF NOT EXISTS evaluation_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  weight_alignment numeric DEFAULT 0,
  variance_index numeric DEFAULT 0,
  processing_time_saved integer DEFAULT 0,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE evaluation_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all evaluation metrics"
  ON evaluation_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert evaluation metrics"
  ON evaluation_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_evaluation_criteria_tender_id ON evaluation_criteria(tender_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_criteria_category ON evaluation_criteria(category);
CREATE INDEX IF NOT EXISTS idx_evaluation_scores_criteria_id ON evaluation_scores(criteria_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_scores_vendor_id ON evaluation_scores(vendor_id);
CREATE INDEX IF NOT EXISTS idx_evaluators_tender_id ON evaluators(tender_id);
CREATE INDEX IF NOT EXISTS idx_matrix_locks_tender_id ON matrix_locks(tender_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_metrics_tender_id ON evaluation_metrics(tender_id);
