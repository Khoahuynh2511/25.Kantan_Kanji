import Link from 'next/link';

export const metadata = {
  title: 'About',
  description: 'About KanjiKantan — a free, open-source Japanese learning platform.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">About KanjiKantan</h1>
        <p className="text-[var(--secondary-color)] text-lg mb-8">
          A free, open-source Japanese learning platform.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">What We Offer</h2>
          <ul className="space-y-2 text-[var(--secondary-color)]">
            <li>Kanji study with spaced repetition and kanji map visualization</li>
            <li>Kana learning with interactive training modes</li>
            <li>JLPT vocabulary (N1–N5) with audio</li>
            <li>Japanese grammar points (JLPT N1–N5)</li>
            <li>Reading comprehension stories (JLPT N3)</li>
            <li>Japanese text parser powered by kuromoji</li>
            <li>Grammar resources for Korean, Mandarin (HSK), Vietnamese, and Thai</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Open Source</h2>
          <p className="text-[var(--secondary-color)]">
            KanjiKantan is open source. We welcome contributions from developers, 
            language teachers, and learners.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Get Started</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/kanji" className="px-4 py-2 rounded bg-[var(--main-color)] text-[var(--background-color)] text-sm hover:opacity-90 transition-opacity">
              Study Kanji
            </Link>
            <Link href="/japanese/grammarlist" className="px-4 py-2 rounded border border-[var(--border-color)] text-sm hover:bg-[var(--card-color)] transition-colors">
              Grammar
            </Link>
            <Link href="/reading" className="px-4 py-2 rounded border border-[var(--border-color)] text-sm hover:bg-[var(--card-color)] transition-colors">
              Reading Practice
            </Link>
            <Link href="/text-parser" className="px-4 py-2 rounded border border-[var(--border-color)] text-sm hover:bg-[var(--card-color)] transition-colors">
              Text Parser
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
