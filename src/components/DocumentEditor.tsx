import { useState } from 'react';
import { MessageSquare, Sparkles, Eye, FileText, Edit3 } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  aiDraft: string;
  finalContent: string;
  isEdited: boolean;
  wordCount: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  isResolved: boolean;
}

interface DocumentEditorProps {
  sections: Section[];
  onSectionUpdate: (sectionId: string, content: string) => void;
  onAddComment: (sectionId: string, comment: string) => void;
  onCompare: (sectionId: string) => void;
}

export function DocumentEditor({ sections, onSectionUpdate, onAddComment, onCompare }: DocumentEditorProps) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(sections[0]?.id || null);
  const [newComment, setNewComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState<string | null>(null);

  const activeSection = sections.find(s => s.id === activeSectionId);

  const handleContentChange = (sectionId: string, value: string) => {
    onSectionUpdate(sectionId, value);
  };

  const handleAddComment = (sectionId: string) => {
    if (newComment.trim()) {
      onAddComment(sectionId, newComment);
      setNewComment('');
      setShowCommentBox(null);
    }
  };

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50/30 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col h-[calc(100vh-280px)]">
      <div className="relative px-6 py-4 border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-inner">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Document Editor
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Edit and refine your justification sections</p>
          </div>
        </div>
        <span className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg border border-slate-200">
          {sections.length} sections
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-slate-200 bg-gradient-to-br from-slate-50/50 via-white to-slate-50/30 overflow-y-auto custom-scrollbar">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-inner">
                <Edit3 className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Sections
              </p>
            </div>
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={`
                    w-full text-left p-3 rounded-xl mb-2 text-sm transition-all duration-200
                    ${activeSectionId === section.id
                      ? 'bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 text-indigo-700 border-2 border-indigo-200 shadow-md'
                      : 'text-gray-700 hover:bg-white border-2 border-transparent hover:border-slate-200 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold flex-1 line-clamp-2">{section.title}</span>
                    {section.isEdited && (
                      <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 mt-1 shadow-sm"></div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-medium text-gray-600">{section.wordCount} words</span>
                    {section.comments.length > 0 && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {section.comments.length}
                        </span>
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {activeSection ? (
            <>
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-br from-white via-slate-50/30 to-slate-50 flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 mb-2">
                      {activeSection.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {activeSection.aiDraft && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                          <Sparkles className="w-3.5 h-3.5" />
                          AI Generated
                        </span>
                      )}
                      {activeSection.isEdited && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 shadow-sm">
                          <Edit3 className="w-3.5 h-3.5" />
                          Edited
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onCompare(activeSection.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border-2 border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Compare
                    </button>
                    <button
                      onClick={() => setShowCommentBox(activeSection.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Comment
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gradient-to-br from-white via-slate-50/20 to-white">
                <textarea
                  value={activeSection.finalContent}
                  onChange={(e) => handleContentChange(activeSection.id, e.target.value)}
                  className="w-full h-full min-h-[400px] p-5 text-sm leading-relaxed text-gray-900 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 resize-none bg-white shadow-sm focus:shadow-md transition-all duration-200"
                  placeholder="Start writing your justification..."
                />

                {showCommentBox === activeSection.id && (
                  <div className="mt-4 p-5 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 shadow-md">
                    <label className="block text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">
                      Add Comment
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full p-4 text-sm text-gray-900 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-300 resize-none bg-white shadow-sm focus:shadow-md transition-all duration-200"
                      rows={3}
                      placeholder="Type your comment..."
                    />
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleAddComment(activeSection.id)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Add Comment
                      </button>
                      <button
                        onClick={() => setShowCommentBox(null)}
                        className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border-2 border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {activeSection.comments.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-600" />
                      <span>Comments ({activeSection.comments.length})</span>
                    </h4>
                    <div className="space-y-3">
                      {activeSection.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className={`p-4 rounded-xl border-2 shadow-sm transition-all duration-200 ${
                            comment.isResolved
                              ? 'bg-gradient-to-br from-slate-50 via-white to-slate-50 border-slate-200 opacity-75'
                              : 'bg-gradient-to-br from-white via-blue-50/30 to-white border-blue-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-bold text-gray-900">
                              {comment.author}
                            </span>
                            <span className="text-xs font-medium text-gray-500 bg-slate-100 px-2 py-1 rounded-md">
                              {comment.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                          {comment.isResolved && (
                            <span className="inline-flex items-center gap-1 mt-3 px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md">
                              ✓ Resolved
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gradient-to-br from-slate-50 via-white to-slate-50">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">Select a section to start editing</p>
              <p className="text-xs text-gray-500 mt-1">Choose a section from the sidebar to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
