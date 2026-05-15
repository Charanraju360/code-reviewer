import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';

// ── Severity config ──────────────────────────────────────────────
const SEV = {
  error:      { bg: 'bg-red-50',     border: 'border-red-400',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700',    dot: 'bg-red-400',    lineBg: 'bg-red-50'     },
  warning:    { bg: 'bg-amber-50',   border: 'border-amber-400',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400',  lineBg: 'bg-amber-50'   },
  suggestion: { bg: 'bg-blue-50',    border: 'border-blue-400',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-400',   lineBg: 'bg-blue-50'    },
};

// ── Small reusable components ────────────────────────────────────
function SeverityBadge({ severity }) {
  const s = SEV[severity] || SEV.suggestion;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {severity}
    </span>
  );
}

function FileBadge({ comments }) {
  const errors   = comments.filter(c => c.severity === 'error').length;
  const warnings = comments.filter(c => c.severity === 'warning').length;
  if (errors > 0)   return <span className="ml-auto text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{errors}</span>;
  if (warnings > 0) return <span className="ml-auto text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{warnings}</span>;
  return <span className="ml-auto text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">✓</span>;
}

// ── Main component ───────────────────────────────────────────────
export default function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [review,       setReview]       = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState('');

  // Fetch review on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await client.get(`/api/reviews/${id}/`);
        setReview(res.data);
        if (res.data.files?.length > 0) setSelectedFile(res.data.files[0]);
      } catch {
        setFetchError('Failed to load review. It may not exist or you may not have access.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── Loading state ──
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-mono">Loading review...</p>
      </div>
    </div>
  );

  // ── Error state ──
  if (fetchError) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-red-400 text-sm">{fetchError}</p>
        <button onClick={() => navigate('/dashboard')} className="text-indigo-400 hover:text-indigo-300 text-sm underline">
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );

  if (!review) return null;

  // ── Derived stats ──
  const allComments   = review.files.flatMap(f => f.comments);
  const totalErrors   = allComments.filter(c => c.severity === 'error').length;
  const totalWarnings = allComments.filter(c => c.severity === 'warning').length;
  const totalSugs     = allComments.filter(c => c.severity === 'suggestion').length;

  // Build line → comments map for selected file
  const commentsByLine = {};
  if (selectedFile) {
    selectedFile.comments.forEach(c => {
      if (!commentsByLine[c.line_number]) commentsByLine[c.line_number] = [];
      commentsByLine[c.line_number].push(c);
    });
  }

  const lines = selectedFile ? selectedFile.file_content.split('\n') : [];

  // ── Render ──
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col font-mono text-sm">

      {/* ── Top navbar ── */}
      <header className="flex-shrink-0 bg-gray-900 border-b border-gray-800 px-5 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </button>

        <div className="w-px h-4 bg-gray-700" />

        <span className="text-white font-semibold text-sm truncate max-w-xs">{review.title}</span>

        <div className="ml-auto flex items-center gap-3">
          {totalErrors > 0 && (
            <span className="flex items-center gap-1.5 text-xs bg-red-900/50 text-red-300 px-2.5 py-1 rounded-full border border-red-800">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
              {totalErrors} error{totalErrors !== 1 ? 's' : ''}
            </span>
          )}
          {totalWarnings > 0 && (
            <span className="flex items-center gap-1.5 text-xs bg-amber-900/50 text-amber-300 px-2.5 py-1 rounded-full border border-amber-800">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              {totalWarnings} warning{totalWarnings !== 1 ? 's' : ''}
            </span>
          )}
          {totalSugs > 0 && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-900/50 text-blue-300 px-2.5 py-1 rounded-full border border-blue-800">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
              {totalSugs} suggestion{totalSugs !== 1 ? 's' : ''}
            </span>
          )}
          <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
            review.status === 'done'
              ? 'bg-emerald-900/50 text-emerald-300 border-emerald-800'
              : 'bg-gray-800 text-gray-400 border-gray-700'
          }`}>
            {review.status}
          </span>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: File sidebar ── */}
        <aside className="flex-shrink-0 w-56 bg-gray-900 border-r border-gray-800 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold">
              Files · {review.files.length}
            </p>
          </div>
          <nav className="flex-1 overflow-y-auto py-1">
            {review.files.map(f => {
              const isActive = selectedFile?.id === f.id;
              const shortName = f.filename.split('/').pop();
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-2 transition-colors border-l-2 ${
                    isActive
                      ? 'bg-indigo-950/60 border-indigo-500 text-white'
                      : 'border-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  {/* File icon */}
                  <svg className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs truncate flex-1">{shortName}</span>
                  <FileBadge comments={f.comments} />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── CENTER: Code viewer ── */}
        <main className="flex-1 overflow-auto bg-gray-950">
          {selectedFile ? (
            <div className="min-h-full">
              {/* File path header */}
              <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 py-2 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="text-gray-300 text-xs">{selectedFile.filename}</span>
                <span className="ml-auto text-gray-600 text-xs">{lines.length} lines</span>
              </div>

              {/* Code lines */}
              <div className="py-2">
                {lines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const lineComments = commentsByLine[lineNum] || [];
                  const topSeverity = lineComments[0]?.severity;
                  const sev = topSeverity ? SEV[topSeverity] : null;

                  return (
                    <div key={lineNum}>
                      {/* Code line */}
                      <div className={`flex items-stretch group ${sev ? sev.lineBg + '/10' : 'hover:bg-gray-900/40'}`}>
                        {/* Left severity bar */}
                        <div className={`w-0.5 flex-shrink-0 ${sev ? sev.dot : 'bg-transparent'}`} />
                        {/* Line number */}
                        <span className="flex-shrink-0 w-12 text-right pr-4 text-gray-600 select-none text-xs leading-6 pt-0.5">
                          {lineNum}
                        </span>
                        {/* Code */}
                        <span className={`flex-1 pr-4 text-xs leading-6 whitespace-pre ${sev ? sev.text : 'text-gray-300'}`}>
                          {line || ' '}
                        </span>
                        {/* Inline comment count badge */}
                        {lineComments.length > 0 && (
                          <span className={`flex-shrink-0 self-center mr-3 text-xs font-bold px-1.5 py-0.5 rounded ${sev?.badge}`}>
                            {lineComments.length}
                          </span>
                        )}
                      </div>

                      {/* Inline comment preview (shown directly under highlighted lines) */}
                      {lineComments.length > 0 && (
                        <div className={`mx-12 mb-1 mt-0.5 rounded border-l-2 px-3 py-1.5 ${sev?.border} ${sev?.bg}/20`}>
                          {lineComments.map((c, i) => (
                            <p key={i} className={`text-xs ${sev?.text} leading-relaxed`}>
                              <span className="font-semibold capitalize">[{c.severity}]</span> {c.comment}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600 text-sm">
              Select a file from the sidebar
            </div>
          )}
        </main>

        {/* ── RIGHT: Comments panel ── */}
        <aside className="flex-shrink-0 w-72 bg-gray-900 border-l border-gray-800 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold">AI Comments</p>
            {selectedFile && (
              <span className="text-xs text-gray-500">{selectedFile.comments.length} issue{selectedFile.comments.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {!selectedFile ? null :
             selectedFile.comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-900/50 border border-emerald-700 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-emerald-400 text-xs text-center">No issues found.<br />This file looks clean!</p>
              </div>
            ) : (
              selectedFile.comments
                .slice()
                .sort((a, b) => a.line_number - b.line_number)
                .map(c => {
                  const s = SEV[c.severity] || SEV.suggestion;
                  return (
                    <div
                      key={c.id}
                      className={`rounded-lg border-l-2 p-3 space-y-1.5 ${s.border} bg-gray-800/60`}
                    >
                      <div className="flex items-center justify-between">
                        <SeverityBadge severity={c.severity} />
                        <span className="text-gray-500 text-xs">Line {c.line_number}</span>
                      </div>
                      <p className="text-gray-300 text-xs leading-relaxed">{c.comment}</p>
                    </div>
                  );
                })
            )}
          </div>

          {/* Bottom summary */}
          {selectedFile && selectedFile.comments.length > 0 && (
            <div className="border-t border-gray-800 px-4 py-3 flex flex-wrap gap-2">
              {['error', 'warning', 'suggestion'].map(sev => {
                const count = selectedFile.comments.filter(c => c.severity === sev).length;
                if (!count) return null;
                const s = SEV[sev];
                return (
                  <span key={sev} className={`text-xs px-2 py-0.5 rounded-full font-semibold ${s.badge}`}>
                    {count} {sev}{count !== 1 ? 's' : ''}
                  </span>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}