'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

export interface WordNodeData extends Record<string, unknown> {
  word: string;
  meaning: string;
  example?: string;
  readings?: string[];
  usage?: string;
}

interface WordHierarchyNodeProps {
  data: WordNodeData;
}

function WordHierarchyNode({ data }: WordHierarchyNodeProps) {
  return (
    <div className="px-4 py-3 shadow-md rounded-lg bg-[var(--card-color)] border border-[var(--border-color)] max-w-[220px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-1.5 bg-[var(--main-color)]"
      />

      <div className="text-center mb-2">
        <div className="text-xl font-bold text-[var(--text-color)]">
          {data.word}
        </div>
        {data.readings && data.readings.length > 0 && (
          <div className="text-sm text-[var(--secondary-color)]">
            {data.readings.join(', ')}
          </div>
        )}
        <div className="text-sm text-[var(--main-color)] mt-0.5">
          {data.meaning}
        </div>
      </div>

      {data.example && (
        <div className="text-xs text-[var(--secondary-color)] border-t border-[var(--border-color)] pt-1 mb-1">
          {data.example}
        </div>
      )}

      {data.usage && (
        <div className="text-xs text-[var(--secondary-color)]">{data.usage}</div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-1.5 bg-[var(--main-color)]"
      />
    </div>
  );
}

export default memo(WordHierarchyNode);
