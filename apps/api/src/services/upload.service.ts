import ImageKit from 'imagekit';
import { env } from '../config/env.js';
import { prisma } from '@dikshant/database';

export class UploadService {
  private static ik: ImageKit | null = null;

  private static getIK() {
    if (!this.ik) {
      if (!env.IMAGEKIT_PUBLIC_KEY || !env.IMAGEKIT_PRIVATE_KEY || !env.IMAGEKIT_URL_ENDPOINT) {
        // Fallback for development if credentials are empty, to allow compilation/booting
        console.warn('[WARNING] ImageKit keys missing. Uploads will fail.');
        return null;
      }
      this.ik = new ImageKit({
        publicKey: env.IMAGEKIT_PUBLIC_KEY,
        privateKey: env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
      });
    }
    return this.ik;
  }

  static async uploadImage(fileBuffer: Buffer, fileName: string, mimeType: string, userId: string) {
    const ikInstance = this.getIK();
    if (!ikInstance) {
      throw new Error('ImageKit is not configured. Please supply environment variables.');
    }

    const uploadResponse = await ikInstance.upload({
      file: fileBuffer,
      fileName: fileName,
      folder: '/blog',
      useUniqueFileName: true,
    });

    // Save reference to database
    return prisma.media.create({
      data: {
        uploadedById: userId,
        type: 'IMAGE',
        key: uploadResponse.fileId,
        bucket: 'imagekit',
        publicUrl: uploadResponse.url,
        fileName: uploadResponse.name,
        contentType: mimeType,
        size: uploadResponse.size,
        width: uploadResponse.width,
        height: uploadResponse.height,
      },
    });
  }

  static async deleteImage(mediaId: string) {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      throw new Error('Media resource not found');
    }

    const ikInstance = this.getIK();
    if (ikInstance) {
      try {
        await ikInstance.deleteFile(media.key);
      } catch (error) {
        console.error(`Failed to delete file from ImageKit: ${media.key}`, error);
      }
    }

    return prisma.media.delete({
      where: { id: mediaId },
    });
  }
}
