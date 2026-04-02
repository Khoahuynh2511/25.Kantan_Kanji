import { NextRequest, NextResponse } from 'next/server';

// GET /api/jisho?keyword=食べる
export async function GET(req: NextRequest) {
  const keyword = new URL(req.url).searchParams.get('keyword');
  if (!keyword) return NextResponse.json({ error: 'Missing keyword' }, { status: 400 });

  try {
    const res = await fetch(
      `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(keyword)}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`Jisho API error: ${res.status}`);
    const data = await res.json();

    // Return only the first 3 results with essential fields
    const results = (data.data ?? []).slice(0, 3).map((item: {
      slug: string;
      is_common: boolean;
      jlpt: string[];
      japanese: Array<{ word?: string; reading?: string }>;
      senses: Array<{ english_definitions: string[]; parts_of_speech: string[] }>;
    }) => ({
      slug: item.slug,
      is_common: item.is_common,
      jlpt: item.jlpt,
      japanese: item.japanese.slice(0, 2),
      senses: item.senses.slice(0, 3).map((s) => ({
        english_definitions: s.english_definitions.slice(0, 3),
        parts_of_speech: s.parts_of_speech,
      })),
    }));

    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
