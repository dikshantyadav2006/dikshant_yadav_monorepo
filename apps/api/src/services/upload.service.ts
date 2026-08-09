import crypto from 'crypto';
import { prisma } from '@dikshant/database';
import { isCloudinaryConfigured } from '../lib/cloudinary.js';
import {
  deleteFromCloudinary,
  inferResourceType,
  uploadBufferToCloudinary,
} from '../utils/cloudinary-upload.js';

const UPLOAD_FOLDER = 'dikshant-posts';

// Per-type upload limits. Keep in sync with apps/admin-web/src/components/editor/MediaField.tsx
export const UPLOAD_LIMITS = {
  image: 5 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  pdf: 25 * 1024 * 1024,
} as const;

export type UploadKind = keyof typeof UPLOAD_LIMITS;

export function uploadKindFor(mimeType: string): UploadKind {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'pdf';
}

type MediaRecordType = 'IMAGE' | 'VIDEO' | 'RAW';

function toMediaType(resourceType: string, contentType: string): MediaRecordType {
  if (resourceType === 'video' || contentType.startsWith('video/')) return 'VIDEO';
  if (resourceType === 'raw' && !contentType.startsWith('image/')) return 'RAW';
  return 'IMAGE';
}

function externalKey(url: string): string {
  return `external-${crypto.createHash('sha256').update(url).digest('hex').slice(0, 32)}`;
}

// Level-1 duplicate detection: match on size + fileName + contentType only.
// Zero CPU cost and retroactively works against existing Media rows (no hashing).
async function findDuplicateUpload(fileName: string, contentType: string, size: number) {
  return prisma.media.findFirst({
    where: {
      fileName: fileName.toLowerCase(),
      contentType,
      size,
    },
    orderBy: { createdAt: 'asc' },
  });
}

export class UploadService {
  static async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    userId: string,
  ) {
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary is not configured. Set CLOUDINARY_* environment variables.');
    }

    const existing = await findDuplicateUpload(fileName, mimeType, fileBuffer.length);
    if (existing) {
      return { ...existing, deduplicated: true };
    }

    const result = await uploadBufferToCloudinary(fileBuffer, {
      folder: UPLOAD_FOLDER,
      fileName,
      mimeType,
    });

    const key = result.public_id;
    const existingByKey = await prisma.media.findUnique({ where: { key } });
    if (existingByKey) {
      return existingByKey;
    }

    return prisma.media.create({
      data: {
        uploadedById: userId,
        type: toMediaType(result.resource_type, mimeType),
        key,
        bucket: 'cloudinary',
        publicUrl: result.secure_url,
        fileName,
        contentType: mimeType,
        size: result.bytes ?? fileBuffer.length,
        width: result.width ?? null,
        height: result.height ?? null,
      },
    });
  }

  static async registerExternalUrl(url: string, userId: string, alt?: string) {
    const trimmed = url.trim();
    if (!trimmed) {
      throw new Error('URL is required');
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new Error('Invalid URL');
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Only HTTP(S) URLs are supported');
    }

    const contentType = inferResourceType('', trimmed) === 'video'
      ? 'video/mp4'
      : inferResourceType('', trimmed) === 'image'
        ? 'image/jpeg'
        : 'application/octet-stream';

    const key = externalKey(trimmed);

    const existing = await prisma.media.findUnique({ where: { key } });
    if (existing) return existing;

    return prisma.media.create({
      data: {
        uploadedById: userId,
        type: toMediaType(inferResourceType(contentType, trimmed), contentType),
        key,
        bucket: 'external',
        publicUrl: trimmed,
        fileName: parsed.pathname.split('/').pop() || 'external-media',
        contentType,
        size: 0,
        alt: alt ?? null,
      },
    });
  }

  static async deleteMedia(mediaId: string) {
    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) {
      throw new Error('Media resource not found');
    }

    if (media.bucket === 'cloudinary' && isCloudinaryConfigured()) {
      try {
        const resourceType = media.type === 'VIDEO' ? 'video' : media.type === 'RAW' ? 'raw' : 'image';
        await deleteFromCloudinary(media.key, resourceType);
      } catch (error) {
        console.error(`Failed to delete from Cloudinary: ${media.key}`, error);
      }
    }

    return prisma.media.delete({ where: { id: mediaId } });
  }
}
