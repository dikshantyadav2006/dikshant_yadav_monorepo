'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { workNodeRegistry } from '@dikshant/node-registry';
import type { Work, UserPreferences } from '@dikshant/types';
import { useWorkBuilderStore } from '../../features/work-builder/store';
import { getWorkCanvas } from '../../features/work-builder/api';
import apiFetch from '../../lib/api';
import { useWorkAutoSave } from './hooks/useWorkAutoSave';
import { useWorkUndoRedo } from './hooks/useWorkUndoRedo';
import { WorkSidebar } from './WorkSidebar';
import { WorkInspector } from './WorkInspector';
import { WorkToolbar } from './WorkToolbar';
import { WorkVersionsSidebar } from './WorkVersionsSidebar';
import {
  LargeImageNode,
  Grid2Node,
  BannerNode,
  PostersNode,
  MobileShowcaseNode,
  DesktopShowcaseNode,
  BentoNode,
  VideoNode,
  EmbedNode,
  MetricsNode,
  LinkNode,
} from './nodes/WorkNodes';
import WorkPreviewPanel from './WorkPreviewPanel';

const workNodeTypes = {
  'large-image': LargeImageNode,
  'grid-2': Grid2Node,
  banner: BannerNode,
  posters: PostersNode,
  'mobile-showcase': MobileShowcaseNode,
  'desktop-showcase': DesktopShowcaseNode,
  bento: BentoNode,
  video: VideoNode,
  embed: EmbedNode,
  metrics: MetricsNode,
  link: LinkNode,
};

export interface WorkCanvasProps {
  workId: string;
  initialWork?: Work | null;
  onBack: () => void;
}

