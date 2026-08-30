'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiFetch from '../../../../lib/api';
import WorkCanvas from '../../../../components/work-editor/WorkCanvas';
import { PageLoader } from '../../../../components/shared/PageLoader';

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
    return <PageLoader label="Creating new work…" backHref="/works" backLabel="Back to works" />;
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
      }}
    />
  );
}
