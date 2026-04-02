import { Suspense } from 'react';
import ReadingCards from '@/shared/components/hanabira/ReadingCards';
import AozoraLibrary from '@/shared/components/hanabira/AozoraLibrary';
import Sidebar from '@/shared/components/Menu/Sidebar';
import ReadingTabs from '@/shared/components/hanabira/ReadingTabs';

export const metadata = {
  title: 'Reading Practice',
  description: 'Practice Japanese reading with JLPT stories and classic Aozora Bunko literature.',
};

export default function ReadingPage() {
  return (
    <div className="min-h-[100dvh] max-w-[100dvw] flex">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden pb-20 lg:pb-0">
        <div className="max-w-screen-xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Reading Practice</h1>
          <p className="text-[var(--secondary-color)] mb-6">
            JLPT stories with word lookup and TTS, plus classic Japanese literature from Aozora Bunko.
          </p>
          <ReadingTabs
            jlptContent={
              <Suspense fallback={<div className="p-8 text-center text-[var(--secondary-color)]">Loading stories...</div>}>
                <ReadingCards />
              </Suspense>
            }
            aozoraContent={<AozoraLibrary />}
          />
        </div>
      </main>
    </div>
  );
}
