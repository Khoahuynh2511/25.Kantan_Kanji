'use client';

import { useEffect, useState } from 'react';
import PlayAudioButton from './PlayAudioButton';

interface KanjiItem {
  kanji: string;
  reading: string;
  k_audio: string;
  exampleWord: string;
  exampleReading: string;
  translation: string;
  audio: string;
  p_tag: string;
  s_tag: string;
}

export default function KanjiDashboard({ pTag }: { pTag: string }) {
  const [items, setItems] = useState<KanjiItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/hanabira/kanji?p_tag=${pTag}`)
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [pTag]);

  if (loading) return <div className="p-8 text-center text-[var(--secondary-color)]">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{pTag} Kanji — {items.length} characters</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <div key={i} className="border border-[var(--border-color)] rounded-lg p-4 bg-[var(--card-color)]">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl font-bold">{item.kanji}</span>
              <div>
                <p className="text-sm text-[var(--secondary-color)]">{item.reading}</p>
                {item.k_audio && <PlayAudioButton audioSrc={item.k_audio} />}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{item.exampleWord}</span>
              <span className="text-sm text-[var(--secondary-color)]">{item.exampleReading}</span>
              {item.audio && <PlayAudioButton audioSrc={item.audio} />}
            </div>
            <p className="text-sm text-[var(--secondary-color)] mt-1">{item.translation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
