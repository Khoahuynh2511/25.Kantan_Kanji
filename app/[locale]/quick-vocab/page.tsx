import VocabDashboard from '@/shared/components/hanabira/VocabDashboard';
import Sidebar from '@/shared/components/Menu/Sidebar';

export const metadata = {
  title: 'Quick Vocab',
  description: 'Review JLPT N5-N1 vocabulary with flip cards.',
};

export default function QuickVocabPage() {
  return (
    <div className="min-h-[100dvh] max-w-[100dvw] flex">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden pb-20 lg:pb-0">
        <div className="max-w-screen-xl mx-auto px-4 pt-8 pb-2">
          <h1 className="text-3xl font-bold mb-2">Quick Vocab</h1>
          <p className="text-[var(--secondary-color)]">
            Review JLPT N5–N1 vocabulary. Click a card to reveal the reading and meaning.
          </p>
        </div>
        <VocabDashboard />
      </main>
    </div>
  );
}
