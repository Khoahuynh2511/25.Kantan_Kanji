import { Suspense } from 'react';
import GrammarTitles from '@/shared/components/hanabira/GrammarTitles';
import Link from 'next/link';
import Sidebar from '@/shared/components/Menu/Sidebar';

export const metadata = {
  title: 'Japanese Grammar List',
  description: 'JLPT Japanese grammar points N1 to N5.',
};

const LEVELS = ['JLPT_N5', 'JLPT_N4', 'JLPT_N3', 'JLPT_N2', 'JLPT_N1'] as const;

const LEVEL_META: Record<string, { label: string; color: string; desc: string }> = {
  JLPT_N5: { label: 'N5', color: 'bg-blue-500', desc: 'Beginner — essential patterns for daily conversations' },
  JLPT_N4: { label: 'N4', color: 'bg-green-500', desc: 'Elementary — expanding sentence structures' },
  JLPT_N3: { label: 'N3', color: 'bg-yellow-500', desc: 'Intermediate — natural expression and nuance' },
  JLPT_N2: { label: 'N2', color: 'bg-orange-500', desc: 'Upper-intermediate — complex and formal patterns' },
  JLPT_N1: { label: 'N1', color: 'bg-red-500', desc: 'Advanced — literary and sophisticated usage' },
};

interface GrammarListPageProps {
  searchParams: Promise<{ level?: string }>;
}

export default async function JapaneseGrammarListPage({ searchParams }: GrammarListPageProps) {
  const { level } = await searchParams;
  const activeLevel = (LEVELS as readonly string[]).includes(level ?? '') ? level! : 'JLPT_N5';
  const meta = LEVEL_META[activeLevel];

  return (
    <div className="min-h-[100dvh] max-w-[100dvw] flex">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden pb-20 lg:pb-0">

        {/* Hero header */}
        <div className="border-b border-[var(--border-color)] bg-[var(--card-color)]">
          <div className="max-w-screen-xl mx-auto px-4 py-8">
            <div className="flex items-start gap-4">
              <div className={`shrink-0 w-14 h-14 rounded-2xl ${meta.color} flex items-center justify-center shadow-lg`}>
                <span className="text-white text-2xl font-bold">{meta.label}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Japanese Grammar</h1>
                <p className="text-[var(--secondary-color)] text-sm">{meta.desc}</p>
              </div>
            </div>

            {/* Level tabs */}
            <div className="flex gap-2 mt-6 flex-wrap">
              {LEVELS.map(lvl => {
                const m = LEVEL_META[lvl];
                const isActive = activeLevel === lvl;
                return (
                  <Link
                    key={lvl}
                    href={`?level=${lvl}`}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                      isActive
                        ? 'border-transparent text-white shadow-md'
                        : 'border-[var(--border-color)] text-[var(--secondary-color)] hover:text-[var(--text-color)] hover:bg-[var(--card-color)] bg-transparent'
                    }`}
                    style={isActive ? { background: `var(--main-color)` } : {}}
                  >
                    <span className={`w-2 h-2 rounded-full ${m.color}`} />
                    {m.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grammar list */}
        <div className="pt-6">
          <Suspense fallback={
            <div className="max-w-screen-xl mx-auto px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] animate-pulse" />
                ))}
              </div>
            </div>
          }>
            <GrammarTitles
              lang="Japanese"
              pTag={activeLevel}
              slugBase="/japanese/grammarpoint"
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
