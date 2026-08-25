import type { Work, WorkContentBlock } from '@dikshant/types';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

export interface AdjacentWork {
  slug: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  heroImageUrl?: string | null;
  swatchColor?: string | null;
}

export interface WorkDetail extends Work {
  contentBlocks?: WorkContentBlock[] | null;
  prev?: AdjacentWork | null;
  next?: AdjacentWork | null;
}

interface WorksListResponse {
  works: Work[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export async function getWorks(limit = 100): Promise<Work[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/works?page=1&limit=${limit}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.warn(`[work-web] /works failed: ${res.status}`);
      return [];
    }
    const data = (await res.json()) as WorksListResponse;
    return data?.works ?? [];
  } catch (err) {
    console.warn('[work-web] Failed to fetch works:', err);
    return [];
  }
}

export async function getWork(slug: string): Promise<WorkDetail | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/works/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return (await res.json()) as WorkDetail;
  } catch (err) {
    console.warn('[work-web] Failed to fetch work:', err);
    return null;
  }
}
