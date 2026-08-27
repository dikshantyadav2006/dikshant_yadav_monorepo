'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiFetch from '../lib/api';
import type { Post, PostStatus } from '@dikshant/types';

// ── Posts List ──
export interface PostsResponse {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function usePostsList(page = 1, limit = 50) {
  return useQuery<PostsResponse>({
    queryKey: ['posts', { page, limit }],
    queryFn: () => apiFetch(`/posts?page=${page}&limit=${limit}`),
    staleTime: 30_000,
  });
}

// ── Single Post ──
export function usePost(id: string | null) {
  return useQuery<Post>({
    queryKey: ['post', id],
    queryFn: () => apiFetch(`/posts/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ── Delete Post ──
export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/posts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
