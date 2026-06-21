'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiFetch from '../../../../lib/api';
import Canvas from '../../../../components/editor/Canvas';

export default function NewPostPage() {
  const router = useRouter();
  const [postId, setPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // On mount, create a blank draft post so the canvas has a postId to save against
  useEffect(() => {
    let active = true;
    async function createDraft() {
      try {
        const draft = await apiFetch<{ id: string }>('/posts', {
          method: 'POST',
          body: JSON.stringify({
            title: 'Untitled Post',
            content: '(draft)',
            status: 'DRAFT',
          }),
        });
        if (active && draft?.id) {
          setPostId(draft.id);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to create draft post');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    createDraft();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">
            Creating new post…
          </p>
        </div>
      </div>
    );
  }

  if (error || !postId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          {error || 'Failed to initialise new post'}
        </div>
      </div>
    );
  }

  return (
    <Canvas
      postId={postId}
      initialPost={null}
      onBack={() => {
        router.push('/');
        router.refresh();
      }}
    />
  );
}
