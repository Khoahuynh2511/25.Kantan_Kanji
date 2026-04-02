'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { WordNode } from '@/shared/components/hanabira/WordHierarchyMap';
import Sidebar from '@/shared/components/Menu/Sidebar';
import ApiKeyPanel, { type AiConfig } from '@/shared/components/experiment/ApiKeyPanel';

const WordHierarchyMap = dynamic(
  () => import('@/shared/components/hanabira/WordHierarchyMap'),
  { ssr: false, loading: () => <div className="h-[700px] flex items-center justify-center text-[var(--secondary-color)]">Loading graph...</div> }
);

const WORD_TYPES = [
  { value: 'verb-conjugation', label: 'Verb Conjugation' },
  { value: 'word-similarity', label: 'Word Similarity' },
  { value: 'synonyms', label: 'Synonyms' },
  { value: 'antonyms', label: 'Antonyms' },
  { value: 'hypernyms', label: 'Hypernyms' },
  { value: 'hyponyms', label: 'Hyponyms' },
  { value: 'collocations', label: 'Collocations' },
  { value: 'part-of-speech', label: 'Part of Speech' },
  { value: 'idioms', label: 'Idioms' },
  { value: 'pronunciation-similarity', label: 'Pronunciation / Kanji Similarity' },
] as const;

const EXAMPLE_WORDS: Record<string, string> = {
  Japanese: '食べる',
  Korean: '먹다',
};

const DEFAULT_DATA: WordNode = {
  word: '食べる',
  meaning: 'to eat',
  readings: ['たべる'],
  usage: 'A common verb used to express eating.',
  children: [
    {
      word: '食べます',
      meaning: 'to eat (polite)',
      example: 'ご飯を食べます (I eat rice)',
      readings: ['たべます'],
      usage: 'Polite non-past form.',
      children: [
        {
          word: '食べません',
          meaning: 'do not eat (polite negative)',
          example: '野菜を食べません (I do not eat vegetables)',
          readings: ['たべません'],
          usage: 'Polite present negative.',
          children: [],
        },
        {
          word: '食べました',
          meaning: 'ate (polite past)',
          example: 'ケーキを食べました (I ate cake)',
          readings: ['たべました'],
          usage: 'Polite past form.',
          children: [],
        },
      ],
    },
    {
      word: '食べたい',
      meaning: 'want to eat',
      example: 'ケーキを食べたい (I want to eat cake)',
      readings: ['たべたい'],
      usage: 'Expresses desire to eat.',
      children: [
        {
          word: '食べたくない',
          meaning: 'do not want to eat',
          example: '辛いものを食べたくない (I do not want to eat spicy food)',
          readings: ['たべたくない'],
          usage: 'Negative desire form.',
          children: [],
        },
      ],
    },
    {
      word: '食べられる',
      meaning: 'can eat / to be eaten',
      example: '刺身が食べられる (I can eat sashimi)',
      readings: ['たべられる'],
      usage: 'Potential and passive form.',
      children: [],
    },
  ],
};

export default function WordHierarchyPage() {
  const [word, setWord] = useState('食べる');
  const [language, setLanguage] = useState('Japanese');
  const [wordType, setWordType] = useState('verb-conjugation');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<WordNode>(DEFAULT_DATA);
  const [aiConfig, setAiConfig] = useState<AiConfig>({ provider: 'openai', apiKey: '', model: 'gpt-4o' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const wordParam = params.get('word');
      const langParam = params.get('language');

      if (wordParam) setWord(decodeURIComponent(wordParam));
      if (langParam) {
        const normalized = langParam.charAt(0).toUpperCase() + langParam.slice(1).toLowerCase();
        if (normalized === 'Japanese' || normalized === 'Korean') {
          setLanguage(normalized);
        }
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/word-hierarchy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: word.trim(),
          wordType,
          apiKey: aiConfig.apiKey || undefined,
          provider: aiConfig.provider,
          model: aiConfig.model,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Request failed');
        return;
      }

      setGraphData(json.tree as WordNode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-[100dvh] max-w-[100dvw] flex'>
      <Sidebar />
      <main className='flex-1 min-w-0 overflow-x-hidden pb-20 lg:pb-0'>
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-1">Word Hierarchy</h1>
        <p className="text-[var(--secondary-color)] mb-6">
          Explore relationships between Japanese and Korean words — conjugation, synonyms, antonyms, and more — as an interactive graph.
        </p>

        <ApiKeyPanel onChange={setAiConfig} />

        <div className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="word-input" className="block text-sm font-semibold mb-1">
                  Word
                </label>
                <input
                  id="word-input"
                  type="text"
                  value={word}
                  onChange={e => setWord(e.target.value)}
                  placeholder={EXAMPLE_WORDS[language]}
                  maxLength={50}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--main-color)]"
                />
              </div>

              <div>
                <p className="text-sm font-semibold mb-1">Language</p>
                <div className="flex gap-4 pt-1">
                  {['Japanese', 'Korean'].map(lang => (
                    <label key={lang} className="flex items-center gap-1.5 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="language"
                        value={lang}
                        checked={language === lang}
                        onChange={() => {
                          setLanguage(lang);
                          setWord(EXAMPLE_WORDS[lang]);
                        }}
                        className="accent-[var(--main-color)]"
                      />
                      {lang}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Word Association Type</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {WORD_TYPES.map(({ value, label }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-1.5 cursor-pointer text-sm px-3 py-2 rounded-lg border transition-colors ${
                      wordType === value
                        ? 'border-[var(--main-color)] bg-[var(--main-color)] text-[var(--background-color)]'
                        : 'border-[var(--border-color)] hover:bg-[var(--card-color)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="wordType"
                      value={value}
                      checked={wordType === value}
                      onChange={() => setWordType(value)}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-[var(--main-color)] text-[var(--background-color)] font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Generating...' : 'Generate Graph'}
            </button>
          </form>

          {error && (
            <p className="mt-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
        </div>

        <div className="border border-[var(--border-color)] rounded-xl overflow-hidden">
          <WordHierarchyMap data={graphData} />
        </div>

        <p className="mt-3 text-xs text-[var(--secondary-color)]">
          Graph generated by {aiConfig.model}. Content may contain errors. Drag nodes to rearrange, use the minimap to navigate.
        </p>
      </div>
      </main>
    </div>
  );
}
