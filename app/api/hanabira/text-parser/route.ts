import { NextRequest, NextResponse } from 'next/server';
import kuromoji from 'kuromoji';

let tokenizerInstance: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;

function getTokenizer(): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> {
  if (tokenizerInstance) return Promise.resolve(tokenizerInstance);
  return new Promise((resolve, reject) => {
    kuromoji
      .builder({ dicPath: 'node_modules/kuromoji/dict' })
      .build((err, tokenizer) => {
        if (err) return reject(err);
        tokenizerInstance = tokenizer;
        resolve(tokenizer);
      });
  });
}

// POST /api/hanabira/text-parser   body: { text: string }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { text?: string };
  const { text } = body;

  if (!text) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }

  try {
    const tokenizer = await getTokenizer();
    const tokens = tokenizer.tokenize(text);

    const result = tokens.map(t => ({
      surface_form: t.surface_form,
      reading: t.reading ?? t.surface_form,
      basic_form: t.basic_form ?? t.surface_form,
      pos: t.pos,
      pos_detail_1: t.pos_detail_1,
      conjugation_type: t.conjugated_type,
      conjugated_form: t.conjugated_form,
    }));

    return NextResponse.json({ tokens: result });
  } catch (err) {
    console.error('Kuromoji error:', err);
    return NextResponse.json(
      { error: 'Failed to parse text' },
      { status: 500 }
    );
  }
}
