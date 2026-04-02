'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import PlayAudioButton from './PlayAudioButton';

interface ReadingData {
  key: string;
  title: string;
  titleRomaji: string;
  titleJp: string;
  shortDescription: string;
  shortDescriptionJp: string;
  textAudio?: string;
  textAudioEn?: string;
  japaneseText: string[];
  romanizedText: string[];
  englishTranslation: string[];
}

interface Token {
  surface_form: string;
  reading?: string;
  basic_form?: string;
  pos: string;
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

type DisplayMode = 'japanese' | 'romaji' | 'english' | 'bilingual';

const LOOKUP_SKIP_POS = new Set(['記号', '助詞', '助動詞', '接続詞']);

export default function ReadingComponent({ readingKey }: { readingKey: string }) {
  const [data, setData] = useState<ReadingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<DisplayMode>('bilingual');
  const [tokenMap, setTokenMap] = useState<Record<number, Token[]>>({});
  const [tokenizing, setTokenizing] = useState<number | null>(null);
  const [popup, setPopup] = useState<PopupState>({
    visible: false, word: '', x: 0, y: 0, results: [], loading: false,
  });
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/hanabira/reading?key=${encodeURIComponent(readingKey)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [readingKey]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopup(p => ({ ...p, visible: false }));
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const tokenizeSentence = useCallback(async (idx: number, text: string) => {
    if (tokenMap[idx]) return;
    setTokenizing(idx);
    try {
      const res = await fetch('/api/tokenize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
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

  if (loading) return <div className="p-8 text-center text-[var(--secondary-color)]">Loading...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Reading not found.</div>;

  const modes: DisplayMode[] = ['japanese', 'romaji', 'english', 'bilingual'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 relative">
      <h1 className="text-3xl font-bold mb-1">{data.title}</h1>
      <p className="text-[var(--secondary-color)] mb-1">{data.titleRomaji}</p>
      <p className="text-[var(--secondary-color)] text-lg mb-4">{data.titleJp}</p>

      {data.textAudio && (
        <div className="flex gap-2 mb-4">
          <PlayAudioButton audioSrc={data.textAudio} label="JP Audio" />
          {data.textAudioEn && <PlayAudioButton audioSrc={data.textAudioEn} label="EN Audio" />}
        </div>
      )}

      <p className="text-sm text-[var(--secondary-color)] mb-6 italic">{data.shortDescription}</p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {modes.map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded text-sm border transition-colors ${
              mode === m
                ? 'bg-[var(--main-color)] text-[var(--background-color)] border-[var(--main-color)]'
                : 'border-[var(--border-color)] hover:bg-[var(--card-color)]'
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      <p className="text-xs text-[var(--secondary-color)] mb-6">
        Click on a Japanese sentence to analyze words. Click a word to look it up.
      </p>

      <div className="space-y-6">
        {data.japaneseText.map((jp, i) => {
          const tokens = tokenMap[i];
          return (
            <div key={i} className="border-l-2 border-[var(--border-color)] pl-4 group">
              {(mode === 'japanese' || mode === 'bilingual') && (
                <div className="flex items-start gap-2 mb-1">
                  <button
                    onClick={() => speakText(jp)}
                    className="mt-0.5 flex-shrink-0 text-xs px-1.5 py-0.5 border border-[var(--border-color)] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Read aloud"
                  >
                    TTS
                  </button>
                  <p
                    className="text-base leading-loose cursor-pointer"
                    onClick={() => !tokens && tokenizeSentence(i, jp)}
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
                        {jp}
                        {tokenizing === i && (
                          <span className="ml-2 text-xs text-[var(--secondary-color)]">analyzing...</span>
                        )}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {mode === 'romaji' && (
                <p className="text-sm text-[var(--secondary-color)] leading-relaxed mb-1">
                  {data.romanizedText[i]}
                </p>
              )}

              {mode === 'bilingual' && data.romanizedText[i] && (
                <p className="text-xs text-[var(--secondary-color)] mb-1">{data.romanizedText[i]}</p>
              )}

              {(mode === 'english' || mode === 'bilingual') && data.englishTranslation[i] && (
                <p className="text-sm text-[var(--secondary-color)]">{data.englishTranslation[i]}</p>
              )}
            </div>
          );
        })}
      </div>

      {popup.visible && (
        <div
          ref={popupRef}
          style={{ position: 'absolute', top: popup.y, left: Math.min(popup.x, (typeof window !== 'undefined' ? window.innerWidth : 800) - 320) }}
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

          {popup.loading && <p className="text-sm text-[var(--secondary-color)]">Looking up...</p>}

          {!popup.loading && popup.results.length === 0 && (
            <p className="text-sm text-[var(--secondary-color)]">No results found.</p>
          )}

          {popup.results.map(r => (
            <div key={r.slug} className="mb-3 last:mb-0">
              <div className="flex flex-wrap gap-1 mb-1">
                {r.japanese.map((j, ji) => (
                  <span key={ji} className="text-sm">
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
                {r.senses.map((s, si) => (
                  <li key={si}>
                    <span className="text-[var(--secondary-color)] text-xs">{s.parts_of_speech.join(', ')}</span>
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
