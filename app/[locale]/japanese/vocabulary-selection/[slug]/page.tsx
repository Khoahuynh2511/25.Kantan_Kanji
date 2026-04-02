import Link from 'next/link';
import Sidebar from '@/shared/components/Menu/Sidebar';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const VOCAB_SETS: Record<string, { label: string; sections: { id: string; label: string }[] }> = {
  JLPT_N5: { label: 'JLPT N5', sections: [{ id: '100', label: 'Core N5 Vocabulary' }] },
  JLPT_N4: { label: 'JLPT N4', sections: [{ id: '100', label: 'Core N4 Vocabulary' }] },
  JLPT_N3: {
    label: 'JLPT N3',
    sections: [
      { id: '100', label: 'Core N3 Vocabulary' },
      { id: 'verbs', label: 'N3 Tango Verbs' },
      { id: 'i-adjectives', label: 'N3 I-Adjectives' },
      { id: 'na-adjectives', label: 'N3 Na-Adjectives' },
    ],
  },
  JLPT_N2: { label: 'JLPT N2', sections: [{ id: '100', label: 'Core N2 Vocabulary' }] },
  JLPT_N1: { label: 'JLPT N1', sections: [{ id: '100', label: 'Core N1 Vocabulary' }] },
  essential_600_verbs: { label: '600 Essential Verbs', sections: [{ id: 'all', label: 'All 600 Verbs' }] },
  suru_verbs: { label: 'Suru Verbs', sections: [{ id: 'all', label: 'All Suru Verbs' }] },
};

export default async function VocabularySelectionPage({ params }: PageProps) {
  const { slug } = await params;
  const set = VOCAB_SETS[slug];

  if (!set) {
    return (
      <div className='min-h-[100dvh] max-w-[100dvw] flex'>
        <Sidebar />
        <main className='flex-1 min-w-0 p-8'>
          <h1 className="text-2xl font-bold">Vocabulary set not found: {slug}</h1>
          <Link href="/japanese/vocabulary-selection" className="text-[var(--main-color)] underline mt-4 inline-block">
            Back to vocabulary sets
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-[100dvh] max-w-[100dvw] flex'>
      <Sidebar />
      <main className='flex-1 min-w-0 overflow-x-hidden pb-20 lg:pb-0'>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/japanese/vocabulary-selection" className="text-sm text-[var(--secondary-color)] hover:underline mb-4 inline-block">
            All vocabulary sets
          </Link>
          <h1 className="text-3xl font-bold mb-6">{set.label}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {set.sections.map(section => (
              <Link
                key={section.id}
                href={`/japanese/vocabulary-dashboard/${slug}/${section.id}`}
                className="block border border-[var(--border-color)] rounded-lg p-6 hover:shadow-md bg-[var(--card-color)] transition-shadow"
              >
                <h2 className="text-lg font-semibold">{section.label}</h2>
                <p className="text-sm text-[var(--secondary-color)] mt-1">Click to study this section</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
