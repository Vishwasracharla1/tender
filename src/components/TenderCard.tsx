import React from 'react';
import { FileText, Calendar, DollarSign, Building2, Mail, Phone, User } from 'lucide-react';

interface TenderCardProps {
  tenderData: {
    metadata?: {
      tender_reference_number?: string;
      document_title?: string;
      document_type?: string;
      issue_date?: string;
      issuer?: string;
      country?: string;
    };
    tender_summary?: {
      project_title?: string;
      objective?: string;
      scope_summary?: string;
    };
    administration?: {
      submission_deadline?: string;
      proposal_validity_days?: number | string;
      submission_instructions?: string;
    };
    evaluation?: {
      technical_weight_percent?: number;
      financial_weight_percent?: number;
      evaluation_criteria?: Array<{
        name?: string;
        weight_percent?: number;
      }>;
    };
    pricing?: {
      currency?: string;
      pricing_structure?: string;
    };
    contact_information?: {
      contact_name?: string;
      contact_email?: string;
      contact_phone?: string;
    };
  };
  onClick?: () => void;
}

export function TenderCard({ tenderData, onClick }: TenderCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const calculateDaysRemaining = (deadline?: string) => {
    if (!deadline) return null;
    try {
      const today = new Date();
      const deadlineDate = new Date(deadline);
      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const daysRemaining = calculateDaysRemaining(tenderData.administration?.submission_deadline);

  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-lg p-4 max-w-2xl w-full cursor-pointer
        transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]
        border-2 border-transparent hover:border-indigo-300
        ${onClick ? 'hover:bg-indigo-50/30' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">
              {tenderData.metadata?.tender_reference_number || 'Tender Reference'}
            </p>
            <h1 className="text-lg font-bold text-gray-900">
              {tenderData.tender_summary?.project_title || tenderData.metadata?.document_title || 'Tender Title'}
            </h1>
          </div>
        </div>
        {daysRemaining !== null && (
          <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            daysRemaining > 14 ? 'bg-green-100 text-green-700' : 
            daysRemaining > 7 ? 'bg-yellow-100 text-yellow-700' : 
            'bg-red-100 text-red-700'
          }`}>
            {daysRemaining > 0 ? `${daysRemaining}d left` : 'Expired'}
          </div>
        )}
      </div>

      {/* Objective */}
      {(tenderData.tender_summary?.objective || tenderData.tender_summary?.scope_summary) && (
        <p className="text-gray-600 mb-3 pb-3 border-b text-sm line-clamp-2">
          {tenderData.tender_summary.objective || tenderData.tender_summary.scope_summary}
        </p>
      )}

      {/* Key Information Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-blue-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs text-gray-600">Issuer</span>
          </div>
          <p className="font-semibold text-gray-900 text-xs">
            {tenderData.metadata?.issuer || 'Not specified'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {tenderData.metadata?.country || ''}
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-xs text-gray-600">Deadline</span>
          </div>
          <p className="font-semibold text-gray-900 text-xs">
            {formatDate(tenderData.administration?.submission_deadline)}
          </p>
          {tenderData.administration?.proposal_validity_days && (
            <p className="text-xs text-gray-500 mt-0.5">
              Valid {tenderData.administration.proposal_validity_days} days
            </p>
          )}
        </div>

        <div className="bg-green-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs text-gray-600">Pricing</span>
          </div>
          <p className="font-semibold text-gray-900 text-xs">
            {tenderData.pricing?.currency || 'Not specified'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {tenderData.pricing?.pricing_structure || ''}
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <FileText className="w-3.5 h-3.5 text-orange-600" />
            <span className="text-xs text-gray-600">Evaluation</span>
          </div>
          {tenderData.evaluation?.technical_weight_percent && tenderData.evaluation?.financial_weight_percent ? (
            <>
              <p className="font-semibold text-gray-900 text-xs">
                Tech {tenderData.evaluation.technical_weight_percent}% / Fin {tenderData.evaluation.financial_weight_percent}%
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {tenderData.metadata?.document_type || ''}
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-500">Not specified</p>
          )}
        </div>
      </div>

      {/* Contact Information */}
      {(tenderData.contact_information?.contact_name || 
        tenderData.contact_information?.contact_email || 
        tenderData.contact_information?.contact_phone) && (
        <div className="bg-gray-50 rounded-lg p-2.5">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Contact Information</h3>
          <div className="space-y-1">
            {tenderData.contact_information.contact_name && (
              <div className="flex items-center gap-1.5 text-xs">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-900">{tenderData.contact_information.contact_name}</span>
              </div>
            )}
            {tenderData.contact_information.contact_email && (
              <div className="flex items-center gap-1.5 text-xs">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <a 
                  href={`mailto:${tenderData.contact_information.contact_email}`} 
                  className="text-indigo-600 hover:text-indigo-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  {tenderData.contact_information.contact_email}
                </a>
              </div>
            )}
            {tenderData.contact_information.contact_phone && (
              <div className="flex items-center gap-1.5 text-xs">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <a 
                  href={`tel:${tenderData.contact_information.contact_phone}`}
                  className="text-indigo-600 hover:text-indigo-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  {tenderData.contact_information.contact_phone}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {onClick && (
        <div className="mt-2 text-center">
          <p className="text-xs text-indigo-600 font-medium">Click to process with agents →</p>
        </div>
      )}
    </div>
  );
}

