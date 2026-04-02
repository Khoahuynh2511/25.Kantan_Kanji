'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/shared/components/Menu/Sidebar';
import ParseTree from '@/shared/components/grammar/ParseTree';
import GrammarExplanation from '@/shared/components/grammar/GrammarExplanation';
import ApiKeyPanel, { type AiConfig } from '@/shared/components/experiment/ApiKeyPanel';

// ---- types ----

interface Token {
  surface_form: string;
  reading: string;
  basic_form: string;
  pos: string;
  pos_detail_1: string;
}

interface TreeNode {
  type?: string;
  value: string;
  translation?: string;
  children?: TreeNode[];
}

interface ParseMeta {
  model: string;
  tokensUsed: number;
  callTimestamp: string;
}

// ---- constants ----

const LANGUAGES = ['Japanese', 'Korean', 'English'] as const;
type Language = (typeof LANGUAGES)[number];

const EXAMPLE_SENTENCES: Record<Language, string> = {
  Japanese: '私は雨の日曜日の午後にドゥームメタルを聴くのが好きです。',
  Korean: '저는 비 오는 일요일 오후에 둠 메탈을 듣는 것을 좋아해요。',
  English: 'I like listening to doom metal on rainy Sunday afternoons.',
};

const POS_COLORS: Record<string, string> = {
  '名詞': '#3B82F6',
  '動詞': '#22C55E',
  '形容詞': '#EAB308',
  '副詞': '#A855F7',
  '助詞': '#6B7280',
  '助動詞': '#EF4444',
  '接続詞': '#F97316',
};

const INITIAL_TREE: TreeNode = {
  type: 'sentence',
  value: '저는 비 오는 일요일 오후에 둠 메탈을 듣는 것을 좋아해요.',
  translation: 'I like listening to doom metal on rainy Sunday afternoons.',
  children: [
    {
      type: 'noun_phrase',
      value: '저는',
      translation: 'I (topic)',
      children: [
        { type: 'pronoun', value: '저', translation: 'I' },
        { type: 'particle', value: '는', translation: 'topic marker' },
      ],
    },
    {
      type: 'noun_phrase',
      value: '비 오는 일요일 오후에',
      translation: 'on rainy Sunday afternoons',
      children: [
        {
          type: 'noun_phrase',
          value: '비 오는 일요일',
          translation: 'rainy Sunday',
          children: [
            { type: 'noun', value: '비', translation: 'rain' },
            { type: 'verb', value: '오는', translation: 'coming' },
            { type: 'noun', value: '일요일', translation: 'Sunday' },
          ],
        },
        { type: 'noun', value: '오후', translation: 'afternoon' },
        { type: 'particle', value: '에', translation: 'at/on' },
      ],
    },
    {
      type: 'verb_phrase',
      value: '둠 메탈을 듣는',
      translation: 'listening to doom metal',
      children: [
        { type: 'noun', value: '둠 메탈', translation: 'doom metal' },
        { type: 'particle', value: '을', translation: 'object marker' },
        { type: 'verb', value: '듣는', translation: 'listening' },
      ],
    },
    {
      type: 'noun_phrase',
      value: '것을',
      translation: 'the act of',
      children: [
        { type: 'noun', value: '것', translation: 'thing / act' },
        { type: 'particle', value: '을', translation: 'object marker' },
      ],
    },
    {
      type: 'verb_phrase',
      value: '좋아해요',
      translation: 'like',
      children: [
        { type: 'verb', value: '좋아하다', translation: 'like' },
        { type: 'politeness_marker', value: '해요', translation: 'polite form' },
      ],
    },
  ],
};

// ---- page ----

