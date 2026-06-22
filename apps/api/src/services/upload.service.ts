import crypto from 'crypto';
import { prisma } from '@dikshant/database';
import { isCloudinaryConfigured } from '../lib/cloudinary.js';
import {
  deleteFromCloudinary,
  inferResourceType,
  uploadBufferToCloudinary,
} from '../utils/cloudinary-upload.js';

const UPLOAD_FOLDER = 'dikshant-posts';

type MediaRecordType = 'IMAGE' | 'VIDEO' | 'RAW';

function toMediaType(resourceType: string, contentType: string): MediaRecordType {
  if (resourceType === 'video' || contentType.startsWith('video/')) return 'VIDEO';
  if (resourceType === 'raw' && !contentType.startsWith('image/')) return 'RAW';
  return 'IMAGE';
}

function externalKey(url: string): string {
  return `external-${crypto.createHash('sha256').update(url).digest('hex').slice(0, 32)}`;
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

    const result = await uploadBufferToCloudinary(fileBuffer, {
      folder: UPLOAD_FOLDER,
      fileName,
      mimeType,
    });

    return prisma.media.create({
      data: {
        uploadedById: userId,
        type: toMediaType(result.resource_type, mimeType),
        key: result.public_id,
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
