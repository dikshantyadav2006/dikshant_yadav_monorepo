'use client';

import React from 'react';
import type { NodeProps } from 'reactflow';
import { CodeBlockInteractiveNode } from '../../shared/CodeBlockInteractiveNode';
import { useVisualBuilderStore } from '../../../features/visual-builder/store';

export function CodeBlockInteractiveNodeWrapper(props: NodeProps) {
  const setNodes = useVisualBuilderStore((state) => state.setNodes);
  const canvasData = useVisualBuilderStore((state) => state.canvasData);
  const activeNodeId = useVisualBuilderStore((state) => state.activeNodeId);
  const setActiveNode = useVisualBuilderStore((state) => state.setActiveNode);

  const handleDelete = (nodeId: string) => {
    setNodes(canvasData.nodes.filter((node) => node.id !== nodeId));
    if (activeNodeId === nodeId) {
      setActiveNode(null);
    }
  };

  const handleUpdate = (nodeId: string, data: Record<string, any>) => {
    setNodes(
      canvasData.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node,
      ),
    );
  };

  return (
    <CodeBlockInteractiveNode
      {...props}
      onDelete={handleDelete}
      onUpdate={handleUpdate}
    />
  );
}
