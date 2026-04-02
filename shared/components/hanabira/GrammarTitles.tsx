import GrammarTitlesList from './GrammarTitlesList';
import { readGrammarByPTag, type GrammarItem } from '@/shared/lib/hanabira/grammarData';

interface GrammarTitlesProps {
  lang: string;
  pTag: string;
  slugBase: string;
}

export default async function GrammarTitles({ lang, pTag, slugBase }: GrammarTitlesProps) {
  let items: GrammarItem[] = [];
  try {
    items = readGrammarByPTag(pTag);
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
