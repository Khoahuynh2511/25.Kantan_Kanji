import GrammarPoint from '@/shared/components/hanabira/GrammarPoint';
import Sidebar from '@/shared/components/Menu/Sidebar';

interface GrammarPointPageProps {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ level?: string }>;
}

export default async function JapaneseGrammarPointPage({
  params,
  searchParams,
}: GrammarPointPageProps) {
  const { slug } = await params;
  const { level } = await searchParams;
  const pTag = level ?? 'JLPT_N5';

  return (
    <div className='min-h-[100dvh] max-w-[100dvw] flex'>
      <Sidebar />
      <main className='flex-1 min-w-0 overflow-x-hidden pb-20 lg:pb-0'>
        <GrammarPoint
          pTag={pTag}
          title={slug}
          lang="Japanese"
          listHref={`/japanese/grammarlist?level=${pTag}`}
        />
      </main>
    </div>
  );
}
