import { NextRequest, NextResponse } from 'next/server';

const PROVIDER_URLS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  zhipu: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
};

const MAX_WORD_LENGTH = 50;

const PAYLOAD_STRUCTURE = `
Incoming word will be Japanese or Korean.
Logical hierarchical breakdown is required.
Provide 3 levels of hierarchy where possible.
Provide the results as a hierarchical JSON array of objects.
Returned data is in the following JSON format only.
Ensure no additional text or explanations, just the JSON.
Data under "usage" key will be in English.
Data under "example" key will be in target language (and in English in brackets).
Objects should have child objects where possible to show hierarchy.
You must have 3 hierarchy levels where possible.
Output is supposed to teach students.
Provide long JSON so we have a complex nested structure.

Example output format:
{
  "word": "",
  "meaning": "",
  "readings": [""],
  "usage": "",
  "children": [
    {
      "word": "",
      "meaning": "",
      "example": "",
      "readings": [""],
      "usage": "",
      "children": [
        {
          "word": "",
          "meaning": "",
          "example": "",
          "readings": [""],
          "usage": "",
          "children": []
        }
      ]
    }
  ]
}`;

const PROMPTS: Record<string, string> = {
  'verb-conjugation': `You are an expert in Japanese and Korean verb conjugation.
For the given word, return a hierarchical breakdown of its conjugation.
${PAYLOAD_STRUCTURE}`,

  'word-similarity': `You are an expert linguist in Japanese and Korean.
For the given word, identify words with related meanings or that share contextual usage.
Each object includes the similar word and a brief description of the relationship.
${PAYLOAD_STRUCTURE}`,

  synonyms: `You are a synonym expert in Japanese and Korean.
For the given word, provide a JSON of synonyms, hierarchically ranked by relevance.
${PAYLOAD_STRUCTURE}`,

  antonyms: `You are a linguistic expert in Japanese and Korean.
For the given word, provide a JSON of antonyms, hierarchically ranked by relevance.
${PAYLOAD_STRUCTURE}`,

  hypernyms: `You are an expert in lexical hierarchies in Japanese and Korean.
For the given word, identify its hypernyms (more general terms that encompass the word).
${PAYLOAD_STRUCTURE}`,

  hyponyms: `You are an expert in lexical hierarchies in Japanese and Korean.
For the given word, identify its hyponyms (more specific terms under the word's category).
${PAYLOAD_STRUCTURE}`,

  collocations: `You are an expert in collocations and phraseology in Japanese and Korean.
For the given word, provide a JSON of common collocations where this word appears.
${PAYLOAD_STRUCTURE}`,

  'part-of-speech': `You are an expert linguist in Japanese and Korean.
For the given word, provide its possible parts of speech and corresponding examples.
${PAYLOAD_STRUCTURE}`,

  idioms: `You are an expert in idiomatic expressions and phrasal verbs in Japanese and Korean.
For the given word, provide a JSON of idioms or phrasal verbs where this word appears.
Each object should include the expression and its meaning.
${PAYLOAD_STRUCTURE}`,

  'pronunciation-similarity': `You are an expert in phonetics and linguistics in Japanese and Korean.
For the given word, provide words that are phonetically similar or share similar syllable structures.
Show words that typically cause confusion, including Kanji visual similarity.
${PAYLOAD_STRUCTURE}`,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { word, wordType, apiKey: clientKey, provider = 'openai', model } = body as {
      word?: string;
      wordType?: string;
      apiKey?: string;
      provider?: string;
      model?: string;
    };

    if (!word || word.trim().length === 0) {
      return NextResponse.json({ error: 'word is required' }, { status: 400 });
    }

    if (word.length > MAX_WORD_LENGTH) {
      return NextResponse.json(
        { error: `word cannot exceed ${MAX_WORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    const promptType = wordType ?? 'verb-conjugation';
    const systemPrompt = PROMPTS[promptType];

    if (!systemPrompt) {
      return NextResponse.json(
        { error: `Unknown wordType: ${promptType}` },
        { status: 400 }
      );
    }

    const apiKey = clientKey?.trim() || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key provided. Please enter your API key in the AI Configuration panel.' },
        { status: 400 }
      );
    }

    const apiUrl = PROVIDER_URLS[provider] ?? PROVIDER_URLS.openai;
    const resolvedModel = model || (provider === 'zhipu' ? 'glm-4.7-flash' : 'gpt-4o');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: resolvedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: word.trim() },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `AI API error (${response.status}): ${errText}` },
        { status: 502 }
      );
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const raw = data?.choices?.[0]?.message?.content ?? '';
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const tree = JSON.parse(cleaned);
      return NextResponse.json({ tree });
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON', raw },
        { status: 422 }
      );
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
