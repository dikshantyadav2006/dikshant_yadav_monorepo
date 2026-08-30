'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function PageLoader({
  label,
  backHref,
  backLabel,
}: {
  label: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel || 'Back'}
          </Link>
        )}
      </div>
    </div>
  );
}