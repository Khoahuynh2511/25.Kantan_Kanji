import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

let kradfile: Record<string, string[]> | null = null;
let descriptions: Record<string, string> | null = null;

function loadData() {
  if (!kradfile) {
    const kradPath = path.join(process.cwd(), 'data', 'radicals', 'kradfile.json');
    kradfile = JSON.parse(fs.readFileSync(kradPath, 'utf8'));
  }
  if (!descriptions) {
    const descPath = path.join(process.cwd(), 'data', 'radicals', 'descriptions.json');
    descriptions = JSON.parse(fs.readFileSync(descPath, 'utf8'));
  }
}

function isKanji(char: string) {
  return (char >= '\u4e00' && char <= '\u9faf') || (char >= '\u3400' && char <= '\u4dbf');
}

export async function POST(req: NextRequest) {
  try {
    loadData();

    const body = await req.json();
    let kanjiList: string[] = typeof body.kanjiList === 'string'
      ? body.kanjiList.split('')
      : body.kanjiList;

    if (!Array.isArray(kanjiList) || kanjiList.length === 0) {
      return NextResponse.json({ error: 'kanjiList is required' }, { status: 400 });
    }

    const result = kanjiList.map(kanji => {
      if (!isKanji(kanji)) {
        return { kanji, error: 'Not a kanji character' };
      }

      const radicals = kradfile![kanji];
      if (!radicals) {
        return { kanji, error: 'Kanji not found' };
      }

      return {
        kanji,
        radicals: radicals.map(r => ({
          radical: r,
          meaning: descriptions![r] ?? 'Unknown',
        })),
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
