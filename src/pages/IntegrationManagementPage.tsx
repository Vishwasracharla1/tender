import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { CheckCircle, XCircle, AlertCircle, Settings, RefreshCw, Database, FileText, Globe, Users } from 'lucide-react';

interface IntegrationManagementPageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration') => void;
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

  const getTypeIcon = (type: Integration['type']) => {
    switch (type) {
      case 'ERP':
        return <Database className="w-5 h-5 text-blue-600" />;
      case 'Procurement':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'Financial':
        return <Database className="w-5 h-5 text-green-600" />;
      case 'HRMS':
        return <Users className="w-5 h-5 text-orange-600" />;
      case 'Document':
        return <FileText className="w-5 h-5 text-indigo-600" />;
      case 'Vendor':
        return <Users className="w-5 h-5 text-pink-600" />;
      case 'Custom':
        return <Globe className="w-5 h-5 text-gray-600" />;
    }
  };

  const activeCount = integrations.filter(i => i.status === 'active').length;
  const totalRecords = integrations.reduce((sum, i) => sum + i.recordsSync, 0);
  const errorCount = integrations.filter(i => i.status === 'error').length;

  const selectedIntegrationData = integrations.find(i => i.id === selectedIntegration);

  return (
    <>
      <Sidebar currentPage="integration" onNavigate={onNavigate} />
      <div className="min-h-screen bg-gray-50 pb-24 lg:pl-64">
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
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">Total Integrations</h3>
                <Database className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{integrations.length}</p>
              <p className="text-xs text-gray-500 mt-1">{activeCount} active connections</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">Records Synced</h3>
                <RefreshCw className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalRecords.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">System Types</h3>
                <Globe className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">7</p>
              <p className="text-xs text-gray-500 mt-1">ERP, HRMS, Custom, etc.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">Avg Sync Time</h3>
                <Settings className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">8.4m</p>
              <p className="text-xs text-gray-500 mt-1">Average across all systems</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  Integration Systems
                </h2>

                <div className="space-y-3">
                  {integrations.map((integration) => (
                    <div
                      key={integration.id}
                      onClick={() => setSelectedIntegration(integration.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedIntegration === integration.id
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1">{getTypeIcon(integration.type)}</div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900">
                                {integration.name}
                              </h3>
                              <p className="text-xs text-gray-600 mt-0.5">
                                {integration.system}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded border flex items-center gap-1 ${getStatusColor(
                                  integration.status
                                )}`}
                              >
                                {getStatusIcon(integration.status)}
                                {integration.status}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-gray-600 mb-3">
                            {integration.description}
                          </p>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-4 text-gray-500">
                              <span>
                                Last sync: <span className="font-medium">{integration.lastSync}</span>
                              </span>
                              <span>
                                Records: <span className="font-medium">{integration.recordsSync.toLocaleString()}</span>
                              </span>
                              <span>
                                Flow: <span className="font-medium capitalize">{integration.dataFlow}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedIntegrationData ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-4">
                    Integration Details
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        System Name
                      </label>
                      <p className="text-sm text-gray-900">{selectedIntegrationData.name}</p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        Platform
                      </label>
                      <p className="text-sm text-gray-900">{selectedIntegrationData.system}</p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        Type
                      </label>
                      <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded">
                        {getTypeIcon(selectedIntegrationData.type)}
                        {selectedIntegrationData.type}
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        Status
                      </label>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border ${getStatusColor(
                          selectedIntegrationData.status
                        )}`}
                      >
                        {getStatusIcon(selectedIntegrationData.status)}
                        {selectedIntegrationData.status}
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        API Endpoint
                      </label>
                      <p className="text-xs text-gray-900 font-mono bg-gray-50 p-2 rounded border border-gray-200 break-all">
                        {selectedIntegrationData.endpoint}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        Authentication
                      </label>
                      <p className="text-sm text-gray-900">{selectedIntegrationData.authMethod}</p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        Data Flow
                      </label>
                      <p className="text-sm text-gray-900 capitalize">{selectedIntegrationData.dataFlow}</p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        Connected Departments
                      </label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedIntegrationData.department.map((dept) => (
                          <span
                            key={dept}
                            className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full"
                          >
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        Last Sync
                      </label>
                      <p className="text-sm text-gray-900">{selectedIntegrationData.lastSync}</p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        Records Synced (24h)
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedIntegrationData.recordsSync.toLocaleString()}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-200 space-y-2">
                      <button
                        onClick={() => alert(`Syncing ${selectedIntegrationData.name}...`)}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Sync Now
                        </div>
                      </button>

                      <button
                        onClick={() => setShowConfigModal(true)}
                        className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">
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
