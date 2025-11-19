/**
 * TypeScript interfaces for Tender Overview Page data structure
 * This matches the JSON schema that the AI agent will provide
 */

export interface TenderOverviewData {
  tenderOverview: {
    header: {
      title: string;
      subtitle: string;
    };
    overview: {
      evaluationWeighting: {
        title: string;
        description: string;
        data: Array<{
          name: string;
          value: number;
        }>;
      };
      keyRequirements: {
        title: string;
        description: string;
        requirements: Array<{
          label: string;
          value: string;
        }>;
      };
      evaluationScoringSystem: {
        title: string;
        description: string;
        financialScoring: {
          title: string;
          rules: Array<{
            label: string;
            description: string;
          }>;
        };
        technicalScoring: {
          title: string;
          rules: Array<{
            label: string;
            description: string;
          }>;
        };
      };
    };
    financial: {
      title: string;
      weight: number;
      weightUnit: string;
      evaluationFactors: Array<{
        order: number;
        title: string;
        description: string;
      }>;
      disqualificationTriggers: string[];
    };
    technical: {
      title: string;
      weight: number;
      weightUnit: string;
      scoringScale: string;
      technicalCriteria: Array<{
        category: string;
        weight: number;
      }>;
      psdRequirements: string[];
      disqualificationTriggers: string[];
    };
    compliance: {
      title: string;
      description: string;
      generalSubmissionCompliance: string[];
      technicalComplianceRequirements: string[];
      technicalComplianceNote: string;
      teamComplianceRequirements: Array<{
        title: string;
        description: string;
      }>;
      oracleLicensingCompliance: {
        note: string;
      };
    };
    support: {
      title: string;
      description: string;
      supportAvailability: {
        systemAvailabilityRequirement: {
          value: number;
          unit: string;
        };
        supportHours: Array<{
          type: string;
          schedule: string;
        }>;
      };
      incidentResponseTimes: Array<{
        priority: string;
        responseTime: string;
      }>;
      severityLevels: Array<{
        level: number;
        description: string;
      }>;
      backupAndDisasterRecovery: Array<{
        type: string;
        period: string;
      }>;
      reliabilityRequirement: string;
    };
  };
}

