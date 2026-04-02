import Link from 'next/link';
import { readReadingSummaries, type ReadingSummary } from '@/shared/lib/hanabira/readingData';

export default async function ReadingCards() {
  let readings: ReadingSummary[] = [];

  try {
    readings = readReadingSummaries();
  } catch {
    return <p className="text-red-500">Failed to load readings.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {readings.map(card => (
        <Link
          key={card.key}
          href={`/reading/${card.key}`}
          className="block border border-[var(--border-color)] rounded-lg p-4 hover:shadow-md bg-[var(--card-color)] transition-shadow"
        >
          <h2 className="text-lg font-semibold">{card.title}</h2>
          <p className="text-sm text-[var(--secondary-color)]">{card.titleRomaji}</p>
          <p className="text-sm text-[var(--secondary-color)]">({card.titleJp})</p>
          <p className="text-sm mt-2 text-[var(--secondary-color)]">{card.shortDescription}</p>
          <span className="inline-block mt-3 text-xs px-2 py-0.5 rounded bg-[var(--border-color)]">
            {card.p_tag}
          </span>
        </Link>
      ))}
    </div>
  );
}
