import { Suspense } from 'react';
import GrammarTitles from '@/shared/components/hanabira/GrammarTitles';
import Link from 'next/link';

export const metadata = { title: 'Thai Grammar List' };

const LEVELS = ['TH_1', 'TH_2', 'TH_3', 'TH_4', 'TH_5'] as const;

interface PageProps { searchParams: Promise<{ level?: string }> }

export default async function ThaiGrammarListPage({ searchParams }: PageProps) {
  const { level } = await searchParams;
  const activeLevel = (LEVELS as readonly string[]).includes(level ?? '') ? level! : 'TH_1';
  return (
    <main className="min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 pt-8">
        <h1 className="text-3xl font-bold mb-2">Thai Grammar</h1>
        <div className="flex gap-2 mb-2 flex-wrap">
          {LEVELS.map(lvl => (
            <Link key={lvl} href={`?level=${lvl}`}
              className={`px-4 py-2 rounded border transition-colors text-sm ${activeLevel === lvl ? 'bg-[var(--main-color)] text-[var(--background-color)] border-[var(--main-color)]' : 'border-[var(--border-color)] hover:bg-[var(--card-color)]'}`}>
              {lvl}
            </Link>
          ))}
        </div>
      </div>
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <GrammarTitles lang="Thai" pTag={activeLevel} slugBase={`/langs/thai/grammarpoint`} />
      </Suspense>
    </main>
  );
}
