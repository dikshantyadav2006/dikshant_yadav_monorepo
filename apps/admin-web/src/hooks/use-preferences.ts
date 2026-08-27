'use client';

import { useQuery } from '@tanstack/react-query';
import apiFetch from '../lib/api';

export interface UserPreferences {
  userId: string;
  autosaveEnabled: boolean;
  autosaveIntervalMs: number;
  compactEditorMode: boolean;
  focusMode: boolean;
  defaultVisibility: string;
  defaultFeatured: boolean;
  defaultImageLayout?: string | null;
  defaultHeroImageStyle?: string | null;
}

export function usePreferences() {
  return useQuery<UserPreferences>({
    queryKey: ['preferences'],
    queryFn: () => apiFetch('/preferences'),
    staleTime: 60_000,
    retry: false,
  });
}
