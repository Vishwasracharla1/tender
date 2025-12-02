import { Sidebar } from '../components/Sidebar';
import { FileSearch, AlertTriangle, CheckCircle2, FileText, ListTree, Target, ShieldAlert } from 'lucide-react';
import govData from '../data/evaluationMatrixGovTender.json';

interface EvaluationMatrixGovTenderPageProps {
  onNavigate: (
    page:
      | 'intake'
      | 'evaluation'
      | 'benchmark'
      | 'integrity'
      | 'justification'
      | 'award'
      | 'leadership'
      | 'monitoring'
      | 'integration'
      | 'tender-article'
      | 'tender-overview'
      | 'tender-prebidding'
      | 'evaluation-gov-tender'
  ) => void;
}

type GovData = typeof govData;

export function EvaluationMatrixGovTenderPage({
  onNavigate,
}: EvaluationMatrixGovTenderPageProps) {
  const data = govData as GovData;

  return (
    <>
      <Sidebar currentPage="evaluation-gov-tender" onNavigate={onNavigate} />
      <div className="app-shell min-h-screen bg-gray-50 pb-24">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shadow-md">
                <FileSearch className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Evaluation Matrix – Government Tender
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Structured assessment generated from RFP document analysis.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {data.tenderMeta?.tenderId}
              </span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {data.tenderMeta?.departmentName}
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Tender meta & completeness */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="col-span-2">
              <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-sky-100 to-white p-5 shadow-sm">
                <div className="absolute -right-14 -top-10 w-40 h-40 bg-sky-200/40 rounded-full blur-3xl" />
                <div className="relative space-y-2">
                  <p className="text-xs font-semibold tracking-[0.35em] text-sky-700 uppercase">
                    Tender Overview
                  </p>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {data.tenderMeta?.tenderTitle}
                  </h2>
                  <p className="text-sm text-slate-700">
                    {data.tenderMeta?.sourceFileName} •{' '}
                    <span className="font-medium">
                      Version {data.tenderMeta?.documentVersion}
                    </span>{' '}
                    • Currency: {data.tenderMeta?.currency}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <p className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                      Completeness
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    {data.completenessCheck?.overallStatus} •{' '}
                    {data.completenessCheck?.score ?? 0}/100
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {data.completenessCheck?.remarks}
                </p>
              </div>
            </div>
          </section>

          {/* Evaluation dimensions – move to top */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.evaluation && (
              <>
                {Object.entries(data.evaluation).map(([key, block]: any) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-sky-600" />
                        <p className="text-sm font-semibold text-slate-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">
                        Score: {block.score ?? 0} • {block.verdict}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">{block.summary}</p>
                    {block.strengths && block.strengths.length > 0 && (
                      <div className="mt-1">
                        <p className="text-[11px] font-semibold text-emerald-700 uppercase mb-1">
                          Strengths
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                          {block.strengths.map((s: string) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {block.gaps && block.gaps.length > 0 && (
                      <div className="mt-1">
                        <p className="text-[11px] font-semibold text-amber-700 uppercase mb-1">
                          Gaps
                        </p>
                        <ul className="list-disc list-inside text-xs text-amber-800 space-y-1">
                          {block.gaps.map((g: string) => (
                            <li key={g}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </section>

          {/* Evaluation matrix categories – second */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ListTree className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Evaluation Matrix – Categories
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.evaluationMatrix?.categories?.map((cat) => (
                <div
                  key={cat.category_name}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {cat.category_name}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {cat.category_description}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {cat.subcategories?.map((sub) => (
                      <div
                        key={sub.subcategory_name}
                        className="rounded-lg bg-white border border-slate-200 px-3 py-2"
                      >
                        <p className="text-xs font-semibold text-slate-800">
                          {sub.subcategory_name}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {sub.subcategory_description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Document structure – now full width, with missing sections below */}
          <section className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Document Structure
                </h3>
              </div>
              <div className="space-y-3">
                {data.documentStructure?.sections?.map((s) => (
                  <div
                    key={s.sectionId}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-slate-700 uppercase">
                        {s.sectionId} • {s.title}
                      </p>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                        Pages {s.pageRange?.[0]}–{s.pageRange?.[1]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">{s.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing key sections moved below as horizontal pill row */}
            {data.documentStructure?.missingKeySections &&
              data.documentStructure.missingKeySections.length > 0 && (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 shadow-sm flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 mr-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-800 uppercase">
                      Missing Key Sections
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.documentStructure.missingKeySections.map((m) => (
                      <span
                        key={m}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-amber-700 border border-amber-200"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </section>

          {/* Risk & issues – after document structure */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Risk Assessment – {data.riskAssessment?.overallRiskLevel}
                </h3>
              </div>
              <div className="space-y-2">
                {data.riskAssessment?.dimensions &&
                  Object.entries(data.riskAssessment.dimensions).map(
                    ([name, dim]: any) => (
                      <div
                        key={name}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <p className="text-xs font-semibold text-slate-800">
                          {name.replace(/([A-Z])/g, ' $1')} – {dim.level}
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-700 mt-1 space-y-1">
                          {dim.reasons?.map((r: string) => (
                            <li key={r}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Issues &amp; Clarifications
                </h3>
              </div>
              <div className="space-y-2">
                {data.issuesAndClarifications?.clarificationQuestions?.map(
                  (q) => (
                    <div
                      key={q.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <p className="text-[11px] font-semibold text-slate-500 uppercase">
                        {q.id} • {q.category}
                      </p>
                      <p className="text-sm text-slate-800">{q.question}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>

          {/* Overall recommendation */}
          <section className="space-y-4">
            <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-sky-100 to-white p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-sky-700" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Overall Recommendation
                </h3>
              </div>
              <p className="text-sm text-slate-800">
                {data.overallRecommendation?.narrativeSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Strengths Box */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
                <p className="text-xs font-semibold text-emerald-700 uppercase mb-3">
                  Strengths
                </p>
                <ul className="list-disc list-inside text-xs text-slate-800 space-y-1.5">
                  {data.overallRecommendation?.keyStrengths?.map((s: string) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Concerns Box */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
                <p className="text-xs font-semibold text-amber-700 uppercase mb-3">
                  Concerns
                </p>
                <ul className="list-disc list-inside text-xs text-amber-800 space-y-1.5">
                  {data.overallRecommendation?.keyConcerns?.map((c: string) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Recommended Actions Box */}
              <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 shadow-sm">
                <p className="text-xs font-semibold text-sky-700 uppercase mb-3">
                  Recommended Actions
                </p>
                <ul className="list-disc list-inside text-xs text-slate-800 space-y-1.5">
                  {data.overallRecommendation?.recommendedActionsBeforeBidding?.map(
                    (a: string) => (
                      <li key={a}>{a}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}



