'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category, Post, PostStatus, Tag } from '@dikshant/types';
import apiFetch from '../lib/api';

export interface PostFormValues {
  title: string;
  content: string;
  excerpt: string;
  status: PostStatus;
  featured: boolean;
  categoryId: string;
  tagIds: string[];
  seoTitle: string;
  seoDescription: string;
}

const defaultValues: PostFormValues = {
  title: '',
  content: '',
  excerpt: '',
  status: 'DRAFT',
  featured: false,
  categoryId: '',
  tagIds: [],
  seoTitle: '',
  seoDescription: '',
};

interface PostFormProps {
  postId?: string;
  initialPost?: Post;
}

function postToFormValues(post: Post): PostFormValues {
  const tags = post.tags ?? [];
  const tagIds = tags.map((t) => ('tag' in t && t.tag ? t.tag.id : (t as Tag).id));

  return {
    title: post.title,
    content: post.content?.body ?? '',
    excerpt: post.excerpt ?? '',
    status: post.status,
    featured: post.featured,
    categoryId: post.categoryId ?? '',
    tagIds,
    seoTitle: post.seoTitle ?? '',
    seoDescription: post.seoDescription ?? '',
  };
}

export function PostForm({ postId, initialPost }: PostFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<PostFormValues>(
    initialPost ? postToFormValues(initialPost) : defaultValues
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, tagList] = await Promise.all([
          apiFetch<Category[]>('/categories'),
          apiFetch<Tag[]>('/tags'),
        ]);
        setCategories(cats);
        setTags(tagList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories/tags');
      } finally {
        setLoadingMeta(false);
      }
    }
    loadMeta();
  }, []);

  function updateField<K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(tagId: string) {
    setValues((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      title: values.title,
      content: values.content,
      excerpt: values.excerpt || undefined,
      status: values.status,
      featured: values.featured,
      categoryId: values.categoryId || null,
      tags: values.tagIds,
      seoTitle: values.seoTitle || undefined,
      seoDescription: values.seoDescription || undefined,
    };

    try {
      if (postId) {
        await apiFetch(`/posts/${postId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/posts', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingMeta) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              required
              value={values.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="excerpt" className="text-sm font-medium">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              rows={3}
              value={values.excerpt}
              onChange={(e) => updateField('excerpt', e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Content (MDX)
            </label>
            <textarea
              id="content"
              required
              rows={18}
              value={values.content}
              onChange={(e) => updateField('content', e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card/30 p-5 space-y-5">
            <h3 className="font-semibold">Publish</h3>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                value={values.status}
                onChange={(e) => updateField('status', e.target.value as PostStatus)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.featured}
                onChange={(e) => updateField('featured', e.target.checked)}
                className="rounded border-input"
              />
              Featured post
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-glow-primary transition hover:bg-accent/90 disabled:opacity-60"
            >
              {submitting ? 'Saving…' : postId ? 'Update Post' : 'Create Post'}
            </button>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/30 p-5 space-y-4">
            <h3 className="font-semibold">Category</h3>
            <select
              value={values.categoryId}
              onChange={(e) => updateField('categoryId', e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {tags.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card/30 p-5 space-y-4">
              <h3 className="font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const selected = values.tagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        selected
                          ? 'bg-accent text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border/60 bg-card/30 p-5 space-y-4">
            <h3 className="font-semibold">SEO</h3>
            <div className="space-y-2">
              <label htmlFor="seoTitle" className="text-xs font-medium text-muted-foreground">
                SEO Title
              </label>
              <input
                id="seoTitle"
                value={values.seoTitle}
                onChange={(e) => updateField('seoTitle', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="seoDescription" className="text-xs font-medium text-muted-foreground">
                SEO Description
              </label>
              <textarea
                id="seoDescription"
                rows={3}
                value={values.seoDescription}
                onChange={(e) => updateField('seoDescription', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default PostForm;
