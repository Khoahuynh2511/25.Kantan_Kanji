import { Suspense } from 'react';
import GrammarTitles from '@/shared/components/hanabira/GrammarTitles';
import Link from 'next/link';

export const metadata = { title: 'Korean Grammar List' };

const LEVELS = ['KOREAN_1', 'KOREAN_2', 'KOREAN_3', 'KOREAN_4', 'KOREAN_5', 'KOREAN_6'] as const;

interface PageProps {
  searchParams: Promise<{ level?: string }>;
}

export default async function KoreanGrammarListPage({ searchParams }: PageProps) {
  const { level } = await searchParams;
  const activeLevel = (LEVELS as readonly string[]).includes(level ?? '') ? level! : 'KOREAN_1';

  return (
    <main className="min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 pt-8">
        <h1 className="text-3xl font-bold mb-2">Korean Grammar</h1>
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
        <GrammarTitles lang="Korean" pTag={activeLevel} slugBase={`/langs/korean/grammarpoint?level=${activeLevel}&slug=`} />
      </Suspense>
    </main>
  );
}
