'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Canvas from '../../../../../components/editor/Canvas';
import { usePost } from '../../../../../hooks';
import { PageLoader } from '../../../../../components/shared/PageLoader';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: post, isLoading, error } = usePost(id);

  if (isLoading) {
    return <PageLoader label="Loading post…" backHref="/" backLabel="Back to posts" />;
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
      }}
    />
  );
}
