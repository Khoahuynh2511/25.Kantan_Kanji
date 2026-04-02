import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'hanabira', 'grammar');

const P_TAG_TO_FILE: Record<string, string> = {
  JLPT_N1: 'grammar_ja_JLPT_N1_0001.json',
  JLPT_N2: 'grammar_ja_JLPT_N2_0001.json',
  JLPT_N3: 'grammar_ja_JLPT_N3_0001.json',
  JLPT_N4: 'grammar_ja_JLPT_N4_0001.json',
  JLPT_N5: 'grammar_ja_JLPT_N5_0001.json',
  KOREAN_1: 'grammar_kr_KOREAN_1_0001.json',
  KOREAN_2: 'grammar_kr_KOREAN_2_0001.json',
  KOREAN_3: 'grammar_kr_KOREAN_3_0001.json',
  KOREAN_4: 'grammar_kr_KOREAN_4_0001.json',
  KOREAN_5: 'grammar_kr_KOREAN_5_0001.json',
  KOREAN_6: 'grammar_kr_KOREAN_6_0001.json',
  HSK_1: 'grammar_cn_HSK_1_0001.json',
  HSK_2: 'grammar_cn_HSK_2_0001.json',
  HSK_3: 'grammar_cn_HSK_3_0001.json',
  HSK_4: 'grammar_cn_HSK_4_0001.json',
  HSK_5: 'grammar_cn_HSK_5_0001.json',
  HSK_6: 'grammar_cn_HSK_6_0001.json',
  VN: 'grammar_vn_all_corrected_0001.json',
  TH_1: 'grammar_th_CU-TFL_1_0001.json',
  TH_2: 'grammar_th_CU-TFL_2_0001.json',
  TH_3: 'grammar_th_CU-TFL_3_0001.json',
  TH_4: 'grammar_th_CU-TFL_4_0001.json',
  TH_5: 'grammar_th_CU-TFL_5_0001.json',
};

function readGrammarFile(filename: string): unknown[] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

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

  const filename = P_TAG_TO_FILE[pTag.toUpperCase()];
  if (!filename) {
    return NextResponse.json(
      { error: `Unknown p_tag: ${pTag}` },
      { status: 400 }
    );
  }

  const items = readGrammarFile(filename);

  if (title) {
    const decoded = decodeURIComponent(title);
    const item = (items as Array<{ title: string }>).find(
      g => g.title === decoded
    );
    if (!item) {
      return NextResponse.json({ error: 'Grammar point not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  }

  return NextResponse.json(items);
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

  const filename = P_TAG_TO_FILE[p_tag.toUpperCase()];
  if (!filename) {
    return NextResponse.json({ error: `Unknown p_tag: ${p_tag}` }, { status: 400 });
  }

  const items = readGrammarFile(filename) as Array<{ title: string }>;
  const item = items.find(g => g.title === title);
  if (!item) {
    return NextResponse.json({ error: 'Grammar point not found' }, { status: 404 });
  }
  return NextResponse.json(item);
}
