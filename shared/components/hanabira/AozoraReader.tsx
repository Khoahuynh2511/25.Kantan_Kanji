'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface AozoraBook {
  book_id: string;
  title: string;
  title_yomi: string;
  author: string;
  card_url: string;
  html_url: string;
}

interface JishoSense {
  english_definitions: string[];
  parts_of_speech: string[];
}

interface JishoResult {
  slug: string;
  is_common: boolean;
  jlpt: string[];
  japanese: Array<{ word?: string; reading?: string }>;
  senses: JishoSense[];
}

interface PopupState {
  visible: boolean;
  word: string;
  x: number;
  y: number;
  results: JishoResult[];
  loading: boolean;
}

interface Token {
  surface_form: string;
  reading?: string;
  basic_form?: string;
  pos: string;
}

// Strip HTML tags from a string, preserving text content
function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

// Extract plain-text paragraphs from Aozora HTML content
// Aozora HTML uses <br> and <p> tags; ruby is rendered as <ruby><rb>...</rb><rp>...</rp><rt>...</rt><rp>...</rp></ruby>
function parseAozoraHTML(html: string): Array<{ raw: string; plain: string }> {
  // Split on <br>, <p>, block-level tags as paragraph separators
  const chunks = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .split('\n')
    .map(c => c.trim())
    .filter(c => stripTags(c).trim().length > 2);

  return chunks.map(raw => ({ raw, plain: stripTags(raw).trim() }));
}

// Render a raw HTML chunk with ruby preserved as React nodes
// This is safe because content is from Aozora's own server
function renderChunk(raw: string): React.ReactNode {
  // Use dangerouslySetInnerHTML — content is from trusted Aozora Bunko
  return <span dangerouslySetInnerHTML={{ __html: raw }} />;
}

const LOOKUP_SKIP_POS = new Set(['記号', '助詞', '助動詞', '接続詞']);

