import GrammarPoint from '@/shared/components/hanabira/GrammarPoint';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function VietnameseGrammarPointPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <main className="min-h-screen">
      <GrammarPoint pTag="VN" title={slug} lang="Vietnamese" listHref="/langs/vietnamese/grammarlist" />
    </main>
  );
}
