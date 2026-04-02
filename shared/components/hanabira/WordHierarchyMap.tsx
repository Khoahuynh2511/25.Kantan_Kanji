'use client';

import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import WordHierarchyNode, { type WordNodeData } from './WordHierarchyNode';

interface DagreGraph {
  setGraph(opts: { ranksep: number; nodesep: number }): void;
  setDefaultEdgeLabel(fn: () => Record<string, unknown>): void;
  setNode(id: string, opts: { width: number; height: number }): void;
  setEdge(source: string, target: string): void;
  node(id: string): { x: number; y: number };
}

// dagre has no bundled TS types; require avoids the implicit-any error
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dagre = require('dagre') as {
  graphlib: { Graph: new () => DagreGraph };
  layout: (g: DagreGraph) => void;
};

const nodeTypes = { wordNode: WordHierarchyNode };

export interface WordNode {
  word: string;
  meaning: string;
  example?: string;
  readings?: string[];
  usage?: string;
  children?: WordNode[];
}

interface WordHierarchyMapProps {
  data: WordNode;
}

let nodeCounter = 0;

function buildNodes(vocab: WordNode, parentId: string | null = null): Node[] {
  const id = `node-${nodeCounter++}`;

  const node: Node<WordNodeData> = {
    id,
    type: 'wordNode',
    data: {
      word: vocab.word,
      meaning: vocab.meaning,
      example: vocab.example,
      readings: vocab.readings ?? [],
      usage: vocab.usage,
    },
    position: { x: 0, y: 0 },
  };

  const nodes: Node[] = [node];

  if (vocab.children) {
    for (const child of vocab.children) {
      const childNodes = buildNodes(child, id);
      nodes.push(...childNodes);
    }
  }

  // Attach parentId as metadata for edge building
  (node as Node & { _parentId?: string | null })._parentId = parentId;

  return nodes;
}

function buildEdges(nodes: Node[]): Edge[] {
  const edges: Edge[] = [];

  for (const node of nodes) {
    const parentId = (node as Node & { _parentId?: string | null })._parentId;
    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        animated: true,
        style: { stroke: 'var(--main-color)', strokeWidth: 1.5 },
      });
    }
  }

  return edges;
}

function applyDagreLayout(
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ ranksep: 120, nodesep: 60 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach(node => g.setNode(node.id, { width: 220, height: 160 }));
  edges.forEach(edge => g.setEdge(edge.source, edge.target));

  dagre.layout(g);

  const layoutedNodes = nodes.map(node => {
    const pos = g.node(node.id);
    return { ...node, position: { x: pos.x - 110, y: pos.y - 80 } };
  });

  return { nodes: layoutedNodes, edges };
}

export default function WordHierarchyMap({ data }: WordHierarchyMapProps) {
  nodeCounter = 0;
  const rawNodes = buildNodes(data);
  const rawEdges = buildEdges(rawNodes);
  const { nodes: layoutedNodes, edges: layoutedEdges } = applyDagreLayout(
    rawNodes,
    rawEdges
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  );

  useEffect(() => {
    nodeCounter = 0;
    const fresh = buildNodes(data);
    const freshEdges = buildEdges(fresh);
    const { nodes: ln, edges: le } = applyDagreLayout(fresh, freshEdges);
    setNodes(ln);
    setEdges(le);
  }, [data, setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '700px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-[var(--bg-color)] rounded-lg"
      >
        <MiniMap
          nodeColor="var(--main-color)"
          maskColor="rgba(0,0,0,0.1)"
        />
        <Controls />
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="var(--border-color)"
        />
      </ReactFlow>
    </div>
  );
}
