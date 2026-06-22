import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@dikshant/types';
import { Clock, Eye } from 'lucide-react';
import DossierLabel from '@/components/ui/dossier-label';
import { formatDate, formatDossierId } from '@/lib/utils';
import { getCoverUrl } from '@/lib/posts';

interface PostCardProps {
  post: Post;
  variant?: 'default' | 'compact' | 'horizontal';
  index?: number;
}

export default function PostCard({ post, variant = 'default', index }: PostCardProps) {
  const cover = getCoverUrl(post);

  if (variant === 'horizontal') {
    return (
      <Link href={`/posts/${post.slug}`} className="post-card group flex gap-5">
        {cover && (
          <div className="relative h-24 w-32 shrink-0 overflow-hidden border-2 border-foreground">
            <Image
              src={cover}
              alt={post.title}
              fill
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
              sizes="128px"
            />
          </div>
        )}
        <div className="flex flex-col justify-center min-w-0">
          <DossierLabel>{post.category?.name || 'Report'}</DossierLabel>
          <h3 className="font-display text-lg leading-snug mt-1 group-hover:underline underline-offset-4 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{post.excerpt}</p>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/posts/${post.slug}`} className="group block border-b border-foreground/20 py-4 last:border-0">
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-mono text-[10px] text-muted-foreground shrink-0">
            {index !== undefined ? String(index + 1).padStart(2, '0') : formatDossierId(post.id)}
          </span>
          <h3 className="font-display text-base leading-snug flex-1 group-hover:underline underline-offset-4">
            {post.title}
          </h3>
          <span className="font-mono text-[10px] text-muted-foreground shrink-0">
            {formatDate(post.publishedAt, 'short')}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/posts/${post.slug}`} className="post-card group flex flex-col h-full">
      {cover && (
        <div className="relative aspect-[16/10] -mx-5 -mt-5 mb-4 overflow-hidden border-b-2 border-foreground">
          <Image
            src={cover}
            alt={post.title}
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}
      <DossierLabel>{post.category?.name || 'Intelligence Report'}</DossierLabel>
      <h3 className="font-display text-xl leading-tight mt-2 mb-3 group-hover:underline underline-offset-4 line-clamp-3">
        {post.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
        {post.excerpt || 'Full dossier available for review.'}
      </p>
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-foreground/20 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {post.readingTime} min
        </span>
        {post._count?.views !== undefined && (
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {post._count.views}
          </span>
        )}
        <span className="ml-auto">{formatDate(post.publishedAt, 'short')}</span>
      </div>
    </Link>
  );
}
