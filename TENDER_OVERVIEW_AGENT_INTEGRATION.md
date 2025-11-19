# Tender Overview Page - Agent Integration Guide

## Overview
This document describes the JSON schema format that the AI agent should use when providing data for the Tender Overview page. The page displays information across 5 tabs: Overview, Financial, Technical, Compliance, and Support.

## JSON Schema Structure

The agent should return data in the following JSON format (see `TENDER_OVERVIEW_JSON_SCHEMA.json` for the complete schema):

```json
{
  "tenderOverview": {
    "header": { ... },
    "overview": { ... },
    "financial": { ... },
    "technical": { ... },
    "compliance": { ... },
    "support": { ... }
  }
}
```

## Data Mapping Guide

### 1. Overview Tab

#### Evaluation Weighting (Pie Chart)
- **Path**: `tenderOverview.overview.evaluationWeighting.data`
- **Format**: Array of objects with `name` (string) and `value` (number)
- **Usage**: Rendered as a pie chart showing distribution percentages
- **Example**:
  ```json
  [
    { "name": "Financial", "value": 50 },
    { "name": "Technical", "value": 50 }
  ]
  ```

#### Key Requirements
- **Path**: `tenderOverview.overview.keyRequirements.requirements`
- **Format**: Array of objects with `label` (string) and `value` (string)
- **Usage**: Displayed as a list of key-value pairs
- **Example**:
  ```json
  [
    { "label": "Named Users (Year 1)", "value": "20" },
    { "label": "Project Duration", "value": "36 months" }
  ]
  ```

#### Evaluation Scoring System
- **Path**: `tenderOverview.overview.evaluationScoringSystem`
- **Format**: Contains `financialScoring` and `technicalScoring` objects
- **Usage**: Displayed as two columns with bullet-point lists

### 2. Financial Tab

#### Evaluation Factors
- **Path**: `tenderOverview.financial.evaluationFactors`
- **Format**: Array of objects with `order` (number), `title` (string), `description` (string)
- **Usage**: Displayed as numbered list items

#### Disqualification Triggers
- **Path**: `tenderOverview.financial.disqualificationTriggers`
- **Format**: Array of strings
- **Usage**: Displayed as red alert boxes with ✕ icon

### 3. Technical Tab

#### Technical Criteria (Bar Chart)
- **Path**: `tenderOverview.technical.technicalCriteria`
- **Format**: Array of objects with `category` (string) and `weight` (number)
- **Usage**: Rendered as a bar chart showing weight percentages
- **Example**:
  ```json
  [
    { "category": "Functional & Technical Requirements Compliance", "weight": 30 },
    { "category": "Implementation Plan & Approach", "weight": 10 }
  ]
  ```

#### PSD Requirements
- **Path**: `tenderOverview.technical.psdRequirements`
- **Format**: Array of strings
- **Usage**: Displayed as a bullet-point list with ✓ icons

#### Disqualification Triggers
- **Path**: `tenderOverview.technical.disqualificationTriggers`
- **Format**: Array of strings
- **Usage**: Displayed as red alert boxes with ✕ icon

### 4. Compliance Tab

#### General Submission Compliance
- **Path**: `tenderOverview.compliance.generalSubmissionCompliance`
- **Format**: Array of strings
- **Usage**: Displayed as blue boxes with ✓ icons

#### Technical Compliance Requirements
- **Path**: `tenderOverview.compliance.technicalComplianceRequirements`
- **Format**: Array of strings
- **Usage**: Displayed in a grid with "YES/NO" badges

#### Team Compliance Requirements
- **Path**: `tenderOverview.compliance.teamComplianceRequirements`
- **Format**: Array of objects with `title` (string) and `description` (string)
- **Usage**: Displayed as cards with title and description

#### Oracle Licensing Compliance
- **Path**: `tenderOverview.compliance.oracleLicensingCompliance.note`
- **Format**: String
- **Usage**: Displayed as a red alert box

### 5. Support Tab

#### System Availability
- **Path**: `tenderOverview.support.supportAvailability.systemAvailabilityRequirement`
- **Format**: Object with `value` (number) and `unit` (string)
- **Usage**: Displayed as a large number with percentage

