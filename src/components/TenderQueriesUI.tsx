import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Building2,
  MapPin,
  Package,
  Target,
  Phone,
  Mail,
  User,
} from 'lucide-react';

export interface TenderQueriesData {
  tenderId: string;
  companyName: string;
  queries: Array<{
    queryId: string;
    questionText: string;
    answer: {
      clientName: string;
      domainIndustry?: string | null;
      region?: string | null;
      sapProducts?: string[];
      scopeImplemented?: string[];
      projectBenefits?: string[];
      keyKpisOrOutcomes?: string[];
      contact?: {
        name?: string | null;
        email?: string | null;
        phone?: string | null;
      } | null;
      sourceMeta?: {
        documentName?: string | null;
        sectionHint?: string | null;
        pageApprox?: number | null;
      } | null;
      rawAnswerText?: string | null;
    };
  }>;
}

const sampleData: TenderQueriesData = {
  tenderId: 'RAK_01',
  companyName: 'Tycons',
  queries: [
      {
        queryId: 'Q1',
        questionText: 'What is the scope of the SAP S/4HANA implementation project?',
        answer: {
          clientName: 'Ras Al Khaimah Public Services Department',
          domainIndustry: 'Public Services',
          region: 'Ras Al Khaimah, UAE',
          sapProducts: [
            'SAP S/4HANA Finance & Controlling (SAP FICO)',
            'SAP S/4HANA Funds Management (SAP FM)',
            'SAP S/4HANA Material Management (SAP MM)',
            'SAP S/4HANA Sales & Distribution (SAP SD)',
            'SAP S/4HANA Plant Maintenance (SAP PM)',
            'SAP S/4HANA Project Systems (SAP PS)',
            'SAP S/4HANA Group Consolidation',
            'SAP Process Orchestration (PO)',
            'SAP Single Sign-On',
          ],
          scopeImplemented: [
            'Plan, design, implement, configure, test, deploy, and train RAK PSD staff',
            'Operate and support the installed ERP system for 6 months after Go-Live with onsite hyper-care support',
          ],
          projectBenefits: [
            'Automate all PSD operations from beginning to end',
            'Enhance PSD services internally and externally',
            'Increase efficiency of completion of operations',
            'Utilize latest technological innovations to minimize operational costs',
            'Provide best business practices',
          ],
          keyKpisOrOutcomes: [
            'Comprehensive solution that serves the business sector in Ras Al Khaimah',
            'Eliminate repetition and overlap in systems and applications',
            'Enhance decision-making process in the Ras Al Khaimah government',
          ],
          contact: {
            name: 'Tarek Abdelkhalek',
            email: 'svaddi@tyconz.com',
            phone: '+971 50 9948453',
          },
          sourceMeta: {
            documentName: 'tycons_technical_proposal.pdf',
            sectionHint: 'Project Scope',
            pageApprox: 11,
          },
        },
      },
      {
        queryId: 'Q2',
        questionText: 'What are the payment terms for the project?',
        answer: {
          clientName: 'Ras Al Khaimah Public Services Department',
          sourceMeta: {
            documentName: 'tycons_financial_proposal.pdf',
            sectionHint: 'Payment Terms',
            pageApprox: 17,
          },
          rawAnswerText:
            'Payment Milestone Amount Down Payment: PO Issuance (Services) 10% Milestone 1: Completion of Prepare Phase (Services) 30 % Milestone 2: Completion of Realize Phase (Services) 30 % Milestone 3: Completion of Deploy Phase (Services) 20 % Milestone 4: Customer sign off (Services) 10 % Total 100 %',
        },
      },
      {
        queryId: 'Q3',
        questionText: 'What is the project timeline for the SAP S/4HANA implementation?',
        answer: {
          clientName: 'Ras Al Khaimah Public Services Department',
          sourceMeta: {
            documentName: 'tycons_financial_proposal.pdf',
            sectionHint: 'Project Timeline',
            pageApprox: 13,
          },
          rawAnswerText:
            'The Project start date is assumed to be on April 2020. The Project implementation duration shall be 7 months including full onsite hypercare for 1 month. Post Hypercare a support coordinator will be assigned onsite to carry out support coordination for a period of 6 months.',
        },
      },
    ],
};

