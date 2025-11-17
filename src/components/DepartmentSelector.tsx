import { Building2 } from 'lucide-react';
import { RAK_DEPARTMENTS } from '../data/departments';

interface DepartmentSelectorProps {
  selectedDepartment: string;
  onDepartmentChange: (departmentId: string) => void;
}

export function DepartmentSelector({ selectedDepartment, onDepartmentChange }: DepartmentSelectorProps) {
  const departments = RAK_DEPARTMENTS;

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-indigo-50 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className="relative px-6 py-4 border-b border-white/40 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-inner">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Issuing Department
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Select Department</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {departments.map((dept) => {
            const isSelected = selectedDepartment === dept.id;
            return (
              <label
                key={dept.id}
                className={`
                  group relative flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300
                  ${isSelected
                    ? 'bg-gradient-to-br from-indigo-50 via-white to-indigo-100 border-2 border-indigo-500 shadow-[0_18px_40px_rgba(79,70,229,0.15)]'
                    : 'bg-gradient-to-br from-white via-slate-50 to-white border-2 border-slate-200 hover:border-indigo-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]'
                  }
                  hover:-translate-y-0.5
                `}
              >
                <input
                  type="radio"
                  name="department"
                  value={dept.id}
                  checked={isSelected}
                  onChange={(e) => onDepartmentChange(e.target.value)}
                  className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 focus:ring-2"
                />
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-semibold mb-1.5 ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                    {dept.name}
                  </h4>
                  <p className={`text-xs mb-3 ${isSelected ? 'text-indigo-700' : 'text-gray-600'}`}>
                    {dept.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.allowedCategories.map((cat) => (
                      <span
                        key={cat}
                        className={`
                          px-2.5 py-1 text-xs font-semibold rounded-full border
                          ${isSelected
                            ? 'text-indigo-700 bg-indigo-100 border-indigo-200'
                            : 'text-blue-700 bg-blue-50 border-blue-100'
                          }
                        `}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-500 shadow-lg" />
                )}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
