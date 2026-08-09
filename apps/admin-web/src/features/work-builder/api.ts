import type { CanvasData, Post, WorkVersion } from '@dikshant/types';
import apiFetch from '@/lib/api';
import type { WorkMetadata } from './store';

export async function getWorkCanvas(workId: string) {
  return apiFetch<CanvasData>(`/works/${workId}/canvas`);
}

export async function saveWorkCanvas(
  workId: string,
  canvasData: CanvasData,
  changeLabel?: string,
) {
  return apiFetch<{ version: number; canvasData: CanvasData }>(`/works/${workId}/canvas`, {
    method: 'PUT',
    body: JSON.stringify({ canvasData, changeLabel }),
  });
}

export async function getWorkVersions(workId: string) {
  return apiFetch<Pick<WorkVersion, 'id' | 'workId' | 'version' | 'changeLabel' | 'savedById' | 'createdAt'>[]>(
    `/works/${workId}/versions`,
  );
}

export async function restoreWorkVersion(workId: string, version: number) {
  return apiFetch<{ version: number; canvasData: CanvasData }>(
    `/works/${workId}/versions/${version}/restore`,
    { method: 'POST' },
  );
}

export async function saveWorkMetadata(workId: string, metadata: WorkMetadata) {
  const payload: Record<string, unknown> = {
    title: metadata.title,
    subtitle: metadata.subtitle || null,
    category: metadata.category || null,
    year: metadata.year || null,
    heroImageUrl: metadata.heroImageUrl || null,
    imageUrl: metadata.imageUrl || null,
    overview: metadata.overview || null,
    description: metadata.description || null,
    techStack: metadata.techStack.length > 0 ? metadata.techStack : null,
    link: metadata.link || null,
    swatchColor: metadata.swatchColor || null,
    credits: metadata.credits.length > 0 ? metadata.credits : null,
    status: metadata.status,
    featured: metadata.featured,
    featuredPinned: metadata.featuredPinned,
    seoTitle: metadata.seoTitle || null,
    seoDescription: metadata.seoDescription || null,
  };

  return apiFetch(`/works/${workId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function getWorkPosts(workId: string) {
  return apiFetch<{ posts: Post[] }>(`/works/${workId}/posts`);
}

export async function setWorkPosts(workId: string, postIds: string[]) {
  return apiFetch<{ posts: Post[] }>(`/works/${workId}/posts`, {
    method: 'PUT',
    body: JSON.stringify({ posts: postIds.map((postId) => ({ postId })) }),
  });
}
