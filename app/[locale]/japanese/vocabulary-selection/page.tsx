import Link from 'next/link';
import Sidebar from '@/shared/components/Menu/Sidebar';

export const metadata = {
  title: 'Japanese Vocabulary',
  description: 'Select a JLPT vocabulary set to study.',
};

const SETS = [
  { slug: 'JLPT_N5', label: 'JLPT N5', description: 'Essential N5 vocabulary' },
  { slug: 'JLPT_N4', label: 'JLPT N4', description: 'Core N4 vocabulary list' },
  { slug: 'JLPT_N3', label: 'JLPT N3', description: 'N3 tango verbs, adjectives and core vocab' },
  { slug: 'JLPT_N2', label: 'JLPT N2', description: 'Core N2 vocabulary list' },
  { slug: 'JLPT_N1', label: 'JLPT N1', description: 'Core N1 vocabulary list' },
  { slug: 'essential_600_verbs', label: '600 Essential Verbs', description: 'The most essential Japanese verbs' },
  { slug: 'suru_verbs', label: 'Suru Verbs', description: 'Japanese suru compound verbs' },
];

export default function VocabularySelectionPage() {
  return (
    <div className='min-h-[100dvh] max-w-[100dvw] flex'>
      <Sidebar />
      <main className='flex-1 min-w-0 overflow-x-hidden pb-20 lg:pb-0'>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Japanese Vocabulary</h1>
          <p className="text-[var(--secondary-color)] mb-8">Select a vocabulary set to study.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SETS.map(set => (
              <Link
                key={set.slug}
                href={`/japanese/vocabulary-selection/${set.slug}`}
                className="block border border-[var(--border-color)] rounded-lg p-6 hover:shadow-md bg-[var(--card-color)] transition-shadow"
              >
                <h2 className="text-xl font-semibold">{set.label}</h2>
                <p className="text-sm text-[var(--secondary-color)] mt-2">{set.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
