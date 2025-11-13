/*
  # Update RAK Departments Configuration

  1. Updates
    - Replaces with 13 official RAK departments
    - Configures each department's allowed tender categories
    - Sets up emirate and compliance requirements

  2. Departments
    1. Legal - Services & Consultancy
    2. HR - Services, Consultancy, Supplies
    3. Water Management - All categories
    4. Parking Management - Works, Services, Supplies
    5. Waste Management - Works, Services, Supplies
    6. Roads & Construction - Works, Consultancy, Supplies
    7. Maintenance - Works, Services, Supplies
    8. Administration - Services, Supplies, Consultancy
    9. Procurement - All categories
    10. City Violation / Enforcement - Services, Supplies
    11. Tolls Management - Works, Services, Supplies
    12. Citizen-Centric Services - Services, Consultancy, Supplies
    13. Landscape & Irrigation - Works, Services, Supplies
*/

-- Clear existing department configurations
DELETE FROM department_tender_config;

-- Insert 13 RAK departments with proper configurations
INSERT INTO department_tender_config (department_name, emirate, category_weights, approval_workflow, compliance_requirements, is_active, created_at)
VALUES
  (
    'Legal',
    'Ras Al Khaimah',
    '{"SERVICES": 60, "CONSULTANCY": 40}'::jsonb,
    '{"levels": [{"role": "Department Head", "threshold": 100000}, {"role": "Director General", "threshold": 500000}]}'::jsonb,
    '{"bar_association": true, "legal_entity_verification": true}'::jsonb,
    true,
    NOW()
  ),
  (
    'HR',
    'Ras Al Khaimah',
    '{"SERVICES": 50, "CONSULTANCY": 30, "SUPPLIES": 20}'::jsonb,
    '{"levels": [{"role": "HR Manager", "threshold": 50000}, {"role": "Director General", "threshold": 200000}]}'::jsonb,
    '{"ministry_hrda_approval": true, "uae_labor_law_compliance": true}'::jsonb,
    true,
    NOW()
  ),
  (
    'Water Management',
    'Ras Al Khaimah',
    '{"WORKS": 40, "SERVICES": 25, "CONSULTANCY": 20, "SUPPLIES": 15}'::jsonb,
    '{"levels": [{"role": "Department Head", "threshold": 200000}, {"role": "Director General", "threshold": 1000000}]}'::jsonb,
    '{"environmental_clearance": true, "water_quality_standards": true}'::jsonb,
    true,
    NOW()
  ),
  (
    'Parking Management',
    'Ras Al Khaimah',
    '{"WORKS": 50, "SERVICES": 30, "SUPPLIES": 20}'::jsonb,
    '{"levels": [{"role": "Parking Director", "threshold": 150000}, {"role": "Municipality Director", "threshold": 500000}]}'::jsonb,
    '{"traffic_department_coordination": true, "smart_parking_standards": true}'::jsonb,
    true,
    NOW()
  ),
  (
    'Waste Management',
    'Ras Al Khaimah',
    '{"WORKS": 35, "SERVICES": 45, "SUPPLIES": 20}'::jsonb,
    '{"levels": [{"role": "Waste Manager", "threshold": 100000}, {"role": "Municipality Director", "threshold": 750000}]}'::jsonb,
    '{"environmental_agency_approval": true, "waste_disposal_license": true}'::jsonb,
    true,
    NOW()
  ),
  (
    'Roads & Construction',
    'Ras Al Khaimah',
    '{"WORKS": 70, "CONSULTANCY": 20, "SUPPLIES": 10}'::jsonb,
    '{"levels": [{"role": "Engineering Manager", "threshold": 500000}, {"role": "Director General", "threshold": 2000000}]}'::jsonb,
    '{"contractor_license": true, "safety_certification": true, "insurance_requirements": true}'::jsonb,
    true,
    NOW()
  ),
  (
    'Maintenance',
    'Ras Al Khaimah',
    '{"WORKS": 40, "SERVICES": 40, "SUPPLIES": 20}'::jsonb,
    '{"levels": [{"role": "Maintenance Head", "threshold": 75000}, {"role": "Facilities Director", "threshold": 300000}]}'::jsonb,
    '{"facility_management_standards": true, "emergency_response_capability": true}'::jsonb,
    true,
    NOW()
  ),
  (
    'Administration',
    'Ras Al Khaimah',
    '{"SERVICES": 45, "SUPPLIES": 35, "CONSULTANCY": 20}'::jsonb,
    '{"levels": [{"role": "Admin Manager", "threshold": 50000}, {"role": "Director General", "threshold": 200000}]}'::jsonb,
    '{"government_standards_compliance": true}'::jsonb,
    true,
    NOW()
  ),
  (
    'Procurement',
    'Ras Al Khaimah',
    '{"WORKS": 25, "SERVICES": 25, "SUPPLIES": 30, "CONSULTANCY": 20}'::jsonb,
    '{"levels": [{"role": "Procurement Manager", "threshold": 250000}, {"role": "CFO", "threshold": 1000000}]}'::jsonb,
    '{"federal_procurement_law": true, "supplier_registration": true}'::jsonb,
    true,
    NOW()
  ),
  (
    'City Violation / Enforcement',
    'Ras Al Khaimah',
    '{"SERVICES": 70, "SUPPLIES": 30}'::jsonb,
    '{"levels": [{"role": "Enforcement Manager", "threshold": 100000}, {"role": "Municipality Director", "threshold": 400000}]}'::jsonb,
    '{"legal_authority_verification": true, "enforcement_protocols": true}'::jsonb,
    true,
    NOW()
  ),
  (
    'Tolls Management',
    'Ras Al Khaimah',
    '{"WORKS": 35, "SERVICES": 40, "SUPPLIES": 25}'::jsonb,
    '{"levels": [{"role": "Tolls Director", "threshold": 200000}, {"role": "Transport Authority", "threshold": 1000000}]}'::jsonb,
    '{"transport_authority_approval": true, "toll_collection_standards": true}'::jsonb,
    true,
    NOW()
  ),
  (
    'Citizen-Centric Services',
    'Ras Al Khaimah',
    '{"SERVICES": 50, "CONSULTANCY": 30, "SUPPLIES": 20}'::jsonb,
    '{"levels": [{"role": "Service Manager", "threshold": 75000}, {"role": "Director General", "threshold": 300000}]}'::jsonb,
    '{"customer_service_standards": true, "data_privacy_compliance": true}'::jsonb,
    true,
    NOW()
  ),
  (
    'Landscape & Irrigation',
    'Ras Al Khaimah',
    '{"WORKS": 45, "SERVICES": 35, "SUPPLIES": 20}'::jsonb,
    '{"levels": [{"role": "Landscape Manager", "threshold": 100000}, {"role": "Municipality Director", "threshold": 500000}]}'::jsonb,
    '{"environmental_standards": true, "water_conservation_requirements": true}'::jsonb,
    true,
    NOW()
  );

SELECT 'Successfully configured 13 RAK departments' as status, COUNT(*) as department_count
FROM department_tender_config WHERE is_active = true;
