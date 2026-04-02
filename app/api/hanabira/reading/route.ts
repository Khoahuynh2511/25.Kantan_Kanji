import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'hanabira', 'reading');

const READING_FILES = [
  'JLPT_N3_reading_01.json',
  'JLPT_N3_reading_02.json',
  'JLPT_N3_reading_03.json',
  'JLPT_N3_reading_04.json',
  'JLPT_N3_reading_05.json',
  'JLPT_N3_reading_06.json',
  'JLPT_N3_reading_07.json',
  'JLPT_N3_reading_08.json',
  'JLPT_N3_reading_09.json',
  'JLPT_N3_reading_10.json',
];

function readAllReadings(): unknown[] {
  return READING_FILES.map(file => {
    const fp = path.join(DATA_DIR, file);
    if (!fs.existsSync(fp)) return null;
    return JSON.parse(fs.readFileSync(fp, 'utf-8'));
  }).filter(Boolean);
}

// GET /api/hanabira/reading         → returns list (summary only)
// GET /api/hanabira/reading?key=... → returns full reading object
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  const all = readAllReadings() as Array<Record<string, unknown>>;

  if (key) {
    const item = all.find(r => r.key === key);
    if (!item) {
      return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  }

  // Return summary list (omit large arrays to reduce payload)
  const summaries = all.map(r => ({
    key: r.key,
    title: r.title,
    titleJp: r.titleJp,
    titleRomaji: r.titleRomaji,
    p_tag: r.p_tag,
    s_tag: r.s_tag,
    shortDescription: r.shortDescription,
    shortDescriptionJp: r.shortDescriptionJp,
  }));

  return NextResponse.json(summaries);
}
