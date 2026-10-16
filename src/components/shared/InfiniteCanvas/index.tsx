import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  type DefaultEdgeOptions,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { RootNode, DecisionNode, LeafNode } from './nodes';
import { ZoomToolbar } from './ZoomToolbar';
import type { TreeFlowNode, TreeEdge } from './types';

// Define custom node types
const nodeTypes = {
  root: RootNode,
  decision: DecisionNode,
  leaf: LeafNode,
};

// Default edge options for 90-degree connectors
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: 'smoothstep',
  style: {
    stroke: 'var(--color-input)',
    strokeWidth: 2,
  },
};

interface InfiniteCanvasProps {
  initialNodes: TreeFlowNode[];
  initialEdges: TreeEdge[];
  className?: string;
}

function InfiniteCanvasInner({
  initialNodes,
  initialEdges,
  className = '',
}: InfiniteCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<TreeEdge>([]);

  // Update nodes and edges when props change
  useEffect(() => {
    setNodes(initialNodes as Node[]);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Minimap node color function
  const nodeColor = useCallback((node: Node) => {
    switch (node.type) {
      case 'root':
        return '#113378';
      case 'decision':
        return '#9aa6b8';
      case 'leaf':
        return (node.data as { color?: string })?.color || '#2a7a68';
      default:
        return '#9aa6b8';
    }
  }, []);

  return (
    <div
      className={`${className}`}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--color-background)',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        panOnScroll
        selectionOnDrag={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        {/* Dot grid background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--color-input)"
        />

        {/* Minimap in top-right corner */}
        <MiniMap
          nodeColor={nodeColor}
          maskColor="rgba(10, 20, 48, 0.12)"
          style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            width: 150,
            height: 100,
          }}
          className="!right-4 !top-4"
          pannable
          zoomable
        />

        {/* Zoom controls */}
        <ZoomToolbar />
      </ReactFlow>
    </div>
  );
}

export function InfiniteCanvas(props: InfiniteCanvasProps) {
  return (
    <ReactFlowProvider>
      <InfiniteCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

export default InfiniteCanvas;
