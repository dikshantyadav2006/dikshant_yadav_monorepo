'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import WorkCanvas from '../../../../../components/work-editor/WorkCanvas';
import { useWork } from '../../../../../hooks';
import { PageLoader } from '../../../../../components/shared/PageLoader';

export default function EditWorkPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: work, isLoading, error } = useWork(id);

  if (isLoading) {
    return <PageLoader label="Loading work…" backHref="/works" backLabel="Back to works" />;
  }

  if (error || !work) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          {error?.message || 'Work not found'}
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
      }}
    />
  );
}