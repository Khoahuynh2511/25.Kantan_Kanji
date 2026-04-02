'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { buildKanjiHref } from '@/features/KanjiMap/lib/kanji-routing';

export interface RadicalEntry {
  number: string;
  radical: string;
  strokes: string;
  original: string;
  category: string;
  meaning: string;
  readingJapanese: string;
  readingRomanized: string;
  positionJapanese: string;
  positionRomanized: string;
  frequency: string;
  alternatives: string[];
}

interface Props {
  radicals: RadicalEntry[];
  navigableIds: string[];
}

export default function RadicalsContent({ radicals, navigableIds }: Props) {
  const [search, setSearch] = useState('');
  const [selectedStrokes, setSelectedStrokes] = useState<string | null>(null);

  const navigableSet = useMemo(() => new Set(navigableIds), [navigableIds]);

  const strokeCounts = useMemo(() => {
    const counts = Array.from(new Set(radicals.map(r => r.strokes)))
      .sort((a, b) => Number(a) - Number(b));
    return counts;
  }, [radicals]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return radicals.filter(r => {
      if (selectedStrokes && r.strokes !== selectedStrokes) return false;
      if (!q) return true;
      return (
        r.radical.includes(q) ||
        r.meaning.toLowerCase().includes(q) ||
        r.readingJapanese.includes(q) ||
        r.readingRomanized.toLowerCase().includes(q) ||
        r.alternatives.some(a => a.includes(q))
      );
    });
  }, [radicals, search, selectedStrokes]);

  return (
    <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border-color)]">
        <h1 className="text-2xl font-bold mb-1">Kanji Radicals</h1>
        <p className="text-sm text-[var(--secondary-color)] max-w-2xl">
          The 214 Kangxi radicals are the building blocks of kanji. Learning them helps break down complex characters into recognizable parts.
        </p>
      </div>

      <div className="px-6 py-3 border-b border-[var(--border-color)] flex flex-col gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by radical, meaning, or reading..."
          className="w-full max-w-sm px-3 py-1.5 text-sm rounded border border-[var(--border-color)] bg-[var(--card-color)] text-[var(--text-color)] outline-none focus:border-[var(--main-color)]"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedStrokes(null)}
            className={`px-3 py-0.5 text-xs rounded border transition-colors ${
              selectedStrokes === null
                ? 'bg-[var(--main-color)] text-[var(--background-color)] border-[var(--main-color)]'
                : 'border-[var(--border-color)] text-[var(--secondary-color)] hover:bg-[var(--card-color)]'
            }`}
          >
            All
          </button>
          {strokeCounts.map(s => (
            <button
              key={s}
              onClick={() => setSelectedStrokes(s === selectedStrokes ? null : s)}
              className={`px-3 py-0.5 text-xs rounded border transition-colors ${
                selectedStrokes === s
                  ? 'bg-[var(--main-color)] text-[var(--background-color)] border-[var(--main-color)]'
                  : 'border-[var(--border-color)] text-[var(--secondary-color)] hover:bg-[var(--card-color)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <p className="text-xs text-[var(--secondary-color)] mb-3">{filtered.length} radicals</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map(r => {
            const isNavigable = navigableSet.has(r.radical);
            const cardContent = (
              <>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-[var(--secondary-color)]">#{r.number}</span>
                  <span className="text-xs text-[var(--secondary-color)]">{r.strokes}s</span>
                </div>
                <div className="text-4xl text-center leading-none my-2">{r.radical}</div>
                {r.alternatives.filter(Boolean).length > 0 && (
                  <div className="text-center text-sm text-[var(--secondary-color)] mb-1">
                    {r.alternatives.filter(Boolean).join(' ')}
                  </div>
                )}
                <div className="text-center text-sm font-medium leading-snug">{r.meaning}</div>
                <div className="text-center text-xs text-[var(--secondary-color)] mt-1">
                  {r.readingJapanese}
                </div>
                {r.readingRomanized && (
                  <div className="text-center text-xs text-[var(--secondary-color)]">
                    {r.readingRomanized}
                  </div>
                )}
                {r.frequency && (
                  <div className="text-center text-xs text-[var(--secondary-color)] mt-1">
                    freq: {r.frequency}
                  </div>
                )}
              </>
            );

            const className =
              'relative flex flex-col p-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] transition-all duration-200 ' +
              (isNavigable
                ? 'hover:border-[var(--main-color)] hover:shadow-sm cursor-pointer'
                : '');

            if (isNavigable) {
              return (
                <Link key={r.number} href={buildKanjiHref(r.radical)} className={className}>
                  {cardContent}
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--main-color)]" />
                </Link>
              );
            }

            return (
              <div key={r.number} className={className}>
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
