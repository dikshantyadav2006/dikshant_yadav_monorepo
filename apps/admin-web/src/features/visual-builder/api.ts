import type { CanvasData, PostVersion } from '@dikshant/types';
import apiFetch from '@/lib/api';

export async function getPostCanvas(postId: string) {
  return apiFetch<CanvasData>(`/posts/${postId}/canvas`);
}

export async function savePostCanvas(
  postId: string,
  canvasData: CanvasData,
  changeLabel?: string,
) {
  return apiFetch<{ version: number; canvasData: CanvasData }>(`/posts/${postId}/canvas`, {
    method: 'PUT',
    body: JSON.stringify({ canvasData, changeLabel }),
  });
}

export async function getPostVersions(postId: string) {
  return apiFetch<Pick<PostVersion, 'id' | 'postId' | 'version' | 'changeLabel' | 'savedById' | 'createdAt'>[]>(
    `/posts/${postId}/versions`,
  );
}

export async function restorePostVersion(postId: string, version: number) {
  return apiFetch<{ version: number; canvasData: CanvasData }>(
    `/posts/${postId}/versions/${version}/restore`,
    { method: 'POST' },
  );
}