export default function GrammarGraphPage() {
  const [sentence, setSentence] = useState('');
  const [language, setLanguage] = useState<Language>('Japanese');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [treeData, setTreeData] = useState<TreeNode>(INITIAL_TREE);
  const [parseMeta, setParseMeta] = useState<ParseMeta | null>(null);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [loadingTree, setLoadingTree] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tokens' | 'tree'>('tree');
  const [aiConfig, setAiConfig] = useState<AiConfig>({ provider: 'openai', apiKey: '', model: 'gpt-4o' });

  // Read URL params and init sentence on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const querySentence = params.get('sentence');
    const queryLanguage = params.get('language');

    let lang: Language = 'Japanese';
    if (queryLanguage) {
      const normalized =
        queryLanguage.charAt(0).toUpperCase() + queryLanguage.slice(1).toLowerCase();
      if (LANGUAGES.includes(normalized as Language)) lang = normalized as Language;
    }
    setLanguage(lang);
    setSentence(querySentence ?? EXAMPLE_SENTENCES[lang]);
  }, []);

  // Swap example sentence when language changes (only if current is still an example)
  useEffect(() => {
    const isExample = Object.values(EXAMPLE_SENTENCES).includes(sentence);
    if (isExample) setSentence(EXAMPLE_SENTENCES[language]);
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- handlers ----

  const handleAnalyzeTokens = async () => {
    if (!sentence.trim() || language !== 'Japanese') return;
    setLoadingTokens(true);
    try {
      const res = await fetch('/api/hanabira/text-parser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sentence }),
      });
      const data = await res.json() as { tokens?: Token[] };
      setTokens(data.tokens ?? []);
      setActiveTab('tokens');
    } finally {
      setLoadingTokens(false);
    }
  };

  const handleParseTree = async () => {
    if (!sentence.trim()) return;
    if (sentence.length > 100) {
      alert('Sentence cannot exceed 100 characters.');
      return;
    }
    setLoadingTree(true);
    try {
      const res = await fetch('/api/parse-tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence,
          language,
          apiKey: aiConfig.apiKey || undefined,
          provider: aiConfig.provider,
          model: aiConfig.model,
        }),
      });
      const data = await res.json() as {
        parseTree?: TreeNode;
        model?: string;
        tokensUsed?: number;
        callTimestamp?: string;
        error?: string;
      };
      if (data.error) throw new Error(data.error);
      if (data.parseTree) {
        setTreeData(data.parseTree);
        setParseMeta(
          data.model
            ? { model: data.model, tokensUsed: data.tokensUsed ?? 0, callTimestamp: data.callTimestamp ?? '' }
            : null
        );
        setActiveTab('tree');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Parse tree failed');
    } finally {
      setLoadingTree(false);
    }
  };

  const isLoading = loadingTokens || loadingTree;

  return (
    <div className="min-h-[100dvh] max-w-[100dvw] flex">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden pb-20 lg:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Header */}
          <h1 className="text-3xl font-bold mb-1 text-[var(--main-color)]">Grammar Graph</h1>
          <p className="text-[var(--secondary-color)] text-sm mb-6">
            Parse tree visualization and morphological analysis for Japanese, Korean, and English sentences.
            Inspired by{' '}
            <a
              href="https://mirinae.io"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-75 transition-opacity"
            >
              mirinae.io
            </a>
            .
          </p>

          <ApiKeyPanel onChange={setAiConfig} />

          {/* Disclaimer */}
          <div className="mb-6 rounded-xl border border-[var(--border-color)] overflow-hidden">
            <button
              onClick={() => setDisclaimerOpen((v) => !v)}
              className="w-full flex justify-between items-center px-4 py-3 bg-[var(--card-color)] text-[var(--main-color)] text-sm font-medium hover:opacity-80 transition-opacity"
            >
              <span>Disclaimer</span>
              <span className="text-[var(--secondary-color)]">{disclaimerOpen ? '▲' : '▼'}</span>
            </button>
            {disclaimerOpen && (
              <div className="px-4 py-3 bg-[var(--background-color)] border-t border-[var(--border-color)] text-sm text-[var(--secondary-color)]">
                The parse tree feature uses{' '}
                <strong className="text-[var(--main-color)]">{aiConfig.model}</strong> and may produce
                inaccurate results. AI-generated grammar analysis is a learning aid — always verify
                with authoritative sources. The kuromoji tokenizer (Japanese only) runs locally and
                is deterministic.
              </div>
            )}
          </div>

          {/* Input form */}
          <div className="mb-6 p-5 rounded-xl border border-[var(--border-color)] bg-[var(--card-color)]">
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--main-color)] mb-2">
                Sentence
                <span className="ml-2 text-xs font-normal text-[var(--secondary-color)]">
                  (max 100 characters for AI parse)
                </span>
              </label>
              <input
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) handleParseTree();
                }}
                placeholder="Enter a sentence..."
                maxLength={150}
                className="w-full border border-[var(--border-color)] rounded-lg px-4 py-2 bg-[var(--background-color)] text-[var(--main-color)] focus:outline-none focus:ring-2 focus:ring-[var(--main-color)] text-sm"
              />
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-[var(--main-color)] mb-2">Language</p>
              <div className="flex gap-5">
                {LANGUAGES.map((lang) => (
                  <label
                    key={lang}
                    className="flex items-center gap-2 text-sm text-[var(--main-color)] cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="language"
                      value={lang}
                      checked={language === lang}
                      onChange={() => setLanguage(lang)}
                      className="accent-[var(--main-color)]"
                    />
                    {lang}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleParseTree}
                disabled={isLoading || !sentence.trim()}
                className="px-5 py-2 rounded-lg bg-[var(--main-color)] text-[var(--background-color)] text-sm font-medium disabled:opacity-40 hover:opacity-85 transition-opacity"
              >
                {loadingTree ? 'Generating tree...' : 'AI Parse Tree'}
              </button>
              {language === 'Japanese' && (
                <button
                  onClick={handleAnalyzeTokens}
                  disabled={isLoading || !sentence.trim()}
                  className="px-5 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--background-color)] text-[var(--main-color)] text-sm font-medium disabled:opacity-40 hover:opacity-80 transition-opacity"
                >
                  {loadingTokens ? 'Analyzing...' : 'Morphology (kuromoji)'}
                </button>
              )}
            </div>
          </div>

          {/* Main content: tree/tokens + explanation side by side */}
          <div className="flex flex-col xl:flex-row gap-6">

            {/* Left: parse tree / tokens */}
            <div className="flex-1 min-w-0">
              {/* Tabs */}
              <div className="flex gap-1 mb-4">
                <button
                  onClick={() => setActiveTab('tree')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'tree'
                      ? 'bg-[var(--main-color)] text-[var(--background-color)]'
                      : 'text-[var(--secondary-color)] hover:text-[var(--main-color)]'
                  }`}
                >
                  Parse Tree
                </button>
                {tokens.length > 0 && (
                  <button
                    onClick={() => setActiveTab('tokens')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'tokens'
                        ? 'bg-[var(--main-color)] text-[var(--background-color)]'
                        : 'text-[var(--secondary-color)] hover:text-[var(--main-color)]'
                    }`}
                  >
                    Morphology
                  </button>
                )}
              </div>

              {/* Parse Tree view */}
              {activeTab === 'tree' && (
                <div>
                  <ParseTree data={treeData} />
                  {parseMeta && (
                    <div className="mt-3 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] text-xs text-[var(--secondary-color)]">
                      <span className="mr-4">Model: {parseMeta.model}</span>
                      <span className="mr-4">Tokens: {parseMeta.tokensUsed}</span>
                      <span>{parseMeta.callTimestamp}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Morphology / token view */}
              {activeTab === 'tokens' && tokens.length > 0 && (
                <div>
                  <div className="flex flex-wrap gap-3 p-5 rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] mb-4">
                    {tokens.map((t, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <span className="text-xs text-[var(--secondary-color)]">{t.reading}</span>
                        <span
                          className="px-3 py-1.5 rounded-lg text-white text-sm font-medium"
                          style={{ backgroundColor: POS_COLORS[t.pos] ?? '#9CA3AF' }}
                          title={`${t.pos} / ${t.basic_form}`}
                        >
                          {t.surface_form}
                        </span>
                        <span className="text-xs text-[var(--secondary-color)]">{t.pos}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(POS_COLORS).map(([pos, color]) => (
                      <span key={pos} className="flex items-center gap-1.5 text-xs text-[var(--secondary-color)]">
                        <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: color }} />
                        {pos}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: AI grammar explanation */}
            <div className="xl:w-[360px] shrink-0">
              <GrammarExplanation sentence={sentence} aiConfig={aiConfig} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
