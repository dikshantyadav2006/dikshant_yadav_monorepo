'use client';

import { useQuery } from '@tanstack/react-query';
import apiFetch from '../lib/api';

// ── Categories ──
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiFetch('/categories'),
    staleTime: 300_000, // 5 min – categories rarely change
  });
}

// ── Tags ──
export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: () => apiFetch('/tags'),
    staleTime: 300_000,
  });
}
