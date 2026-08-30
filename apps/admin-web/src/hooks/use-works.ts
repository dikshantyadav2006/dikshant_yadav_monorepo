'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiFetch from '../lib/api';
import type { Work } from '@dikshant/types';

// ── Works List ──
export interface WorksResponse {
  works: Work[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useWorksList(page = 1, limit = 50) {
  return useQuery<WorksResponse>({
    queryKey: ['works', { page, limit }],
    queryFn: () => apiFetch(`/works?page=${page}&limit=${limit}`),
    staleTime: 30_000,
  });
}

// ── Single Work ──
export function useWork(id: string | null) {
  return useQuery<Work>({
    queryKey: ['work', id],
    queryFn: () => apiFetch(`/works/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ── Delete Work ──
export function useDeleteWork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/works/${id}`, { method: 'DELETE' }),
    // Optimistically remove just this work from every cached list page —
    // no full refetch, no list reload, no UI flash.
    onSuccess: (_data, id) => {
      qc.setQueriesData<WorksResponse>({ queryKey: ['works'] }, (old) =>
        old ? removeWorkFromPage(old, id) : old,
      );
    },
  });
}

function removeWorkFromPage(data: WorksResponse, id: string): WorksResponse {
  return {
    ...data,
    works: data.works.filter((work) => work.id !== id),
    pagination: {
      ...data.pagination,
      total: Math.max(0, data.pagination.total - 1),
    },
  };
}