'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiFetch from '../lib/api';
import type { CanvasData } from '@dikshant/types';

// ── Get Canvas ──
export function useCanvas(postId: string | null) {
  return useQuery<CanvasData>({
    queryKey: ['canvas', postId],
    queryFn: () => apiFetch(`/posts/${postId}/canvas`),
    enabled: !!postId,
    staleTime: 30_000,
  });
}

// ── Save Canvas ──
export function useSaveCanvas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, canvasData, changeLabel }: {
      postId: string;
      canvasData: CanvasData;
      changeLabel?: string;
    }) =>
      apiFetch(`/posts/${postId}/canvas`, {
        method: 'PUT',
        body: JSON.stringify({ canvasData, changeLabel }),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['canvas', variables.postId] });
    },
  });
}
