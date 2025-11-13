import { Building2 } from 'lucide-react';
import { RAK_DEPARTMENTS } from '../data/departments';

interface DepartmentSelectorProps {
  selectedDepartment: string;
  onDepartmentChange: (departmentId: string) => void;
}

export function DepartmentSelector({ selectedDepartment, onDepartmentChange }: DepartmentSelectorProps) {
  const departments = RAK_DEPARTMENTS;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-600" />
          <h3 className="text-base font-semibold text-gray-900">
            Issuing Department
          </h3>
        </div>
      </div>

      <div className="p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Select Department
        </label>
        <div className="space-y-2">
          {departments.map((dept) => (
            <label
              key={dept.id}
              className={`
                flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all
                ${selectedDepartment === dept.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              <input
                type="radio"
                name="department"
                value={dept.id}
                checked={selectedDepartment === dept.id}
                onChange={(e) => onDepartmentChange(e.target.value)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {dept.name}
                </h4>
                <p className="text-xs text-gray-600 mb-2">
                  {dept.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {dept.allowedCategories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
