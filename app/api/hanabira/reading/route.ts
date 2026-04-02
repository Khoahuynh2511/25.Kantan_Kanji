import { NextRequest, NextResponse } from 'next/server';
import { readReadingSummaries, readReadingByKey } from '@/shared/lib/hanabira/readingData';

// GET /api/hanabira/reading         → returns list (summary only)
// GET /api/hanabira/reading?key=... → returns full reading object
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  if (key) {
    const item = readReadingByKey(key);
    if (!item) {
      return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  }

  return NextResponse.json(readReadingSummaries());
}
