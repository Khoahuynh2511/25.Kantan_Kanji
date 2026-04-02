'use client';

import { useEffect, useState, useCallback } from 'react';
import { ReactFlow, MiniMap, Controls, Background, BackgroundVariant, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Node, Edge } from '@xyflow/react';
import Sidebar from '@/shared/components/Menu/Sidebar';

interface VocabItem {
  vocabulary_original: string;
  vocabulary_simplified: string;
  vocabulary_english: string;
  p_tag: string;
}

const LEVELS = ['JLPT_N5', 'JLPT_N4', 'JLPT_N3'] as const;

export default function VocabularyMapPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [level, setLevel] = useState('JLPT_N5');
  const [loading, setLoading] = useState(false);

  const buildGraph = useCallback(async (pTag: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hanabira/vocabulary?p_tag=${pTag}&limit=40`);
      const data = await res.json();
      const items: VocabItem[] = data.items ?? [];

      const centerNode: Node = {
        id: 'center',
        position: { x: 400, y: 300 },
        data: { label: pTag },
        style: { backgroundColor: 'var(--main-color)', color: 'var(--background-color)', borderRadius: 8, fontWeight: 'bold', padding: 12 },
      };

      const radius = 250;
      const childNodes: Node[] = items.slice(0, 30).map((item, i) => {
        const angle = (i / 30) * 2 * Math.PI;
        return {
          id: `word-${i}`,
          position: {
            x: 400 + radius * Math.cos(angle),
            y: 300 + radius * Math.sin(angle),
          },
          data: { label: `${item.vocabulary_original}\n${item.vocabulary_english}` },
          style: { backgroundColor: 'var(--card-color)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 11, padding: 6, whiteSpace: 'pre' },
        };
      });

      const childEdges: Edge[] = childNodes.map(n => ({
        id: `e-center-${n.id}`,
        source: 'center',
        target: n.id,
        style: { stroke: 'var(--border-color)' },
      }));

      setNodes([centerNode, ...childNodes]);
      setEdges(childEdges);
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  useEffect(() => { buildGraph(level); }, [level, buildGraph]);

  return (
    <div className='min-h-[100dvh] max-w-[100dvw] flex'>
      <Sidebar />
      <main className='flex-1 min-w-0 flex flex-col'>
        <div className="px-4 py-4 flex items-center gap-4 border-b border-[var(--border-color)]">
          <h1 className="text-2xl font-bold">Vocabulary Map</h1>
          <div className="flex gap-2">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)}
                className={`px-3 py-1 rounded text-sm border transition-colors ${level === l ? 'bg-[var(--main-color)] text-[var(--background-color)] border-[var(--main-color)]' : 'border-[var(--border-color)] hover:bg-[var(--card-color)]'}`}>
                {l}
              </button>
            ))}
          </div>
          {loading && <span className="text-sm text-[var(--secondary-color)]">Loading...</span>}
        </div>
        <div className="flex-1">
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView>
            <MiniMap />
            <Controls />
            <Background variant={BackgroundVariant.Dots} />
          </ReactFlow>
        </div>
      </main>
    </div>
  );
}
