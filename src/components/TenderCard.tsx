import React from 'react';
import { FileText, Calendar, DollarSign, Building2, Mail, Phone, User, Clock } from 'lucide-react';

interface TenderCardProps {
  tenderData: {
    metadata?: {
      tender_reference_number?: string;
      document_title?: string;
      document_type?: string;
      issue_date?: string;
      issuer?: string;
      country?: string;
      status?: string;
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
      status?: string;
    };
    status?: string;
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
    created_at?: string;
    updated_at?: string;
    timestamp?: string;
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

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return null;
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  };

  // Get timestamp from data (check multiple possible locations)
  const getTimestamp = (): string | null => {
    if (tenderData.timestamp) return tenderData.timestamp;
    if (tenderData.created_at) return tenderData.created_at;
    if (tenderData.updated_at) return tenderData.updated_at;
    if (tenderData.metadata?.issue_date) return tenderData.metadata.issue_date;
    return null;
  };

  const timestamp = getTimestamp();
  const formattedTimestamp = formatTimestamp(timestamp || undefined);

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

  // Get status from data (check multiple possible locations)
  const getStatus = (): string | null => {
    // Check top-level status first
    if (tenderData.status) {
      return tenderData.status;
    }
    // Check metadata.status
    if (tenderData.metadata?.status) {
      return tenderData.metadata.status;
    }
    // Check administration.status
    if (tenderData.administration?.status) {
      return tenderData.administration.status;
    }
    // Fallback to calculating from deadline if no status found
    return null;
  };

  const status = getStatus();
  const daysRemaining = calculateDaysRemaining(tenderData.administration?.submission_deadline);

  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-lg p-4 w-full h-full min-h-[400px] flex flex-col cursor-pointer
        transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]
        border-2 border-transparent hover:border-indigo-300
        ${onClick ? 'hover:bg-indigo-50/30' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="bg-indigo-100 p-2 rounded-lg flex-shrink-0">
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 truncate">
              {tenderData.metadata?.tender_reference_number || 'Tender Reference'}
            </p>
            <h1 className="text-lg font-bold text-gray-900 line-clamp-2">
              {tenderData.tender_summary?.project_title || tenderData.metadata?.document_title || 'Tender Title'}
            </h1>
            {formattedTimestamp && (
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-500 truncate">
                  {formattedTimestamp}
                </p>
              </div>
            )}
          </div>
        </div>
        {(status || daysRemaining !== null) && (
          <div className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ml-2 ${
            status 
              ? (status.toLowerCase().includes('active') || status.toLowerCase().includes('open') || status.toLowerCase().includes('valid')
                  ? 'bg-green-100 text-green-700'
                  : status.toLowerCase().includes('expired') || status.toLowerCase().includes('closed') || status.toLowerCase().includes('completed')
                  ? 'bg-red-100 text-red-700'
                  : status.toLowerCase().includes('pending') || status.toLowerCase().includes('draft')
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-blue-100 text-blue-700')
              : (daysRemaining !== null
                  ? (daysRemaining > 14 ? 'bg-green-100 text-green-700' : 
                     daysRemaining > 7 ? 'bg-yellow-100 text-yellow-700' : 
                     'bg-red-100 text-red-700')
                  : 'bg-gray-100 text-gray-700')
          }`}>
            {status 
              ? status 
              : (daysRemaining !== null 
                  ? (daysRemaining > 0 ? `${daysRemaining}d left` : 'Expired')
                  : 'No status')}
          </div>
        )}
      </div>

      {/* Objective */}
      <div className="mb-3 pb-3 border-b flex-shrink-0 min-h-[48px]">
        {(tenderData.tender_summary?.objective || tenderData.tender_summary?.scope_summary) ? (
          <p className="text-gray-600 text-sm line-clamp-2">
            {tenderData.tender_summary.objective || tenderData.tender_summary.scope_summary}
          </p>
        ) : (
          <p className="text-gray-400 text-sm line-clamp-2 italic">No description available</p>
        )}
      </div>

      {/* Key Information Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3 flex-shrink-0">
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
      <div className="bg-gray-50 rounded-lg p-2.5 flex-shrink-0 min-h-[80px] flex flex-col">
        {(tenderData.contact_information?.contact_name || 
          tenderData.contact_information?.contact_email || 
          tenderData.contact_information?.contact_phone) ? (
          <>
            <h3 className="text-xs font-semibold text-gray-700 mb-2">Contact Information</h3>
            <div className="space-y-1 flex-1">
              {tenderData.contact_information.contact_name && (
                <div className="flex items-center gap-1.5 text-xs">
                  <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-900 truncate">{tenderData.contact_information.contact_name}</span>
                </div>
              )}
              {tenderData.contact_information.contact_email && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <a 
                    href={`mailto:${tenderData.contact_information.contact_email}`} 
                    className="text-indigo-600 hover:text-indigo-700 truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {tenderData.contact_information.contact_email}
                  </a>
                </div>
              )}
              {tenderData.contact_information.contact_phone && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <a 
                    href={`tel:${tenderData.contact_information.contact_phone}`}
                    className="text-indigo-600 hover:text-indigo-700 truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {tenderData.contact_information.contact_phone}
                  </a>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center">
            <p className="text-xs text-gray-400 italic">No contact information</p>
          </div>
        )}
      </div>

      {onClick && (
        <div className="mt-2 text-center flex-shrink-0">
          <p className="text-xs text-indigo-600 font-medium">Click to process with agents →</p>
        </div>
      )}
    </div>
  );
}

