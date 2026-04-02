'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import PlayAudioButton from './PlayAudioButton';

interface VocabItem {
  vocabulary_original: string;
  vocabulary_simplified: string;
  vocabulary_english: string;
  vocabulary_audio: string;
  p_tag: string;
  s_tag: string;
}

const VOCAB_SETS: Record<string, number[]> = {
  JLPT_N5: [100, 200, 300, 400, 500, 600, 700],
  JLPT_N4: [100, 200, 300, 400, 500, 600, 700],
  JLPT_N3: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900],
  JLPT_N2: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900],
  JLPT_N1: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500],
};

const JLPT_LEVELS = ['JLPT_N5', 'JLPT_N4', 'JLPT_N3', 'JLPT_N2', 'JLPT_N1'];

interface VocabCardProps {
  item: VocabItem;
  showReadings: boolean;
}

function VocabCard({ item, showReadings }: VocabCardProps) {
  const [flipped, setFlipped] = useState(false);

  const handleClick = () => {
    setFlipped(f => !f);
  };

  return (
    <div
      className="relative w-44 h-44 cursor-pointer select-none mt-2"
      onClick={handleClick}
    >
      {/* Front */}
      <div
        className={`absolute inset-0 rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] flex flex-col items-center justify-center p-3 transition-opacity duration-150 ${
          flipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {showReadings && (
          <p className="text-xs text-[var(--secondary-color)] mb-1">{item.vocabulary_simplified}</p>
        )}
        <p className="text-4xl font-bold text-[var(--text-color)]">{item.vocabulary_original}</p>
      </div>

      {/* Back */}
      <div
        className={`absolute inset-0 rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] flex flex-col items-center justify-center p-3 gap-1 transition-opacity duration-150 ${
          flipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <p className="text-xs text-[var(--secondary-color)]">{item.vocabulary_simplified}</p>
        <p className="text-2xl font-bold text-[var(--text-color)]">{item.vocabulary_original}</p>
        <p className="text-sm text-center text-[var(--secondary-color)] line-clamp-3">{item.vocabulary_english}</p>
        <div className="flex items-center gap-2 mt-1" onClick={e => e.stopPropagation()}>
          {item.vocabulary_audio && <PlayAudioButton audioSrc={item.vocabulary_audio} />}
          <Link
            href={`https://www.japandict.com/?s=${encodeURIComponent(item.vocabulary_original)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline"
          >
            dict
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VocabDashboard() {
  const [level, setLevel] = useState<string>('JLPT_N3');
  const [chunk, setChunk] = useState<number>(100);
  const [showReadings, setShowReadings] = useState(false);
  const [items, setItems] = useState<VocabItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLevel = localStorage.getItem('qv_level');
    const savedChunk = localStorage.getItem('qv_chunk');
    if (savedLevel && VOCAB_SETS[savedLevel]) setLevel(savedLevel);
    if (savedChunk) setChunk(parseInt(savedChunk, 10));
  }, []);

  const chunks = useMemo(() => VOCAB_SETS[level] ?? [], [level]);

  // If chunk not in current level's list, reset to first
  useEffect(() => {
    if (!chunks.includes(chunk)) {
      setChunk(chunks[0] ?? 100);
    }
  }, [level, chunks, chunk]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('qv_level', level);
    localStorage.setItem('qv_chunk', chunk.toString());
  }, [level, chunk, mounted]);

  useEffect(() => {
    if (!mounted) return;
    setLoading(true);
    setItems([]);
    fetch(`/api/hanabira/vocabulary?p_tag=${level}&s_tag=${chunk}&limit=200`)
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d.items) ? d.items : []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [level, chunk, mounted]);

  if (!mounted) return null;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      {/* JLPT level tabs */}
      <div className="flex gap-1 border-b border-[var(--border-color)] overflow-x-auto pb-0">
        {JLPT_LEVELS.map(lvl => (
          <button
            key={lvl}
            onClick={() => setLevel(lvl)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              level === lvl
                ? 'border-[var(--main-color)] text-[var(--main-color)]'
                : 'border-transparent text-[var(--secondary-color)] hover:text-[var(--text-color)]'
            }`}
          >
            {lvl.replace('JLPT_', '')}
          </button>
        ))}
      </div>

      {/* Chunk tabs */}
      <div className="flex flex-wrap gap-1 py-2 border-b border-[var(--border-color)]">
        {chunks.map(c => (
          <button
            key={c}
            onClick={() => setChunk(c)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              chunk === c
                ? 'bg-[var(--main-color)] text-[var(--background-color)]'
                : 'border border-[var(--border-color)] text-[var(--secondary-color)] hover:bg-[var(--card-color)]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between py-3">
        <p className="text-sm text-[var(--secondary-color)]">
          {loading ? 'Loading...' : `${items.length} words — click card to reveal`}
        </p>
        <button
          onClick={() => setShowReadings(s => !s)}
          className="text-sm text-[var(--secondary-color)] hover:text-[var(--text-color)] border border-[var(--border-color)] px-3 py-1 rounded transition-colors"
        >
          {showReadings ? 'Hide readings' : 'Show readings'}
        </button>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="py-12 text-center text-[var(--secondary-color)]">Loading...</div>
      ) : (
        <div className="flex flex-wrap justify-center gap-4">
          {items.map((item, i) => (
            <VocabCard key={i} item={item} showReadings={showReadings} />
          ))}
        </div>
      )}
    </div>
  );
}
