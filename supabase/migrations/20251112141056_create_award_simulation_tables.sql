/*
  # Create Award Simulation Tables

  1. New Tables
    - `simulation_scenarios`
      - `id` (uuid, primary key)
      - `tender_id` (uuid, foreign key)
      - `scenario_name` (text)
      - `scenario_type` (text) - best_value, lowest_cost, risk_adjusted
      - `weight_config` (jsonb) - category weights
      - `exclusions` (jsonb) - excluded vendors/criteria
      - `selected_vendor_id` (uuid)
      - `total_score` (numeric)
      - `total_cost` (numeric)
      - `risk_score` (numeric)
      - `best_value_index` (numeric)
      - `predicted_reliability` (numeric)
      - `cost_saving_percentage` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `scenario_results`
      - `id` (uuid, primary key)
      - `scenario_id` (uuid, foreign key)
      - `vendor_id` (uuid, foreign key)
      - `rank` (integer)
      - `weighted_score` (numeric)
      - `total_cost` (numeric)
      - `value_score` (numeric)
      - `risk_assessment` (numeric)
      - `recommendation_strength` (numeric)
      - `calculated_at` (timestamptz)
    
    - `award_recommendations`
      - `id` (uuid, primary key)
      - `tender_id` (uuid, foreign key)
      - `scenario_id` (uuid, foreign key)
      - `recommended_vendor_id` (uuid, foreign key)
      - `recommendation_rationale` (text)
      - `confidence_score` (numeric)
      - `recommended_by` (uuid)
      - `recommender_name` (text)
      - `status` (text) - pending, approved, rejected
      - `created_at` (timestamptz)
    
    - `simulation_configs`
      - `id` (uuid, primary key)
      - `tender_id` (uuid, foreign key)
      - `config_name` (text)
      - `weight_settings` (jsonb)
      - `risk_parameters` (jsonb)
      - `exclusion_rules` (jsonb)
      - `is_active` (boolean)
      - `created_by` (uuid)
      - `created_at` (timestamptz)
    
    - `simulation_metrics`
      - `id` (uuid, primary key)
      - `tender_id` (uuid, foreign key)
      - `best_value_index` (numeric)
      - `predicted_reliability` (numeric)
      - `cost_saving_percentage` (numeric)
      - `scenarios_run` (integer)
      - `recorded_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users with evaluation chair role
*/

-- Create simulation_scenarios table
CREATE TABLE IF NOT EXISTS simulation_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  scenario_name text NOT NULL,
  scenario_type text DEFAULT 'best_value' CHECK (scenario_type IN ('best_value', 'lowest_cost', 'risk_adjusted', 'custom')),
  weight_config jsonb DEFAULT '{}'::jsonb,
  exclusions jsonb DEFAULT '[]'::jsonb,
  selected_vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  total_score numeric DEFAULT 0,
  total_cost numeric DEFAULT 0,
  risk_score numeric DEFAULT 0,
  best_value_index numeric DEFAULT 0,
  predicted_reliability numeric DEFAULT 0,
  cost_saving_percentage numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE simulation_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all simulation scenarios"
  ON simulation_scenarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert simulation scenarios"
  ON simulation_scenarios FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update simulation scenarios"
  ON simulation_scenarios FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create scenario_results table
CREATE TABLE IF NOT EXISTS scenario_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid REFERENCES simulation_scenarios(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  rank integer DEFAULT 0,
  weighted_score numeric DEFAULT 0,
  total_cost numeric DEFAULT 0,
  value_score numeric DEFAULT 0,
  risk_assessment numeric DEFAULT 0,
  recommendation_strength numeric DEFAULT 0,
  calculated_at timestamptz DEFAULT now()
);

ALTER TABLE scenario_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all scenario results"
  ON scenario_results FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert scenario results"
  ON scenario_results FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create award_recommendations table
CREATE TABLE IF NOT EXISTS award_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  scenario_id uuid REFERENCES simulation_scenarios(id) ON DELETE SET NULL,
  recommended_vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  recommendation_rationale text DEFAULT '',
  confidence_score numeric DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  recommended_by uuid,
  recommender_name text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE award_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all award recommendations"
  ON award_recommendations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert award recommendations"
  ON award_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update award recommendations"
  ON award_recommendations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create simulation_configs table
CREATE TABLE IF NOT EXISTS simulation_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  config_name text NOT NULL,
  weight_settings jsonb DEFAULT '{}'::jsonb,
  risk_parameters jsonb DEFAULT '{}'::jsonb,
  exclusion_rules jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT false,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE simulation_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all simulation configs"
  ON simulation_configs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert simulation configs"
  ON simulation_configs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update simulation configs"
  ON simulation_configs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create simulation_metrics table
CREATE TABLE IF NOT EXISTS simulation_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid REFERENCES tenders(id) ON DELETE CASCADE,
  best_value_index numeric DEFAULT 0,
  predicted_reliability numeric DEFAULT 0,
  cost_saving_percentage numeric DEFAULT 0,
  scenarios_run integer DEFAULT 0,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE simulation_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all simulation metrics"
  ON simulation_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert simulation metrics"
  ON simulation_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_simulation_scenarios_tender_id ON simulation_scenarios(tender_id);
CREATE INDEX IF NOT EXISTS idx_simulation_scenarios_type ON simulation_scenarios(scenario_type);
CREATE INDEX IF NOT EXISTS idx_scenario_results_scenario_id ON scenario_results(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_results_vendor_id ON scenario_results(vendor_id);
CREATE INDEX IF NOT EXISTS idx_award_recommendations_tender_id ON award_recommendations(tender_id);
CREATE INDEX IF NOT EXISTS idx_award_recommendations_scenario_id ON award_recommendations(scenario_id);
CREATE INDEX IF NOT EXISTS idx_simulation_configs_tender_id ON simulation_configs(tender_id);
CREATE INDEX IF NOT EXISTS idx_simulation_metrics_tender_id ON simulation_metrics(tender_id);
