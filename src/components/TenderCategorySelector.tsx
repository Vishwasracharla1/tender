import { useState, useEffect } from 'react';
import { FileText, CheckCircle } from 'lucide-react';

interface Category {
  id: string;
  code: string;
  name: string;
  description: string;
}

interface Subcategory {
  id: string;
  code: string;
  name: string;
  description: string;
}

interface EvaluationCriteria {
  name: string;
  description: string;
  maxScore: number;
}

interface TenderCategorySelectorProps {
  onCategorySelect: (categoryId: string, subcategoryId: string, criteria: EvaluationCriteria[]) => void;
  allowedCategories?: string[];
}

export function TenderCategorySelector({ onCategorySelect, allowedCategories }: TenderCategorySelectorProps) {
  const [categories] = useState<Category[]>([
    {
      id: '1',
      code: 'WORKS',
      name: 'Works & Construction',
      description: 'Construction, infrastructure development, renovation, and building works',
    },
    {
      id: '2',
      code: 'SUPPLIES',
      name: 'Supplies & Equipment',
      description: 'Procurement of goods, materials, equipment, and consumables',
    },
    {
      id: '3',
      code: 'SERVICES',
      name: 'Services',
      description: 'General services including maintenance, facility management, and support services',
    },
    {
      id: '4',
      code: 'CONSULTANCY',
      name: 'Consultancy & Professional Services',
      description: 'Professional services, consulting, design, and advisory services',
    },
  ]);

  const [subcategories] = useState<{ [key: string]: Subcategory[] }>({
    '1': [
      { id: 's1', code: 'WORKS_CONSTRUCTION', name: 'Building Construction', description: 'New building construction and structural works' },
      { id: 's2', code: 'WORKS_INFRASTRUCTURE', name: 'Infrastructure Development', description: 'Roads, bridges, utilities, and civil infrastructure' },
      { id: 's3', code: 'WORKS_RENOVATION', name: 'Renovation & Retrofit', description: 'Building renovation, retrofit, and energy efficiency upgrades' },
      { id: 's4', code: 'WORKS_LANDSCAPING', name: 'Landscaping & Green Spaces', description: 'Parks, gardens, and environmental beautification' },
    ],
    '2': [
      { id: 's5', code: 'SUPPLIES_IT', name: 'IT Equipment & Hardware', description: 'Computers, servers, networking equipment' },
      { id: 's6', code: 'SUPPLIES_OFFICE', name: 'Office Supplies & Furniture', description: 'Office equipment, furniture, and consumables' },
      { id: 's7', code: 'SUPPLIES_MEDICAL', name: 'Medical Equipment & Supplies', description: 'Healthcare equipment and medical consumables' },
      { id: 's8', code: 'SUPPLIES_VEHICLES', name: 'Vehicles & Transport Equipment', description: 'Government vehicles and transportation equipment' },
    ],
    '3': [
      { id: 's9', code: 'SERVICES_MAINTENANCE', name: 'Maintenance & Facility Management', description: 'Building maintenance and facility services' },
      { id: 's10', code: 'SERVICES_CLEANING', name: 'Cleaning & Sanitation', description: 'Cleaning services and waste management' },
      { id: 's11', code: 'SERVICES_SECURITY', name: 'Security Services', description: 'Security, surveillance, and safety services' },
      { id: 's12', code: 'SERVICES_IT', name: 'IT Support & Software', description: 'IT support, software licenses, and digital services' },
    ],
    '4': [
      { id: 's13', code: 'CONSULTANCY_ENGINEERING', name: 'Engineering Consultancy', description: 'Engineering design and technical consultancy' },
      { id: 's14', code: 'CONSULTANCY_ARCHITECTURE', name: 'Architecture & Design', description: 'Architectural design and urban planning' },
      { id: 's15', code: 'CONSULTANCY_MANAGEMENT', name: 'Management Consultancy', description: 'Project management and business consultancy' },
      { id: 's16', code: 'CONSULTANCY_LEGAL', name: 'Legal & Regulatory', description: 'Legal advisory and compliance consultancy' },
    ],
  });

  const [evaluationTemplates] = useState<{ [key: string]: EvaluationCriteria[] }>({
    WORKS: [
      { name: 'Technical Capability', description: 'Experience in construction, project management, safety record', maxScore: 100 },
      { name: 'Financial Stability', description: 'Financial strength, bonding capacity, credit rating', maxScore: 100 },
      { name: 'Past Performance', description: 'Track record, quality of previous work, references', maxScore: 100 },
      { name: 'Health & Safety', description: 'Safety protocols, accident record, HSE certifications', maxScore: 100 },
      { name: 'Quality Management', description: 'ISO certifications, quality control processes', maxScore: 100 },
    ],
    SUPPLIES: [
      { name: 'Product Quality', description: 'Quality standards, certifications, warranty terms', maxScore: 100 },
      { name: 'Price Competitiveness', description: 'Total cost of ownership, pricing structure', maxScore: 100 },
      { name: 'Delivery Capability', description: 'Delivery schedule, logistics, supply chain', maxScore: 100 },
      { name: 'After-Sales Support', description: 'Maintenance, support, spare parts availability', maxScore: 100 },
      { name: 'Supplier Reputation', description: 'Market presence, references, reliability', maxScore: 100 },
    ],
    SERVICES: [
      { name: 'Service Quality', description: 'Service level agreements, quality standards', maxScore: 100 },
      { name: 'Technical Expertise', description: 'Staff qualifications, training, certifications', maxScore: 100 },
      { name: 'Cost Efficiency', description: 'Pricing model, value for money', maxScore: 100 },
      { name: 'Response Time', description: 'Availability, response time, emergency support', maxScore: 100 },
      { name: 'Environmental Compliance', description: 'Green practices, sustainability measures', maxScore: 100 },
    ],
    CONSULTANCY: [
      { name: 'Professional Qualifications', description: 'Team qualifications, certifications, licenses', maxScore: 100 },
      { name: 'Relevant Experience', description: 'Similar project experience, industry expertise', maxScore: 100 },
      { name: 'Methodology', description: 'Approach, work plan, deliverables quality', maxScore: 100 },
      { name: 'Innovation', description: 'Creative solutions, best practices, technology use', maxScore: 100 },
      { name: 'Local Knowledge', description: 'Understanding of local regulations and context', maxScore: 100 },
    ],
  });

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [capturedCriteria, setCapturedCriteria] = useState<EvaluationCriteria[]>([]);

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) {
        const criteria = evaluationTemplates[category.code] || [];
        setCapturedCriteria(criteria);
      }
    } else {
      setCapturedCriteria([]);
    }
  }, [selectedCategory]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('');
  };

  const handleComplete = () => {
    if (selectedCategory && selectedSubcategory && capturedCriteria.length > 0) {
      onCategorySelect(selectedCategory, selectedSubcategory, capturedCriteria);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-600" />
          <h3 className="text-base font-semibold text-gray-900">
            Tender Classification
          </h3>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Select Tender Category
          </label>
          <div className="grid grid-cols-2 gap-3">
            {categories
              .filter((category) => !allowedCategories || allowedCategories.includes(category.code))
              .map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`
                  p-4 text-left border-2 rounded-lg transition-all
                  ${selectedCategory === category.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {category.name}
                  </h4>
                  {selectedCategory === category.id && (
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  {category.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {selectedCategory && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Select Subcategory
            </label>
            <div className="grid grid-cols-2 gap-3">
              {subcategories[selectedCategory]?.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.id)}
                  className={`
                    p-3 text-left border-2 rounded-lg transition-all
                    ${selectedSubcategory === sub.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {sub.name}
                    </h4>
                    {selectedSubcategory === sub.id && (
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    {sub.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {capturedCriteria.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Auto-Captured Evaluation Criteria
            </h4>
            <div className="space-y-2">
              {capturedCriteria.map((criterion, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900">
                      {criterion.name}
                    </h5>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {criterion.description}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">
                    Max: {criterion.maxScore}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-emerald-700 mt-3 font-medium">
              ✓ {capturedCriteria.length} evaluation criteria automatically configured
            </p>
          </div>
        )}

        <div className="flex items-center justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleComplete}
            disabled={!selectedCategory || !selectedSubcategory || capturedCriteria.length === 0}
            className={`
              px-5 py-2 text-sm font-medium rounded-lg transition-colors
              ${selectedCategory && selectedSubcategory && capturedCriteria.length > 0
                ? 'text-white bg-blue-600 hover:bg-blue-700'
                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }
            `}
          >
            Apply Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
