import KanjiDashboard from '@/shared/components/hanabira/KanjiDashboard';
import Link from 'next/link';
import Sidebar from '@/shared/components/Menu/Sidebar';

export const metadata = {
  title: 'Quick Kanji',
  description: 'Study JLPT kanji with readings, example words, and audio.',
};

const LEVELS = ['JLPT_N5', 'JLPT_N4', 'JLPT_N3'] as const;

interface QuickKanjiPageProps {
  searchParams: Promise<{ level?: string }>;
}

export default async function QuickKanjiPage({ searchParams }: QuickKanjiPageProps) {
  const { level } = await searchParams;
  const activeLevel = (LEVELS as readonly string[]).includes(level ?? '') ? level! : 'JLPT_N5';

  return (
    <div className='min-h-[100dvh] max-w-[100dvw] flex'>
      <Sidebar />
      <main className='flex-1 min-w-0 overflow-x-hidden pb-20 lg:pb-0'>
        <div className="max-w-screen-xl mx-auto px-4 pt-8">
          <h1 className="text-3xl font-bold mb-2">Quick Kanji</h1>
          <p className="text-[var(--secondary-color)] mb-6">Study kanji with readings, example words, and audio.</p>

          <div className="flex gap-2 mb-6 flex-wrap">
            {LEVELS.map(lvl => (
              <Link
                key={lvl}
                href={`?level=${lvl}`}
                className={`px-4 py-2 rounded border transition-colors text-sm ${
                  activeLevel === lvl
                    ? 'bg-[var(--main-color)] text-[var(--background-color)] border-[var(--main-color)]'
                    : 'border-[var(--border-color)] hover:bg-[var(--card-color)]'
                }`}
              >
                {lvl.replace('JLPT_', '')}
              </Link>
            ))}
          </div>
        </div>
        <KanjiDashboard pTag={activeLevel} />
      </main>
    </div>
  );
}
