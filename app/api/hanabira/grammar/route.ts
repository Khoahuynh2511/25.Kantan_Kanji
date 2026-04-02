import { NextRequest, NextResponse } from 'next/server';
import {
  readGrammarByPTag,
  readGrammarItem,
  P_TAG_TO_FILE,
} from '@/shared/lib/hanabira/grammarData';

// GET /api/hanabira/grammar?p_tag=JLPT_N5
// GET /api/hanabira/grammar?p_tag=JLPT_N5&title=<encoded-title>
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pTag = searchParams.get('p_tag');
  const title = searchParams.get('title');

  if (!pTag) {
    return NextResponse.json(
      { error: 'p_tag query parameter is required' },
      { status: 400 }
    );
  }

  if (!P_TAG_TO_FILE[pTag.toUpperCase()]) {
    return NextResponse.json(
      { error: `Unknown p_tag: ${pTag}` },
      { status: 400 }
    );
  }

  if (title) {
    const decoded = decodeURIComponent(title);
    const item = readGrammarItem(pTag, decoded);
    if (!item) {
      return NextResponse.json({ error: 'Grammar point not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  }

  return NextResponse.json(readGrammarByPTag(pTag));
}

// POST /api/hanabira/grammar   body: { title, p_tag }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { title, p_tag } = body as { title?: string; p_tag?: string };

  if (!title || !p_tag) {
    return NextResponse.json(
      { error: 'title and p_tag are required' },
      { status: 400 }
    );
  }

  if (!P_TAG_TO_FILE[p_tag.toUpperCase()]) {
    return NextResponse.json({ error: `Unknown p_tag: ${p_tag}` }, { status: 400 });
  }

  const item = readGrammarItem(p_tag, title);
  if (!item) {
    return NextResponse.json({ error: 'Grammar point not found' }, { status: 404 });
  }
  return NextResponse.json(item);
}
