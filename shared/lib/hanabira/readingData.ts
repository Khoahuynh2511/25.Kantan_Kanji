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

export interface ReadingSummary {
  key: string;
  title: string;
  titleJp: string;
  titleRomaji: string;
  p_tag: string;
  s_tag: string;
  shortDescription: string;
  shortDescriptionJp?: string;
}

export type ReadingFull = Record<string, unknown>;

export function readAllReadings(): ReadingFull[] {
  return READING_FILES.map(file => {
    const fp = path.join(DATA_DIR, file);
    if (!fs.existsSync(fp)) return null;
    return JSON.parse(fs.readFileSync(fp, 'utf-8')) as ReadingFull;
  }).filter(Boolean) as ReadingFull[];
}

export function readReadingSummaries(): ReadingSummary[] {
  return readAllReadings().map(r => ({
    key: r.key as string,
    title: r.title as string,
    titleJp: r.titleJp as string,
    titleRomaji: r.titleRomaji as string,
    p_tag: r.p_tag as string,
    s_tag: r.s_tag as string,
    shortDescription: r.shortDescription as string,
    shortDescriptionJp: r.shortDescriptionJp as string | undefined,
  }));
}

export function readReadingByKey(key: string): ReadingFull | null {
  const all = readAllReadings();
  return all.find(r => r.key === key) ?? null;
}
