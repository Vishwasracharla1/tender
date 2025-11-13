/*
  # Create Integration Management Tables

  1. New Tables
    - `integrations`
      - Integration system configurations
      - Connection parameters and credentials
      - Status and sync information
    
    - `integration_sync_logs`
      - Historical sync logs
      - Success/failure tracking
      - Data volume metrics
    
    - `integration_mappings`
      - Field mappings between systems
      - Data transformation rules
      - Department-specific configurations

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users only
    - Admin-level access required
*/

-- Integration Systems Table
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  system_name text NOT NULL,
  system_type text NOT NULL CHECK (system_type IN ('ERP', 'Procurement', 'Financial', 'HRMS', 'Custom', 'Document', 'Vendor')),
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'configuring')),
  endpoint_url text NOT NULL,
  auth_method text NOT NULL CHECK (auth_method IN ('API Key', 'OAuth 2.0', 'SAML', 'Basic Auth')),
  auth_credentials jsonb,
  data_flow text NOT NULL CHECK (data_flow IN ('bidirectional', 'inbound', 'outbound')),
  departments text[],
  description text,
  last_sync_at timestamptz,
  sync_frequency_minutes integer DEFAULT 15,
  records_synced integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sync Logs Table
CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES integrations(id) ON DELETE CASCADE,
  sync_started_at timestamptz NOT NULL,
  sync_completed_at timestamptz,
  status text NOT NULL CHECK (status IN ('success', 'failed', 'partial', 'in_progress')),
  records_processed integer DEFAULT 0,
  records_success integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_message text,
  error_details jsonb,
  sync_duration_seconds integer,
  created_at timestamptz DEFAULT now()
);

-- Integration Field Mappings Table
CREATE TABLE IF NOT EXISTS integration_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES integrations(id) ON DELETE CASCADE,
  source_field text NOT NULL,
  target_field text NOT NULL,
  field_type text NOT NULL,
  transformation_rule jsonb,
  is_required boolean DEFAULT false,
  default_value text,
  validation_rule text,
  department_specific text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Integration Configuration Table
CREATE TABLE IF NOT EXISTS integration_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES integrations(id) ON DELETE CASCADE,
  config_key text NOT NULL,
  config_value jsonb NOT NULL,
  config_type text NOT NULL CHECK (config_type IN ('connection', 'mapping', 'schedule', 'notification', 'security')),
  is_encrypted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(integration_id, config_key)
);

-- Enable Row Level Security
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for integrations
CREATE POLICY "Authenticated users can view integrations"
  ON integrations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can manage integrations"
  ON integrations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for sync logs
CREATE POLICY "Authenticated users can view sync logs"
  ON integration_sync_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create sync logs"
  ON integration_sync_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for mappings
CREATE POLICY "Authenticated users can view mappings"
  ON integration_mappings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can manage mappings"
  ON integration_mappings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for configs
CREATE POLICY "Admin users can manage configs"
  ON integration_configs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_system_type ON integrations(system_type);
CREATE INDEX IF NOT EXISTS idx_sync_logs_integration_id ON integration_sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON integration_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON integration_sync_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mappings_integration_id ON integration_mappings(integration_id);
CREATE INDEX IF NOT EXISTS idx_configs_integration_id ON integration_configs(integration_id);

-- Insert sample integrations
INSERT INTO integrations (name, system_name, system_type, status, endpoint_url, auth_method, data_flow, departments, description, last_sync_at, records_synced)
VALUES
  (
    'SAP ERP Integration',
    'SAP S/4HANA',
    'ERP',
    'active',
    'https://sap.rak.ae/api/procurement',
    'OAuth 2.0',
    'bidirectional',
    ARRAY['Procurement', 'Finance', 'All Departments'],
    'Core ERP system for procurement, finance, and vendor management',
    NOW() - INTERVAL '2 minutes',
    1847
  ),
  (
    'Tejari Procurement Portal',
    'Tejari (UAE Federal)',
    'Procurement',
    'active',
    'https://api.tejari.gov.ae/v2/tenders',
    'API Key',
    'inbound',
    ARRAY['Procurement'],
    'UAE Federal procurement platform for tender listings and vendor database',
    NOW() - INTERVAL '5 minutes',
    634
  ),
  (
    'RAK Finance System',
    'Oracle Financials',
    'Financial',
    'active',
    'https://finance.rak.ae/api/budget',
    'OAuth 2.0',
    'bidirectional',
    ARRAY['Finance', 'Procurement', 'All Departments'],
    'Financial management system for budget tracking and payment processing',
    NOW() - INTERVAL '10 minutes',
    2341
  );

SELECT 'Integration management tables created successfully' as status;
