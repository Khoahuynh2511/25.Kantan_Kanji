'use client';

import { useEffect, useState } from 'react';
import PlayAudioButton from './PlayAudioButton';

interface VocabItem {
  vocabulary_original: string;
  vocabulary_simplified: string;
  vocabulary_english: string;
  word_type: string;
  vocabulary_audio: string;
  p_tag: string;
  s_tag: string;
}

interface SentenceItem {
  target_word?: string;
  japanese?: string;
  romaji?: string;
  english?: string;
  audio?: string;
}

interface VocabularyDashboardProps {
  pTag: string;
  sTag: string;
}

export default function VocabularyDashboard({ pTag, sTag }: VocabularyDashboardProps) {
  const [items, setItems] = useState<VocabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<VocabItem | null>(null);

  useEffect(() => {
    fetch(`/api/hanabira/vocabulary?p_tag=${pTag}&s_tag=${sTag}&limit=100`)
      .then(r => r.json())
      .then(d => { setItems(d.items ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [pTag, sTag]);

  if (loading) return <div className="p-8 text-center text-[var(--secondary-color)]">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{pTag}</h1>
      <p className="text-[var(--secondary-color)] mb-6">Section: {sTag} — {items.length} words</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => setSelected(selected?.vocabulary_original === item.vocabulary_original ? null : item)}
            className="border border-[var(--border-color)] rounded-lg p-4 cursor-pointer hover:bg-[var(--card-color)] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-bold">{item.vocabulary_original}</span>
                <span className="text-sm text-[var(--secondary-color)] ml-2">{item.vocabulary_simplified}</span>
              </div>
              {item.vocabulary_audio && (
                <PlayAudioButton audioSrc={item.vocabulary_audio} />
              )}
            </div>
            <p className="text-sm text-[var(--secondary-color)] mt-1">{item.vocabulary_english}</p>
            {item.word_type && item.word_type !== 'nan' && (
              <span className="text-xs px-2 py-0.5 rounded bg-[var(--border-color)] mt-2 inline-block">
                {item.word_type}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
