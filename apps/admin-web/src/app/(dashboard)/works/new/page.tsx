'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiFetch from '../../../../lib/api';
import WorkCanvas from '../../../../components/work-editor/WorkCanvas';

export default function NewWorkPage() {
  const router = useRouter();
  const [workId, setWorkId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function createDraft() {
      try {
        const draft = await apiFetch<{ id: string }>('/works', {
          method: 'POST',
          body: JSON.stringify({
            title: 'Untitled Work',
            status: 'DRAFT',
          }),
        });
        if (active && draft?.id) {
          setWorkId(draft.id);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to create draft work');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    createDraft();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Creating new work…</p>
        </div>
      </div>
    );
  }

  if (error || !workId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          {error || 'Failed to initialise new work'}
        </div>
      </div>
    );
  }

  return (
    <WorkCanvas
      workId={workId}
      initialWork={null}
      onBack={() => {
        router.push('/works');
        router.refresh();
      }}
    />
  );
}
