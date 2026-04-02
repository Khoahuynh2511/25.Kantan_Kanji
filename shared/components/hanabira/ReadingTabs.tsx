'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

interface ReadingTabsProps {
  jlptContent: ReactNode;
  aozoraContent: ReactNode;
}

type Tab = 'jlpt' | 'aozora';

export default function ReadingTabs({ jlptContent, aozoraContent }: ReadingTabsProps) {
  const [tab, setTab] = useState<Tab>('jlpt');

  return (
    <div>
      <div className="flex gap-1 border-b border-[var(--border-color)] mb-6">
        {(['jlpt', 'aozora'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-[var(--main-color)] text-[var(--main-color)]'
                : 'border-transparent text-[var(--secondary-color)] hover:text-current'
            }`}
          >
            {t === 'jlpt' ? 'JLPT Practice' : 'Aozora Bunko'}
          </button>
        ))}
      </div>

      <div>{tab === 'jlpt' ? jlptContent : aozoraContent}</div>
    </div>
  );
}