function WorkCanvasInner({ workId, initialWork, onBack }: WorkCanvasProps) {
  const canvasData = useWorkBuilderStore((state) => state.canvasData);
  const setNodes = useWorkBuilderStore((state) => state.setNodes);
  const setEdges = useWorkBuilderStore((state) => state.setEdges);
  const setCanvasData = useWorkBuilderStore((state) => state.setCanvasData);
  const setActiveNode = useWorkBuilderStore((state) => state.setActiveNode);
  const setSelectedNodes = useWorkBuilderStore((state) => state.setSelectedNodes);
  const setWorkMetadata = useWorkBuilderStore((state) => state.setWorkMetadata);
  const updateWorkMetadata = useWorkBuilderStore((state) => state.updateWorkMetadata);
  const setAutosaveConfig = useWorkBuilderStore((state) => state.setAutosaveConfig);
  const autosaveConfig = useWorkBuilderStore((state) => state.autosaveConfig);
  const isDirty = useWorkBuilderStore((state) => state.isDirty);

  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const { saveImmediately } = useWorkAutoSave({ workId });
  const { undo, redo, takeSnapshot, canUndo, canRedo } = useWorkUndoRedo();

  useEffect(() => {
    let active = true;

    async function loadEditorState() {
      try {
        const preferences = await apiFetch<UserPreferences>('/preferences').catch(() => null);
        if (active && preferences) {
          setAutosaveConfig({
            enabled: preferences.autosaveEnabled,
            intervalMs: preferences.autosaveIntervalMs,
          });
        }

        if (initialWork) {
          setWorkMetadata({
            title: initialWork.title || '',
            subtitle: initialWork.subtitle || '',
            category: initialWork.category || '',
            year: initialWork.year || '',
            heroImageUrl: initialWork.heroImageUrl || '',
            imageUrl: initialWork.imageUrl || '',
            overview: initialWork.overview || '',
            description: initialWork.description || '',
            techStack: initialWork.techStack ?? [],
            link: initialWork.link || '',
            swatchColor: initialWork.swatchColor || '',
            status: initialWork.status || 'DRAFT',
            featured: initialWork.featured || false,
            featuredPinned: initialWork.featuredPinned || false,
            seoTitle: initialWork.seoTitle || initialWork.title || '',
            seoDescription: initialWork.seoDescription || '',
            credits: initialWork.credits ?? [],
          });
        } else {
          setWorkMetadata({
            title: 'Untitled Work',
            subtitle: '',
            category: '',
            year: '',
            heroImageUrl: '',
            imageUrl: '',
            overview: '',
            description: '',
            techStack: [],
            link: '',
            swatchColor: '',
            status: 'DRAFT',
            featured: false,
            featuredPinned: false,
            seoTitle: '',
            seoDescription: '',
            credits: [],
          });
        }

        const data = await getWorkCanvas(workId);
        if (active) {
          setCanvasData(data && (data.nodes || data.edges) ? data : { nodes: [], edges: [] });
        }
      } catch (err) {
        console.error('[WorkCanvas] Failed to load editor state:', err);
        if (active) {
          setCanvasData({ nodes: [], edges: [] });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadEditorState();
    return () => {
      active = false;
    };
  }, [initialWork, workId, setAutosaveConfig, setCanvasData, setWorkMetadata]);

  const handleBack = useCallback(() => {
    if (!autosaveConfig.enabled && isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Leave anyway?');
      if (!confirmed) {
        return;
      }
    }

    onBack();
  }, [autosaveConfig.enabled, isDirty, onBack]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    const hasMoveChange = changes.some((c) => c.type === 'position' && c.dragging === false);
    const hasRemoveChange = changes.some((c) => c.type === 'remove');
    if (hasMoveChange || hasRemoveChange) {
      takeSnapshot();
    }

    setNodes(applyNodeChanges(changes, canvasData.nodes as any) as any);

    const selected = changes
      .filter((c) => c.type === 'select')
      .map((c) => (c as any).id);
    if (selected.length > 0) {
      setSelectedNodes(selected);
    }
  }, [canvasData.nodes, setNodes, setSelectedNodes, takeSnapshot]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    if (changes.some((c) => c.type === 'remove')) {
      takeSnapshot();
    }
    setEdges(applyEdgeChanges(changes, canvasData.edges as any) as any);
  }, [canvasData.edges, setEdges, takeSnapshot]);

  const onConnect = useCallback((connection: Connection) => {
    takeSnapshot();
    setEdges(addEdge({ ...connection, type: 'smoothstep' }, canvasData.edges));
  }, [canvasData.edges, setEdges, takeSnapshot]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!reactFlowInstance || !reactFlowWrapper.current) return;

    const nodeType = event.dataTransfer.getData('application/reactflow');
    if (!nodeType) return;

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const def = workNodeRegistry.get(nodeType);
    const newNode = {
      id: `${nodeType}-${crypto.randomUUID().slice(0, 8)}`,
      type: nodeType,
      position,
      data: structuredClone(def?.defaultData || {}),
    };

    takeSnapshot();
    setNodes([...canvasData.nodes, newNode]);
    setActiveNode(newNode.id);
  }, [reactFlowInstance, canvasData.nodes, setNodes, setActiveNode, takeSnapshot]);

  const onNodeClick = useCallback((_: any, node: any) => {
    setActiveNode(node.id);
  }, [setActiveNode]);

  const onPaneClick = useCallback(() => {
    setActiveNode(null);
  }, [setActiveNode]);

  const handleRestoreSuccess = (restoredData: any) => {
    takeSnapshot();
    setCanvasData(restoredData);
    setActiveNode(null);
  };

  const handlePublish = async () => {
    try {
      updateWorkMetadata({ status: 'PUBLISHED' });
      await saveImmediately();
      alert('Work published successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to publish work');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Loading work editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col h-screen w-screen bg-background select-none overflow-hidden">
      <WorkToolbar
        workId={workId}
        workTitle={initialWork?.title || 'Untitled Work'}
        workStatus={initialWork?.status || 'DRAFT'}
        onBack={handleBack}
        onToggleVersions={() => setIsVersionsOpen(!isVersionsOpen)}
        onTogglePreview={() => setIsPreviewOpen(!isPreviewOpen)}
        onSave={saveImmediately}
        onPublish={handlePublish}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {isPreviewOpen ? (
          <WorkPreviewPanel onClose={() => setIsPreviewOpen(false)} />
        ) : (
          <>
            <WorkSidebar />

            <div ref={reactFlowWrapper} className="flex-1 h-full relative bg-muted/5">
              <ReactFlow
                nodes={canvasData.nodes}
                edges={canvasData.edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={workNodeTypes}
                onInit={setReactFlowInstance}
                fitView
                snapToGrid
                snapGrid={[16, 16]}
                deleteKeyCode="Delete"
              >
                <Background gap={16} size={1} />
                <Controls />
                <MiniMap />
              </ReactFlow>
            </div>

            {isVersionsOpen ? (
              <WorkVersionsSidebar
                workId={workId}
                onClose={() => setIsVersionsOpen(false)}
                onRestoreSuccess={handleRestoreSuccess}
              />
            ) : (
              <WorkInspector workId={workId} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function WorkCanvas(props: WorkCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

export default WorkCanvas;
