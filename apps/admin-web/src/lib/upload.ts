import apiFetch from './api';

export interface UploadResponse {
  id: string;
  publicUrl: string;
  secure_url: string;
  public_id: string;
  resource_type: string;
  type: string;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  blurDataUrl?: string | null;
  dominantColor?: string | null;
  responsiveMeta?: Record<string, unknown> | null;
  size: number;
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch<UploadResponse>('/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function registerMediaUrl(url: string, alt?: string): Promise<UploadResponse> {
  return apiFetch<UploadResponse>('/upload/url', {
    method: 'POST',
    body: JSON.stringify({ url, alt }),
  });
}
