import ReadingComponent from '@/shared/components/hanabira/ReadingComponent';
import Sidebar from '@/shared/components/Menu/Sidebar';

interface ReadingStoryPageProps {
  params: Promise<{ key: string; locale: string }>;
}

export default async function ReadingStoryPage({ params }: ReadingStoryPageProps) {
  const { key } = await params;
  return (
    <div className='min-h-[100dvh] max-w-[100dvw] flex'>
      <Sidebar />
      <main className='flex-1 min-w-0 overflow-x-hidden pb-20 lg:pb-0'>
        <ReadingComponent readingKey={key} />
      </main>
    </div>
  );
}
