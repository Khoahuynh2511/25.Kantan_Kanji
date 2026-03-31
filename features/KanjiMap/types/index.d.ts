type KanjiInfo = {
  id: string;
  jishoData?: {
    query?: string;
    found?: boolean;
    taughtIn?: string;
    jlptLevel?: string | null;
    newspaperFrequencyRank?: number | null;
    strokeCount?: number | null;
    meaning?: string;
    kunyomi?: string[];
    onyomi?: string[];
    radical?: {
      symbol?: string;
      meaning?: string;
    };
    onyomiExamples?: Array<{
      example?: string;
      reading?: string;
      meaning?: string;
    }>;
    kunyomiExamples?: Array<{
      example?: string;
      reading?: string;
      meaning?: string;
    }>;
  } | null;
  kanjialiveData?: {
    radical?: {
      character?: string;
      name?: {
        hiragana?: string;
        romaji?: string;
      };
      strokes?: number;
      animation?: string[];
    };
    examples?: Array<{
      japanese?: string;
      meaning?: {
        english?: string;
      };
      audio?: {
        mp3?: string;
        ogg?: string;
      };
    }>;
  } | null;
};

type BothGraphData = {
  withOutLinks: import("react-force-graph-3d").GraphData;
  noOutLinks: import("react-force-graph-3d").GraphData;
};
