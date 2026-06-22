'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

const OPTIMIZED_HOSTS = [
  'res.cloudinary.com',
  'ik.imagekit.io',
  'images.unsplash.com',
  'images.pexels.com',
  'picsum.photos',
  'cdn.jsdelivr.net',
];

function canOptimize(src: string): boolean {
  try {
    const url = new URL(src);
    return OPTIMIZED_HOSTS.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
    );
  } catch {
    return false;
  }
}

interface SmartImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export default function SmartImage({
  src,
  alt,
  fill,
  width,
  height,
  priority,
  className,
  sizes,
}: SmartImageProps) {
  if (!src) return null;

  if (canOptimize(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        priority={priority}
        className={className}
        sizes={sizes}
      />
    );
  }

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        className={cn('absolute inset-0 h-full w-full object-cover', className)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      className={className}
    />
  );
}
