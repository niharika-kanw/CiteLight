'use client';

import { useState } from 'react';

export default function Home() {
  const [sourceContent, setSourceContent] = useState('https://en.wikipedia.org/wiki/Cohere');
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [citations, setCitations] = useState<any[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [activeChunkIds, setActiveChunkIds] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAnswer('');
    setCitations([]);
    setSources([]);

    try {
      // Auto-detect if input is a URL
      const isUrl = sourceContent.trim().match(/^https?:\/\//);

      const payload = {
        query,
        url: isUrl ? sourceContent.trim() : undefined,
        text: !isUrl ? sourceContent : undefined,
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch answer');
      }

      setAnswer(data.answer);
      setCitations(data.citations || []);
      setSources(data.sources || []);
    } catch (err: any) {
      console.error(err);
      setAnswer(err.message || 'Error fetching answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCitationEnter = (docIds: string[]) => {
    setActiveChunkIds(docIds);
  };

  const handleCitationLeave = () => {
    setActiveChunkIds([]);
  };

  return (

    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-sans selection:bg-purple-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-neutral-950/0 to-neutral-950/0 pointer-events-none" />

      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-center relative z-10">
        <div>
          <h1 className="text-5xl font-bold font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 drop-shadow-sm">
            CiteLight
          </h1>
          <p className="text-neutral-400 mt-3 text-lg font-light tracking-wide">
            Grounded Intelligence for the Enterprise.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium bg-neutral-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-800 text-neutral-300 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Powered by Command R+
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)] relative z-10">

        {/* Left Column: Input & Sources */}
        <div className="flex flex-col gap-6 h-full">
          <form onSubmit={handleSubmit} className="space-y-5 bg-neutral-900/40 backdrop-blur-xl p-8 rounded-3xl border border-neutral-800 shadow-2xl flex-shrink-0 relative overflow-hidden group">
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div>
              <label className="block text-sm font-semibold text-neutral-300 mb-2 uppercase tracking-wider">Source Content</label>
              <p className="text-xs text-neutral-500 mb-3">
                Paste a public URL to analyze. For content behind a login (e.g. Outlook, LinkedIn), please paste the text directly.
              </p>
              <textarea
                required
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
                className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-5 py-4 placeholder-neutral-600 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 focus:outline-none transition-all h-32 resize-none font-mono text-sm leading-relaxed"
                placeholder="https://example.com/article..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-300 mb-2 uppercase tracking-wider">Target Query</label>
              <textarea
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-5 py-4 placeholder-neutral-600 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 focus:outline-none transition-all h-24 resize-none text-base"
                placeholder="What specific information are you looking for?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all transform duration-200 ${loading
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:scale-[1.01] active:scale-[0.99]'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Run Analysis'}
            </button>
          </form>

          {/* Source Chunks (Scrollable) */}
          {sources?.length > 0 && (
            <div className="bg-neutral-900/40 backdrop-blur-md p-6 rounded-3xl border border-neutral-800 flex-grow flex flex-col min-h-0">
              <h3 className="text-xs font-bold text-neutral-500 mb-4 uppercase tracking-widest flex-shrink-0 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Retrieved Context
              </h3>
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-grow">
                {sources.map((src, i) => {
                  const chunkId = `chunk_${i}`;
                  const isActive = activeChunkIds.includes(chunkId);
                  return (
                    <div
                      key={i}
                      id={chunkId}
                      className={`p-4 rounded-xl border text-sm leading-relaxed transition-all duration-300 font-mono ${isActive
                        ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] transform scale-[1.01]'
                        : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                    >
                      <div className="text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider flex justify-between">
                        <span>Chunk {i + 1}</span>
                        {isActive && <span className="text-purple-400">Active Reference</span>}
                      </div>
                      {src}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Answer */}
        <div className="bg-neutral-900/40 backdrop-blur-xl p-8 rounded-3xl border border-neutral-800 shadow-2xl relative overflow-hidden flex flex-col h-full group">

          {!answer && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-center space-y-6">
              <div className="w-20 h-20 bg-neutral-800/50 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-neutral-700/50 group-hover:scale-110 transition-transform duration-500">
                ✨
              </div>
              <p className="text-lg font-light text-neutral-400">Ready to ground truth in data.</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-full animate-pulse blur-md opacity-50"></div>
                </div>
              </div>
              <p className="text-purple-300 font-medium tracking-wide animate-pulse">Reading & Reasoning...</p>
            </div>
          )}

          {answer && (
            <div className="relative z-10 flex flex-col h-full">
              <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-3 flex-shrink-0 text-white">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 text-neutral-950 text-sm shadow-lg shadow-emerald-500/20">
                  AI
                </span>
                Generated Insight
              </h2>

              <div className={`whitespace-pre-wrap leading-relaxed flex-grow overflow-y-auto pr-4 custom-scrollbar text-lg text-neutral-200 ${answer.startsWith('Error') || answer.startsWith('Failed') ? 'text-red-400' : ''}`}>
                {answer}
              </div>

              {/* Citations Section */}
              {citations && citations.length > 0 && (
                <div className="mt-8 pt-6 border-t border-neutral-800 flex-shrink-0">
                  <h3 className="text-xs font-bold text-neutral-500 mb-4 uppercase tracking-widest">
                    Verified Sources
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {citations.map((cit, i) => (
                      <span
                        key={i}
                        onMouseEnter={() => handleCitationEnter(cit.documentIds)}
                        onMouseLeave={handleCitationLeave}
                        className="text-xs bg-neutral-800 hover:bg-purple-600 hover:text-white px-3 py-1.5 rounded-md text-neutral-300 cursor-pointer transition-all duration-200 border border-neutral-700 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20"
                      >
                        [{i + 1}] {cit.text}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
