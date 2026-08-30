'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiFetch from '../../../../lib/api';
import Canvas from '../../../../components/editor/Canvas';
import { PageLoader } from '../../../../components/shared/PageLoader';

export default function NewPostPage() {
  const router = useRouter();
  const [postId, setPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const draftCreated = useRef(false);

  useEffect(() => {
    if (draftCreated.current) return;
    draftCreated.current = true;

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
    return <PageLoader label="Creating new post…" backHref="/" backLabel="Back to posts" />;
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
      }}
    />
  );
}
