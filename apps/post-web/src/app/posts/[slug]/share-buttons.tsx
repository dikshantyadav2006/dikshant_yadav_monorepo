'use client';

import React, { useState, useEffect } from 'react';
import { Twitter, Linkedin, Link, Check } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/posts/${slug}`);
    }
  }, [slug]);

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Read "${title}" by @dikshantyadav`
  )}&url=${encodeURIComponent(shareUrl)}`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="flex items-center gap-3">
      {/* Twitter */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/65 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </a>

      {/* LinkedIn */}
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/65 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/65 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
        title="Copy link to clipboard"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500 animate-fade-in" />
        ) : (
          <Link className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
export default ShareButtons;
