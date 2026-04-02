import { NextRequest, NextResponse } from 'next/server';

const PROVIDER_URLS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  zhipu: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
};

const MAX_LENGTH = 100;

const SYSTEM_PROMPT = `You are a linguistic expert specializing in Japanese, Korean, and English grammar analysis.

Given a sentence and its language, produce a hierarchical parse tree as a JSON object.

Required structure:
{
  "type": "sentence",
  "value": "<original sentence>",
  "translation": "<English translation if not English, otherwise Japanese translation>",
  "children": [
    {
      "type": "<phrase or morpheme type>",
      "value": "<text segment>",
      "translation": "<English meaning>",
      "children": [...]
    }
  ]
}

Valid types: sentence, noun_phrase, verb_phrase, adjective_phrase, adverbial_phrase, prepositional_phrase, conjunction_phrase, nominalizer_phrase, noun, verb, adjective, adverb, pronoun, particle, copula, suffix, prefix, connector, politeness_marker, verb_stem.

Rules:
- Every node requires "type" and "value"
- Decompose phrases recursively down to morpheme level at leaves
- Provide translation for every node where meaningful
- Return only valid JSON, no markdown fences or extra text`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sentence, language, apiKey: clientKey, provider = 'openai', model } = body as {
      sentence?: string;
      language?: string;
      apiKey?: string;
      provider?: string;
      model?: string;
    };

    if (!sentence?.trim()) {
      return NextResponse.json({ error: 'sentence is required' }, { status: 400 });
    }

    if (sentence.length > MAX_LENGTH) {
      return NextResponse.json(
        { error: `Sentence cannot exceed ${MAX_LENGTH} characters` },
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
    const userMessage = `Language: ${language ?? 'Japanese'}\nSentence: ${sentence.trim()}`;

    // Zhipu AI does not support response_format: json_object for all models
    const bodyPayload: Record<string, unknown> = {
      model: resolvedModel,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    };
    if (provider === 'openai') {
      bodyPayload.response_format = { type: 'json_object' };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `AI API error (${response.status}): ${errText}` }, { status: 502 });
    }

    const data = await response.json() as {
      choices?: { message?: { content?: string } }[];
      model?: string;
      usage?: { total_tokens?: number; prompt_tokens?: number; completion_tokens?: number };
    };

    const raw = data?.choices?.[0]?.message?.content ?? '';
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parseTree = JSON.parse(cleaned);
      return NextResponse.json({
        parseTree,
        model: data.model,
        tokensUsed: data.usage?.total_tokens,
        callTimestamp: new Date().toISOString(),
      });
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
