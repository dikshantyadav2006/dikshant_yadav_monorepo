'use client';

import { create } from 'zustand';
import type { CanvasData, CanvasEdge, CanvasNode } from '@dikshant/types';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface VisualBuilderState {
  canvasData: CanvasData;
  selectedNodeIds: string[];
  clipboard: CanvasNode[];
  saveStatus: SaveStatus;
  activeNodeId: string | null;
  postMetadata: {
    title: string;
    excerpt: string;
    status: string;
    featured: boolean;
    categoryId: string;
    tagIds: string[];
    seoTitle: string;
    seoDescription: string;
  } | null;
  setPostMetadata: (metadata: any) => void;
  updatePostMetadata: (metadata: Record<string, any>) => void;
  setCanvasData: (canvasData: CanvasData) => void;
  setNodes: (nodes: CanvasNode[]) => void;
  setEdges: (edges: CanvasEdge[]) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  setSelectedNodes: (nodeIds: string[]) => void;
  copyNodes: () => void;
  pasteNodes: () => void;
  setSaveStatus: (status: SaveStatus) => void;
  setActiveNode: (nodeId: string | null) => void;
}

export const useVisualBuilderStore = create<VisualBuilderState>((set, get) => ({
  canvasData: { nodes: [], edges: [] },
  selectedNodeIds: [],
  clipboard: [],
  saveStatus: 'idle',
  activeNodeId: null,
  postMetadata: null,

  setPostMetadata: (postMetadata) => set({ postMetadata }),
  updatePostMetadata: (metadata) => set((state) => ({
    postMetadata: state.postMetadata ? { ...state.postMetadata, ...metadata } : null
  })),
  setCanvasData: (canvasData) => set({ canvasData }),
  setNodes: (nodes) => set((state) => ({ canvasData: { ...state.canvasData, nodes } })),
  setEdges: (edges) => set((state) => ({ canvasData: { ...state.canvasData, edges } })),

  updateNodeData: (nodeId, data) => set((state) => ({
    canvasData: {
      ...state.canvasData,
      nodes: state.canvasData.nodes.map((node) => (
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )),
    },
  })),

  setSelectedNodes: (selectedNodeIds) => set({ selectedNodeIds }),

  copyNodes: () => set((state) => ({
    clipboard: state.canvasData.nodes
      .filter((node) => state.selectedNodeIds.includes(node.id))
      .map((node) => structuredClone(node)),
  })),

  pasteNodes: () => {
    const { clipboard } = get();
    const pasted = clipboard.map((node) => ({
      ...structuredClone(node),
      id: `${node.type}-${crypto.randomUUID()}`,
      position: {
        x: node.position.x + 40,
        y: node.position.y + 40,
      },
    }));

    set((state) => ({
      canvasData: {
        ...state.canvasData,
        nodes: [...state.canvasData.nodes, ...pasted],
      },
      selectedNodeIds: pasted.map((node) => node.id),
    }));
  },

  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setActiveNode: (activeNodeId) => set({ activeNodeId }),
}));
