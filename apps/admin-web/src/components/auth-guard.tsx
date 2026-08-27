'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth-provider';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
                  D
                </div>
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
              <div className="hidden items-center gap-1 sm:flex">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-8 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-64 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-10 w-28 animate-pulse rounded-xl bg-muted" />
              </div>
              <div className="overflow-hidden rounded-2xl border border-border/60">
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
                      <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-10 animate-pulse rounded bg-muted" />
                      <div className="flex gap-1">
                        <div className="size-8 animate-pulse rounded-lg bg-muted" />
                        <div className="size-8 animate-pulse rounded-lg bg-muted" />
                        <div className="size-8 animate-pulse rounded-lg bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export default AuthGuard;
