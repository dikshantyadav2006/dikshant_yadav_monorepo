'use client';

import { useState } from 'react';
import { Check, Copy, Twitter, Linkedin, Link2 } from 'lucide-react';
import type { Post } from '@dikshant/types';
import { SITE_URL } from '@/lib/constants';
import { getPostPath } from '@/lib/posts';

interface ShareButtonsProps {
  post: Pick<Post, 'id' | 'slug' | 'title'>;
}

export default function ShareButtons({ post }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE_URL}${getPostPath(post)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="dossier-label mr-2">Share</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 border border-foreground/30 hover:bg-foreground hover:text-card transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 border border-foreground/30 hover:bg-foreground hover:text-card transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </a>
      <button
        onClick={handleCopy}
        className="p-2 border border-foreground/30 hover:bg-foreground hover:text-card transition-colors"
        aria-label="Copy link"
      >
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
