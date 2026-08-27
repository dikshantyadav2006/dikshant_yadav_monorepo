'use client';

import { useEffect, useRef } from 'react';
import { useVisualBuilderStore } from '../../../features/visual-builder/store';
import { orderNodes } from '../../../features/visual-builder/serializer';

interface AutoSaveProps {
  postId: string;
}

export function useAutoSave({ postId }: AutoSaveProps) {
  const canvasData = useVisualBuilderStore((state) => state.canvasData);
  const postMetadata = useVisualBuilderStore((state) => state.postMetadata);
  const saveStatus = useVisualBuilderStore((state) => state.saveStatus);
  const setSaveStatus = useVisualBuilderStore((state) => state.setSaveStatus);
  const autosaveConfig = useVisualBuilderStore((state) => state.autosaveConfig);
  const setDirty = useVisualBuilderStore((state) => state.setDirty);

  const isDirty = useRef(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  // Track initial load/save state
  useEffect(() => {
    lastSavedDataRef.current = JSON.stringify({
      nodes: canvasData.nodes,
      edges: canvasData.edges,
      metadata: postMetadata
    });
  }, []);

  // Detect changes and set dirty flag
  useEffect(() => {
    const currentDataStr = JSON.stringify({
      nodes: canvasData.nodes,
      edges: canvasData.edges,
      metadata: postMetadata
    });

    // If it's different from the last saved state, mark dirty
    if (currentDataStr !== lastSavedDataRef.current) {
      isDirty.current = true;
      setDirty(true);
      setSaveStatus('idle');

      // Reset timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      if (!autosaveConfig.enabled) {
        return;
      }

      // Schedule save
      saveTimerRef.current = setTimeout(async () => {
        await triggerSave();
      }, autosaveConfig.intervalMs);
    }

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [autosaveConfig.enabled, autosaveConfig.intervalMs, canvasData.nodes, canvasData.edges, postMetadata, setDirty, setSaveStatus]);

  const triggerSave = async ({ force = false } = {}) => {
    if (!force && !isDirty.current) return;
    setSaveStatus('saving');

    const state = useVisualBuilderStore.getState();
    const currentMeta = state.postMetadata;
    const currentNodes = state.canvasData.nodes;
    const currentEdges = state.canvasData.edges;

    try {
      // Serialize nodes to ordered block structure
      const blocks = orderNodes(currentNodes, currentEdges);
      
      const canvasPayload = {
        nodes: currentNodes,
        edges: currentEdges,
        blocks
      };

      // Single combined save: canvas data + post metadata in one request
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await fetch(`${API_URL}/posts/${postId}/save`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          canvasData: canvasPayload,
          ...(currentMeta ? {
            title: currentMeta.title,
            excerpt: currentMeta.excerpt,
            status: currentMeta.status,
            featured: currentMeta.featured,
            featuredPinned: currentMeta.featuredPinned,
            categoryId: currentMeta.categoryId || null,
            tagIds: currentMeta.tagIds,
            seoTitle: currentMeta.seoTitle,
            seoDescription: currentMeta.seoDescription,
            featuredImageId: currentMeta.featuredImageId || null,
            featuredBannerImageId: currentMeta.featuredBannerImageId || null,
            featuredBannerImageMeta: currentMeta.featuredBannerImageMeta || null,
          } : {}),
        }),
      });
      
      // Update last saved state
      lastSavedDataRef.current = JSON.stringify({
        nodes: currentNodes,
        edges: currentEdges,
        metadata: currentMeta
      });
      isDirty.current = false;
      setDirty(false);
      setSaveStatus('saved');

      // Clear success indicator after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('[AutoSave] Failed to save canvas:', error);
      setSaveStatus('error');
    }
  };

  // Immediate save trigger (e.g. for Ctrl+S or manual trigger)
  const saveImmediately = async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    await triggerSave({ force: true });
  };

  // Keyboard shortcut listener for Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveImmediately();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvasData]);

  // Tab close beacon fallback
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty.current) {
        if (!autosaveConfig.enabled) {
          event.preventDefault();
          event.returnValue = '';
          return '';
        }

        const blocks = orderNodes(canvasData.nodes, canvasData.edges);
        const payload = {
          canvasData: {
            nodes: canvasData.nodes,
            edges: canvasData.edges,
            blocks
          }
        };
        
        // Since beacon must be a POST/PUT, we use fetch with keepalive on modern browsers
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        fetch(`${API_URL}/posts/${postId}/canvas`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          keepalive: true,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autosaveConfig.enabled, canvasData, postId]);

  return { saveImmediately, isDirty: isDirty.current, autosaveEnabled: autosaveConfig.enabled, saveStatus };
}
export default useAutoSave;
