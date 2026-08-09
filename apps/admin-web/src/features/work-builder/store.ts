'use client';

import { create } from 'zustand';
import type { CanvasData, CanvasEdge, CanvasNode, ProjectBento, ProjectCredit, NextProjectLink, WorkStatus } from '@dikshant/types';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutosaveConfig {
  enabled: boolean;
  intervalMs: number;
}

export interface WorkMetadata {
  title: string;
  subtitle: string;
  category: string;
  year: string;
  heroImageUrl: string;
  imageUrl: string;
  overview: string;
  description: string;
  techStack: string[];
  link: string;
  status: WorkStatus;
  featured: boolean;
  featuredPinned: boolean;
  seoTitle: string;
  seoDescription: string;
  bento: ProjectBento | null;
  credits: ProjectCredit[];
  nextProject: NextProjectLink | null;
}

interface WorkBuilderState {
  canvasData: CanvasData;
  selectedNodeIds: string[];
  clipboard: CanvasNode[];
  saveStatus: SaveStatus;
  isDirty: boolean;
  activeNodeId: string | null;
  autosaveConfig: AutosaveConfig;
  workMetadata: WorkMetadata | null;
  setWorkMetadata: (metadata: WorkMetadata | null) => void;
  updateWorkMetadata: (metadata: Record<string, any>) => void;
  setCanvasData: (canvasData: CanvasData) => void;
  setNodes: (nodes: CanvasNode[]) => void;
  setEdges: (edges: CanvasEdge[]) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  setSelectedNodes: (nodeIds: string[]) => void;
  copyNodes: () => void;
  pasteNodes: () => void;
  setSaveStatus: (status: SaveStatus) => void;
  setDirty: (isDirty: boolean) => void;
  setAutosaveConfig: (config: Partial<AutosaveConfig>) => void;
  setActiveNode: (nodeId: string | null) => void;
}

export const useWorkBuilderStore = create<WorkBuilderState>((set, get) => ({
  canvasData: { nodes: [], edges: [] },
  selectedNodeIds: [],
  clipboard: [],
  saveStatus: 'idle',
  isDirty: false,
  activeNodeId: null,
  autosaveConfig: { enabled: true, intervalMs: 60000 },
  workMetadata: null,

  setWorkMetadata: (workMetadata) => set({ workMetadata }),
  updateWorkMetadata: (metadata) => set((state) => ({
    workMetadata: state.workMetadata ? { ...state.workMetadata, ...metadata } : null,
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
  setDirty: (isDirty) => set({ isDirty }),
  setAutosaveConfig: (config) => set((state) => ({
    autosaveConfig: { ...state.autosaveConfig, ...config },
  })),
  setActiveNode: (activeNodeId) => set({ activeNodeId }),
}));
