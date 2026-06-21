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

import { nodeRegistry } from '@dikshant/node-registry';
import { useVisualBuilderStore } from '../../features/visual-builder/store';
import { getPostCanvas } from '../../features/visual-builder/api';
import apiFetch from '../../lib/api';
import { useAutoSave } from './hooks/useAutoSave';
import { useUndoRedo } from './hooks/useUndoRedo';
import { Sidebar } from './Sidebar';
import { Inspector } from './Inspector';
import { Toolbar } from './Toolbar';
import { VersionsSidebar } from './VersionsSidebar';

import {
  HeadingNode,
  TextNode,
  ImageNode,
  VideoNode,
  GalleryNode,
  QuoteNode,
  DividerNode,
  CodeBlockNode,
  EmbedNode,
  QuestionNode,
  PollNode,
  ButtonNode,
  AIBlockNode
} from './nodes/editable-nodes';

import type { Post, Tag } from '@dikshant/types';

const nodeTypes = {
  heading: HeadingNode,
  text: TextNode,
  image: ImageNode,
  video: VideoNode,
  gallery: GalleryNode,
  quote: QuoteNode,
  divider: DividerNode,
  'code-block': CodeBlockNode,
  embed: EmbedNode,
  question: QuestionNode,
  poll: PollNode,
  button: ButtonNode,
  'ai-block': AIBlockNode,
};

export interface CanvasProps {
  postId: string;
  initialPost?: Post | null;
  onBack: () => void;
}

function CanvasInner({ postId, initialPost, onBack }: CanvasProps) {
  const canvasData = useVisualBuilderStore((state) => state.canvasData);
  const setNodes = useVisualBuilderStore((state) => state.setNodes);
  const setEdges = useVisualBuilderStore((state) => state.setEdges);
  const setCanvasData = useVisualBuilderStore((state) => state.setCanvasData);
  const setActiveNode = useVisualBuilderStore((state) => state.setActiveNode);
  const setSelectedNodes = useVisualBuilderStore((state) => state.setSelectedNodes);
  const setPostMetadata = useVisualBuilderStore((state) => state.setPostMetadata);
  const updatePostMetadata = useVisualBuilderStore((state) => state.updatePostMetadata);

  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Initialize hooks
  const { saveImmediately } = useAutoSave({ postId });
  const { undo, redo, takeSnapshot, canUndo, canRedo } = useUndoRedo();

  // Load canvas data + set post metadata on mount
  useEffect(() => {
    let active = true;

    // Set post metadata into store
    if (initialPost) {
      const tags = initialPost.tags ?? [];
      const tagIds = tags.map((t) => ('tag' in t && t.tag ? t.tag.id : (t as any).id));
      setPostMetadata({
        title: initialPost.title || '',
        excerpt: initialPost.excerpt || '',
        status: initialPost.status || 'DRAFT',
        featured: initialPost.featured || false,
        categoryId: initialPost.categoryId || '',
        tagIds,
        seoTitle: initialPost.seoTitle || '',
        seoDescription: initialPost.seoDescription || '',
      });
    } else {
      setPostMetadata({
        title: 'Untitled Post',
        excerpt: '',
        status: 'DRAFT',
        featured: false,
        categoryId: '',
        tagIds: [],
        seoTitle: '',
        seoDescription: '',
      });
    }

    async function loadCanvas() {
      try {
        const data = await getPostCanvas(postId);
        if (active) {
          setCanvasData(data && (data.nodes || data.edges) ? data : { nodes: [], edges: [] });
        }
      } catch (err) {
        console.error('[Canvas] Failed to load canvas data:', err);
        if (active) {
          setCanvasData({ nodes: [], edges: [] });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadCanvas();
    return () => {
      active = false;
    };
  }, [postId, setCanvasData, setPostMetadata]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    const hasMoveChange = changes.some(c => c.type === 'position' && c.dragging === false);
    const hasRemoveChange = changes.some(c => c.type === 'remove');
    if (hasMoveChange || hasRemoveChange) {
      takeSnapshot();
    }

    setNodes(applyNodeChanges(changes, canvasData.nodes as any) as any);
    
    const selected = changes
      .filter(c => c.type === 'select')
      .map(c => (c as any).id);
    if (selected.length > 0) {
      setSelectedNodes(selected);
    }
  }, [canvasData.nodes, setNodes, setSelectedNodes, takeSnapshot]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    if (changes.some(c => c.type === 'remove')) {
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

    const def = nodeRegistry.get(nodeType);
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
      updatePostMetadata({ status: 'PUBLISHED' });
      await saveImmediately();
      alert('Post published successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to publish post');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Loading visual builder canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col h-screen w-screen bg-background select-none overflow-hidden">
      {/* Top Toolbar */}
      <Toolbar
        postId={postId}
        postTitle={initialPost?.title || 'Untitled Post'}
        postStatus={initialPost?.status || 'DRAFT'}
        onBack={onBack}
        onToggleVersions={() => setIsVersionsOpen(!isVersionsOpen)}
        onSave={saveImmediately}
        onPublish={handlePublish}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Drag Palette */}
        <Sidebar />

        {/* Center Flow Canvas */}
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
            nodeTypes={nodeTypes}
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

        {/* Right Sideboards */}
        {isVersionsOpen ? (
          <VersionsSidebar 
            postId={postId}
            onClose={() => setIsVersionsOpen(false)}
            onRestoreSuccess={handleRestoreSuccess}
          />
        ) : (
          <Inspector />
        )}
      </div>
    </div>
  );
}

export function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}

export default Canvas;
