import { useState } from 'react';
import { Filter, Target, FileText, DollarSign, ClipboardCheck, Activity, Clock } from 'lucide-react';
import { KPIWidget } from './KPIWidget';

export default function ProcurementDashboard() {
  const [department, setDepartment] = useState('All Departments');
  const [tender, setTender] = useState('TND-2025-003 - IT Equipment Procurement');

  const articles = [
    { title: 'Needs and Invitations', count: 12 },
    { title: 'BOQ & Technical Specifications', count: 8 },
    { title: 'Evaluation Parameters', count: 15 },
    { title: 'Payment Terms', count: 6 },
    { title: 'Delivery Schedules', count: 9 },
    { title: 'Deadline', count: 3 }
  ];

  return (
    <div className="space-y-6">
      {/* Tender Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <KPIWidget
          title="Total Tenders"
          value="24"
          subtitle="Posted this quarter"
          icon={Activity}
        />

        <KPIWidget
          title="Ongoing Tenders"
          value="8"
          subtitle="Active evaluations"
          icon={Clock}
          trend={{ value: '12%', isPositive: true }}
        />

        <KPIWidget
          title="Weight Alignment"
          value="98%"
          subtitle="Target: 100% (Current: 100%)"
          icon={Target}
          trend={{ value: '5%', isPositive: true }}
        />

        <KPIWidget
          title="Vendor Compliance"
          value="94%"
          subtitle="Target: 95% (Current: 94%)"
          icon={ClipboardCheck}
          trend={{ value: '2%', isPositive: true }}
        />
      </div>

      {/* Additional KPI Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <KPIWidget
          title="Budget Utilization"
          value="87%"
          subtitle="Target: 90% (Current: 87%)"
          icon={DollarSign}
          trend={{ value: '3%', isPositive: true }}
        />
      </div>

      {/* Filters Section */}
      <div className="relative overflow-hidden rounded-2xl p-6 mb-10 bg-gradient-to-br from-white via-sky-50 to-sky-100 border border-sky-100">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-gradient-to-br from-sky-200 to-blue-200 opacity-50 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 bottom-0 w-40 h-40 bg-gradient-to-tr from-cyan-100 to-slate-100 opacity-60 blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-2 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-inner">
            <Filter className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-indigo-500 uppercase">Filters</p>
            <h2 className="text-lg font-semibold text-slate-900">Personalize the Executive View</h2>
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-semibold text-indigo-900 mb-2 tracking-wide">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-white/90 border border-white/60 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
            >
              <option>All Departments</option>
              <option>IT Department</option>
              <option>Finance Department</option>
              <option>Operations Department</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-indigo-900 mb-2 tracking-wide">
              Tender
            </label>
            <select
              value={tender}
              onChange={(e) => setTender(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-white/90 border border-white/60 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
            >
              <option>TND-2025-003 - IT Equipment Procurement</option>
              <option>TND-2025-002 - Office Supplies</option>
              <option>TND-2025-001 - Consulting Services</option>
            </select>
          </div>
        </div>

        <div className="relative flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Showing tender:</span>
          <span className="bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm">
            IT Equipment Procurement
          </span>
          <span className="bg-gradient-to-r from-blue-400 to-blue-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm">
            evaluation
          </span>
          <span className="bg-gradient-to-r from-purple-400 to-purple-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm">
            SUPPLIES
          </span>
        </div>
      </div>

      {/* Articles Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center mb-6">
          <FileText className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-sm font-semibold text-gray-900">Tender Documentation</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-blue-50/50 rounded-xl p-5 border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
                <div className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {article.count}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {article.count} document{article.count !== 1 ? 's' : ''} available
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
