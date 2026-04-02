import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'hanabira', 'grammar');

export const P_TAG_TO_FILE: Record<string, string> = {
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

export interface GrammarItem {
  title: string;
  short_explanation: string;
  p_tag: string;
  [key: string]: unknown;
}

export function readGrammarByPTag(pTag: string): GrammarItem[] {
  const filename = P_TAG_TO_FILE[pTag.toUpperCase()];
  if (!filename) return [];

  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];

  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as GrammarItem[];
}

export function readGrammarItem(pTag: string, title: string): GrammarItem | null {
  const items = readGrammarByPTag(pTag);
  return items.find(g => g.title === title) ?? null;
}
