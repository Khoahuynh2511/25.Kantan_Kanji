import { NextRequest, NextResponse } from 'next/server';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

// GET /api/fetch-content?url=<encoded-url>
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'url parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(decodeURIComponent(url), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; KanjiKantan/1.0; +https://kanadojo.com)',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status}` },
        { status: 502 }
      );
    }

    const html = await response.text();
    const dom = new JSDOM(html, { url: decodeURIComponent(url) });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      return NextResponse.json({ error: 'Could not extract content' }, { status: 422 });
    }

    return NextResponse.json({
      title: article.title,
      content: article.textContent,
      excerpt: article.excerpt,
      siteName: article.siteName,
    });
  } catch (err) {
    console.error('fetch-content error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
