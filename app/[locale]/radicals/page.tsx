import type { Metadata } from 'next';
import Sidebar from '@/shared/components/Menu/Sidebar';
import RadicalsContent from '@/features/Radicals/components/RadicalsContent';
import { getNavigableRadicalIds } from '@/features/KanjiMap/lib';
import radicallist from '@/data/radicallist.json';

export const metadata: Metadata = {
  title: 'Radicals',
  description: 'Browse and learn the 214 Kangxi kanji radicals with readings, meanings, and stroke counts.',
};

export default function RadicalsPage() {
  const navigableIds = getNavigableRadicalIds();

  return (
    <div className="min-h-[100dvh] max-w-[100dvw] flex">
      <Sidebar />
      <RadicalsContent radicals={radicallist as any} navigableIds={navigableIds} />
    </div>
  );
}
