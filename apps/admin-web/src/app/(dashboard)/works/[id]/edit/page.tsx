'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Work } from '@dikshant/types';
import apiFetch from '../../../../../lib/api';
import WorkCanvas from '../../../../../components/work-editor/WorkCanvas';

export default function EditWorkPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadWork() {
      try {
        const data = await apiFetch<Work>(`/works/${id}`);
        setWork(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load work');
      } finally {
        setLoading(false);
      }
    }
    loadWork();
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Loading work…</p>
        </div>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          {error || 'Work not found'}
        </div>
      </div>
    );
  }

  return (
    <WorkCanvas
      workId={id}
      initialWork={work}
      onBack={() => {
        router.push('/works');
        router.refresh();
      }}
    />
  );
}
