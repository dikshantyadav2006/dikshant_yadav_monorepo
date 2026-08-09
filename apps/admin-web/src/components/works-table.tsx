'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, ExternalLink, Trash2 } from 'lucide-react';
import type { Work, WorkStatus } from '@dikshant/types';
import apiFetch from '../lib/api';

const statusStyles: Record<WorkStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PUBLISHED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  ARCHIVED: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

interface WorksResponse {
  works: Work[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function WorksTable() {
  const router = useRouter();
  const [data, setData] = useState<WorksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadWorks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiFetch<WorksResponse>('/works?page=1&limit=50');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load works');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorks();
  }, [loadWorks]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      await apiFetch(`/works/${id}`, { method: 'DELETE' });
      await loadWorks();
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete work');
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
        {error}
        <button
          type="button"
          onClick={loadWorks}
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
            {works.map((work) => (
              <tr key={work.id} className="hover:bg-muted/20 transition-colors">
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
                      onClick={() => handleDelete(work.id, work.title)}
                      disabled={deletingId === work.id}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
