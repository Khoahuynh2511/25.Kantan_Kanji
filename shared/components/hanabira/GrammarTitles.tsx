import GrammarTitlesList from './GrammarTitlesList';

interface GrammarItem {
  title: string;
  short_explanation: string;
  p_tag: string;
}

interface GrammarTitlesProps {
  lang: string;
  pTag: string;
  slugBase: string;
}

export default async function GrammarTitles({ lang, pTag, slugBase }: GrammarTitlesProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  let items: GrammarItem[] = [];
  try {
    const res = await fetch(`${baseUrl}/api/hanabira/grammar?p_tag=${pTag}`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    items = Array.isArray(data) ? data : [];
  } catch {
    return <p className="px-4 text-red-500">Failed to load grammar list for {pTag}.</p>;
  }

  return (
    <GrammarTitlesList
      items={items}
      pTag={pTag}
      slugBase={slugBase}
    />
  );
}
