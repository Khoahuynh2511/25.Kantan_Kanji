import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface AozoraBook {
  book_id: string;
  title: string;
  title_yomi: string;
  orthography: string;
  person_id: string;
  author: string;
  last_name: string;
  first_name: string;
  card_url: string;
  text_zip_url: string;
  html_url: string;
}

let cachedBooks: AozoraBook[] | null = null;

function getBooks(): AozoraBook[] {
  if (cachedBooks) return cachedBooks;
  const fp = path.join(process.cwd(), 'data', 'aozora_books.json');
  cachedBooks = JSON.parse(fs.readFileSync(fp, 'utf-8')) as AozoraBook[];
  return cachedBooks;
}

// GET /api/aozora?type=list&limit=20&skip=0&title=&author=
// GET /api/aozora?type=book&id=059898
// GET /api/aozora?type=content&id=059898
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') ?? 'list';

  try {
    if (type === 'list') {
      const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
      const skip = parseInt(searchParams.get('skip') ?? '0', 10);
      const titleQ = (searchParams.get('title') ?? '').toLowerCase();
      const authorQ = (searchParams.get('author') ?? '').toLowerCase();

      let books = getBooks();

      if (titleQ) {
        books = books.filter(b =>
          b.title.toLowerCase().includes(titleQ) ||
          b.title_yomi?.toLowerCase().includes(titleQ)
        );
      }
      if (authorQ) {
        books = books.filter(b => b.author.toLowerCase().includes(authorQ));
      }

      const page = books.slice(skip, skip + limit);
      return NextResponse.json(page);
    }

    if (type === 'book') {
      const id = searchParams.get('id');
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

      const book = getBooks().find(b => b.book_id === id);
      if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      return NextResponse.json(book);
    }

    if (type === 'content') {
      const id = searchParams.get('id');
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

      const book = getBooks().find(b => b.book_id === id);
      if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

      const url = book.html_url || book.text_zip_url;
      if (!url || !url.endsWith('.html')) {
        return NextResponse.json({ error: 'No HTML content available for this book' }, { status: 404 });
      }

      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (!res.ok) throw new Error(`Aozora fetch error: ${res.status}`);

      // Aozora HTML is Shift-JIS encoded — fetch as ArrayBuffer and decode
      const buffer = await res.arrayBuffer();
      const decoder = new TextDecoder('shift-jis');
      const html = decoder.decode(buffer);

      // Extract main text block between <div class="main_text"> and </div>
      const match = html.match(/<div[^>]+class=["']main_text["'][^>]*>([\s\S]*?)<\/div>/i)
        ?? html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

      const content = match ? match[1] : html;
      return new NextResponse(content, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
