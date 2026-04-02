import { NextRequest, NextResponse } from 'next/server';
import kuromoji from 'kuromoji';
import path from 'path';

export interface Token {
  surface_form: string;
  reading?: string;
  basic_form?: string;
  pos: string;
  pos_detail_1?: string;
}

let tokenizerInstance: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;

function getTokenizer(): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> {
  if (tokenizerInstance) return Promise.resolve(tokenizerInstance);

  const dicPath = path.join(process.cwd(), 'node_modules', 'kuromoji', 'dict');
  return new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath }).build((err, tokenizer) => {
      if (err) return reject(err);
      tokenizerInstance = tokenizer;
      resolve(tokenizer);
    });
  });
}

// POST /api/tokenize  body: { text: string }
export async function POST(req: NextRequest) {
  try {
    const { text } = (await req.json()) as { text: string };
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const tokenizer = await getTokenizer();
    const raw = tokenizer.tokenize(text);

    const tokens: Token[] = raw.map((t) => ({
      surface_form: t.surface_form,
      reading: t.reading,
      basic_form: t.basic_form,
      pos: t.pos,
      pos_detail_1: t.pos_detail_1,
    }));

    return NextResponse.json({ tokens });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
