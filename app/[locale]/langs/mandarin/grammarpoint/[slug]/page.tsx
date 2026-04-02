import GrammarPoint from '@/shared/components/hanabira/GrammarPoint';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ level?: string }>;
}

export default async function MandarinGrammarPointPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { level } = await searchParams;
  const pTag = level ?? 'HSK_1';
  return (
    <main className="min-h-screen">
      <GrammarPoint pTag={pTag} title={slug} lang="Mandarin" listHref={`/langs/mandarin/grammarlist?level=${pTag}`} />
    </main>
  );
}
