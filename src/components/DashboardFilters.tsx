import { Filter } from 'lucide-react';

interface DashboardFiltersProps {
  selectedDepartment: string;
  selectedPhase: string;
  selectedRiskLevel: string;
  onDepartmentChange: (dept: string) => void;
  onPhaseChange: (phase: string) => void;
  onRiskLevelChange: (risk: string) => void;
  departments: string[];
  phases: string[];
  riskLevels: string[];
}

export function DashboardFilters({
  selectedDepartment,
  selectedPhase,
  selectedRiskLevel,
  onDepartmentChange,
  onPhaseChange,
  onRiskLevelChange,
  departments,
  phases,
  riskLevels,
}: DashboardFiltersProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-900">
          Filters
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Department
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Phase
          </label>
          <select
            value={selectedPhase}
            onChange={(e) => onPhaseChange(e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Phases</option>
            {phases.map((phase) => (
              <option key={phase} value={phase}>
                {phase}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Risk Level
          </label>
          <select
            value={selectedRiskLevel}
            onChange={(e) => onRiskLevelChange(e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Risk Levels</option>
            {riskLevels.map((risk) => (
              <option key={risk} value={risk}>
                {risk.charAt(0).toUpperCase() + risk.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
