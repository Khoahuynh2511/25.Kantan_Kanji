'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface AozoraBook {
  book_id: string;
  title: string;
  title_yomi: string;
  orthography: string;
  author: string;
  card_url: string;
}

interface SearchState {
  title: string;
  author: string;
}

const PAGE_SIZE = 20;

export default function AozoraLibrary() {
  const [books, setBooks] = useState<AozoraBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState<SearchState>({ title: '', author: '' });
  const [pendingSearch, setPendingSearch] = useState<SearchState>({ title: '', author: '' });

  const fetchBooks = useCallback(
    async (newSkip: number, newSearch: SearchState, append: boolean) => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          type: 'list',
          limit: String(PAGE_SIZE),
          skip: String(newSkip),
        });
        if (newSearch.title) params.set('title', newSearch.title);
        if (newSearch.author) params.set('author', newSearch.author);

        const res = await fetch(`/api/aozora?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data: AozoraBook[] = await res.json();

        setBooks(prev => (append ? [...prev, ...data] : data));
        setHasMore(data.length === PAGE_SIZE);
      } catch {
        setError('Không thể tải danh sách sách. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial load only — intentionally omit deps to avoid re-fetching on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchBooks(0, search, false); }, []);

  const handleSearch = () => {
    const s = { ...pendingSearch };
    setSearch(s);
    setSkip(0);
    fetchBooks(0, s, false);
  };

  const handleLoadMore = () => {
    const newSkip = skip + PAGE_SIZE;
    setSkip(newSkip);
    fetchBooks(newSkip, search, true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="Title (e.g. 吾輩は猫である)"
          value={pendingSearch.title}
          onChange={e => setPendingSearch(p => ({ ...p, title: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="flex-1 px-3 py-2 border border-[var(--border-color)] rounded bg-[var(--card-color)] text-sm focus:outline-none"
        />
        <input
          type="text"
          placeholder="Author (e.g. 夏目漱石)"
          value={pendingSearch.author}
          onChange={e => setPendingSearch(p => ({ ...p, author: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="flex-1 px-3 py-2 border border-[var(--border-color)] rounded bg-[var(--card-color)] text-sm focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-[var(--main-color)] text-[var(--background-color)] rounded text-sm hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map(book => {
          return (
            <Link
              key={book.book_id}
              href={`/reading/aozora/${book.book_id}`}
              className="block border border-[var(--border-color)] rounded-lg p-4 bg-[var(--card-color)] hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-base mb-1 leading-tight">{book.title}</h3>
              {book.title_yomi && (
                <p className="text-xs text-[var(--secondary-color)] mb-1">{book.title_yomi}</p>
              )}
              <p className="text-sm text-[var(--secondary-color)] mb-2">{book.author}</p>
              <div className="flex gap-1 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded bg-[var(--border-color)]">Aozora</span>
                {book.orthography && (
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--border-color)]">
                    {book.orthography}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {loading && (
        <p className="text-center text-[var(--secondary-color)] text-sm py-8">Loading...</p>
      )}

      {!loading && hasMore && books.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 border border-[var(--border-color)] rounded text-sm hover:bg-[var(--card-color)] transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
