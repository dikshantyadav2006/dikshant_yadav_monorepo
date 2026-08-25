'use client';

import React from 'react';
import type { NodeProps } from 'reactflow';
import { CodeBlockInteractiveNode } from '../../shared/CodeBlockInteractiveNode';
import { useWorkBuilderStore } from '../../../features/work-builder/store';

export function CodeBlockInteractiveNodeWrapper(props: NodeProps) {
  const setNodes = useWorkBuilderStore((state) => state.setNodes);
  const canvasData = useWorkBuilderStore((state) => state.canvasData);
  const activeNodeId = useWorkBuilderStore((state) => state.activeNodeId);
  const setActiveNode = useWorkBuilderStore((state) => state.setActiveNode);

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
