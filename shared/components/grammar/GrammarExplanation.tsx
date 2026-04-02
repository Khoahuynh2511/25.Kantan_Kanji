'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { AiConfig } from '@/shared/components/experiment/ApiKeyPanel';

interface GrammarExplanationProps {
  sentence: string;
  aiConfig?: AiConfig;
}

const GrammarExplanation: React.FC<GrammarExplanationProps> = ({ sentence, aiConfig }) => {
  const [markdown, setMarkdown] = useState('');
  const [modelInfo, setModelInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMarkdown('');
    setError('');
  }, [sentence]);

  const handleGenerate = async () => {
    if (!sentence.trim()) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/grammar-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: sentence,
          apiKey: aiConfig?.apiKey || undefined,
          provider: aiConfig?.provider,
          model: aiConfig?.model,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Request failed');
      }

      const data = await response.json() as {
        choices?: { message?: { content?: string } }[];
        model?: string;
        usage?: { total_tokens?: number; prompt_tokens?: number; completion_tokens?: number };
      };

      const content = data.choices?.[0]?.message?.content ?? '';
      setMarkdown(content);
      if (data.model) {
        setModelInfo(
          `${data.model} — ${data.usage?.total_tokens ?? 0} tokens`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl border border-[var(--border-color)] bg-[var(--card-color)]">
      <div>
        <p className="text-sm font-semibold text-[var(--main-color)] mb-1">Grammar Explanation</p>
        <p className="text-xs text-[var(--secondary-color)] break-all">
          {sentence || 'No sentence provided.'}
        </p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !sentence.trim()}
        className="self-start px-4 py-2 text-xs rounded-lg bg-[var(--main-color)] text-[var(--background-color)] font-medium disabled:opacity-40 hover:opacity-85 transition-opacity"
      >
        {loading ? 'Generating...' : 'Generate Explanation'}
      </button>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {markdown && (
        <div className="mt-1">
          <div className="prose prose-sm max-w-full text-[var(--main-color)] overflow-y-auto max-h-[500px]">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </div>
          {modelInfo && (
            <p className="text-xs text-[var(--secondary-color)] mt-3">{modelInfo}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GrammarExplanation;
