'use client';

import { useState } from 'react';

interface PlayAudioButtonProps {
  audioSrc: string;
  label?: string;
}

export default function PlayAudioButton({ audioSrc, label }: PlayAudioButtonProps) {
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    if (!audioSrc) return;
    const audio = new Audio(audioSrc);
    setPlaying(true);
    audio.play().catch(() => {});
    audio.onended = () => setPlaying(false);
  };

  return (
    <button
      onClick={handlePlay}
      disabled={playing}
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm bg-[var(--card-color)] border border-[var(--border-color)] hover:bg-[var(--border-color)] disabled:opacity-50 transition-colors"
      title={label ?? 'Play audio'}
    >
      <span>{playing ? '...' : '▶'}</span>
      {label && <span>{label}</span>}
    </button>
  );
}
