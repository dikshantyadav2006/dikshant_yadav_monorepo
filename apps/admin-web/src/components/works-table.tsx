'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { Edit, ExternalLink, Trash2, Loader2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Work, WorkStatus } from '@dikshant/types';
import { useWorksList, useDeleteWork } from '../hooks';
import { Skeleton } from './shared/Skeleton';

const statusStyles: Record<WorkStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PUBLISHED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  ARCHIVED: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

function WorksTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/60 bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Category</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">Updated</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Posts</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="hidden h-9 w-9 rounded-lg sm:block" />
                    <div>
                      <Skeleton className="h-4 w-48 mb-1.5" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <Skeleton className="h-3 w-20" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </td>
                <td className="px-4 py-4 hidden sm:table-cell">
                  <Skeleton className="h-3 w-20" />
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <Skeleton className="h-3 w-10" />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="size-8 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function WorksTable() {
  const { data, isLoading, error, refetch } = useWorksList(1, 50);
  const deleteWork = useDeleteWork();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteRequest = useCallback(
    (id: string) => {
      if (deletingId) return;
      setConfirmDeleteId(id);
    },
    [deletingId],
  );

  const handleDeleteConfirm = useCallback(
    (id: string, title: string) => {
      setConfirmDeleteId(null);
      setDeletingId(id);
      deleteWork.mutate(id, {
        onSuccess: () => {
          toast.success(`"${title}" deleted`);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to delete work');
        },
        onSettled: () => setDeletingId(null),
      });
    },
    [deleteWork],
  );

  const handleDeleteCancel = useCallback(() => {
    if (deletingId) return;
    setConfirmDeleteId(null);
  }, [deletingId]);

  if (isLoading) {
    return <WorksTableSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
        {error.message || 'Failed to load works'}
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 block w-full text-accent underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const works = data?.works ?? [];

  if (works.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 py-16 text-center">
        <p className="text-muted-foreground">No works yet.</p>
        <Link
          href="/works/new"
          className="mt-4 inline-flex rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white"
        >
          Create your first work
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-16 z-10 border-b border-border/60 bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground backdrop-blur">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Category</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">Updated</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Posts</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {works.map((work) => {
              const isConfirming = confirmDeleteId === work.id;
              const isDeleting = deletingId === work.id;

              return (
                <tr
                  key={work.id}
                  className={`${
                    isDeleting
                      ? 'pointer-events-none cursor-progress select-none opacity-0 -translate-x-3 transition-all duration-300'
                      : `transition-colors ${
                          isConfirming ? 'bg-destructive/5' : 'hover:bg-muted/20'
                        }`
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {work.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={work.imageUrl}
                          alt=""
                          className="hidden h-9 w-9 rounded-lg object-cover sm:block"
                        />
                      )}
                      <div>
                        <div className="font-medium text-foreground">{work.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">/{work.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell text-muted-foreground">
                    {work.category || '—'}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[work.status]}`}
                    >
                      {work.status}
                    </span>
                    {work.featured && (
                      <span className="ml-2 inline-flex rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell text-muted-foreground">
                    {new Date(work.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell text-muted-foreground">
                    {work._count?.postLinks ?? 0}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {isDeleting ? (
                        <span className="inline-flex items-center gap-1.5 pr-1 text-xs font-medium text-destructive">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Deleting…
                        </span>
                      ) : isConfirming ? (
                        <>
                          <span className="text-xs text-destructive font-medium mr-1">Delete?</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteConfirm(work.id, work.title)}
                            disabled={isDeleting}
                            className="inline-flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                            title="Confirm delete"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteCancel}
                            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {work.status === 'PUBLISHED' && (
                            <a
                              href={`${process.env.NEXT_PUBLIC_WORK_URL || 'http://localhost:3004'}/project/${work.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                              title="View on work site"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <Link
                            href={`/works/${work.id}/edit`}
                            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(work.id)}
                            disabled={isDeleting}
                            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="border-t border-border/40 px-4 py-3 text-xs text-muted-foreground">
          {data.pagination.total} work{data.pagination.total !== 1 ? 's' : ''} total
        </div>
      )}
    </div>
  );
}

export default WorksTable;