import { useState } from 'react';
import { MessageSquare, Sparkles, Eye } from 'lucide-react';

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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-[calc(100vh-280px)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-base font-semibold text-gray-900">
          Document Editor
        </h2>
        <span className="text-xs text-gray-500">
          {sections.length} sections
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-3">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Sections
            </p>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={`
                  w-full text-left px-3 py-2 rounded-lg mb-2 text-sm transition-colors
                  ${activeSectionId === section.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium flex-1 line-clamp-2">{section.title}</span>
                  {section.isEdited && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{section.wordCount} words</span>
                  {section.comments.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {section.comments.length} comments
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {activeSection ? (
            <>
              <div className="px-6 py-4 border-b border-gray-200 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {activeSection.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      {activeSection.aiDraft && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full border border-blue-200">
                          <Sparkles className="w-3 h-3" />
                          AI Generated
                        </span>
                      )}
                      {activeSection.isEdited && (
                        <span className="text-xs text-gray-500">
                          Edited by user
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onCompare(activeSection.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      Compare
                    </button>
                    <button
                      onClick={() => setShowCommentBox(activeSection.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Comment
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <textarea
                  value={activeSection.finalContent}
                  onChange={(e) => handleContentChange(activeSection.id, e.target.value)}
                  className="w-full h-full min-h-[400px] p-4 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Start writing your justification..."
                />

                {showCommentBox === activeSection.id && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Add Comment
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full p-3 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Type your comment..."
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleAddComment(activeSection.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Comment
                      </button>
                      <button
                        onClick={() => setShowCommentBox(null)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {activeSection.comments.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Comments ({activeSection.comments.length})
                    </h4>
                    <div className="space-y-3">
                      {activeSection.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className={`p-3 rounded-lg border ${
                            comment.isResolved
                              ? 'bg-gray-50 border-gray-200 opacity-60'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-900">
                              {comment.author}
                            </span>
                            <span className="text-xs text-gray-500">
                              {comment.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                          {comment.isResolved && (
                            <span className="inline-block mt-2 text-xs text-emerald-600 font-medium">
                              Resolved
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
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p className="text-sm">Select a section to start editing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
