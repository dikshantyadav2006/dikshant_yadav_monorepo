'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, ExternalLink, Trash2, Loader2 } from 'lucide-react';
import type { PostStatus } from '@dikshant/types';
import { usePostsList, useDeletePost } from '../hooks';

const statusStyles: Record<PostStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PUBLISHED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  SCHEDULED: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  ARCHIVED: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

export function PostsTable() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = usePostsList(1, 50);
  const deletePost = useDeletePost();

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deletePost.mutate(id);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
        {error.message || 'Failed to load posts'}
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

  const posts = data?.posts ?? [];

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 py-16 text-center">
        <p className="text-muted-foreground">No posts yet.</p>
        <Link
          href="/posts/new"
          className="mt-4 inline-flex rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white"
        >
          Create your first post
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
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">Updated</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Views</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-4">
                  <div className="font-medium text-foreground">{post.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">/{post.slug}</div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[post.status as PostStatus]}`}
                  >
                    {post.status}
                  </span>
                  {post.featured && (
                    <span className="ml-2 inline-flex rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                      Featured
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 hidden sm:table-cell text-muted-foreground">
                  {new Date(post.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 hidden md:table-cell text-muted-foreground">
                  {post._count?.views ?? 0}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {post.status === 'PUBLISHED' && (
                      <a
                        href={`${process.env.NEXT_PUBLIC_POST_URL || 'http://localhost:3000'}/posts/${post.id}/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        title="View on blog"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <Link
                      href={`/posts/${post.id}/edit`}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={deletePost.isPending}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      title="Delete"
                    >
                      {deletePost.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
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
          {data.pagination.total} post{data.pagination.total !== 1 ? 's' : ''} total
        </div>
      )}
    </div>
  );
}

export default PostsTable;