#### Support Hours
- **Path**: `tenderOverview.support.supportAvailability.supportHours`
- **Format**: Array of objects with `type` (string) and `schedule` (string)
- **Usage**: Displayed as a bullet-point list

#### Incident Response Times
- **Path**: `tenderOverview.support.incidentResponseTimes`
- **Format**: Array of objects with `priority` (string) and `responseTime` (string)
- **Usage**: Displayed as cards with priority and time badge

#### Severity Levels
- **Path**: `tenderOverview.support.severityLevels`
- **Format**: Array of objects with `level` (number) and `description` (string)
- **Usage**: Displayed as numbered list items

#### Backup & Disaster Recovery
- **Path**: `tenderOverview.support.backupAndDisasterRecovery`
- **Format**: Array of objects with `type` (string) and `period` (string)
- **Usage**: Displayed as key-value pairs with badges

#### Reliability Requirement
- **Path**: `tenderOverview.support.reliabilityRequirement`
- **Format**: String
- **Usage**: Displayed as a blue alert box

## Implementation Notes

1. **Type Safety**: Use the TypeScript interfaces in `src/types/tenderOverview.ts` for type checking
2. **Data Validation**: Validate the agent response against the schema before rendering
3. **Error Handling**: Handle missing or invalid data gracefully with fallback values
4. **Chart Colors**: The pie chart uses predefined colors: `['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']`
5. **Number Formatting**: Percentages should be displayed with the "%" symbol
6. **Text Formatting**: Maintain consistent formatting for dates, times, and durations

## Example Agent Response

