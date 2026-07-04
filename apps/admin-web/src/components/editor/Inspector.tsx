'use client';

import React, { useState, useEffect } from 'react';
import { useVisualBuilderStore } from '../../features/visual-builder/store';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import apiFetch from '../../lib/api';
import type { Category, ImageLayout, ImageNodeData, PostStatus, Tag, UserPreferences } from '@dikshant/types';
import MediaField from './MediaField';
import type { UploadResponse } from '../../lib/upload';

const DEFAULT_FOCAL_POINT = { x: 50, y: 50 };

const IMAGE_LAYOUT_OPTIONS: Array<{
  value: ImageLayout;
  label: string;
  description: string;
}> = [
  { value: 'auto', label: 'Auto', description: 'Chooses the best crop from image metadata.' },
  { value: 'wide', label: 'Wide', description: 'Cinematic 16:9 presentation.' },
  { value: 'standard', label: 'Standard', description: 'Balanced 4:3 editorial crop.' },
  { value: 'portrait', label: 'Portrait', description: 'Vertical 3:4 story framing.' },
  { value: 'full-width', label: 'Full Width', description: 'Breaks out of the reading column.' },
];

const AUTOSAVE_INTERVAL_OPTIONS = [
  { value: 30000, label: '30 seconds' },
  { value: 60000, label: '1 minute' },
  { value: 120000, label: '2 minutes' },
  { value: 300000, label: '5 minutes' },
] as const;

function clampPercentage(value: number) {
  return Math.min(100, Math.max(0, Number(value.toFixed(2))));
}

function resolveAutoImageLayout(width?: number | null, height?: number | null): Exclude<ImageLayout, 'auto' | 'full-width'> {
  if (!width || !height) return 'standard';

  const aspectRatio = width / height;
  if (aspectRatio >= 1.55) return 'wide';
  if (aspectRatio <= 0.9) return 'portrait';
  return 'standard';
}

function getPreviewAspectClass(layout?: ImageLayout, width?: number | null, height?: number | null) {
  const effectiveLayout =
    layout === 'wide' || layout === 'standard' || layout === 'portrait'
      ? layout
      : resolveAutoImageLayout(width, height);

  switch (effectiveLayout) {
    case 'wide':
      return 'aspect-video';
    case 'portrait':
      return 'aspect-[3/4]';
    case 'standard':
    default:
      return 'aspect-[4/3]';
  }
}

function getObjectPositionStyle(focalPoint?: ImageNodeData['focalPoint']): React.CSSProperties {
  const x = clampPercentage(focalPoint?.x ?? DEFAULT_FOCAL_POINT.x);
  const y = clampPercentage(focalPoint?.y ?? DEFAULT_FOCAL_POINT.y);
  return { objectPosition: `${x}% ${y}%` };
}

function TooltipIcon({ text }: { text: string }) {
  return (
    <span className="relative inline-flex items-center group/tip align-middle">
      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-muted/60 text-muted-foreground text-[9px] font-bold cursor-help leading-none select-none">
        ?
      </span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1.5 rounded-lg bg-popover text-popover-foreground text-[10px] leading-relaxed shadow-md z-50 opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-150 group-hover/tip:delay-[2000ms] pointer-events-none max-w-[220px] text-center font-normal">
        {text}
      </span>
    </span>
  );
}