interface TenderQueriesUIProps {
  data?: TenderQueriesData | null;
}

export const TenderQueriesUI = ({ data: propsData }: TenderQueriesUIProps) => {
  const [expandedQuery, setExpandedQuery] = useState<string | null>(null);

  const data = propsData ?? sampleData;

  const toggleQuery = (queryId: string) => {
    setExpandedQuery(expandedQuery === queryId ? null : queryId);
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94] as const,
        staggerChildren: 0.1
      } 
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        delay: index * 0.08, 
        duration: 0.35, 
        ease: [0.25, 0.46, 0.45, 0.94] as const 
      },
    }),
  };

  const detailVariants = {
    collapsed: { 
      opacity: 0, 
      height: 0,
      transition: { 
        duration: 0.3, 
        ease: [0.4, 0, 0.2, 1] as const 
      }
    },
    expanded: {
      opacity: 1,
      height: 'auto',
      transition: { 
        duration: 0.4, 
        ease: [0.4, 0, 0.2, 1] as const,
        staggerChildren: 0.05,
        delayChildren: 0.1
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' as const }
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="relative overflow-hidden bg-white rounded-xl shadow-md border-2 border-slate-200 p-6 transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.01 }}
      >
        <motion.div
          className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-blue-50/80 via-sky-50/50 to-transparent"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"
        />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <motion.h1 
              className="text-2xl font-bold text-slate-900 mb-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {data.companyName}
            </motion.h1>
            <motion.p 
              className="text-slate-600 mt-1 text-sm font-normal"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Tender ID: <span className="font-semibold">{data.tenderId}</span>
            </motion.p>
          </div>
          <motion.div 
            className="bg-gradient-to-r from-blue-50 to-sky-50 px-4 py-2 rounded-full border-2 border-blue-200 shadow-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05, borderColor: '#3b82f6' }}
          >
            <span className="text-blue-700 font-bold text-sm">{data.queries.length} Queries</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Queries List */}
      <div className="space-y-4">
        {data.queries.map((query, index) => (
          <motion.div
            key={query.queryId}
            className="group bg-white rounded-xl shadow-md border-2 border-slate-200 overflow-hidden relative transition-all duration-300"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={index}
            whileHover={{
              translateY: -4,
              scale: 1.01,
              borderColor: '#3b82f6',
              boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)',
            }}
          >
            <motion.div
              className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-sky-500 to-blue-400 opacity-0"
              initial={{ opacity: 0, scaleX: 0 }}
              whileHover={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            />
            {/* Query Header */}
            <motion.div
              className="px-5 py-4 cursor-pointer hover:bg-blue-50/50 transition-all duration-300 relative z-10"
              onClick={() => toggleQuery(query.queryId)}
              whileHover={{ backgroundColor: 'rgba(239, 246, 255, 0.5)' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <motion.div 
                    className="flex items-center gap-2 mb-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <motion.span 
                      className="bg-gradient-to-r from-blue-500 to-sky-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {query.queryId}
                    </motion.span>
                  </motion.div>
                  <motion.h3 
                    className="text-base font-bold text-slate-900 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    {query.questionText}
                  </motion.h3>
                </div>
                <motion.div
                  animate={{ rotate: expandedQuery === query.queryId ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {expandedQuery === query.queryId ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0 ml-4 font-bold" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 ml-4 group-hover:text-blue-600 transition-colors" />
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Query Details */}
            <AnimatePresence initial={false}>
              {expandedQuery === query.queryId && (
                <motion.div
                  key={`${query.queryId}-details`}
                  className="border-t-2 border-blue-200 bg-gradient-to-br from-blue-50/30 via-white to-sky-50/30 px-5 py-5"
                  variants={detailVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Left Column */}
                    <div className="space-y-5">
                      {/* Client Info */}
                      <motion.div 
                        className="bg-white p-4 rounded-xl shadow-md border-2 border-slate-200 transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, borderColor: '#3b82f6' }}
                      >
                        <h4 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-2">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </motion.div>
                          Client Information
                        </h4>
                        <div className="space-y-2 text-sm text-slate-700">
                          <motion.p
                            variants={itemVariants}
                            className="font-normal"
                          >
                            <span className="font-bold text-slate-900">Name:</span> <span className="font-normal">{query.answer.clientName}</span>
                          </motion.p>
                          {query.answer.domainIndustry && (
                            <motion.p
                              variants={itemVariants}
                              className="font-normal"
                            >
                              <span className="font-bold text-slate-900">Industry:</span> <span className="font-normal">{query.answer.domainIndustry}</span>
                            </motion.p>
                          )}
                          {query.answer.region && (
                            <motion.p 
                              className="flex items-start gap-2 font-normal"
                              variants={itemVariants}
                            >
                              <MapPin className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                              <span>{query.answer.region}</span>
                            </motion.p>
                          )}
                        </div>
                      </motion.div>

                      {/* SAP Products */}
                      {query.answer.sapProducts && query.answer.sapProducts.length > 0 && (
                        <motion.div 
                          className="bg-white p-4 rounded-xl shadow-md border-2 border-slate-200 transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
                          variants={itemVariants}
                          whileHover={{ scale: 1.02, borderColor: '#3b82f6' }}
                        >
                          <h4 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-2">
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Package className="w-5 h-5 text-emerald-600" />
                            </motion.div>
                            SAP Products
                          </h4>
                          <ul className="space-y-2 text-sm text-slate-700">
                            {query.answer.sapProducts.map((product: string, idx: number) => (
                              <motion.li 
                                key={idx} 
                                className="flex items-start gap-2 font-normal"
                                variants={itemVariants}
                                whileHover={{ x: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <span className="text-emerald-600 mt-0.5 text-base font-bold">•</span>
                                <span className="font-normal">{product}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}

                      {/* Contact */}
                      {query.answer.contact && (
                        <motion.div 
                          className="bg-white p-4 rounded-xl shadow-md border-2 border-slate-200 transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
                          variants={itemVariants}
                          whileHover={{ scale: 1.02, borderColor: '#3b82f6' }}
                        >
                          <h4 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-2">
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                            >
                              <User className="w-5 h-5 text-blue-600" />
                            </motion.div>
                            Contact
                          </h4>
                          <div className="space-y-2 text-sm text-slate-700">
                            <motion.p 
                              className="font-bold text-slate-900"
                              variants={itemVariants}
                            >
                              {query.answer.contact.name}
                            </motion.p>
                            <motion.p 
                              className="flex items-center gap-2 font-normal"
                              variants={itemVariants}
                              whileHover={{ x: 5 }}
                            >
                              <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              <span>{query.answer.contact.email}</span>
                            </motion.p>
                            <motion.p 
                              className="flex items-center gap-2 font-normal"
                              variants={itemVariants}
                              whileHover={{ x: 5 }}
                            >
                              <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              <span>{query.answer.contact.phone}</span>
                            </motion.p>
                          </div>
                        </motion.div>
                      )}
                    </div>

                  {/* Right Column */}
                  <div className="space-y-5">
                    {/* Scope */}
                    {query.answer.scopeImplemented && query.answer.scopeImplemented.length > 0 && (
                      <motion.div 
                        className="bg-white p-4 rounded-xl shadow-md border-2 border-slate-200 transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, borderColor: '#3b82f6' }}
                      >
                        <h4 className="font-bold text-base text-slate-800 mb-4">Scope Implemented</h4>
                        <ul className="space-y-2 text-sm text-slate-700">
                          {query.answer.scopeImplemented.map((scope: string, idx: number) => (
                            <motion.li 
                              key={idx} 
                              className="flex items-start gap-2 font-normal"
                              variants={itemVariants}
                              whileHover={{ x: 5 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <span className="text-blue-600 mt-0.5 text-base font-bold">•</span>
                              <span className="font-normal">{scope}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    )}

                    {/* Benefits */}
                    {query.answer.projectBenefits && query.answer.projectBenefits.length > 0 && (
                      <motion.div 
                        className="bg-white p-4 rounded-xl shadow-md border-2 border-slate-200 transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, borderColor: '#3b82f6' }}
                      >
                        <h4 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-2">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Target className="w-5 h-5 text-amber-600" />
                          </motion.div>
                          Project Benefits
                        </h4>
                        <ul className="space-y-2 text-sm text-slate-700">
                          {query.answer.projectBenefits.map((benefit: string, idx: number) => (
                            <motion.li 
                              key={idx} 
                              className="flex items-start gap-2 font-normal"
                              variants={itemVariants}
                              whileHover={{ x: 5 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <span className="text-amber-600 mt-0.5 text-base font-bold">•</span>
                              <span className="font-normal">{benefit}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    )}

                    {/* KPIs */}
                    {query.answer.keyKpisOrOutcomes && query.answer.keyKpisOrOutcomes.length > 0 && (
                      <motion.div 
                        className="bg-white p-4 rounded-xl shadow-md border-2 border-slate-200 transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, borderColor: '#3b82f6' }}
                      >
                        <h4 className="font-bold text-base text-slate-800 mb-4">Key KPIs & Outcomes</h4>
                        <ul className="space-y-2 text-sm text-slate-700">
                          {query.answer.keyKpisOrOutcomes.map((kpi: string, idx: number) => (
                            <motion.li 
                              key={idx} 
                              className="flex items-start gap-2 font-normal"
                              variants={itemVariants}
                              whileHover={{ x: 5 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <span className="text-blue-600 mt-0.5 text-base font-bold">•</span>
                              <span className="font-normal">{kpi}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    )}

                    {/* Raw Answer */}
                    {query.answer.rawAnswerText && (
                      <motion.div 
                        className="bg-white p-4 rounded-xl shadow-md border-2 border-slate-200 transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, borderColor: '#3b82f6' }}
                      >
                        <h4 className="font-bold text-base text-slate-800 mb-3">Answer</h4>
                        <p className="text-sm text-slate-700 leading-relaxed font-normal">{query.answer.rawAnswerText}</p>
                      </motion.div>
                    )}

                    {/* Source */}
                    {query.answer.sourceMeta && (
                      <motion.div 
                        className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 rounded-xl border-2 border-blue-200 shadow-md transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, borderColor: '#3b82f6' }}
                      >
                        <h4 className="font-bold text-base text-slate-800 mb-3 flex items-center gap-2">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <FileText className="w-5 h-5 text-blue-600" />
                          </motion.div>
                          Source
                        </h4>
                        <div className="text-sm text-slate-700 space-y-2">
                          <motion.p
                            variants={itemVariants}
                            className="font-normal"
                          >
                            <span className="font-bold text-slate-900">Document:</span> <span className="font-normal">{query.answer.sourceMeta.documentName}</span>
                          </motion.p>
                          <motion.p
                            variants={itemVariants}
                            className="font-normal"
                          >
                            <span className="font-bold text-slate-900">Section:</span> <span className="font-normal">{query.answer.sourceMeta.sectionHint}</span>
                          </motion.p>
                          <motion.p
                            variants={itemVariants}
                            className="font-normal"
                          >
                            <span className="font-bold text-slate-900">Page:</span> <span className="font-normal">~{query.answer.sourceMeta.pageApprox}</span>
                          </motion.p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};


