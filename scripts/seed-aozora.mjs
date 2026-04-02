import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const csvPath = join(ROOT, 'data', 'aozora_temp', 'list_person_all_extended_utf8.csv');
const outPath = join(ROOT, 'data', 'aozora_books.json');

// Simple CSV row parser (handles quoted fields with commas inside)
function parseCSVRow(row) {
  const fields = [];
  let inQuote = false;
  let current = '';
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === ',' && !inQuote) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

const raw = readFileSync(csvPath, 'utf-8').replace(/^\uFEFF/, ''); // strip BOM
const lines = raw.split('\n').filter(l => l.trim().length > 0);

// Print header to understand columns
const headers = parseCSVRow(lines[0]);
console.log('Columns:', headers.map((h, i) => `${i}: ${h}`).join('\n'));

const books = [];

for (let i = 1; i < lines.length; i++) {
  const fields = parseCSVRow(lines[i]);
  if (fields.length < 50) continue;

  const book_id = fields[0]?.trim();
  const title = fields[1]?.trim();
  const title_yomi = fields[2]?.trim();
  const copyright_flag = fields[10]?.trim(); // "なし" = no copyright (public domain)
  const orthography = fields[9]?.trim();     // 文字遣い種別: 新字新仮名 = modern
  const card_url = fields[13]?.trim();
  const person_id = fields[14]?.trim();
  const last_name = fields[15]?.trim();
  const first_name = fields[16]?.trim();
  const text_zip_url = fields[45]?.trim();   // テキストファイルURL (index 45)
  const html_url = fields[50]?.trim();       // XHTML/HTMLファイルURL (index 50)

  // Only public domain works with text available
  if (copyright_flag !== 'なし') continue;
  if (!title || !book_id) continue;
  if (!text_zip_url && !html_url) continue;

  books.push({
    book_id,
    title,
    title_yomi,
    orthography,
    person_id,
    author: `${last_name} ${first_name}`.trim(),
    last_name,
    first_name,
    card_url,
    text_zip_url: text_zip_url || '',
    html_url: html_url || '',
  });
}

console.log(`\nTotal Japanese books with text: ${books.length}`);
console.log('Sample:', JSON.stringify(books[0], null, 2));

writeFileSync(outPath, JSON.stringify(books, null, 2), 'utf-8');
console.log(`\nWrote ${books.length} books to data/aozora_books.json`);
