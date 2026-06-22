'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { Post } from '@dikshant/types';
import DossierFrame from '@/components/layout/dossier-frame';
import DossierLabel from '@/components/ui/dossier-label';
import ArchiveStamp from '@/components/ui/archive-stamp';
import { formatDate, formatDossierId } from '@/lib/utils';
import { getCoverUrl } from '@/lib/posts';

interface FeaturedDossierProps {
  post: Post;
}

export default function FeaturedDossier({ post }: FeaturedDossierProps) {
  const cover = getCoverUrl(post, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80');

  return (
    <DossierFrame label="Featured Dossier" className="relative overflow-hidden">
      <ArchiveStamp text="Priority" className="absolute top-6 right-6 hidden sm:block" />

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <DossierLabel variant="classified">Featured Intelligence</DossierLabel>
            <span className="font-mono text-[10px] text-muted-foreground">
              {formatDossierId(post.id)}
            </span>
          </div>

          <h1 className="editorial-headline text-4xl sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl font-serif">
            {post.excerpt || 'Primary intelligence report selected for featured review.'}
          </p>

          <div className="metadata-bar text-muted-foreground">
            <span>{post.author?.name || 'Dikshant Yadav'}</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>{post.readingTime} min read</span>
            {post.category && <span>{post.category.name}</span>}
          </div>

          <Link
            href={`/posts/${post.slug}`}
            className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground text-card px-6 py-3 font-mono text-xs uppercase tracking-wider hover:bg-card hover:text-foreground transition-colors"
          >
            Open Dossier
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="lg:col-span-5">
          <div className="relative aspect-[4/5] border-2 border-foreground overflow-hidden">
            <Image
              src={cover}
              alt={post.title}
              fill
              priority
              className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-foreground/80 text-card p-3 font-mono text-[10px] uppercase tracking-wider">
              Cover Document — {post.category?.name || 'Uncategorized'}
            </div>
          </div>
        </div>
      </div>
    </DossierFrame>
  );
}
