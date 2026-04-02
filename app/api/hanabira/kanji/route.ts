import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'hanabira', 'kanji');

const P_TAG_TO_FILES: Record<string, string[]> = {
  JLPT_N3: [
    'n3kanji1.json',
    'n3kanji2.json',
    'n3kanji3.json',
    'n3kanji4.json',
    'n3kanji5.json',
    'n3kanji6.json',
  ],
  JLPT_N4: ['n4kanji1.json', 'n4kanji2.json', 'n4kanji3.json'],
  JLPT_N5: ['n5kanji1.json'],
};

function readFiles(files: string[]): unknown[] {
  const result: unknown[] = [];
  for (const file of files) {
    const fp = path.join(DATA_DIR, file);
    if (fs.existsSync(fp)) {
      const items = JSON.parse(fs.readFileSync(fp, 'utf-8'));
      result.push(...(Array.isArray(items) ? items : []));
    }
  }
  return result;
}

// GET /api/hanabira/kanji?p_tag=JLPT_N5
// GET /api/hanabira/kanji?p_tag=JLPT_N5&s_tag=part_1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pTag = searchParams.get('p_tag');
  const sTag = searchParams.get('s_tag');

  if (!pTag) {
    return NextResponse.json({ error: 'p_tag is required' }, { status: 400 });
  }

  const files = P_TAG_TO_FILES[pTag.toUpperCase()];
  if (!files) {
    return NextResponse.json({ error: `Unknown p_tag: ${pTag}` }, { status: 400 });
  }

  let items = readFiles(files) as Array<Record<string, string>>;

  if (sTag) {
    items = items.filter(k => k.s_tag === sTag);
  }

  return NextResponse.json(items);
}
