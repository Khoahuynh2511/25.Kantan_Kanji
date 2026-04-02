import { NextRequest, NextResponse } from 'next/server';

const PROVIDER_URLS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  zhipu: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
};

const SYSTEM_PROMPT = `You are an expert language teacher specializing in Japanese, Korean, and English grammar.

When given a sentence, provide a structured grammar explanation in markdown:

## Grammar Breakdown
- Identify each clause, phrase, and grammatical construct
- Name each grammar pattern (e.g. は topic marker, て-form conjunction, ~のが好き structure)

## Key Grammar Points
For each grammar pattern found:
- **Pattern name** (e.g. Vて + いる)
- Meaning and function
- JLPT level if applicable

## Learner Tips
- Common mistakes to avoid
- How to apply this pattern in other sentences

Be concise and pedagogically clear. Use the original script when referencing parts of the sentence.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userPrompt, apiKey: clientKey, provider = 'openai', model } = body as {
      userPrompt?: string;
      apiKey?: string;
      provider?: string;
      model?: string;
    };

    if (!userPrompt?.trim()) {
      return NextResponse.json({ error: 'userPrompt is required' }, { status: 400 });
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
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt.trim() },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `AI API error (${response.status}): ${errText}` }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
