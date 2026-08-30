'use client';

import React, { useCallback, useState } from 'react';
import { Trash2, Loader2, X, Check, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import type { ContactSubmission } from '@dikshant/types';
import { useContactSubmissionsList, useDeleteContactSubmission } from '../hooks';
import { Skeleton } from './shared/Skeleton';

function ContactSubmissionsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/60 bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Contact</th>
              <th className="px-4 py-3 font-semibold">Budget</th>
              <th className="px-4 py-3 font-semibold hidden lg:table-cell">Message</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">Received</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-40 mb-1.5" />
                  <Skeleton className="h-3 w-24" />
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <Skeleton className="h-3 w-32" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </td>
                <td className="px-4 py-4 hidden lg:table-cell">
                  <Skeleton className="h-3 w-64" />
                </td>
                <td className="px-4 py-4 hidden sm:table-cell">
                  <Skeleton className="h-3 w-20" />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
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

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ContactSubmissionsTable() {
  const { data, isLoading, error, refetch } = useContactSubmissionsList(1, 100);
  const deleteSubmission = useDeleteContactSubmission();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDeleteRequest = useCallback(
    (id: string) => {
      if (deletingId) return;
      setConfirmDeleteId(id);
    },
    [deletingId],
  );

  const handleDeleteConfirm = useCallback(
    (id: string, name: string) => {
      setConfirmDeleteId(null);
      setDeletingId(id);
      deleteSubmission.mutate(id, {
        onSuccess: () => {
          toast.success(`Submission from "${name}" deleted`);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to delete submission');
        },
        onSettled: () => setDeletingId(null),
      });
    },
    [deleteSubmission],
  );

  const handleDeleteCancel = useCallback(() => {
    if (deletingId) return;
    setConfirmDeleteId(null);
  }, [deletingId]);

  if (isLoading) {
    return <ContactSubmissionsTableSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
        {error.message || 'Failed to load submissions'}
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

  const submissions = data?.submissions ?? [];

  if (submissions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 py-16 text-center">
        <p className="text-muted-foreground">No submissions yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Submissions from the &ldquo;Let&apos;s work together!&rdquo; form on the connect page will
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/60 bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Contact</th>
              <th className="px-4 py-3 font-semibold">Budget</th>
              <th className="px-4 py-3 font-semibold hidden lg:table-cell">Message</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">Received</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {submissions.map((submission) => {
              const isConfirming = confirmDeleteId === submission.id;
              const isDeleting = deletingId === submission.id;
              const isExpanded = expandedId === submission.id;

              return (
                <React.Fragment key={submission.id}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : submission.id)}
                    className={`cursor-pointer ${
                      isDeleting
                        ? 'pointer-events-none cursor-progress select-none opacity-0 -translate-x-3 transition-all duration-300'
                        : `transition-colors ${
                            isConfirming ? 'bg-destructive/5' : 'hover:bg-muted/20'
                          }`
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium text-foreground">{submission.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {submission.source ?? 'connect'}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {submission.email}
                        </span>
                        {submission.phone && (
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            {submission.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                        {submission.budget ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-muted-foreground max-w-[260px]">
                      <span className="block truncate">{submission.message}</span>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell text-muted-foreground whitespace-nowrap">
                      {formatDate(submission.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
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
                              onClick={() => handleDeleteConfirm(submission.id, submission.name)}
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
                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(submission.id)}
                            disabled={isDeleting}
                            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-t border-border/40 bg-muted/10">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="text-sm text-foreground whitespace-pre-wrap">
                          {submission.message}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground md:hidden">
                          <span className="inline-flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            {submission.email}
                          </span>
                          {submission.phone && (
                            <span className="inline-flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5" />
                              {submission.phone}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="border-t border-border/40 px-4 py-3 text-xs text-muted-foreground">
          {data.pagination.total} submission{data.pagination.total !== 1 ? 's' : ''} total
        </div>
      )}
    </div>
  );
}

export default ContactSubmissionsTable;
