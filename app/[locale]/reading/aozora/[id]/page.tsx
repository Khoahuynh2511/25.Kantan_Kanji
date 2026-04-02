import AozoraReader from '@/shared/components/hanabira/AozoraReader';
import Sidebar from '@/shared/components/Menu/Sidebar';

interface AozoraReaderPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function AozoraReaderPage({ params }: AozoraReaderPageProps) {
  const { id } = await params;
  return (
    <div className="min-h-[100dvh] max-w-[100dvw] flex">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden pb-20 lg:pb-0">
        <AozoraReader bookId={id} />
      </main>
    </div>
  );
}
