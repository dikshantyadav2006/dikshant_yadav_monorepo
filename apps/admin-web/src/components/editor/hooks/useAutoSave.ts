'use client';

import { useEffect, useRef } from 'react';
import { useVisualBuilderStore } from '../../../features/visual-builder/store';
import { savePostCanvas } from '../../../features/visual-builder/api';
import { orderNodes } from '../../../features/visual-builder/serializer';
import apiFetch from '../../../lib/api';

interface AutoSaveProps {
  postId: string;
}

export function useAutoSave({ postId }: AutoSaveProps) {
  const canvasData = useVisualBuilderStore((state) => state.canvasData);
  const postMetadata = useVisualBuilderStore((state) => state.postMetadata);
  const saveStatus = useVisualBuilderStore((state) => state.saveStatus);
  const setSaveStatus = useVisualBuilderStore((state) => state.setSaveStatus);

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
      setSaveStatus('idle');

      // Reset timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // Schedule save
      saveTimerRef.current = setTimeout(async () => {
        await triggerSave();
      }, 3000);
    }

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [canvasData.nodes, canvasData.edges, postMetadata]);

  const triggerSave = async () => {
    if (!isDirty.current) return;
    setSaveStatus('saving');

    try {
      // Serialize nodes to ordered block structure
      const blocks = orderNodes(canvasData.nodes, canvasData.edges);
      
      const payload = {
        nodes: canvasData.nodes,
        edges: canvasData.edges,
        blocks
      };

      await savePostCanvas(postId, payload);

      // Save post metadata
      if (postMetadata) {
        await apiFetch(`/posts/${postId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: postMetadata.title,
            excerpt: postMetadata.excerpt,
            status: postMetadata.status,
            featured: postMetadata.featured,
            categoryId: postMetadata.categoryId || null,
            tags: postMetadata.tagIds,
            seoTitle: postMetadata.seoTitle,
            seoDescription: postMetadata.seoDescription,
          }),
        });
      }
      
      // Update last saved state
      lastSavedDataRef.current = JSON.stringify({
        nodes: canvasData.nodes,
        edges: canvasData.edges,
        metadata: postMetadata
      });
      isDirty.current = false;
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
    await triggerSave();
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
    const handleBeforeUnload = () => {
      if (isDirty.current) {
        const blocks = orderNodes(canvasData.nodes, canvasData.edges);
        const payload = {
          canvasData: {
            nodes: canvasData.nodes,
            edges: canvasData.edges,
            blocks
          }
        };
        
        // Since beacon must be a POST/PUT, we use fetch with keepalive on modern browsers
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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
  }, [canvasData, postId]);

  return { saveImmediately };
}
export default useAutoSave;
