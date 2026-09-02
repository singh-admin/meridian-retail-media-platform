import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';

import { CustomNode } from './CustomNode';
import { useWorkflowStore, useExecutionStore, useUIStore } from '../../stores';
import { BLOCK_DEFINITIONS } from '../../types/blocks';
import { BlockType } from '../../types';

export const WorkflowCanvas: React.FC = () => {
  const {
    nodes,
    edges,
    selectedNodeId,
    setNodes,
    setEdges,
    addNode,
    setSelectedNode
  } = useWorkflowStore();
  const { isRunning } = useExecutionStore();
  const { setActiveRightPanel } = useUIStore();

  const nodeTypes = useMemo(
    () => ({
      input: CustomNode,
      'ai-model': CustomNode,
      tool: CustomNode,
      retrieval: CustomNode,
      condition: CustomNode,
      transform: CustomNode,
      output: CustomNode,
      validator: CustomNode,
      retry: CustomNode,
      fallback: CustomNode,
      'human-review': CustomNode,
      'approval-gate': CustomNode,
      'confidence-check': CustomNode,
      timeout: CustomNode,
      'error-handler': CustomNode,
      'safe-stop': CustomNode
    }),
    []
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes(applyNodeChanges(changes, nodes as Node[]) as any);
    },
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges(applyEdgeChanges(changes, edges as Edge[]) as any);
    },
    [edges, setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        ...connection,
        id: `e-${connection.source}-${connection.target}-${Date.now().toString().slice(-4)}`,
        animated: true,
        style: { strokeWidth: 2, stroke: '#6366f1' }
      } as Edge;
      setEdges(addEdge(newEdge, edges as Edge[]) as any);
    },
    [edges, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as BlockType;
      if (!type || !BLOCK_DEFINITIONS[type]) return;

      const block = BLOCK_DEFINITIONS[type];
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 40
      };

      const id = `node-${type}-${Date.now().toString().slice(-4)}`;
      const newNode = {
        id,
        type,
        position,
        data: {
          label: block.label,
          config: { ...block.defaultConfig },
          description: block.description
        }
      };

      addNode(newNode);
      setSelectedNode(id);
      setActiveRightPanel('config');
    },
    [addNode, setSelectedNode, setActiveRightPanel]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
      setActiveRightPanel('config');
    },
    [setSelectedNode, setActiveRightPanel]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  // Format edges with dynamic animation and styles
  const flowEdges = useMemo(() => {
    return edges.map((e) => ({
      ...e,
      animated: isRunning || e.animated !== false,
      style: {
        strokeWidth: 2.5,
        stroke: isRunning ? '#818cf8' : '#94a3b8'
      }
    }));
  }, [edges, isRunning]);

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] bg-slate-50 relative overflow-hidden">
      <ReactFlow
        nodes={nodes.map((n) => ({
          ...n,
          selected: n.id === selectedNodeId,
          data: { ...n.data, type: n.type }
        }))}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        snapToGrid
        snapGrid={[15, 15]}
        className="touch-none"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1.5} color="#cbd5e1" />
        <Controls className="!bg-white !shadow-lg !border-gray-200 !rounded-lg" />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(n) => {
            const block = BLOCK_DEFINITIONS[n.type as BlockType];
            return block?.color || '#6366f1';
          }}
          className="!bg-white !border-gray-200 !rounded-lg !shadow-md"
        />
      </ReactFlow>
    </div>
  );
};
