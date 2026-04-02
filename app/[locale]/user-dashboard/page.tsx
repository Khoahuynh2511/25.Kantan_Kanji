'use client';

import { useUser } from '@/shared/context/UserContext';
import Link from 'next/link';
import Sidebar from '@/shared/components/Menu/Sidebar';

export default function UserDashboardPage() {
  const { loggedIn, userName, handleLogin, handleLogout } = useUser();

  if (!loggedIn) {
    return (
      <div className='min-h-[100dvh] max-w-[100dvw] flex'>
        <Sidebar />
        <main className='flex-1 min-w-0 flex items-center justify-center pb-20 lg:pb-0'>
          <div className="max-w-sm w-full px-6 py-8 border border-[var(--border-color)] rounded-xl bg-[var(--card-color)]">
            <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
            <p className="text-sm text-[var(--secondary-color)] mb-6 text-center">
              Your progress is stored locally on this device.
            </p>
            <button
              onClick={() => handleLogin('Guest', crypto.randomUUID())}
              className="w-full py-2 px-4 rounded bg-[var(--main-color)] text-[var(--background-color)] font-medium hover:opacity-90 transition-opacity"
            >
              Continue as Guest
            </button>
          </div>
        </main>
      </div>
    );
  }

  const SECTIONS = [
    { href: '/japanese/vocabulary-selection', label: 'Vocabulary', description: 'JLPT N1–N5 vocabulary sets' },
    { href: '/japanese/grammarlist', label: 'Grammar', description: 'Japanese grammar points' },
    { href: '/reading', label: 'Reading', description: 'JLPT N3 reading stories' },
    { href: '/quick-kanji', label: 'Quick Kanji', description: 'N3–N5 kanji study' },
    { href: '/text-parser', label: 'Text Parser', description: 'Analyze Japanese text' },
    { href: '/progress', label: 'Progress', description: 'Your study progress' },
  ];

  return (
    <div className='min-h-[100dvh] max-w-[100dvw] flex'>
      <Sidebar />
      <main className='flex-1 min-w-0 overflow-x-hidden pb-20 lg:pb-0'>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {userName}</h1>
            <p className="text-[var(--secondary-color)] mt-1">Your learning dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 border border-[var(--border-color)] rounded hover:bg-[var(--card-color)] transition-colors"
          >
            Sign out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTIONS.map(s => (
            <Link
              key={s.href}
              href={s.href}
              className="block border border-[var(--border-color)] rounded-lg p-5 hover:shadow-md bg-[var(--card-color)] transition-shadow"
            >
              <h2 className="font-semibold text-lg">{s.label}</h2>
              <p className="text-sm text-[var(--secondary-color)] mt-1">{s.description}</p>
            </Link>
          ))}
        </div>
      </div>
      </main>
    </div>
  );
}
