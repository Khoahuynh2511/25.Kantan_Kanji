'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface TreeNode {
  type?: string;
  value: string;
  translation?: string;
  children?: TreeNode[];
}

interface HoveredNodeData {
  type?: string;
  value?: string;
  translation?: string;
}

interface ParseTreeProps {
  data: TreeNode;
}

const ParseTree: React.FC<ParseTreeProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<HoveredNodeData | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const margin = { top: 20, right: 120, bottom: 20, left: 200 };
    const width = 1200 - margin.right - margin.left;
    const height = 800 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const rootStyle = getComputedStyle(document.documentElement);
    const bgColor = rootStyle.getPropertyValue('--card-color').trim() || '#f8fafc';
    const textColor = rootStyle.getPropertyValue('--main-color').trim() || '#1e293b';
    const secondaryColor = rootStyle.getPropertyValue('--secondary-color').trim() || '#64748b';

    const svg = d3
      .select(svgRef.current)
      .attr(
        'viewBox',
        `0 0 ${width + margin.right + margin.left} ${height + margin.top + margin.bottom}`
      )
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('width', '100%')
      .attr('height', '100%')
      .style('background-color', bgColor)
      .style('font', '12px sans-serif')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const treeLayout = d3.tree<TreeNode>().size([height, width / 1.5]);
    const root = d3.hierarchy<TreeNode>(data);
    treeLayout(root);

    svg
      .selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr(
        'd',
        d3
          .linkHorizontal<d3.HierarchyLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
          .x((d) => (d as d3.HierarchyPointNode<TreeNode>).y * 0.8)
          .y((d) => (d as d3.HierarchyPointNode<TreeNode>).x + 40)
      )
      .attr('stroke', (d) => (d.target.depth === 0 ? '#3b82f6' : '#94a3b8'))
      .attr('stroke-width', 1)
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.6);

    const node = svg
      .selectAll<SVGGElement, d3.HierarchyNode<TreeNode>>('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${(d as d3.HierarchyPointNode<TreeNode>).y * 0.8},${(d as d3.HierarchyPointNode<TreeNode>).x + 40})`)
      .on('mouseover', function (_event, d) {
        d3.select(this)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', 10)
          .attr('fill', '#f97316');
        d3.select(this)
          .selectAll('text')
          .transition()
          .duration(200)
          .style('font-weight', 'bold')
          .style('fill', '#f97316');
        const { children: _c, ...nodeData } = d.data;
        setHoveredNode(nodeData);
      })
      .on('mouseout', function (_event, d) {
        d3.select(this)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', 6)
          .attr('fill', d.depth === 0 ? '#3b82f6' : '#22c55e');
        d3.select(this)
          .selectAll('text')
          .transition()
          .duration(200)
          .style('font-weight', 'normal')
          .style('fill', textColor);
        setHoveredNode(null);
      });

    node
      .append('circle')
      .attr('r', 6)
      .attr('fill', (d) => (d.depth === 0 ? '#3b82f6' : '#22c55e'))
      .attr('stroke', '#555')
      .attr('stroke-width', 1);

    node
      .append('text')
      .attr('dy', (d) => (d.children ? '-1.5em' : '.35em'))
      .attr('x', (d) => (d.children ? -10 : 10))
      .attr('text-anchor', (d) => (d.children ? 'end' : 'start'))
      .text((d) => (d.depth === 0 ? '' : d.data.value))
      .attr('font-size', '12px')
      .attr('font-family', 'sans-serif')
      .style('fill', textColor);

    node
      .append('text')
      .attr('dy', (d) => (d.children ? '-.5em' : '1.5em'))
      .attr('x', (d) => (d.children ? -10 : 10))
      .attr('text-anchor', (d) => (d.children ? 'end' : 'start'))
      .text((d) =>
        d.depth === 0 ? '' : d.data.translation ? `(${d.data.translation})` : ''
      )
      .attr('font-size', '10px')
      .attr('font-family', 'sans-serif')
      .style('fill', secondaryColor);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        svg.attr('transform', event.transform);
      });

    d3.select(svgRef.current).call(zoom);
  }, [data]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--card-color)]">
          <p className="text-xs text-[var(--secondary-color)] mb-1">Original</p>
          <p className="text-sm font-medium text-[var(--main-color)]">{data.value}</p>
          {data.translation && (
            <>
              <p className="text-xs text-[var(--secondary-color)] mt-2 mb-1">Translation</p>
              <p className="text-sm text-[var(--secondary-color)] italic">{data.translation}</p>
            </>
          )}
        </div>

        <div className="flex-1 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] min-h-[80px]">
          {hoveredNode ? (
            <div>
              <p className="text-xs text-[var(--secondary-color)] mb-2">Node detail</p>
              {hoveredNode.type && (
                <p className="text-sm">
                  <span className="text-[var(--secondary-color)]">type: </span>
                  <span className="font-medium text-[var(--main-color)]">{hoveredNode.type}</span>
                </p>
              )}
              {hoveredNode.value && (
                <p className="text-sm">
                  <span className="text-[var(--secondary-color)]">value: </span>
                  <span className="font-medium text-[var(--main-color)]">{hoveredNode.value}</span>
                </p>
              )}
              {hoveredNode.translation && (
                <p className="text-sm">
                  <span className="text-[var(--secondary-color)]">translation: </span>
                  <span className="italic text-[var(--secondary-color)]">{hoveredNode.translation}</span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-[var(--secondary-color)] italic flex items-center h-full">
              Hover over a node to see details
            </p>
          )}
        </div>
      </div>

      <div className="w-full h-[480px] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      <p className="text-xs text-[var(--secondary-color)] mt-2 text-center">
        Scroll to zoom, drag to pan
      </p>
    </div>
  );
};

export default ParseTree;
