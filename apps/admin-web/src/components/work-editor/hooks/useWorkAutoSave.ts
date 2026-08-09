'use client';

import { useEffect, useRef } from 'react';
import { orderNodes } from '../../../features/work-builder/serializer';
import { useWorkBuilderStore } from '../../../features/work-builder/store';
import { saveWorkCanvas, saveWorkMetadata } from '../../../features/work-builder/api';

interface WorkAutoSaveProps {
  workId: string;
}

export function useWorkAutoSave({ workId }: WorkAutoSaveProps) {
  const canvasData = useWorkBuilderStore((state) => state.canvasData);
  const workMetadata = useWorkBuilderStore((state) => state.workMetadata);
  const saveStatus = useWorkBuilderStore((state) => state.saveStatus);
  const setSaveStatus = useWorkBuilderStore((state) => state.setSaveStatus);
  const autosaveConfig = useWorkBuilderStore((state) => state.autosaveConfig);
  const setDirty = useWorkBuilderStore((state) => state.setDirty);

  const isDirty = useRef(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  useEffect(() => {
    lastSavedDataRef.current = JSON.stringify({
      nodes: canvasData.nodes,
      edges: canvasData.edges,
      metadata: workMetadata,
    });
  }, []);

  useEffect(() => {
    const currentDataStr = JSON.stringify({
      nodes: canvasData.nodes,
      edges: canvasData.edges,
      metadata: workMetadata,
    });

    if (currentDataStr !== lastSavedDataRef.current) {
      isDirty.current = true;
      setDirty(true);
      setSaveStatus('idle');

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      if (!autosaveConfig.enabled) {
        return;
      }

      saveTimerRef.current = setTimeout(async () => {
        await triggerSave();
      }, autosaveConfig.intervalMs);
    }

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosaveConfig.enabled, autosaveConfig.intervalMs, canvasData.nodes, canvasData.edges, workMetadata, setDirty, setSaveStatus]);

  const triggerSave = async ({ force = false } = {}) => {
    if (!force && !isDirty.current) return;
    setSaveStatus('saving');

    const state = useWorkBuilderStore.getState();
    const currentMeta = state.workMetadata;
    const currentNodes = state.canvasData.nodes;
    const currentEdges = state.canvasData.edges;

    try {
      const blocks = orderNodes(currentNodes, currentEdges);
      await saveWorkCanvas(workId, { nodes: currentNodes, edges: currentEdges, blocks });

      if (currentMeta) {
        await saveWorkMetadata(workId, currentMeta);
      }

      lastSavedDataRef.current = JSON.stringify({
        nodes: currentNodes,
        edges: currentEdges,
        metadata: currentMeta,
      });
      isDirty.current = false;
      setDirty(false);
      setSaveStatus('saved');

      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('[WorkAutoSave] Failed to save:', error);
      setSaveStatus('error');
    }
  };

  const saveImmediately = async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    await triggerSave({ force: true });
  };

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

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty.current) return;

      if (!autosaveConfig.enabled) {
        event.preventDefault();
        event.returnValue = '';
        return '';
      }

      const state = useWorkBuilderStore.getState();
      const currentNodes = state.canvasData.nodes;
      const currentEdges = state.canvasData.edges;
      const blocks = orderNodes(currentNodes, currentEdges);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      fetch(`${API_URL}/works/${workId}/canvas`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          canvasData: { nodes: currentNodes, edges: currentEdges, blocks },
        }),
        keepalive: true,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autosaveConfig.enabled, canvasData, workId]);

  return {
    saveImmediately,
    isDirty: isDirty.current,
    autosaveEnabled: autosaveConfig.enabled,
    saveStatus,
  };
}
