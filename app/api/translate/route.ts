import { NextRequest, NextResponse } from 'next/server';

// POST /api/translate
// body: { text: string, from?: string, to?: string }
// Uses MyMemory free translation API (no key required, 5000 chars/day limit per IP)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { text, from = 'ja', to = 'en' } = body as { text?: string; from?: string; to?: string };

  if (!text?.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.responseStatus !== 200) {
      return NextResponse.json({ error: data.responseDetails ?? 'Translation failed' }, { status: 502 });
    }

    return NextResponse.json({ translation: data.responseData.translatedText });
  } catch (err) {
    console.error('translate error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