export function Inspector() {
  const activeNodeId = useVisualBuilderStore((state) => state.activeNodeId);
  const canvasData = useVisualBuilderStore((state) => state.canvasData);
  const setNodes = useVisualBuilderStore((state) => state.setNodes);
  const updateNodeData = useVisualBuilderStore((state) => state.updateNodeData);
  const setActiveNode = useVisualBuilderStore((state) => state.setActiveNode);
  const postMetadata = useVisualBuilderStore((state) => state.postMetadata);
  const updatePostMetadata = useVisualBuilderStore((state) => state.updatePostMetadata);
  const setAutosaveConfig = useVisualBuilderStore((state) => state.setAutosaveConfig);

  const [activeTab, setActiveTab] = useState<'properties' | 'styles'>('properties');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [preferencesError, setPreferencesError] = useState('');
  const [savingPreferenceKey, setSavingPreferenceKey] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, tagList] = await Promise.all([
          apiFetch<Category[]>('/categories'),
          apiFetch<Tag[]>('/tags'),
        ]);
        setCategories(cats);
        setTags(tagList);
        const prefs = await apiFetch<UserPreferences>('/preferences');
        setPreferences(prefs);
        setAutosaveConfig({
          enabled: prefs.autosaveEnabled,
          intervalMs: prefs.autosaveIntervalMs,
        });
      } catch (err) {
        console.error('Failed to load categories/tags in Inspector:', err);
      }
    }
    loadMeta();
  }, [setAutosaveConfig]);

  const selectedNode = canvasData.nodes.find((n) => n.id === activeNodeId);

  const updateMetadataField = (key: string, value: any) => {
    updatePostMetadata({ [key]: value });
  };

  const patchPreferences = async (patch: Partial<UserPreferences>, key: string) => {
    if (!preferences) return;

    const previous = preferences;
    const next = { ...preferences, ...patch };
    setPreferences(next);
    setPreferencesError('');
    setSavingPreferenceKey(key);

    if (patch.autosaveEnabled !== undefined || patch.autosaveIntervalMs !== undefined) {
      setAutosaveConfig({
        enabled: patch.autosaveEnabled ?? next.autosaveEnabled,
        intervalMs: patch.autosaveIntervalMs ?? next.autosaveIntervalMs,
      });
    }

    try {
      const saved = await apiFetch<UserPreferences>('/preferences', {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      setPreferences(saved);
      setAutosaveConfig({
        enabled: saved.autosaveEnabled,
        intervalMs: saved.autosaveIntervalMs,
      });
    } catch (err) {
      setPreferences(previous);
      setPreferencesError(err instanceof Error ? err.message : 'Failed to save editor preferences');
      setAutosaveConfig({
        enabled: previous.autosaveEnabled,
        intervalMs: previous.autosaveIntervalMs,
      });
    } finally {
      setSavingPreferenceKey(null);
    }
  };

  const toggleTag = (tagId: string) => {
    if (!postMetadata) return;
    const currentTags = postMetadata.tagIds || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId];
    updateMetadataField('tagIds', newTags);
  };

  const featuredBannerMeta = postMetadata?.featuredBannerImageMeta ?? null;
  const featuredBannerLayout = featuredBannerMeta?.layout ?? 'auto';
  const featuredBannerFocalPoint = featuredBannerMeta?.focalPoint ?? DEFAULT_FOCAL_POINT;
  const featuredBannerWidth =
    typeof postMetadata?.featuredBannerImageWidth === 'number' ? postMetadata.featuredBannerImageWidth : null;
  const featuredBannerHeight =
    typeof postMetadata?.featuredBannerImageHeight === 'number' ? postMetadata.featuredBannerImageHeight : null;
  const featuredBannerAutoLayout = resolveAutoImageLayout(featuredBannerWidth, featuredBannerHeight);

  const updateFeaturedBannerMeta = (updates: Record<string, unknown>) => {
    updateMetadataField('featuredBannerImageMeta', {
      ...(postMetadata?.featuredBannerImageMeta ?? {}),
      ...updates,
    });
  };

  const handleFeaturedBannerSourceChange = (src: string) => {
    updatePostMetadata({
      featuredBannerImageUrl: src,
      featuredBannerImageId: null,
      featuredBannerImageAlt: postMetadata?.featuredBannerImageAlt || '',
      featuredBannerImageWidth: null,
      featuredBannerImageHeight: null,
      featuredBannerImageMeta: {
        layout: postMetadata?.featuredBannerImageMeta?.layout ?? 'auto',
        focalPoint: postMetadata?.featuredBannerImageMeta?.focalPoint ?? DEFAULT_FOCAL_POINT,
      },
    });
  };

  const handleFeaturedBannerSelect = (media: UploadResponse) => {
    updatePostMetadata({
      featuredBannerImageId: media.id,
      featuredBannerImageUrl: media.secure_url || media.publicUrl,
      featuredBannerImageAlt: postMetadata?.featuredBannerImageAlt || media.alt || '',
      featuredBannerImageWidth: media.width ?? null,
      featuredBannerImageHeight: media.height ?? null,
      featuredBannerImageMeta: {
        layout: postMetadata?.featuredBannerImageMeta?.layout ?? 'auto',
        focalPoint: postMetadata?.featuredBannerImageMeta?.focalPoint ?? DEFAULT_FOCAL_POINT,
      },
    });
  };

  const handleFeaturedBannerPreviewLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const nextWidth = event.currentTarget.naturalWidth || null;
    const nextHeight = event.currentTarget.naturalHeight || null;

    if (!nextWidth || !nextHeight) return;
    if (nextWidth === featuredBannerWidth && nextHeight === featuredBannerHeight) return;

    updatePostMetadata({
      featuredBannerImageWidth: nextWidth,
      featuredBannerImageHeight: nextHeight,
    });
  };

  const handleFeaturedBannerFocalPointChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = clampPercentage(((event.clientX - rect.left) / rect.width) * 100);
    const y = clampPercentage(((event.clientY - rect.top) / rect.height) * 100);

    updateFeaturedBannerMeta({
      focalPoint: { x, y },
    });
  };

  // If no node is selected, display global Post Settings
  if (!selectedNode) {
    return (
      <aside className="w-80 border-l border-border bg-card flex flex-col h-full flex-shrink-0 select-none">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/60 bg-muted/10">
          <div className="text-xs font-bold text-foreground font-sans">Post Settings</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 font-sans">Configure global post metadata</div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {postMetadata ? (
            <>
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Post Title</label>
                <input
                  type="text"
                  required
                  value={postMetadata.title || ''}
                  onChange={(e) => updateMetadataField('title', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary font-semibold font-sans"
                  placeholder="Untitled Post"
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Excerpt</label>
                <textarea
                  rows={3}
                  value={postMetadata.excerpt || ''}
                  onChange={(e) => updateMetadataField('excerpt', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary min-h-[60px] font-sans"
                  placeholder="Short description..."
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Category</label>
                <select
                  value={postMetadata.categoryId || ''}
                  onChange={(e) => updateMetadataField('categoryId', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary font-sans"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Tags</label>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => {
                      const selected = (postMetadata.tagIds || []).includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold font-sans transition ${
                            selected
                              ? 'bg-primary text-primary-foreground'
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

              {/* Featured */}
              <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/10 p-3">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer font-sans">
                  <input
                    type="checkbox"
                    checked={postMetadata.featured || false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      updatePostMetadata({
                        featured: checked,
                        featuredPinned: checked ? postMetadata.featuredPinned : false,
                      });
                    }}
                    className="rounded border-input text-primary focus:ring-primary cursor-pointer"
                  />
                  <span>Featured Post</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer font-sans">
                  <input
                    type="checkbox"
                    checked={postMetadata.featuredPinned || false}
                    disabled={!postMetadata.featured}
                    onChange={(e) => updateMetadataField('featuredPinned', e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                  />
                  <span>Pin ahead of newest posts</span>
                </label>

                <div className="space-y-2">
                  <MediaField
                    label="Featured Image"
                    value={postMetadata.featuredBannerImageUrl || ''}
                    onChange={handleFeaturedBannerSourceChange}
                    onSelect={handleFeaturedBannerSelect}
                    accept="image/*"
                    alt={postMetadata.featuredBannerImageAlt || postMetadata.title}
                    placeholder="Upload or paste homepage featured image URL"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Required before a featured post can be published or scheduled.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Featured Image Alt</label>
                  <input
                    type="text"
                    value={postMetadata.featuredBannerImageAlt || ''}
                    onChange={(e) => updateMetadataField('featuredBannerImageAlt', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary font-sans"
                    placeholder="Describe the featured image"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Featured Layout</label>
                    <span className="text-[10px] text-muted-foreground">
                      {featuredBannerLayout === 'auto' ? `Auto selects ${featuredBannerAutoLayout}` : featuredBannerLayout}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {IMAGE_LAYOUT_OPTIONS.filter((option) => option.value !== 'full-width').map((option) => {
                      const selected = featuredBannerLayout === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateFeaturedBannerMeta({ layout: option.value })}
                          className={`rounded-xl border px-3 py-2 text-left transition ${
                            selected
                              ? 'border-primary bg-primary/5 text-foreground'
                              : 'border-border/60 bg-background text-muted-foreground hover:border-border'
                          }`}
                        >
                          <div className="text-[11px] font-semibold">{option.label}</div>
                          <div className="mt-0.5 text-[10px] leading-snug">{option.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {postMetadata.featuredBannerImageUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Featured Focal Point</label>
                      <button
                        type="button"
                        onClick={() => updateFeaturedBannerMeta({ focalPoint: DEFAULT_FOCAL_POINT })}
                        className="text-[10px] font-semibold text-primary hover:underline"
                      >
                        Reset
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleFeaturedBannerFocalPointChange}
                      className={`group relative block w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/30 ${getPreviewAspectClass(
                        featuredBannerLayout,
                        featuredBannerWidth,
                        featuredBannerHeight,
                      )}`}
                      title="Click to set featured image focus"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={postMetadata.featuredBannerImageUrl}
                        alt={postMetadata.featuredBannerImageAlt || postMetadata.title || 'Featured image preview'}
                        onLoad={handleFeaturedBannerPreviewLoad}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        style={getObjectPositionStyle(featuredBannerFocalPoint)}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                      <div
                        className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white/20 shadow"
                        style={{ left: `${featuredBannerFocalPoint.x}%`, top: `${featuredBannerFocalPoint.y}%` }}
                      >
                        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
                      </div>
                    </button>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>
                        Focus: {Math.round(featuredBannerFocalPoint.x)}% x {Math.round(featuredBannerFocalPoint.y)}%
                      </span>
                      <span>
                        {featuredBannerWidth && featuredBannerHeight
                          ? `${featuredBannerWidth} x ${featuredBannerHeight}`
                          : 'Dimensions detected automatically'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* SEO Divider */}
              <hr className="border-border/40 my-3" />

              {/* SEO Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">SEO Title</label>
                <input
                  type="text"
                  value={postMetadata.seoTitle || ''}
                  onChange={(e) => updateMetadataField('seoTitle', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary font-sans"
                  placeholder="Search engine title..."
                />
              </div>

              {/* SEO Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">SEO Description</label>
                <textarea
                  rows={3}
                  value={postMetadata.seoDescription || ''}
                  onChange={(e) => updateMetadataField('seoDescription', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary min-h-[60px] font-sans"
                  placeholder="Search engine description..."
                />
              </div>

              <hr className="border-border/40 my-3" />

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Editor Preferences</label>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Personal editing defaults save automatically.
                  </p>
                </div>

                {preferencesError && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-[10px] text-destructive">
                    {preferencesError}
                  </div>
                )}

                {preferences && (
                  <>
                    <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/10 p-3">
                      <div className="text-[10px] font-bold uppercase text-muted-foreground">Writing Experience</div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer font-sans flex-1">
                          <input
                            type="checkbox"
                            checked={preferences.autosaveEnabled}
                            onChange={(e) => patchPreferences({ autosaveEnabled: e.target.checked }, 'autosaveEnabled')}
                            className="rounded border-input text-primary focus:ring-primary cursor-pointer"
                          />
                          <span>Autosave</span>
                        </label>
                        <TooltipIcon text="Automatically save your work at the configured interval. Prevents data loss while editing." />
                      </div>
                      <div className="space-y-1.5">
                        <label className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase font-sans">Autosave Interval<TooltipIcon text="How often your work is automatically saved when autosave is enabled." /></label>
                        <select
                          value={preferences.autosaveIntervalMs}
                          disabled={!preferences.autosaveEnabled}
                          onChange={(e) =>
                            patchPreferences({ autosaveIntervalMs: Number(e.target.value) }, 'autosaveIntervalMs')
                          }
                          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 font-sans"
                        >
                          {AUTOSAVE_INTERVAL_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer font-sans flex-1">
                          <input
                            type="checkbox"
                            checked={preferences.compactEditorMode}
                            onChange={(e) => patchPreferences({ compactEditorMode: e.target.checked }, 'compactEditorMode')}
                            className="rounded border-input text-primary focus:ring-primary cursor-pointer"
                          />
                          <span>Compact Editor Mode</span>
                        </label>
                        <TooltipIcon text="Reduces padding and spacing for a denser editing experience with more content visible on screen." />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer font-sans flex-1">
                          <input
                            type="checkbox"
                            checked={preferences.focusMode}
                            onChange={(e) => patchPreferences({ focusMode: e.target.checked }, 'focusMode')}
                            className="rounded border-input text-primary focus:ring-primary cursor-pointer"
                          />
                          <span>Focus Mode</span>
                        </label>
                        <TooltipIcon text="Hides all side panels and distractions so you can focus purely on writing." />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/10 p-3">
                      <div className="text-[10px] font-bold uppercase text-muted-foreground">Publishing</div>
                      <div className="space-y-1.5">
                        <label className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase font-sans">Default Visibility<TooltipIcon text="The default publish status applied to new posts. Can be changed per-post before publishing." /></label>
                        <select
                          value={preferences.defaultVisibility}
                          onChange={(e) =>
                            patchPreferences(
                              { defaultVisibility: e.target.value as PostStatus },
                              'defaultVisibility',
                            )
                          }
                          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary font-sans"
                        >
                          <option value="DRAFT">Draft</option>
                          <option value="PUBLISHED">Published</option>
                          <option value="SCHEDULED">Scheduled</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer font-sans flex-1">
                          <input
                            type="checkbox"
                            checked={preferences.defaultFeatured}
                            onChange={(e) => patchPreferences({ defaultFeatured: e.target.checked }, 'defaultFeatured')}
                            className="rounded border-input text-primary focus:ring-primary cursor-pointer"
                          />
                          <span>Default Featured Status</span>
                        </label>
                        <TooltipIcon text="Automatically marks new posts as featured, displaying them prominently on the homepage." />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/10 p-3">
                      <div className="text-[10px] font-bold uppercase text-muted-foreground">Media</div>
                      <div className="space-y-1.5">
                        <label className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase font-sans">Default Image Layout<TooltipIcon text="The default cropping/layout applied to images inserted into posts. Auto selects based on image dimensions." /></label>
                        <select
                          value={preferences.defaultImageLayout || 'auto'}
                          onChange={(e) => patchPreferences({ defaultImageLayout: e.target.value as ImageLayout }, 'defaultImageLayout')}
                          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary font-sans"
                        >
                          <option value="auto">Auto</option>
                          {IMAGE_LAYOUT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase font-sans">Default Hero Image Style<TooltipIcon text="The default hero image style applied to new posts. Controls how the top banner image is displayed." /></label>
                        <select
                          value={preferences.defaultHeroImageStyle || 'auto'}
                          onChange={(e) =>
                            patchPreferences({ defaultHeroImageStyle: e.target.value }, 'defaultHeroImageStyle')
                          }
                          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary font-sans"
                        >
                          <option value="auto">Auto</option>
                          <option value="wide">Wide</option>
                          <option value="standard">Standard</option>
                          <option value="portrait">Portrait</option>
                        </select>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground">
                      {savingPreferenceKey ? 'Saving preferences...' : 'Preferences save instantly.'}
                    </p>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-[10px] text-muted-foreground mt-2 font-sans">Loading settings...</span>
            </div>
          )}
        </div>
      </aside>
    );
  }

  const { type } = selectedNode;
  const data = selectedNode.data as any;
  const imageData = type === 'image' ? (data as ImageNodeData) : null;
  const focalPoint = imageData?.focalPoint ?? DEFAULT_FOCAL_POINT;
  const imageWidth = typeof imageData?.width === 'number' ? imageData.width : null;
  const imageHeight = typeof imageData?.height === 'number' ? imageData.height : null;
  const autoLayout = resolveAutoImageLayout(imageWidth, imageHeight);

  const updateField = (key: string, value: any) => {
    updateNodeData(selectedNode.id, { [key]: value });
  };

  const updateImageData = (updates: Partial<ImageNodeData>) => {
    updateNodeData(selectedNode.id, updates as Record<string, unknown>);
  };

  const handleImageSourceChange = (src: string) => {
    updateImageData({
      src,
      mediaId: null,
      width: null,
      height: null,
      blurDataUrl: null,
      dominantColor: null,
      responsiveMeta: null,
      focalPoint: DEFAULT_FOCAL_POINT,
    });
  };

  const handleImageMediaSelect = (media: {
    id: string;
    publicUrl: string;
    secure_url: string;
    width?: number | null;
    height?: number | null;
    alt?: string | null;
    blurDataUrl?: string | null;
    dominantColor?: string | null;
    responsiveMeta?: Record<string, unknown> | null;
  }) => {
    updateImageData({
      src: media.secure_url || media.publicUrl,
      mediaId: media.id,
      width: media.width ?? null,
      height: media.height ?? null,
      alt: imageData?.alt || media.alt || '',
      blurDataUrl: media.blurDataUrl ?? null,
      dominantColor: media.dominantColor ?? null,
      responsiveMeta: media.responsiveMeta ?? null,
      focalPoint: imageData?.focalPoint ?? DEFAULT_FOCAL_POINT,
    });
  };

  const handleImagePreviewLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const nextWidth = event.currentTarget.naturalWidth || null;
    const nextHeight = event.currentTarget.naturalHeight || null;

    if (!nextWidth || !nextHeight) return;
    if (nextWidth === imageWidth && nextHeight === imageHeight) return;

    updateImageData({
      width: nextWidth,
      height: nextHeight,
    });
  };

  const handleFocalPointChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = clampPercentage(((event.clientX - rect.left) / rect.width) * 100);
    const y = clampPercentage(((event.clientY - rect.top) / rect.height) * 100);

    updateImageData({
      focalPoint: { x, y },
    });
  };

  const handleDelete = () => {
    setNodes(canvasData.nodes.filter((node) => node.id !== selectedNode.id));
    setActiveNode(null);
  };

  // Helper for rendering multiple options for Question/Poll
  const handleOptionChange = (index: number, label: string) => {
    const options = [...((data.options as any[]) || [])];
    options[index] = { ...options[index], label };
    updateField('options', options);
  };

  const addOption = () => {
    const options = [...((data.options as any[]) || [])];
    options.push({ id: `opt-${crypto.randomUUID().slice(0, 6)}`, label: `New Option` });
    updateField('options', options);
  };

  const removeOption = (index: number) => {
    const options = [...((data.options as any[]) || [])];
    options.splice(index, 1);
    updateField('options', options);
  };

  // Helper for Gallery images list
  const handleGalleryImageChange = (index: number, src: string) => {
    const items = [...((data.items as any[]) || [])];
    items[index] = src;
    updateField('items', items);
  };

  const addGalleryImage = () => {
    const items = [...((data.items as any[]) || [])];
    items.push('');
    updateField('items', items);
  };

  const removeGalleryImage = (index: number) => {
    const items = [...((data.items as any[]) || [])];
    items.splice(index, 1);
    updateField('items', items);
  };

  return (
    <aside className="w-80 border-l border-border bg-card flex flex-col h-full flex-shrink-0 select-none">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/60 bg-muted/10">
        <div className="text-xs font-bold text-foreground capitalize">{type} Settings</div>
        <div className="text-[10px] text-muted-foreground mt-0.5 truncate">ID: {selectedNode.id}</div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/60 bg-muted/20 p-1.5 gap-1">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'properties'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Properties
        </button>
        <button
          onClick={() => setActiveTab('styles')}
          className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'styles'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Styles
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
        {activeTab === 'properties' ? (
          <div className="space-y-4">
            {/* 1. Heading Properties */}
            {type === 'heading' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Heading Text</label>
                  <textarea
                    value={data.text || ''}
                    onChange={(e) => updateField('text', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary min-h-[60px]"
                    placeholder="Enter heading..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">HTML Tag</label>
                  <select
                    value={data.level || 2}
                    onChange={(e) => updateField('level', Number(e.target.value))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value={1}>H1 (Main title)</option>
                    <option value={2}>H2 (Section heading)</option>
                    <option value={3}>H3 (Sub-section)</option>
                  </select>
                </div>
              </>
            )}

            {/* 2. Text Properties */}
            {type === 'text' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Body Content</label>
                <textarea
                  value={data.body || ''}
                  onChange={(e) => updateField('body', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary min-h-[160px] leading-relaxed"
                  placeholder="Start typing..."
                />
              </div>
            )}

            {/* 3. Image Properties */}
            {type === 'image' && (
              <>
                <MediaField
                  label="Image Source"
                  value={(data.src as string) || ''}
                  onChange={handleImageSourceChange}
                  onSelect={handleImageMediaSelect}
                  accept="image/*"
                  alt={data.alt || ''}
                  placeholder="Upload or paste image URL (Cloudinary, Pexels, etc.)"
                />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Alt Description</label>
                  <input
                    type="text"
                    value={data.alt || ''}
                    onChange={(e) => updateField('alt', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Descriptive alt text..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Caption</label>
                  <input
                    type="text"
                    value={data.caption || ''}
                    onChange={(e) => updateField('caption', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Optional image caption..."
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Layout</label>
                    <span className="text-[10px] text-muted-foreground">
                      {data.layout === 'auto' || !data.layout ? `Auto selects ${autoLayout}` : data.layout}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {IMAGE_LAYOUT_OPTIONS.map((option) => {
                      const selected = (data.layout || 'auto') === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateField('layout', option.value)}
                          className={`rounded-xl border px-3 py-2 text-left transition ${
                            selected
                              ? 'border-primary bg-primary/5 text-foreground'
                              : 'border-border/60 bg-background text-muted-foreground hover:border-border'
                          }`}
                        >
                          <div className="text-[11px] font-semibold">{option.label}</div>
                          <div className="mt-0.5 text-[10px] leading-snug">{option.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {data.src && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Focal Point</label>
                      <button
                        type="button"
                        onClick={() => updateField('focalPoint', DEFAULT_FOCAL_POINT)}
                        className="text-[10px] font-semibold text-primary hover:underline"
                      >
                        Reset
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleFocalPointChange}
                      className={`group relative block w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/30 ${getPreviewAspectClass(data.layout, imageWidth, imageHeight)}`}
                      title="Click to position the subject"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={data.src}
                        alt={data.alt || data.caption || 'Image preview'}
                        onLoad={handleImagePreviewLoad}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        style={getObjectPositionStyle(focalPoint)}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                      <div
                        className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white/20 shadow"
                        style={{ left: `${focalPoint.x}%`, top: `${focalPoint.y}%` }}
                      >
                        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
                      </div>
                      <div className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/65 px-2 py-1 text-[10px] font-medium text-white">
                        Click preview to set focus
                      </div>
                    </button>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>
                        Focus: {Math.round(focalPoint.x)}% x {Math.round(focalPoint.y)}%
                      </span>
                      <span>
                        {imageWidth && imageHeight ? `${imageWidth} x ${imageHeight}` : 'Dimensions detected automatically'}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 4. Video Properties */}
            {type === 'video' && (
              <>
                <MediaField
                  label="Video Source"
                  value={(data.src as string) || ''}
                  onChange={(url) => updateField('src', url)}
                  accept="video/*"
                  placeholder="Upload video or paste YouTube/Vimeo/direct URL"
                />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Title</label>
                  <input
                    type="text"
                    value={data.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Video title..."
                  />
                </div>
              </>
            )}

            {/* 5. Gallery Properties */}
            {type === 'gallery' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Images list</label>
                  <button
                    onClick={addGalleryImage}
                    className="text-[10px] flex items-center gap-0.5 text-primary hover:underline font-semibold"
                  >
                    <Plus className="w-3 h-3" /> Add Image
                  </button>
                </div>
                <div className="space-y-2">
                  {((data.items as any[]) || []).map((src: string, index: number) => (
                    <div key={index} className="flex gap-1.5 items-start">
                      <div className="flex-1">
                        <MediaField
                          label={`Image ${index + 1}`}
                          value={src}
                          onChange={(url) => handleGalleryImageChange(index, url)}
                          accept="image/*"
                          placeholder="Upload or paste URL"
                        />
                      </div>
                      <button
                        onClick={() => removeGalleryImage(index)}
                        className="text-muted-foreground/60 hover:text-destructive p-1.5 rounded hover:bg-muted mt-5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {((data.items as any[]) || []).length === 0 && (
                    <div className="text-center py-4 border border-dashed border-border/40 rounded-xl text-muted-foreground/60 text-[10px]">
                      No images added. Click "Add Image" above.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. Quote Properties */}
            {type === 'quote' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Quote Text</label>
                  <textarea
                    value={data.quote || ''}
                    onChange={(e) => updateField('quote', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                    placeholder="Quote text..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Attribution</label>
                  <input
                    type="text"
                    value={data.attribution || ''}
                    onChange={(e) => updateField('attribution', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Author name..."
                  />
                </div>
              </>
            )}

            {/* 7. Code Block Properties */}
            {type === 'code-block' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Language</label>
                  <select
                    value={data.language || 'typescript'}
                    onChange={(e) => updateField('language', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="python">Python</option>
                    <option value="bash">Bash</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Code Snippet</label>
                  <textarea
                    value={data.code || ''}
                    onChange={(e) => updateField('code', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background p-2.5 font-mono text-[10px] outline-none focus:ring-1 focus:ring-primary min-h-[140px] leading-normal"
                    placeholder="// Write code here..."
                  />
                </div>
              </>
            )}

            {/* 8. Embed Properties */}
            {type === 'embed' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Embed URL</label>
                <input
                  type="text"
                  value={data.url || ''}
                  onChange={(e) => updateField('url', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                  placeholder="https://codepen.io/... or iframe link"
                />
              </div>
            )}

            {/* 9. Question Properties */}
            {type === 'question' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Question Prompt</label>
                  <input
                    type="text"
                    value={data.prompt || ''}
                    onChange={(e) => updateField('prompt', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter question prompt..."
                  />
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Options</label>
                    <button
                      onClick={addOption}
                      className="text-[10px] flex items-center gap-0.5 text-primary hover:underline font-semibold"
                    >
                      <Plus className="w-3 h-3" /> Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {((data.options as any[]) || []).map((opt: any, index: number) => (
                      <div key={opt.id} className="flex gap-1.5 items-center">
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 rounded-xl border border-input bg-background px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                          placeholder={`Option ${index + 1}`}
                        />
                        <button
                          onClick={() => removeOption(index)}
                          className="text-muted-foreground/60 hover:text-destructive p-1.5 rounded hover:bg-muted"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 10. Poll Properties */}
            {type === 'poll' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Poll Question</label>
                  <input
                    type="text"
                    value={data.prompt || ''}
                    onChange={(e) => updateField('prompt', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter poll question..."
                  />
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Poll Options</label>
                    <button
                      onClick={addOption}
                      className="text-[10px] flex items-center gap-0.5 text-primary hover:underline font-semibold"
                    >
                      <Plus className="w-3 h-3" /> Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {((data.options as any[]) || []).map((opt: any, index: number) => (
                      <div key={opt.id} className="flex gap-1.5 items-center">
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 rounded-xl border border-input bg-background px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                          placeholder={`Option ${index + 1}`}
                        />
                        <button
                          onClick={() => removeOption(index)}
                          className="text-muted-foreground/60 hover:text-destructive p-1.5 rounded hover:bg-muted"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 11. Button Properties */}
            {type === 'button' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Button Text</label>
                  <input
                    type="text"
                    value={data.label || ''}
                    onChange={(e) => updateField('label', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Call to Action"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Link URL</label>
                  <input
                    type="text"
                    value={data.href || ''}
                    onChange={(e) => updateField('href', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    placeholder="https://example.com"
                  />
                </div>
              </>
            )}

            {/* 12. AI Block Properties */}
            {type === 'ai-block' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Prompt</label>
                  <textarea
                    value={data.prompt || ''}
                    onChange={(e) => updateField('prompt', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                    placeholder="Summarize this section..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Output Type</label>
                  <select
                    value={data.outputType || 'text'}
                    onChange={(e) => updateField('outputType', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="text">Text block</option>
                    <option value="image">Image generation</option>
                    <option value="quiz">Interactive Quiz</option>
                  </select>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visual Styling */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Alignment</label>
              <div className="flex rounded-xl border border-border bg-background p-1.5 gap-1 w-full justify-between">
                <button
                  type="button"
                  onClick={() => updateField('alignment', 'left')}
                  className={`flex-1 flex justify-center py-1.5 rounded transition ${
                    (data.alignment || 'left') === 'left' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateField('alignment', 'center')}
                  className={`flex-1 flex justify-center py-1.5 rounded transition ${
                    data.alignment === 'center' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateField('alignment', 'right')}
                  className={`flex-1 flex justify-center py-1.5 rounded transition ${
                    data.alignment === 'right' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Background Color</label>
              <select
                value={data.background || 'transparent'}
                onChange={(e) => updateField('background', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="transparent">Transparent</option>
                <option value="muted">Light Gray</option>
                <option value="accent">Theme Accent</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Margin Top (px)</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={data.marginTop !== undefined ? data.marginTop : 24}
                  onChange={(e) => updateField('marginTop', Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Margin Bottom (px)</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={data.marginBottom !== undefined ? data.marginBottom : 24}
                  onChange={(e) => updateField('marginBottom', Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="border-t border-border/40 pt-3 mt-3">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="flex items-center justify-between w-full text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase transition-colors"
              >
                <span>Advanced Settings</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
              </button>

              {isAdvancedOpen && (
                <div className="space-y-3 pt-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Custom CSS Class</label>
                    <input
                      type="text"
                      value={data.customClass || ''}
                      onChange={(e) => updateField('customClass', e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                      placeholder="e.g. shadow-lg rounded-3xl"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Button footer */}
      <div className="p-4 border-t border-border/60 bg-muted/10">
        <button
          onClick={handleDelete}
          className="w-full py-2.5 rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive text-xs font-bold transition flex items-center justify-center gap-1.5 hover:border-destructive/30"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete Block
        </button>
      </div>
    </aside>
  );
}

export default Inspector;
