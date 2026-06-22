import { Readable } from 'node:stream';
import cloudinary from '../lib/cloudinary.js';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: 'image' | 'video' | 'raw';
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
}

function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

export function uploadBufferToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    fileName: string;
    mimeType: string;
  },
): Promise<CloudinaryUploadResult> {
  const resourceType = options.mimeType.startsWith('video/')
    ? 'video'
    : options.mimeType.startsWith('image/')
      ? 'image'
      : 'raw';

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: resourceType,
        public_id: options.fileName.replace(/\.[^.]+$/, '').slice(0, 80),
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }
        resolve(result as CloudinaryUploadResult);
      },
    );

    bufferToStream(buffer).pipe(stream);
  });
}

export async function deleteFromCloudinary(publicId: string, resourceType: string = 'image') {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType as 'image' | 'video' | 'raw',
  });
}

export function inferResourceType(contentType: string, url?: string): 'image' | 'video' | 'raw' {
  if (contentType.startsWith('video/')) return 'video';
  if (contentType.startsWith('image/')) return 'image';
  if (url) {
    if (/\.(mp4|webm|mov|avi)(\?|$)/i.test(url)) return 'video';
    if (/\.(jpg|jpeg|png|gif|webp|svg|avif)(\?|$)/i.test(url)) return 'image';
  }
  return 'raw';
}
