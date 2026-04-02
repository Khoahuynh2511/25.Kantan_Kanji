'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

export type AiProvider = 'openai' | 'zhipu';

export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
}

const PROVIDERS: { value: AiProvider; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'zhipu', label: 'Zhipu AI' },
];

const MODELS: Record<AiProvider, { value: string; label: string }[]> = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  ],
  zhipu: [
    { value: 'glm-4.7-flash', label: 'GLM-4.7 Flash (free)' },
    { value: 'glm-4.5-flash', label: 'GLM-4.5 Flash (free)' },
    { value: 'glm-4.7-flashx', label: 'GLM-4.7 FlashX' },
    { value: 'glm-4.5-air', label: 'GLM-4.5 Air' },
    { value: 'glm-4.6', label: 'GLM-4.6' },
    { value: 'glm-4.7', label: 'GLM-4.7' },
  ],
};

const STORAGE_KEY = 'experiment_ai_config';

const DEFAULT_CONFIG: AiConfig = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o',
};

interface ApiKeyPanelProps {
  onChange: (config: AiConfig) => void;
}

export default function ApiKeyPanel({ onChange }: ApiKeyPanelProps) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<AiConfig>(DEFAULT_CONFIG);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AiConfig;
        setConfig(parsed);
        onChange(parsed);
      }
    } catch {
      // ignore
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (partial: Partial<AiConfig>) => {
    const next = { ...config, ...partial };
    if (partial.provider && partial.provider !== config.provider) {
      next.model = MODELS[partial.provider][0].value;
    }
    setConfig(next);
    onChange(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const hasKey = config.apiKey.trim().length > 0;

  return (
    <div className="rounded-xl border border-[var(--border-color)] overflow-hidden mb-6">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--card-color)] hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[var(--text-color)]">AI Configuration</span>
          <span className={clsx(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            hasKey
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
          )}>
            {hasKey ? `${PROVIDERS.find(p => p.value === config.provider)?.label} / ${config.model}` : 'No key set'}
          </span>
        </div>
        <span className="text-[var(--secondary-color)]">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {open && (
        <div className="px-4 py-4 bg-[var(--bg-color)] border-t border-[var(--border-color)] space-y-4">
          <div>
            <p className="text-xs font-semibold text-[var(--secondary-color)] uppercase tracking-wide mb-2">Provider</p>
            <div className="flex gap-3">
              {PROVIDERS.map(p => (
                <label key={p.value} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="ai-provider"
                    value={p.value}
                    checked={config.provider === p.value}
                    onChange={() => update({ provider: p.value })}
                    className="accent-[var(--main-color)]"
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-[var(--secondary-color)] uppercase tracking-wide mb-2">Model</p>
            <div className="flex flex-wrap gap-2">
              {MODELS[config.provider].map(m => (
                <label
                  key={m.value}
                  className={clsx(
                    'flex items-center gap-1.5 cursor-pointer text-sm px-3 py-1.5 rounded-lg border transition-colors',
                    config.model === m.value
                      ? 'border-[var(--main-color)] bg-[var(--main-color)] text-[var(--background-color)]'
                      : 'border-[var(--border-color)] hover:bg-[var(--card-color)]'
                  )}
                >
                  <input
                    type="radio"
                    name="ai-model"
                    value={m.value}
                    checked={config.model === m.value}
                    onChange={() => update({ model: m.value })}
                    className="sr-only"
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-[var(--secondary-color)] uppercase tracking-wide mb-2">API Key</p>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={e => update({ apiKey: e.target.value })}
                placeholder={config.provider === 'openai' ? 'sk-...' : 'Enter Zhipu AI key'}
                className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-color)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--main-color)]"
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="px-3 py-2 rounded-lg border border-[var(--border-color)] text-[var(--secondary-color)] hover:text-[var(--text-color)] hover:bg-[var(--card-color)] transition-colors"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-[var(--secondary-color)]">
              Key is saved locally in your browser. It is never sent to our servers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
