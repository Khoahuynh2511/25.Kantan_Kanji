'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import PlayAudioButton from './PlayAudioButton';
import GrammarBreadcrumb from './GrammarBreadcrumb';

interface GrammarExample {
  jp: string;
  romaji: string;
  en: string;
  grammar_audio?: string;
}

interface GrammarData {
  title: string;
  short_explanation: string;
  long_explanation: string;
  formation: string;
  examples: GrammarExample[];
  p_tag: string;
}

interface GrammarPointProps {
  pTag: string;
  title: string;
  lang: string;
  listHref: string;
}

function Skeleton() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-8 animate-pulse space-y-4">
      <div className="h-4 w-32 bg-[var(--border-color)] rounded" />
      <div className="h-8 w-3/4 bg-[var(--border-color)] rounded mt-4" />
      <div className="h-4 w-full bg-[var(--border-color)] rounded" />
      <div className="h-4 w-5/6 bg-[var(--border-color)] rounded" />
      <div className="h-20 bg-[var(--border-color)] rounded-xl mt-6" />
      <div className="h-32 bg-[var(--border-color)] rounded-xl" />
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 bg-[var(--border-color)] rounded-xl" />
      ))}
    </div>
  );
}

export default function GrammarPoint({ pTag, title, lang, listHref }: GrammarPointProps) {
  const [data, setData] = useState<GrammarData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const decodedTitle = decodeURIComponent(title).replace(/-/g, '/');
    fetch(`/api/hanabira/grammar?p_tag=${pTag}&title=${encodeURIComponent(decodedTitle)}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
        if (d && !('error' in d)) {
          try {
            const raw = localStorage.getItem('grammar_visited');
            const visited: string[] = raw ? JSON.parse(raw) : [];
            if (!visited.includes(d.title)) {
              visited.push(d.title);
              localStorage.setItem('grammar_visited', JSON.stringify(visited));
            }
          } catch {}
        }
      })
      .catch(() => setLoading(false));
  }, [pTag, title]);

  if (loading) return <Skeleton />;
  if (!data || 'error' in (data as object)) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-16 text-center">
        <p className="text-4xl mb-4">404</p>
        <p className="text-[var(--secondary-color)] mb-6">Grammar point not found.</p>
        <Link href={listHref} className="text-[var(--main-color)] underline">Back to list</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <GrammarBreadcrumb lang={lang} pTag={pTag} title={data.title} listHref={listHref} />

      <article className="px-4 sm:px-6 py-6 space-y-8">

        {/* Header */}
        <header>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--card-color)] border border-[var(--border-color)] text-[var(--secondary-color)]">
              {pTag}
            </span>
            <span className="text-xs text-[var(--secondary-color)]">{lang}</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-3">{data.title}</h1>
          <p className="text-[var(--secondary-color)] leading-relaxed border-l-4 border-[var(--main-color)] pl-3">
            {data.short_explanation}
          </p>
        </header>

        {/* Formation */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--secondary-color)] mb-3">
            Formation
          </h2>
          <div className="relative rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--main-color)] rounded-l-xl" />
            <pre className="pl-5 pr-4 py-4 text-sm font-mono whitespace-pre-wrap break-words text-[var(--text-color)]">
              {data.formation}
            </pre>
          </div>
        </section>

        {/* Explanation */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--secondary-color)] mb-3">
            Explanation
          </h2>
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] px-5 py-4">
            <div className="prose prose-sm max-w-none text-[var(--text-color)] prose-p:text-[var(--text-color)] prose-strong:text-[var(--text-color)]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {data.long_explanation}
              </ReactMarkdown>
            </div>
          </div>
        </section>

        {/* Examples */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--secondary-color)] mb-3">
            Examples ({data.examples.length})
          </h2>
          <div className="space-y-3">
            {data.examples.map((ex, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] overflow-hidden"
              >
                {/* Number bar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)]">
                  <span className="text-xs font-mono text-[var(--secondary-color)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {ex.grammar_audio && (
                    <PlayAudioButton audioSrc={ex.grammar_audio} />
                  )}
                </div>

                <div className="px-4 py-3 space-y-1">
                  <p className="text-lg font-medium text-[var(--text-color)]">{ex.jp}</p>
                  <p className="text-sm text-[var(--secondary-color)] italic">{ex.romaji}</p>
                  <p className="text-sm text-[var(--secondary-color)]">{ex.en}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer nav */}
        <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)]">
          <Link
            href={listHref}
            className="text-sm text-[var(--secondary-color)] hover:text-[var(--text-color)] transition-colors"
          >
            ← Back to {pTag} list
          </Link>
        </div>
      </article>
    </div>
  );
}
