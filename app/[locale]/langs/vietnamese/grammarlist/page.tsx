import { Suspense } from 'react';
import GrammarTitles from '@/shared/components/hanabira/GrammarTitles';

export const metadata = {
  title: 'Vietnamese Grammar List',
  description: 'Vietnamese grammar points and explanations.',
};

export default function VietnameseGrammarListPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<div className="p-8 text-center text-[var(--secondary-color)]">Loading...</div>}>
        <GrammarTitles lang="Vietnamese" pTag="VN" slugBase="/langs/vietnamese/grammarpoint" />
      </Suspense>
    </main>
  );
}
