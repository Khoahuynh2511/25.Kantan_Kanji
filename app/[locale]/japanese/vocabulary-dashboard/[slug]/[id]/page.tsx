import VocabularyDashboard from '@/shared/components/hanabira/VocabularyDashboard';

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function VocabularyDashboardPage({ params }: PageProps) {
  const { slug, id } = await params;
  return (
    <main className="min-h-screen">
      <VocabularyDashboard pTag={slug} sTag={id} />
    </main>
  );
}
