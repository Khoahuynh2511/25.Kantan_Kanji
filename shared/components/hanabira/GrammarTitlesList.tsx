'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

interface GrammarItem {
  title: string;
  short_explanation: string;
  p_tag: string;
}

interface GrammarTitlesListProps {
  items: GrammarItem[];
  pTag: string;
  slugBase: string;
}

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  JLPT_N5: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  JLPT_N4: { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  JLPT_N3: { bg: 'bg-yellow-50 dark:bg-yellow-950/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
  JLPT_N2: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  JLPT_N1: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
};

type SortOrder = 'default' | 'az' | 'za' | 'learn';
type ViewMode = 'grid' | 'list';

function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function IconList() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="4" y1="4" x2="15" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="4" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="4" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="1.5" cy="4" r="1" fill="currentColor"/>
      <circle cx="1.5" cy="8" r="1" fill="currentColor"/>
      <circle cx="1.5" cy="12" r="1" fill="currentColor"/>
    </svg>
  );
}

const VISITED_KEY = 'grammar_visited';

function loadVisited(): Set<string> {
  try {
    const raw = localStorage.getItem(VISITED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export default function GrammarTitlesList({ items, pTag, slugBase }: GrammarTitlesListProps) {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [visited, setVisited] = useState<Set<string>>(new Set());

  useEffect(() => {
    setVisited(loadVisited());

    const onStorage = (e: StorageEvent) => {
      if (e.key === VISITED_KEY) setVisited(loadVisited());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const processed = useMemo(() => {
    const q = search.toLowerCase().trim();
    let result = q
      ? items.filter(
          item =>
            item.title.toLowerCase().includes(q) ||
            item.short_explanation.toLowerCase().includes(q)
        )
      : [...items];

    if (sortOrder === 'az') result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    if (sortOrder === 'za') result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    if (sortOrder === 'learn') {
      result = [...result].sort((a, b) => {
        const aV = visited.has(a.title) ? 1 : 0;
        const bV = visited.has(b.title) ? 1 : 0;
        return aV - bV;
      });
    }

    return result;
  }, [items, search, sortOrder, visited]);

  const encodeTitle = (title: string) =>
    encodeURIComponent(title.replace(/\//g, '-'));

  const color = LEVEL_COLORS[pTag] ?? {
    bg: 'bg-[var(--card-color)]',
    text: 'text-[var(--main-color)]',
    border: 'border-[var(--border-color)]',
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 pb-12">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        {/* Left: badge + count */}
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${color.bg} ${color.text} border ${color.border}`}>
            {pTag.replace('JLPT_', '')}
          </span>
          <span className="text-sm text-[var(--secondary-color)]">
            {processed.length !== items.length
              ? `${processed.length} / ${items.length} grammar points`
              : `${items.length} grammar points`}
          </span>
        </div>

        {/* Right: search + sort + view toggle */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search */}
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search grammar..."
            className="w-full sm:w-52 px-3 py-1.5 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] text-[var(--text-color)] placeholder:text-[var(--secondary-color)] focus:outline-none focus:border-[var(--main-color)] transition-colors"
          />

          {/* Sort select */}
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as SortOrder)}
            title="Sort order"
            aria-label="Sort order"
            className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] text-[var(--text-color)] focus:outline-none focus:border-[var(--main-color)] transition-colors cursor-pointer"
          >
            <option value="default">Default</option>
            <option value="learn">Learn first</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
          </select>

          {/* View mode toggle */}
          <div className="flex rounded-lg border border-[var(--border-color)] overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[var(--main-color)] text-[var(--background-color)]'
                  : 'bg-[var(--card-color)] text-[var(--secondary-color)] hover:text-[var(--text-color)]'
              }`}
            >
              <IconGrid />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List view"
              className={`p-2 transition-colors border-l border-[var(--border-color)] ${
                viewMode === 'list'
                  ? 'bg-[var(--main-color)] text-[var(--background-color)]'
                  : 'bg-[var(--card-color)] text-[var(--secondary-color)] hover:text-[var(--text-color)]'
              }`}
            >
              <IconList />
            </button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {processed.length === 0 ? (
        <div className="py-16 text-center text-[var(--secondary-color)]">
          No grammar points found for &ldquo;{search}&rdquo;
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid view */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {processed.map((item, i) => {
            const isVisited = visited.has(item.title);
            return (
              <Link
                key={`${i}-${item.title}`}
                href={`${slugBase}/${encodeTitle(item.title)}?level=${pTag}`}
                className="group relative flex flex-col gap-2 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] hover:border-[var(--main-color)] hover:shadow-md transition-all duration-200"
              >
                <span className={`absolute top-3 right-3 text-xs font-mono px-1.5 py-0.5 rounded ${color.bg} ${color.text} opacity-70`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {/* visited dot */}
                {isVisited && (
                  <span className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-green-400" title="Studied" />
                )}
                <p className="font-semibold text-sm leading-snug pr-8 text-[var(--text-color)] group-hover:text-[var(--main-color)] transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-[var(--secondary-color)] line-clamp-2 leading-relaxed">
                  {item.short_explanation}
                </p>
                <span className="mt-auto text-xs text-[var(--secondary-color)] group-hover:text-[var(--main-color)] transition-colors self-end">
                  Study →
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        /* List / row view */
        <div className="rounded-xl border border-[var(--border-color)] overflow-hidden divide-y divide-[var(--border-color)]">
          {processed.map((item, i) => {
            const isVisited = visited.has(item.title);
            return (
              <Link
                key={`${i}-${item.title}`}
                href={`${slugBase}/${encodeTitle(item.title)}?level=${pTag}`}
                className="group flex items-center gap-4 px-4 py-3 bg-[var(--card-color)] hover:bg-[var(--border-color)] transition-colors"
              >
                <span className={`shrink-0 text-xs font-mono w-7 text-right ${color.text} opacity-60`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {isVisited && <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" title="Studied" />}
                    <p className="text-sm font-semibold text-[var(--text-color)] group-hover:text-[var(--main-color)] truncate transition-colors">
                      {item.title}
                    </p>
                  </div>
                  <p className="text-xs text-[var(--secondary-color)] truncate">
                    {item.short_explanation}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-[var(--secondary-color)] group-hover:text-[var(--main-color)] transition-colors">
                  →
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
