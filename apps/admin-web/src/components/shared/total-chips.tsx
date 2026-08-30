'use client';

import React from 'react';
import { useWorksList, usePostsList, useContactSubmissionsList } from '../../hooks';
import { Skeleton } from './Skeleton';

function CountChip({
  value,
  loading,
  label,
}: {
  value: number | undefined;
  loading: boolean;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
      {loading ? <Skeleton className="h-3 w-6 rounded" /> : value}
      <span className="font-medium">{label}</span>
    </span>
  );
}

export function WorksCountChip() {
  const { data, isLoading } = useWorksList(1, 50);
  return <CountChip value={data?.pagination.total} loading={isLoading} label="works" />;
}

export function PostsCountChip() {
  const { data, isLoading } = usePostsList(1, 50);
  return <CountChip value={data?.pagination.total} loading={isLoading} label="posts" />;
}

export function SubmissionsCountChip() {
  const { data, isLoading } = useContactSubmissionsList(1, 50);
  return <CountChip value={data?.pagination.total} loading={isLoading} label="submissions" />;
}