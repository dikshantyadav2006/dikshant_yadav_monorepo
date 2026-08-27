'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Canvas from '../../../../../components/editor/Canvas';
import { usePost } from '../../../../../hooks';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: post, isLoading, error } = usePost(id);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          {error?.message || 'Post not found'}
        </div>
      </div>
    );
  }

  return (
    <Canvas
      postId={id}
      initialPost={post}
      onBack={() => {
        router.push('/');
        router.refresh();
      }}
    />
  );
}
