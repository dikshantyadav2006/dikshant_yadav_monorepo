'use client';

import { useState, type CSSProperties } from 'react';
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
  blurDataUrl?: string | null;
  dominantColor?: string | null;
  style?: CSSProperties;
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
  blurDataUrl,
  dominantColor,
  style,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);

  if (!src) return null;

  const blurClass = loaded ? 'smart-image-loaded' : 'smart-image-loading';

  if (canOptimize(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        priority={priority}
        placeholder={blurDataUrl ? 'blur' : 'empty'}
        blurDataURL={blurDataUrl || undefined}
        onLoad={() => setLoaded(true)}
        className={cn('smart-image', blurClass, className)}
        sizes={sizes}
        style={
          !blurDataUrl && dominantColor
            ? { ...style, backgroundColor: dominantColor }
            : style
        }
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
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          'absolute inset-0 h-full w-full object-cover smart-image',
          blurClass,
          className,
        )}
        style={
          dominantColor && !loaded
            ? { ...style, backgroundColor: dominantColor }
            : style
        }
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
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={cn('smart-image', blurClass, className)}
      style={style}
    />
  );
}
