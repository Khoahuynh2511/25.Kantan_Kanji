'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('kanjikantan_cookieConsent');
    if (!consent) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem('kanjikantan_cookieConsent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--card-color)] border-t border-[var(--border-color)] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-sm text-[var(--secondary-color)] text-center sm:text-left">
        This site uses cookies for the best experience. Read our{' '}
        <a href="/privacy" className="underline hover:opacity-80">Privacy Policy</a>{' '}
        and{' '}
        <a href="/terms" className="underline hover:opacity-80">Terms of Service</a>.
      </p>
      <button
        onClick={accept}
        className="px-4 py-2 rounded bg-[var(--main-color)] text-[var(--background-color)] text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
      >
        Accept
      </button>
    </div>
  );
}
