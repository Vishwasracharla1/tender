import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { KPIWidget } from '../components/KPIWidget';
import { CheckCircle, XCircle, AlertCircle, Settings, RefreshCw, Database, FileText, Globe, Users, Plug2, ArrowLeftRight, ArrowDown, ArrowUp, Info } from 'lucide-react';

interface IntegrationManagementPageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration' | 'tender-prebidding') => void;
}

interface Integration {
  id: string;
  name: string;
  system: string;
  type: 'ERP' | 'Procurement' | 'Financial' | 'HRMS' | 'Custom' | 'Document' | 'Vendor';
  status: 'active' | 'inactive' | 'error' | 'configuring';
  lastSync: string;
  recordsSync: number;
  endpoint: string;
  authMethod: 'API Key' | 'OAuth 2.0' | 'SAML' | 'Basic Auth';
  dataFlow: 'bidirectional' | 'inbound' | 'outbound';
  department: string[];
  description: string;
}

export function IntegrationManagementPage({ onNavigate }: IntegrationManagementPageProps) {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const integrations: Integration[] = [
    {
      id: 'int-001',
      name: 'SAP ERP Integration',
      system: 'SAP S/4HANA',
      type: 'ERP',
      status: 'active',
      lastSync: '2 minutes ago',
      recordsSync: 1847,
      endpoint: 'https://sap.rak.ae/api/procurement',
      authMethod: 'OAuth 2.0',
      dataFlow: 'bidirectional',
      department: ['Procurement', 'Finance', 'All Departments'],
      description: 'Core ERP system for procurement, finance, and vendor management',
    },
    {
      id: 'int-002',
      name: 'Tejari Procurement Portal',
      system: 'Tejari (UAE Federal)',
      type: 'Procurement',
      status: 'active',
      lastSync: '5 minutes ago',
      recordsSync: 634,
      endpoint: 'https://api.tejari.gov.ae/v2/tenders',
      authMethod: 'API Key',
      dataFlow: 'inbound',
      department: ['Procurement'],
      description: 'UAE Federal procurement platform for tender listings and vendor database',
    },
    {
      id: 'int-003',
      name: 'RAK Finance System',
      system: 'Oracle Financials',
      type: 'Financial',
      status: 'active',
      lastSync: '10 minutes ago',
      recordsSync: 2341,
      endpoint: 'https://finance.rak.ae/api/budget',
      authMethod: 'OAuth 2.0',
      dataFlow: 'bidirectional',
      department: ['Finance', 'Procurement', 'All Departments'],
      description: 'Financial management system for budget tracking and payment processing',
    },
    {
      id: 'int-004',
      name: 'RAK HR Management System',
      system: 'PeopleSoft HRMS',
      type: 'HRMS',
      status: 'active',
      lastSync: '15 minutes ago',
      recordsSync: 892,
      endpoint: 'https://hr.rak.ae/api/employees',
      authMethod: 'SAML',
      dataFlow: 'inbound',
      department: ['HR', 'All Departments'],
      description: 'Employee data, evaluator credentials, and departmental structure',
    },
    {
      id: 'int-005',
      name: 'RAK Document Management',
      system: 'SharePoint Online',
      type: 'Document',
      status: 'active',
      lastSync: '3 minutes ago',
      recordsSync: 4567,
      endpoint: 'https://rak.sharepoint.com/_api/tender-docs',
      authMethod: 'OAuth 2.0',
      dataFlow: 'bidirectional',
      department: ['All Departments'],
      description: 'Central repository for tender documents, contracts, and compliance files',
    },
    {
      id: 'int-006',
      name: 'RAK Vendor Registry',
      system: 'Custom Vendor System',
      type: 'Vendor',
      status: 'active',
      lastSync: '8 minutes ago',
      recordsSync: 1234,
      endpoint: 'https://vendors.rak.ae/api/registry',
      authMethod: 'API Key',
      dataFlow: 'bidirectional',
      department: ['Procurement', 'Legal'],
      description: 'Centralized vendor registration, prequalification, and compliance tracking',
    },
    {
      id: 'int-007',
      name: 'RAK E-Services Portal',
      system: 'Custom Citizen Portal',
      type: 'Custom',
      status: 'active',
      lastSync: '12 minutes ago',
      recordsSync: 567,
      endpoint: 'https://eservices.rak.ae/api/public-tenders',
      authMethod: 'API Key',
      dataFlow: 'outbound',
      department: ['Citizen-Centric Services'],
      description: 'Public-facing portal for tender announcements and citizen inquiries',
    },
    {
      id: 'int-008',
      name: 'RAK Asset Management',
      system: 'Maximo (IBM)',
      type: 'Custom',
      status: 'active',
      lastSync: '20 minutes ago',
      recordsSync: 789,
      endpoint: 'https://assets.rak.ae/api/inventory',
      authMethod: 'Basic Auth',
      dataFlow: 'inbound',
      department: ['Maintenance', 'Roads & Construction'],
      description: 'Asset tracking, maintenance schedules, and inventory management',
    },
    {
      id: 'int-009',
      name: 'Smart City IoT Platform',
      system: 'RAK Smart City Hub',
      type: 'Custom',
      status: 'configuring',
      lastSync: 'Never',
      recordsSync: 0,
      endpoint: 'https://smartcity.rak.ae/api/sensors',
      authMethod: 'OAuth 2.0',
      dataFlow: 'inbound',
      department: ['Water Management', 'Waste Management', 'Tolls Management'],
      description: 'IoT sensor data for infrastructure monitoring and predictive maintenance',
    },
    {
      id: 'int-010',
      name: 'GCC Procurement Gateway',
      system: 'GCC Integration Hub',
      type: 'Procurement',
      status: 'inactive',
      lastSync: '2 days ago',
      recordsSync: 234,
      endpoint: 'https://gcc-procurement.ae/api/cross-border',
      authMethod: 'API Key',
      dataFlow: 'inbound',
      department: ['Procurement'],
      description: 'Cross-border procurement opportunities across GCC member states',
    },
    {
      id: 'int-011',
      name: 'RAK Legal Compliance System',
      system: 'Custom Legal Platform',
      type: 'Custom',
      status: 'active',
      lastSync: '7 minutes ago',
      recordsSync: 456,
      endpoint: 'https://legal.rak.ae/api/compliance',
      authMethod: 'SAML',
      dataFlow: 'bidirectional',
      department: ['Legal', 'Procurement'],
      description: 'Legal document review, contract templates, and regulatory compliance checks',
    },
    {
      id: 'int-012',
      name: 'Market Intelligence Database',
      system: 'Bloomberg Government',
      type: 'Custom',
      status: 'active',
      lastSync: '1 hour ago',
      recordsSync: 15234,
      endpoint: 'https://api.bgov.com/v3/pricing',
      authMethod: 'API Key',
      dataFlow: 'inbound',
      department: ['Procurement'],
      description: 'Market pricing data, commodity indices, and competitive benchmarking',
    },
  ];

  const getStatusConfig = (status: Integration['status']) => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-gradient-to-r from-emerald-50 to-teal-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          badge: 'bg-gradient-to-r from-emerald-500 to-teal-500',
          icon: CheckCircle,
        };
      case 'inactive':
        return {
          bg: 'bg-gradient-to-r from-slate-50 to-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-200',
          badge: 'bg-gradient-to-r from-slate-400 to-slate-500',
          icon: XCircle,
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          text: 'text-red-700',
          border: 'border-red-200',
          badge: 'bg-gradient-to-r from-red-500 to-rose-500',
          icon: AlertCircle,
        };
      case 'configuring':
        return {
          bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          badge: 'bg-gradient-to-r from-amber-500 to-orange-500',
          icon: Settings,
        };
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'configuring':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'configuring':
        return <Settings className="w-4 h-4 animate-spin" />;
    }
  };

  const getTypeConfig = (type: Integration['type']) => {
    switch (type) {
      case 'ERP':
        return { icon: Database, gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', text: 'text-blue-700' };
      case 'Procurement':
        return { icon: FileText, gradient: 'from-purple-500 to-indigo-500', bg: 'from-purple-50 to-indigo-50', border: 'border-purple-200', text: 'text-purple-700' };
      case 'Financial':
        return { icon: Database, gradient: 'from-emerald-500 to-teal-500', bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', text: 'text-emerald-700' };
      case 'HRMS':
        return { icon: Users, gradient: 'from-orange-500 to-amber-500', bg: 'from-orange-50 to-amber-50', border: 'border-orange-200', text: 'text-orange-700' };
      case 'Document':
        return { icon: FileText, gradient: 'from-indigo-500 to-purple-500', bg: 'from-indigo-50 to-purple-50', border: 'border-indigo-200', text: 'text-indigo-700' };
      case 'Vendor':
        return { icon: Users, gradient: 'from-pink-500 to-rose-500', bg: 'from-pink-50 to-rose-50', border: 'border-pink-200', text: 'text-pink-700' };
      case 'Custom':
        return { icon: Globe, gradient: 'from-slate-500 to-slate-600', bg: 'from-slate-50 to-slate-100', border: 'border-slate-200', text: 'text-slate-700' };
    }
  };

  const getTypeIcon = (type: Integration['type']) => {
    const config = getTypeConfig(type);
    const Icon = config.icon;
    return <Icon className="w-5 h-5" style={{ color: 'inherit' }} />;
  };

  const getFlowIcon = (flow: Integration['dataFlow']) => {
    switch (flow) {
      case 'bidirectional':
        return ArrowLeftRight;
      case 'inbound':
        return ArrowDown;
      case 'outbound':
        return ArrowUp;
    }
  };

  const activeCount = integrations.filter(i => i.status === 'active').length;
  const totalRecords = integrations.reduce((sum, i) => sum + i.recordsSync, 0);
  const errorCount = integrations.filter(i => i.status === 'error').length;

  const selectedIntegrationData = integrations.find(i => i.id === selectedIntegration);

  return (
    <>
      <Sidebar currentPage="integration" onNavigate={onNavigate} />
      <div className="app-shell min-h-screen bg-gray-50 pb-24">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Integration Management
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  System integrations and data synchronization
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                  {activeCount} Active
                </span>
                {errorCount > 0 && (
                  <span className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-full border border-red-200">
                    {errorCount} Errors
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-4 gap-6 mb-8">
            <KPIWidget
              title="Total Integrations"
              value={integrations.length}
              subtitle={`${activeCount} active connections`}
              icon={Plug2}
            />

            <KPIWidget
              title="Records Synced"
              value={totalRecords.toLocaleString()}
              subtitle="Last 24 hours"
              icon={RefreshCw}
            />

            <KPIWidget
              title="System Types"
              value="7"
              subtitle="ERP, HRMS, Custom, etc."
              icon={Globe}
            />

            <KPIWidget
              title="Avg Sync Time"
              value="8.4m"
              subtitle="Average across all systems"
              icon={Settings}
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white via-indigo-50/30 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden">
                <div className="px-6 py-4 border-b-2 border-slate-200 bg-gradient-to-r from-white via-indigo-50/50 to-white backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <Plug2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Integration Systems
                      </h2>
                      <p className="text-xs text-slate-500">Connected systems and platforms</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {integrations.map((integration) => {
                    const typeConfig = getTypeConfig(integration.type);
                    const statusConfig = getStatusConfig(integration.status);
                    const TypeIcon = typeConfig.icon;
                    const StatusIcon = statusConfig.icon;
                    const FlowIcon = getFlowIcon(integration.dataFlow);
                    const isSelected = selectedIntegration === integration.id;
                    
                    return (
                      <div
                        key={integration.id}
                        onClick={() => setSelectedIntegration(integration.id)}
                        className={`group relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? `${statusConfig.border} ${statusConfig.bg} shadow-lg scale-[1.02]`
                            : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeConfig.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                            <TypeIcon className="w-5 h-5 text-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-slate-900 mb-1">
                                  {integration.name}
                                </h3>
                                <p className="text-xs font-medium text-slate-600">
                                  {integration.system}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border-2 shadow-sm ${statusConfig.badge} text-white`}
                                >
                                  <StatusIcon className="w-3.5 h-3.5" />
                                  {integration.status}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs font-medium text-slate-600 mb-3">
                              {integration.description}
                            </p>

                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <RefreshCw className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-600">
                                  <span className="font-semibold">Last sync:</span> {integration.lastSync}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Database className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-600">
                                  <span className="font-semibold">Records:</span> {integration.recordsSync.toLocaleString()}
                                </span>
                              </div>
                              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${
                                integration.dataFlow === 'bidirectional'
                                  ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
                                  : integration.dataFlow === 'inbound'
                                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                                  : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                              }`}>
                                <FlowIcon className={`w-3.5 h-3.5 ${
                                  integration.dataFlow === 'bidirectional'
                                    ? 'text-blue-600'
                                    : integration.dataFlow === 'inbound'
                                    ? 'text-emerald-600'
                                    : 'text-amber-600'
                                }`} />
                                <span className={`text-xs font-bold capitalize ${
                                  integration.dataFlow === 'bidirectional'
                                    ? 'text-blue-700'
                                    : integration.dataFlow === 'inbound'
                                    ? 'text-emerald-700'
                                    : 'text-amber-700'
                                }`}>
                                  {integration.dataFlow}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              {selectedIntegrationData ? (
                <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white via-indigo-50/30 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden">
                  <div className="px-6 py-4 border-b-2 border-slate-200 bg-gradient-to-r from-white via-indigo-50/50 to-white backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <Info className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">
                          Integration Details
                        </h2>
                        <p className="text-xs text-slate-500">System configuration</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border-2 border-slate-200 space-y-4">
                      <div className="pb-3 border-b border-slate-200 last:border-b-0 last:pb-0">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                          System Name
                        </label>
                        <p className="text-sm font-bold text-slate-900">{selectedIntegrationData.name}</p>
                      </div>

                      <div className="pb-3 border-b border-slate-200 last:border-b-0 last:pb-0">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                          Platform
                        </label>
                        <p className="text-sm font-bold text-slate-900">{selectedIntegrationData.system}</p>
                      </div>

                      <div className="pb-3 border-b border-slate-200 last:border-b-0 last:pb-0">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                          Type
                        </label>
                        {(() => {
                          const typeConfig = getTypeConfig(selectedIntegrationData.type);
                          const TypeIcon = typeConfig.icon;
                          return (
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border-2 shadow-sm bg-gradient-to-r ${typeConfig.bg} ${typeConfig.border} ${typeConfig.text}`}>
                              <TypeIcon className="w-4 h-4" />
                              {selectedIntegrationData.type}
                            </span>
                          );
                        })()}
                      </div>

                      <div className="pb-3 border-b border-slate-200 last:border-b-0 last:pb-0">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                          Status
                        </label>
                        {(() => {
                          const statusConfig = getStatusConfig(selectedIntegrationData.status);
                          const StatusIcon = statusConfig.icon;
                          return (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border-2 shadow-sm ${statusConfig.badge} text-white`}>
                              <StatusIcon className="w-4 h-4" />
                              {selectedIntegrationData.status}
                            </span>
                          );
                        })()}
                      </div>

                      <div className="pb-3 border-b border-slate-200 last:border-b-0 last:pb-0">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                          API Endpoint
                        </label>
                        <p className="text-xs text-slate-900 font-mono bg-slate-50 p-3 rounded-lg border border-slate-200 break-all">
                          {selectedIntegrationData.endpoint}
                        </p>
                      </div>

                      <div className="pb-3 border-b border-slate-200 last:border-b-0 last:pb-0">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                          Authentication
                        </label>
                        <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-lg shadow-sm">
                          {selectedIntegrationData.authMethod}
                        </span>
                      </div>

                      <div className="pb-3 border-b border-slate-200 last:border-b-0 last:pb-0">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                          Data Flow
                        </label>
                        {(() => {
                          const FlowIcon = getFlowIcon(selectedIntegrationData.dataFlow);
                          return (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border-2 shadow-sm capitalize ${
                              selectedIntegrationData.dataFlow === 'bidirectional'
                                ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-700'
                                : selectedIntegrationData.dataFlow === 'inbound'
                                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700'
                                : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-700'
                            }`}>
                              <FlowIcon className="w-4 h-4" />
                              {selectedIntegrationData.dataFlow}
                            </span>
                          );
                        })()}
                      </div>

                      <div className="pb-3 border-b border-slate-200 last:border-b-0 last:pb-0">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                          Connected Departments
                        </label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedIntegrationData.department.map((dept) => (
                            <span
                              key={dept}
                              className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg shadow-sm"
                            >
                              {dept}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pb-3 border-b border-slate-200 last:border-b-0 last:pb-0">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                          Last Sync
                        </label>
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-slate-400" />
                          <p className="text-sm font-bold text-slate-900">{selectedIntegrationData.lastSync}</p>
                        </div>
                      </div>

                      <div className="pb-3 border-b-0 last:border-b-0 last:pb-0">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                          Records Synced (24h)
                        </label>
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-slate-400" />
                          <p className="text-sm font-black text-slate-900">
                            {selectedIntegrationData.recordsSync.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <button
                        onClick={() => alert(`Syncing ${selectedIntegrationData.name}...`)}
                        className="w-full px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Sync Now
                        </div>
                      </button>

                      <button
                        onClick={() => setShowConfigModal(true)}
                        className="w-full px-4 py-3 text-sm font-bold text-slate-700 bg-white border-2 border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Settings className="w-4 h-4" />
                          Configure
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white via-slate-50/30 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden">
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center mx-auto mb-4">
                      <Info className="w-8 h-8 text-slate-500" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500">
                      Select an integration to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