```json
{
  "tenderOverview": {
    "header": {
      "title": "Tender Evaluation Framework",
      "subtitle": "RFP_CSD_PSD - Ras Al Khaimah Public Service Department"
    },
    "overview": {
      "evaluationWeighting": {
        "title": "Evaluation Weighting",
        "description": "Overall criteria distribution",
        "data": [
          { "name": "Financial", "value": 50 },
          { "name": "Technical", "value": 50 }
        ]
      },
      "keyRequirements": {
        "title": "Key Requirements",
        "description": "Mandatory qualifications",
        "requirements": [
          { "label": "Named Users (Year 1)", "value": "20" },
          { "label": "Analytics Licenses", "value": "20" },
          { "label": "Project Duration", "value": "36 months" },
          { "label": "Sprint Cycles", "value": "2 weeks" },
          { "label": "Minimum Company Experience", "value": "10 years" }
        ]
      },
      "evaluationScoringSystem": {
        "title": "Evaluation Scoring System",
        "description": "Comprehensive scoring methodology",
        "financialScoring": {
          "title": "Financial Scoring",
          "rules": [
            { "label": "Lowest bidder", "description": "100 points" },
            { "label": "Others", "description": "Scored proportionally based on price difference" },
            { "label": "Example", "description": "AED 10x = 100%, AED 12x = 80%, AED 14x = 60%" }
          ]
        },
        "technicalScoring": {
          "title": "Technical Scoring",
          "rules": [
            { "label": "Scale", "description": "1–10 for each category" },
            { "label": "Weighted", "description": "Based on importance of each criterion" },
            { "label": "Pass/Fail", "description": "Compliance requirements are mandatory" }
          ]
        }
      }
    },
    "financial": {
      "title": "Financial Evaluation Criteria",
      "weight": 50,
      "weightUnit": "percentage",
      "evaluationFactors": [
        {
          "order": 1,
          "title": "Completeness of Supporting Company Documentation",
          "description": "All required financial documents must be submitted"
        },
        {
          "order": 2,
          "title": "BOQ Alignment with Scope",
          "description": "Bill of Quantities components must match defined scope of work"
        },
        {
          "order": 3,
          "title": "Benchmark Comparison",
          "description": "Design, Configuration, Testing & UAT, Training, Staffing, Oracle License & Support Fees"
        }
      ],
      "disqualificationTriggers": [
        "Missing mandatory financial documents",
        "Major mismatch between BOQ and scope",
        "Unrealistic, unbalanced, or non-compliant pricing"
      ]
    },
    "technical": {
      "title": "Technical Evaluation Criteria",
      "weight": 50,
      "weightUnit": "percentage",
      "scoringScale": "1-10 per category",
      "technicalCriteria": [
        { "category": "Functional & Technical Requirements Compliance", "weight": 30 },
        { "category": "Implementation Plan & Approach", "weight": 10 },
        { "category": "Training Plan", "weight": 15 },
        { "category": "Team Qualifications, Experience & Local Capability", "weight": 30 },
        { "category": "Similar Experience & Business Case Alignment", "weight": 15 }
      ],
      "psdRequirements": [
        "End-to-end methodology completeness (Assessment → Design → Config → UAT → Go-Live → Support)",
        "Alignment with Oracle / Primavera implementation standards",
        "Experience with KPI, ERM, GRC, PPM modules",
        "Solid timeline, governance model, and execution roadmap",
        "Structured training approach (Basic → Advanced → TTT → Video-based)"
      ],
      "disqualificationTriggers": [
        "Major gaps between proposal and RFP requirements",
        "Missing responses in any mandatory compliance matrix",
        "Weak team (no certifications, insufficient experience, unrelated projects)"
      ]
    },
    "compliance": {
      "title": "Mandatory Compliance Requirements",
      "description": "Pass/Fail - Non-Negotiable",
      "generalSubmissionCompliance": [
        "Proposal submitted in Arabic + English",
        "Separate sealed envelopes for Technical & Financial proposals",
        "Acknowledgement of Receipt (Appendix 1) submitted",
        "All Appendices 1–9 fully completed",
        "Proposal validity: 3 months"
      ],
      "technicalComplianceRequirements": [
        "Process Requirements",
        "Functional Requirements",
        "Technical Requirements",
        "Deliverables Requirements",
        "Other RFP Requirements",
        "Sub-Consultants",
        "Project Team",
        "CVs",
        "Project Experience"
      ],
      "technicalComplianceNote": "Empty cells = automatically treated as \"NO.\"",
      "teamComplianceRequirements": [
        {
          "title": "Oracle Implementation Specialist Certifications",
          "description": "Mandatory requirement"
        },
        {
          "title": "Integration Consultant",
          "description": "8+ years experience + 3 successful implementations"
        },
        {
          "title": "Key Team Member History",
          "description": "Evidence that key team members previously worked together on Unifier, P6, OBIEE"
        }
      ],
      "oracleLicensingCompliance": {
        "note": "All costs must match PSD-provided Oracle pricing (non-negotiable)"
      }
    },
    "support": {
      "title": "Support & Service Level Agreements",
      "description": "Operational requirements and SLAs",
      "supportAvailability": {
        "systemAvailabilityRequirement": {
          "value": 99.5,
          "unit": "percentage"
        },
        "supportHours": [
          { "type": "Regular", "schedule": "7:00 AM – 2:00 PM (Sun–Thu)" },
          { "type": "Extended", "schedule": "2:00 PM – 10:00 PM (Sun–Thu)" },
          { "type": "Additional", "schedule": "9:00 AM – 2:00 PM (Sat)" },
          { "type": "Maintenance window", "schedule": "4:00 PM – 6:00 PM (First Sunday monthly)" }
        ]
      },
      "incidentResponseTimes": [
        { "priority": "High Priority", "responseTime": "0–8 hours" },
        { "priority": "Medium Priority", "responseTime": "≤48 hours" }
      ],
      "severityLevels": [
        { "level": 1, "description": "Total Outage" },
        { "level": 2, "description": "Severe Degradation" },
        { "level": 3, "description": "Minor Service Impact" },
        { "level": 4, "description": "Information / Clarification" }
      ],
      "backupAndDisasterRecovery": [
        { "type": "Daily backup retention", "period": "7 days" },
        { "type": "Weekly backup retention", "period": "4 weeks" },
        { "type": "Monthly backup retention", "period": "12 months" },
        { "type": "Annual backup retention", "period": "7 years" }
      ],
      "reliabilityRequirement": "System must not break more than 3 times per year"
    }
  }
}
```

## Next Steps

1. Update `TenderOverviewPage.tsx` to accept and use this data structure
2. Create an API service function to fetch data from the agent
3. Add state management for loading and error states
4. Map the agent response to the UI components
5. Add data validation and error handling

