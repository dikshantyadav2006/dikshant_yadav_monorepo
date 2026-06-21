'use client';

import { useRef, useCallback } from 'react';
import type { CanvasNode, CanvasEdge } from '@dikshant/types';
import { useVisualBuilderStore } from '../../../features/visual-builder/store';

export function useUndoRedo() {
  const canvasData = useVisualBuilderStore((state) => state.canvasData);
  const setCanvasData = useVisualBuilderStore((state) => state.setCanvasData);

  const past = useRef<Array<{ nodes: CanvasNode[]; edges: CanvasEdge[] }>>([]);
  const future = useRef<Array<{ nodes: CanvasNode[]; edges: CanvasEdge[] }>>([]);

  const takeSnapshot = useCallback(() => {
    past.current.push(structuredClone({ nodes: canvasData.nodes, edges: canvasData.edges }));
    future.current = [];
    if (past.current.length > 55) {
      past.current.shift();
    }
  }, [canvasData]);

  const undo = useCallback(() => {
    if (past.current.length === 0) return;
    const previous = past.current.pop()!;
    future.current.push(structuredClone({ nodes: canvasData.nodes, edges: canvasData.edges }));
    setCanvasData({
      ...canvasData,
      nodes: previous.nodes,
      edges: previous.edges,
    });
  }, [canvasData, setCanvasData]);

  const redo = useCallback(() => {
    if (future.current.length === 0) return;
    const next = future.current.pop()!;
    past.current.push(structuredClone({ nodes: canvasData.nodes, edges: canvasData.edges }));
    setCanvasData({
      ...canvasData,
      nodes: next.nodes,
      edges: next.edges,
    });
  }, [canvasData, setCanvasData]);

  return { 
    undo, 
    redo, 
    takeSnapshot, 
    canUndo: past.current.length > 0, 
    canRedo: future.current.length > 0 
  };
}
