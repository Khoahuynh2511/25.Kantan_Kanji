'use client';

import { useState, useEffect, useRef } from 'react';

interface Token {
  surface_form: string;
  reading: string;
  basic_form: string;
  pos: string;
  pos_detail_1: string;
}

interface JishoSense {
  english_definitions: string[];
  parts_of_speech: string[];
  tags: string[];
  info: string[];
  links: { text: string; url: string }[];
}

interface JishoEntry {
  slug: string;
  japanese: { word?: string; reading?: string }[];
  senses: JishoSense[];
  is_common: boolean;
  jlpt: string[];
}

const posConfig: Record<string, { label: string; chip: string; dot: string }> = {
  '名詞':   { label: 'Noun',     chip: 'bg-blue-100 text-blue-800 border-blue-200',       dot: 'bg-blue-400' },
  '動詞':   { label: 'Verb',     chip: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-400' },
  '形容詞': { label: 'Adj',      chip: 'bg-amber-100 text-amber-800 border-amber-200',     dot: 'bg-amber-400' },
  '副詞':   { label: 'Adv',      chip: 'bg-violet-100 text-violet-800 border-violet-200',  dot: 'bg-violet-400' },
  '助詞':   { label: 'Particle', chip: 'bg-slate-100 text-slate-600 border-slate-200',     dot: 'bg-slate-400' },
  '助動詞': { label: 'Aux',      chip: 'bg-rose-100 text-rose-700 border-rose-200',         dot: 'bg-rose-400' },
  '接続詞': { label: 'Conj',     chip: 'bg-orange-100 text-orange-800 border-orange-200',  dot: 'bg-orange-400' },
  '感動詞': { label: 'Interj',   chip: 'bg-pink-100 text-pink-800 border-pink-200',         dot: 'bg-pink-400' },
  '記号':   { label: 'Symbol',   chip: 'bg-gray-100 text-gray-500 border-gray-200',         dot: 'bg-gray-300' },
};

const fallbackConfig = { label: 'Other', chip: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };

function getChip(pos: string)     { return (posConfig[pos] ?? fallbackConfig).chip; }
function getDot(pos: string)      { return (posConfig[pos] ?? fallbackConfig).dot; }
function getHover(pos: string)    {
  const map: Record<string, string> = {
    '名詞': 'hover:bg-blue-200', '動詞': 'hover:bg-emerald-200', '形容詞': 'hover:bg-amber-200',
    '副詞': 'hover:bg-violet-200', '助詞': 'hover:bg-slate-200', '助動詞': 'hover:bg-rose-200',
    '接続詞': 'hover:bg-orange-200', '感動詞': 'hover:bg-pink-200', '記号': 'hover:bg-gray-200',
  };
  return map[pos] ?? 'hover:bg-gray-200';
}

export default function TextParser() {
  const [text, setText] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFurigana, setShowFurigana] = useState<'hover' | 'always' | 'never'>('hover');
  const [showTable, setShowTable] = useState(true);

  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [dictEntries, setDictEntries] = useState<JishoEntry[]>([]);
  const [dictLoading, setDictLoading] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  const [translation, setTranslation] = useState('');
  const [translating, setTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const translate = async () => {
    if (!text.trim()) return;
    setTranslating(true);
    setShowTranslation(true);
    setTranslation('');
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTranslation(data.translation);
    } catch (e) {
      setTranslation(`Error: ${String(e)}`);
    } finally {
      setTranslating(false);
    }
  };

  const parse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setSelectedToken(null);
    setDictEntries([]);
    try {
      const res = await fetch('/api/hanabira/text-parser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTokens(data.tokens ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const lookupWord = async (token: Token) => {
    setSelectedToken(token);
    setDictEntries([]);
    setDictLoading(true);
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    try {
      const keyword = token.basic_form !== '*' ? token.basic_form : token.surface_form;
      const res = await fetch(`/api/dictionary?keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      setDictEntries(data.data?.slice(0, 4) ?? []);
    } catch {
      setDictEntries([]);
    } finally {
      setDictLoading(false);
    }
  };

  const hasFurigana = (t: Token) => t.reading && t.reading !== t.surface_form;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--main-color)]">Japanese Text Parser</h1>
        <p className="text-[var(--secondary-color)] mt-1 text-sm">
          Enter Japanese text to analyze morphological structure. Click any word to look up its meaning.
        </p>
      </div>

      {/* Input card */}
      <div className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm mb-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) parse(); }}
          placeholder="日本語のテキストを入力してください..."
          rows={4}
          className="w-full bg-transparent text-[var(--main-color)] resize-y focus:outline-none text-base placeholder:text-[var(--secondary-color)] font-serif"
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--secondary-color)]">Ctrl+Enter to parse</span>
          <div className="flex gap-2">
            <button
              onClick={translate}
              disabled={translating || !text.trim()}
              className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-[var(--main-color)] font-medium text-sm disabled:opacity-40 hover:bg-[var(--card-color)] transition-colors"
            >
              {translating ? 'Translating...' : 'Translate'}
            </button>
            <button
              onClick={parse}
              disabled={loading || !text.trim()}
              className="px-5 py-2 rounded-lg bg-[var(--main-color)] text-[var(--background-color)] font-medium text-sm disabled:opacity-40 hover:opacity-85 transition-opacity"
            >
              {loading ? 'Parsing...' : 'Parse'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {showTranslation && (
        <div className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl px-5 py-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--secondary-color)]">Translation (JA → EN)</span>
            <button
              onClick={() => setShowTranslation(false)}
              className="text-[var(--secondary-color)] hover:text-[var(--main-color)] text-lg leading-none transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          {translating ? (
            <div className="flex items-center gap-2 text-sm text-[var(--secondary-color)]">
              <span className="w-4 h-4 border-2 border-[var(--border-color)] border-t-[var(--main-color)] rounded-full animate-spin" />
              Translating...
            </div>
          ) : (
            <p className="text-[var(--main-color)] leading-relaxed">{translation}</p>
          )}
          <p className="text-xs text-[var(--secondary-color)] mt-2 opacity-60">Powered by MyMemory</p>
        </div>
      )}

      {tokens.length > 0 && (
        <div className="space-y-5">

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--secondary-color)] mr-1">Furigana:</span>
            {(['hover', 'always', 'never'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setShowFurigana(mode)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                  showFurigana === mode
                    ? 'bg-[var(--main-color)] text-[var(--background-color)] border-[var(--main-color)]'
                    : 'bg-transparent text-[var(--secondary-color)] border-[var(--border-color)] hover:bg-[var(--card-color)]'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={() => setShowTable(!showTable)}
              className="px-3 py-1 rounded-full text-xs font-medium border border-[var(--border-color)] text-[var(--secondary-color)] hover:bg-[var(--card-color)] transition-colors"
            >
              {showTable ? 'Hide' : 'Show'} Table
            </button>
          </div>

          {/* Token display */}
          <div className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
            <div className="flex flex-wrap gap-x-1 gap-y-7 font-serif text-2xl leading-none">
              {tokens.map((t, i) => (
                <span
                  key={i}
                  className="relative group inline-block cursor-pointer"
                  onClick={() => lookupWord(t)}
                >
                  {/* Furigana */}
                  <span
                    className={`absolute -top-5 left-0 right-0 text-center text-xs font-sans text-[var(--secondary-color)] transition-opacity duration-200 z-10 whitespace-nowrap pointer-events-none ${
                      showFurigana === 'always' && hasFurigana(t)
                        ? 'opacity-100'
                        : showFurigana === 'hover' && hasFurigana(t)
                          ? 'opacity-0 group-hover:opacity-100'
                          : 'opacity-0'
                    }`}
                  >
                    {t.reading}
                  </span>

                  {/* Token chip */}
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-md border transition-all duration-200 hover:scale-110 hover:shadow-md ${getChip(t.pos)} ${getHover(t.pos)} ${
                      selectedToken === t ? 'ring-2 ring-offset-1 ring-[var(--main-color)] scale-110' : ''
                    }`}
                  >
                    {t.surface_form}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* POS legend */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(posConfig).map(([pos, cfg]) => (
              <span key={pos} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${cfg.chip}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {pos} <span className="opacity-60">({cfg.label})</span>
              </span>
            ))}
          </div>

          {/* Word detail panel */}
          {selectedToken && (
            <div ref={detailRef} className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl shadow-sm overflow-hidden">
              {/* Panel header */}
              <div className="flex items-start justify-between px-5 py-4 border-b border-[var(--border-color)]">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-serif text-3xl font-semibold text-[var(--main-color)]">
                    {selectedToken.surface_form}
                  </span>
                  {hasFurigana(selectedToken) && (
                    <span className="text-lg text-[var(--secondary-color)] font-serif">
                      {selectedToken.reading}
                    </span>
                  )}
                  {selectedToken.basic_form && selectedToken.basic_form !== selectedToken.surface_form && selectedToken.basic_form !== '*' && (
                    <span className="text-sm text-[var(--secondary-color)]">
                      base: <span className="font-serif">{selectedToken.basic_form}</span>
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border font-medium ${getChip(selectedToken.pos)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getDot(selectedToken.pos)}`} />
                    {selectedToken.pos}
                    {selectedToken.pos_detail_1 && selectedToken.pos_detail_1 !== '*' && (
                      <span className="opacity-60 ml-0.5">/ {selectedToken.pos_detail_1}</span>
                    )}
                  </span>
                </div>
                <button
                  onClick={() => { setSelectedToken(null); setDictEntries([]); }}
                  className="text-[var(--secondary-color)] hover:text-[var(--main-color)] text-lg leading-none ml-3 transition-colors"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* Definitions */}
              <div className="px-5 py-4">
                {dictLoading ? (
                  <div className="flex items-center gap-2 text-sm text-[var(--secondary-color)] py-2">
                    <span className="w-4 h-4 border-2 border-[var(--border-color)] border-t-[var(--main-color)] rounded-full animate-spin" />
                    Looking up...
                  </div>
                ) : dictEntries.length === 0 ? (
                  <p className="text-sm text-[var(--secondary-color)] italic">No definition found.</p>
                ) : (
                  <div className="space-y-4">
                    {dictEntries.map((entry, ei) => (
                      <div key={ei} className={ei > 0 ? 'pt-4 border-t border-[var(--border-color)]' : ''}>
                        {/* Entry header */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-serif text-xl text-[var(--main-color)]">
                            {entry.japanese[0]?.word ?? entry.japanese[0]?.reading}
                          </span>
                          {entry.japanese[0]?.word && entry.japanese[0]?.reading && (
                            <span className="text-sm text-[var(--secondary-color)] font-serif">
                              {entry.japanese[0].reading}
                            </span>
                          )}
                          {entry.is_common && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium">
                              common
                            </span>
                          )}
                          {entry.jlpt.length > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                              {entry.jlpt[0].replace('jlpt-', '').toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Senses */}
                        <ol className="space-y-1.5">
                          {entry.senses.slice(0, 5).map((sense, si) => (
                            <li key={si} className="flex gap-2.5 text-sm">
                              <span className="text-[var(--secondary-color)] font-medium min-w-[1.2rem] text-right">{si + 1}.</span>
                              <div>
                                <span className="text-[var(--main-color)]">
                                  {sense.english_definitions.join(', ')}
                                </span>
                                {sense.parts_of_speech.length > 0 && (
                                  <span className="ml-2 text-xs text-[var(--secondary-color)] italic">
                                    {sense.parts_of_speech.join(', ')}
                                  </span>
                                )}
                                {sense.info.length > 0 && (
                                  <span className="ml-2 text-xs text-[var(--secondary-color)]">
                                    ({sense.info.join(', ')})
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ol>

                        {/* Alt readings */}
                        {entry.japanese.length > 1 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {entry.japanese.slice(1).map((j, ji) => (
                              <span key={ji} className="text-xs px-2 py-0.5 rounded border border-[var(--border-color)] text-[var(--secondary-color)] font-serif">
                                {j.word ?? j.reading}
                                {j.word && j.reading && <span className="ml-1 opacity-70">({j.reading})</span>}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    <a
                      href={`https://jisho.org/search/${encodeURIComponent(selectedToken.basic_form !== '*' ? selectedToken.basic_form : selectedToken.surface_form)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[var(--secondary-color)] hover:text-[var(--main-color)] transition-colors mt-1"
                    >
                      View on Jisho
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Detailed breakdown table */}
          {showTable && (
            <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] shadow-sm">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[var(--card-color)] text-[var(--secondary-color)] text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left border-b border-[var(--border-color)] font-medium">#</th>
                    <th className="px-4 py-3 text-left border-b border-[var(--border-color)] font-medium">Surface</th>
                    <th className="px-4 py-3 text-left border-b border-[var(--border-color)] font-medium">Reading</th>
                    <th className="px-4 py-3 text-left border-b border-[var(--border-color)] font-medium">Base Form</th>
                    <th className="px-4 py-3 text-left border-b border-[var(--border-color)] font-medium">POS</th>
                    <th className="px-4 py-3 text-left border-b border-[var(--border-color)] font-medium">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((t, i) => (
                    <tr
                      key={i}
                      onClick={() => lookupWord(t)}
                      className={`hover:bg-[var(--card-color)] transition-colors border-b border-[var(--border-color)] last:border-b-0 cursor-pointer ${selectedToken === t ? 'bg-[var(--card-color)]' : ''}`}
                    >
                      <td className="px-4 py-2.5 text-[var(--secondary-color)] text-xs">{i + 1}</td>
                      <td className="px-4 py-2.5 font-serif text-lg font-medium text-[var(--main-color)]">{t.surface_form}</td>
                      <td className="px-4 py-2.5 text-[var(--secondary-color)]">{t.reading || '—'}</td>
                      <td className="px-4 py-2.5 font-serif">{t.basic_form}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border font-medium ${getChip(t.pos)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getDot(t.pos)}`} />
                          {t.pos}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[var(--secondary-color)] text-xs">{t.pos_detail_1 || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
