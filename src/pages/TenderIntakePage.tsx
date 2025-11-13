import { useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { ValidationPanel } from '../components/ValidationPanel';
import { NormalizationSummary } from '../components/NormalizationSummary';
import { UnitHarmonizationLog } from '../components/UnitHarmonizationLog';
import { KPIWidget } from '../components/KPIWidget';
import { VendorErrorHeatmap } from '../components/VendorErrorHeatmap';
import { StickyFooter } from '../components/StickyFooter';
import { Sidebar } from '../components/Sidebar';
import { DepartmentSelector } from '../components/DepartmentSelector';
import { TenderCategorySelector } from '../components/TenderCategorySelector';
import { getDepartmentAllowedCategories } from '../data/departments';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import type { TenderDocument } from '../lib/supabase';

interface TenderIntakePageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership') => void;
}

export function TenderIntakePage({ onNavigate }: TenderIntakePageProps) {
  const [tenderId] = useState('TND-2025-001');
  const [phase] = useState('Intake & Validation');
  const [uploadedFiles, setUploadedFiles] = useState<TenderDocument[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [categoryConfigured, setCategoryConfigured] = useState(false);
  const [evaluationCriteria, setEvaluationCriteria] = useState<any[]>([]);

  const validationItems = [
    { label: 'Document format verification', status: 'completed' as const },
    { label: 'BOQ extraction complete', status: 'completed' as const },
    { label: 'Specification parsing', status: 'completed' as const },
    { label: 'Timeline validation', status: 'warning' as const },
    { label: 'Vendor information check', status: 'completed' as const },
    { label: 'Pricing structure review', status: 'pending' as const },
  ];

  const normalizationEntries = [
    {
      category: 'Units',
      original: 'kg',
      normalized: 'kilograms',
      count: 23,
    },
    {
      category: 'Units',
      original: 'm²',
      normalized: 'square meters',
      count: 18,
    },
    {
      category: 'Dates',
      original: 'MM/DD/YYYY',
      normalized: 'YYYY-MM-DD',
      count: 12,
    },
  ];

  const harmonizationLogs = [
    {
      timestamp: new Date().toISOString(),
      field: 'Material Quantity',
      originalValue: '500 kg',
      normalizedValue: '500 kilograms',
      vendor: 'Acme Corp',
    },
    {
      timestamp: new Date(Date.now() - 60000).toISOString(),
      field: 'Area Coverage',
      originalValue: '250 m²',
      normalizedValue: '250 square meters',
      vendor: 'BuildTech Ltd',
    },
    {
      timestamp: new Date(Date.now() - 120000).toISOString(),
      field: 'Delivery Date',
      originalValue: '12/31/2025',
      normalizedValue: '2025-12-31',
      vendor: 'Global Supplies',
    },
  ];

  const vendorErrors = [
    { vendor: 'Acme Corp', errorCount: 2, maxErrors: 15 },
    { vendor: 'BuildTech Ltd', errorCount: 5, maxErrors: 15 },
    { vendor: 'Global Supplies', errorCount: 0, maxErrors: 15 },
    { vendor: 'TechCon Industries', errorCount: 8, maxErrors: 15 },
    { vendor: 'Prime Contractors', errorCount: 1, maxErrors: 15 },
  ];

  const handleFilesUploaded = (files: TenderDocument[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleCategorySelect = (categoryId: string, subcategoryId: string, criteria: any[]) => {
    setEvaluationCriteria(criteria);
    setCategoryConfigured(true);
    alert(`Tender configured with ${criteria.length} evaluation criteria!\n\nAuto-captured criteria:\n${criteria.map(c => `• ${c.name}`).join('\n')}`);
  };

  const handleRequestClarification = () => {
    alert('Clarification request sent to notify-svc');
  };

  const handleProceedToEvaluation = () => {
    onNavigate('evaluation');
  };

  const validatedCount = uploadedFiles.filter(f => f.validation_status === 'passed').length;
  const totalCount = uploadedFiles.length || 1;
  const validationPercentage = Math.round((validatedCount / totalCount) * 100);

  const avgValidationTime = uploadedFiles.length > 0
    ? Math.floor(Math.random() * 60) + 30
    : 0;

  return (
    <>
      <Sidebar currentPage="intake" onNavigate={onNavigate} />
      <div className="min-h-screen bg-gray-50 pb-24 lg:pl-64">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Tender Intake & Validation
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                DataValidation.Agent Active
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                {phase}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <KPIWidget
            title="Bids Validated"
            value={`${validationPercentage}%`}
            subtitle={`${validatedCount} of ${totalCount} bids`}
            icon={CheckCircle}
            trend={{ value: '12%', isPositive: true }}
          />

          <KPIWidget
            title="Avg Validation Time"
            value={`${avgValidationTime}s`}
            subtitle="Per document"
            icon={Clock}
            trend={{ value: '8%', isPositive: false }}
          />

          <KPIWidget
            title="Total Errors"
            value={vendorErrors.reduce((sum, v) => sum + v.errorCount, 0)}
            subtitle="Across all vendors"
            icon={AlertTriangle}
          />
        </div>

        <div className="mb-6">
          <DepartmentSelector
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
          />
        </div>

        {selectedDepartment && (
          <div className="mb-6">
            <TenderCategorySelector
              onCategorySelect={handleCategorySelect}
              allowedCategories={getDepartmentAllowedCategories(selectedDepartment)}
            />
          </div>
        )}

        {categoryConfigured && (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  Upload Documents
                </h2>
                <FileUpload
                  tenderId={tenderId}
                  onFilesUploaded={handleFilesUploaded}
                />
              </div>

              <ValidationPanel items={validationItems} />
            </div>

            <div className="space-y-6">
              <NormalizationSummary entries={normalizationEntries} />

              <VendorErrorHeatmap data={vendorErrors} />

              <UnitHarmonizationLog entries={harmonizationLogs} />
            </div>
          </div>
        )}
      </main>

      <StickyFooter
        tenderId={tenderId}
        phase={phase}
        onRequestClarification={handleRequestClarification}
        onProceedToEvaluation={handleProceedToEvaluation}
      />
      </div>
    </>
  );
}
