import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'hanabira', 'vocabulary');

const P_TAG_TO_FILES: Record<string, string[]> = {
  JLPT_N1: ['wordsTanos_openai_JLPT_N1_tanos_vocab_list.json'],
  JLPT_N2: ['wordsTanos_openai_JLPT_N2_tanos_vocab_list.json'],
  JLPT_N3: [
    'wordsTanos_openai_JLPT_N3_tanos_vocab_list.json',
    'words_openai_N3_tango_verbs_xaa.json',
    'words_openai_N3_tango_verbs_xab.json',
    'words_openai_N3_tango_verbs_xac.json',
    'words_openai_N3_tango_verbs_xad.json',
    'words_openai_N3_tango_verbs_xae.json',
    'words_openai_N3_tango_p210-213_i-adjectives_1_shuffled.json',
    'words_openai_N3_tango_p214-223_na-adjectives_1_shuffled.json',
  ],
  JLPT_N4: ['wordsTanos_openai_JLPT_N4_tanos_vocab_list.json'],
  JLPT_N5: ['wordsTanos_openai_JLPT_N5_tanos_vocab_list.json'],
  essential_600_verbs: [
    'words_essential_600_verbs_xaa.json',
    'words_essential_600_verbs_xab.json',
    'words_essential_600_verbs_xac.json',
    'words_essential_600_verbs_xad.json',
    'words_essential_600_verbs_xae.json',
    'words_essential_600_verbs_xaf.json',
    'words_essential_600_verbs_xag.json',
    'words_essential_600_verbs_xah.json',
  ],
  suru_verbs: [
    'words_suru_verbs_essential_600_verbs_xaa.json',
    'words_suru_verbs_essential_600_verbs_xab.json',
    'words_suru_verbs_essential_600_verbs_xac.json',
    'words_suru_verbs_essential_600_verbs_xad.json',
    'words_suru_verbs_essential_600_verbs_xae.json',
    'words_suru_verbs_essential_600_verbs_xaf.json',
  ],
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

// GET /api/hanabira/vocabulary?p_tag=JLPT_N5
// GET /api/hanabira/vocabulary?p_tag=JLPT_N5&s_tag=100&limit=50&offset=0
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pTag = searchParams.get('p_tag');
  const sTag = searchParams.get('s_tag');
  const limit = parseInt(searchParams.get('limit') ?? '200', 10);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  if (!pTag) {
    return NextResponse.json({ error: 'p_tag is required' }, { status: 400 });
  }

  const files = P_TAG_TO_FILES[pTag];
  if (!files) {
    return NextResponse.json({ error: `Unknown p_tag: ${pTag}` }, { status: 400 });
  }

  let items = readFiles(files) as Array<Record<string, string>>;

  if (sTag) {
    items = items.filter(w => w.s_tag === sTag);
  }

  const total = items.length;
  const paginated = items.slice(offset, offset + limit);

  return NextResponse.json({ total, items: paginated });
}