export default function AozoraReader({ bookId }: { bookId: string }) {
  const [book, setBook] = useState<AozoraBook | null>(null);
  const [paragraphs, setParagraphs] = useState<Array<{ raw: string; plain: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tokenMap, setTokenMap] = useState<Record<number, Token[]>>({});
  const [tokenizing, setTokenizing] = useState<number | null>(null);
  const [popup, setPopup] = useState<PopupState>({
    visible: false, word: '', x: 0, y: 0, results: [], loading: false,
  });
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [bookRes, contentRes] = await Promise.all([
          fetch(`/api/aozora?type=book&id=${bookId}`),
          fetch(`/api/aozora?type=content&id=${bookId}`),
        ]);
        if (!bookRes.ok) throw new Error('Book not found');
        const bookData: AozoraBook = await bookRes.json();
        setBook(bookData);

        if (contentRes.ok) {
          const html = await contentRes.text();
          setParagraphs(parseAozoraHTML(html));
        } else {
          setError('No HTML content available for this book.');
        }
      } catch {
        setError('Could not load this book. It may not be available.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bookId]);

  // Close popup on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopup(p => ({ ...p, visible: false }));
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const tokenizeParagraph = useCallback(async (idx: number, plain: string) => {
    if (tokenMap[idx]) return;
    setTokenizing(idx);
    try {
      const res = await fetch('/api/tokenize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: plain }),
      });
      const { tokens } = await res.json();
      setTokenMap(prev => ({ ...prev, [idx]: tokens }));
    } finally {
      setTokenizing(null);
    }
  }, [tokenMap]);

  const lookupWord = useCallback(async (word: string, basicForm: string, x: number, y: number) => {
    const keyword = basicForm && basicForm !== '*' ? basicForm : word;
    setPopup({ visible: true, word: keyword, x, y, results: [], loading: true });
    try {
      const res = await fetch(`/api/jisho?keyword=${encodeURIComponent(keyword)}`);
      const { results } = await res.json();
      setPopup(p => ({ ...p, results: results ?? [], loading: false }));
    } catch {
      setPopup(p => ({ ...p, loading: false }));
    }
  }, []);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'ja-JP';
    utt.rate = 0.85;
    window.speechSynthesis.speak(utt);
  };

  if (loading) return <div className="p-8 text-center text-[var(--secondary-color)]">Loading book...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!book) return null;

  const authorName = book.author ?? '';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 relative">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">{book.title}</h1>
        {book.title_yomi && <p className="text-sm text-[var(--secondary-color)]">{book.title_yomi}</p>}
        {authorName && <p className="text-base text-[var(--secondary-color)] mt-1">{authorName}</p>}
        {book.card_url && (
          <a
            href={book.card_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--main-color)] underline mt-1 inline-block"
          >
            View on Aozora Bunko
          </a>
        )}
      </div>

      <p className="text-xs text-[var(--secondary-color)] mb-6">
        Click on a paragraph to tokenize, then click a word to look it up.
      </p>

      <div className="space-y-5">
        {paragraphs.map((para, idx) => {
          const tokens = tokenMap[idx];

          return (
            <div
              key={idx}
              className="border-l-2 border-[var(--border-color)] pl-4 group cursor-pointer"
            >
              <div className="flex items-start gap-2">
                <button
                  onClick={() => speakText(para.plain)}
                  className="mt-0.5 flex-shrink-0 text-xs px-1.5 py-0.5 border border-[var(--border-color)] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Read aloud"
                >
                  TTS
                </button>

                <div
                  className="text-base leading-loose"
                  onClick={() => !tokens && tokenizeParagraph(idx, para.plain)}
                >
                  {tokens ? (
                    tokens.map((tok, ti) => {
                      const isLookupable =
                        !LOOKUP_SKIP_POS.has(tok.pos) && tok.surface_form.trim().length > 0;

                      return isLookupable ? (
                        <span
                          key={ti}
                          className="cursor-pointer hover:bg-[var(--border-color)] rounded px-0.5 transition-colors"
                          onClick={e => {
                            e.stopPropagation();
                            const rect = (e.target as HTMLElement).getBoundingClientRect();
                            lookupWord(
                              tok.surface_form,
                              tok.basic_form ?? tok.surface_form,
                              rect.left + window.scrollX,
                              rect.bottom + window.scrollY + 4
                            );
                          }}
                        >
                          {tok.surface_form}
                        </span>
                      ) : (
                        <span key={ti}>{tok.surface_form}</span>
                      );
                    })
                  ) : (
                    <span>
                      {renderChunk(para.raw)}
                      {tokenizing === idx && (
                        <span className="ml-2 text-xs text-[var(--secondary-color)]">analyzing...</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {popup.visible && (
        <div
          ref={popupRef}
          style={{ position: 'absolute', top: popup.y, left: Math.min(popup.x, window.innerWidth - 320) }}
          className="z-50 w-72 bg-[var(--card-color)] border border-[var(--border-color)] rounded-lg shadow-lg p-3"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-base">{popup.word}</span>
            <button
              onClick={() => setPopup(p => ({ ...p, visible: false }))}
              className="text-[var(--secondary-color)] hover:text-current text-lg leading-none"
            >
              x
            </button>
          </div>

          {popup.loading && (
            <p className="text-sm text-[var(--secondary-color)]">Looking up...</p>
          )}

          {!popup.loading && popup.results.length === 0 && (
            <p className="text-sm text-[var(--secondary-color)]">No results found.</p>
          )}

          {popup.results.map(r => (
            <div key={r.slug} className="mb-3 last:mb-0">
              <div className="flex flex-wrap gap-1 mb-1">
                {r.japanese.map((j, i) => (
                  <span key={i} className="text-sm">
                    {j.word && <span className="font-medium">{j.word}</span>}
                    {j.reading && (
                      <span className="text-[var(--secondary-color)] ml-1">[{j.reading}]</span>
                    )}
                  </span>
                ))}
                {r.is_common && (
                  <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded">common</span>
                )}
                {r.jlpt.map(j => (
                  <span key={j} className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">{j}</span>
                ))}
              </div>
              <ol className="text-sm space-y-1">
                {r.senses.map((s, i) => (
                  <li key={i}>
                    <span className="text-[var(--secondary-color)] text-xs">
                      {s.parts_of_speech.join(', ')}
                    </span>
                    <p>{s.english_definitions.join('; ')}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
