'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Link2, Loader2, ChevronDown, Monitor, Smartphone } from 'lucide-react';
import { useWorkBuilderStore } from '../../features/work-builder/store';
import type { WorkContentBlock, Post } from '@dikshant/types';
import apiFetch from '../../lib/api';
import MediaField from '../editor/MediaField';
import { getWorkPosts, setWorkPosts } from '../../features/work-builder/api';
import { BlockPreview } from './BlockPreview';

interface WorkInspectorProps {
  workId: string;
}

type PreviewDevice = 'desktop' | 'mobile';

const SWATCH_PRESETS = [
  '#D2D8CB',
  '#E8C4A2',
  '#A8C5D6',
  '#D9B8C4',
  '#C9D4A5',
  '#E6D3A3',
  '#B8C9B8',
  '#C4B8D9',
];

interface PostsResponse {
  posts: Post[];
}

function ArrayFieldEditor({
  label,
  values,
  placeholder,
  onChange,
}: {
  label: string;
  values: string[];
  placeholder: string;
  onChange: (next: string[]) => void;
}) {
  const update = (index: number, value: string) => {
    const next = [...values];
    next[index] = value;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-muted-foreground uppercase">{label}</label>
        <button
          type="button"
          onClick={() => onChange([...values, ''])}
          className="text-[10px] flex items-center gap-0.5 text-primary hover:underline font-semibold"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      <div className="space-y-1.5">
        {values.map((value, index) => (
          <div key={index} className="flex gap-1.5 items-center">
            <input
              type="text"
              value={value}
              onChange={(e) => update(index, e.target.value)}
              className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              placeholder={placeholder}
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              className="text-muted-foreground/60 hover:text-destructive p-1.5 rounded hover:bg-muted"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImagePairEditor({
  label,
  images,
  alts,
  onChange,
}: {
  label: string;
  images: string[];
  alts: string[];
  onChange: (next: { images: string[]; alts: string[] }) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-muted-foreground uppercase">{label}</label>
      {[0, 1].map((i) => (
        <div key={i} className="space-y-1">
          <MediaField
            label={`Image ${i + 1}`}
            value={images[i] || ''}
            onChange={(src) => {
              const nextImages = [...images];
              nextImages[i] = src;
              onChange({ images: nextImages, alts });
            }}
            accept="image/*"
            placeholder="Upload or paste URL"
          />
          <input
            type="text"
            value={alts[i] || ''}
            onChange={(e) => {
              const nextAlts = [...alts];
              nextAlts[i] = e.target.value;
              onChange({ images, alts: nextAlts });
            }}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
            placeholder={`Alt text ${i + 1}`}
          />
        </div>
      ))}
    </div>
  );
}

export function WorkInspector({ workId }: WorkInspectorProps) {
  const activeNodeId = useWorkBuilderStore((state) => state.activeNodeId);
  const canvasData = useWorkBuilderStore((state) => state.canvasData);
  const setNodes = useWorkBuilderStore((state) => state.setNodes);
  const updateNodeData = useWorkBuilderStore((state) => state.updateNodeData);
  const setActiveNode = useWorkBuilderStore((state) => state.setActiveNode);
  const workMetadata = useWorkBuilderStore((state) => state.workMetadata);
  const updateWorkMetadata = useWorkBuilderStore((state) => state.updateWorkMetadata);

  const [isCreditsOpen, setIsCreditsOpen] = useState(true);
  const [isSeoOpen, setIsSeoOpen] = useState(false);
  const [isLinkedPostsOpen, setIsLinkedPostsOpen] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');

  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [linkedPostIds, setLinkedPostIds] = useState<string[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksSaving, setLinksSaving] = useState(false);
  const [linksError, setLinksError] = useState('');

  useEffect(() => {
    async function loadPosts() {
      try {
        const [all, linked] = await Promise.all([
          apiFetch<PostsResponse>('/posts?page=1&limit=200'),
          getWorkPosts(workId),
        ]);
        setAllPosts(all?.posts ?? []);
        setLinkedPostIds((linked?.posts ?? []).map((post) => post.id));
      } catch (err) {
        setLinksError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setLinksLoading(false);
      }
    }
    loadPosts();
  }, [workId]);

  const toggleLinkedPost = async (postId: string) => {
    const next = linkedPostIds.includes(postId)
      ? linkedPostIds.filter((id) => id !== postId)
      : [...linkedPostIds, postId];
    setLinkedPostIds(next);
    setLinksError('');
    setLinksSaving(true);
    try {
      await setWorkPosts(workId, next);
    } catch (err) {
      setLinkedPostIds(linkedPostIds);
      setLinksError(err instanceof Error ? err.message : 'Failed to save linked posts');
    } finally {
      setLinksSaving(false);
    }
  };

  const selectedNode = canvasData.nodes.find((n) => n.id === activeNodeId);

  const updateMetadataField = (key: string, value: any) => {
    updateWorkMetadata({ [key]: value });
  };

  const handleDelete = () => {
    if (!selectedNode) return;
    setNodes(canvasData.nodes.filter((node) => node.id !== selectedNode.id));
    setActiveNode(null);
  };

  if (!selectedNode) {
    const credits = workMetadata?.credits ?? [];

    return (
      <aside className="w-80 border-l border-border bg-card flex flex-col h-full flex-shrink-0 select-none">
        <div className="px-4 py-3 border-b border-border/60 bg-muted/10">
          <div className="text-xs font-bold text-foreground font-sans">Work Settings</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 font-sans">Configure global work metadata</div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {workMetadata ? (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Title</label>
                <input
                  type="text"
                  value={workMetadata.title || ''}
                  onChange={(e) => updateMetadataField('title', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary font-semibold font-sans"
                  placeholder="Untitled Work"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Subtitle</label>
                  <input
                    type="text"
                    value={workMetadata.subtitle || ''}
                    onChange={(e) => updateMetadataField('subtitle', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary font-sans"
                    placeholder="Role / tagline"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Category</label>
                  <input
                    type="text"
                    value={workMetadata.category || ''}
                    onChange={(e) => updateMetadataField('category', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary font-sans"
                    placeholder="e.g. Branding"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Year</label>
                  <input
                    type="text"
                    value={workMetadata.year || ''}
                    onChange={(e) => updateMetadataField('year', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary font-sans"
                    placeholder="2026"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Live URL</label>
                  <input
                    type="text"
                    value={workMetadata.link || ''}
                    onChange={(e) => updateMetadataField('link', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary font-sans"
                    placeholder="https://…"
                  />
                </div>
              </div>

              <MediaField
                label="Hero Image"
                value={workMetadata.heroImageUrl || ''}
                onChange={(url) => updateMetadataField('heroImageUrl', url)}
                accept="image/*"
                placeholder="Upload or paste hero image URL"
              />

              <MediaField
                label="Card Image"
                value={workMetadata.imageUrl || ''}
                onChange={(url) => updateMetadataField('imageUrl', url)}
                accept="image/*"
                placeholder="Upload or paste card image URL"
              />

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={workMetadata.swatchColor || '#D2D8CB'}
                    onChange={(e) => updateMetadataField('swatchColor', e.target.value)}
                    className="h-8 w-10 shrink-0 cursor-pointer rounded-lg border border-input bg-background p-0.5"
                  />
                  <input
                    type="text"
                    value={workMetadata.swatchColor || ''}
                    onChange={(e) => updateMetadataField('swatchColor', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary font-mono"
                    placeholder="#RRGGBB"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {SWATCH_PRESETS.map((swatch) => (
                    <button
                      key={swatch}
                      type="button"
                      onClick={() => updateMetadataField('swatchColor', swatch)}
                      className={`h-6 w-6 rounded-full border transition ${
                        workMetadata.swatchColor?.toLowerCase() === swatch
                          ? 'ring-2 ring-primary ring-offset-1 ring-offset-card'
                          : 'border-border'
                      }`}
                      style={{ backgroundColor: swatch }}
                      aria-label={`Set accent color ${swatch}`}
                    />
                  ))}
                </div>
                <p className="text-[9px] text-muted-foreground/70">
                  Used for next/prev cards, transitions and the color tracker.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Overview</label>
                <textarea
                  rows={3}
                  value={workMetadata.overview || ''}
                  onChange={(e) => updateMetadataField('overview', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary min-h-[60px] font-sans"
                  placeholder="Short one-liner for cards…"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Description</label>
                <textarea
                  rows={4}
                  value={workMetadata.description || ''}
                  onChange={(e) => updateMetadataField('description', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary min-h-[80px] font-sans"
                  placeholder="Longer project description…"
                />
              </div>

              <ArrayFieldEditor
                label="Tech Stack"
                values={workMetadata.techStack || []}
                placeholder="e.g. React, Node.js"
                onChange={(next) => updateMetadataField('techStack', next)}
              />

              {/* Status + Featured */}
              <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/10 p-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Status</label>
                  <select
                    value={workMetadata.status || 'DRAFT'}
                    onChange={(e) => updateMetadataField('status', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary font-sans"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer font-sans">
                  <input
                    type="checkbox"
                    checked={workMetadata.featured || false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      updateWorkMetadata({
                        featured: checked,
                        featuredPinned: checked ? workMetadata.featuredPinned : false,
                      });
                    }}
                    className="rounded border-input text-primary focus:ring-primary cursor-pointer"
                  />
                  <span>Featured Work</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer font-sans">
                  <input
                    type="checkbox"
                    checked={workMetadata.featuredPinned || false}
                    disabled={!workMetadata.featured}
                    onChange={(e) => updateMetadataField('featuredPinned', e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                  />
                  <span>Pin ahead of newest works</span>
                </label>
              </div>

              {/* Linked posts */}
              <div className="rounded-2xl border border-border/60 bg-muted/10 p-3 space-y-2">
                <button
                  type="button"
                  onClick={() => setIsLinkedPostsOpen(!isLinkedPostsOpen)}
                  className="w-full flex items-center justify-between text-[10px] font-bold uppercase text-muted-foreground"
                >
                  <span className="flex items-center gap-1">
                    <Link2 className="w-3 h-3" /> Linked Posts
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isLinkedPostsOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLinkedPostsOpen && (
                  <>
                    {linksError && (
                      <div className="text-[10px] text-destructive bg-destructive/5 border border-destructive/20 p-2 rounded-lg">
                        {linksError}
                      </div>
                    )}

                    {linksLoading ? (
                      <div className="flex items-center justify-center py-4 text-muted-foreground gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="text-[10px]">Loading posts…</span>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-44 overflow-y-auto space-y-1 no-scrollbar">
                          {allPosts.map((post) => {
                            const linked = linkedPostIds.includes(post.id);
                            return (
                              <button
                                key={post.id}
                                type="button"
                                disabled={linksSaving}
                                onClick={() => toggleLinkedPost(post.id)}
                                className={`w-full text-left flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium transition disabled:opacity-60 ${
                                  linked
                                    ? 'bg-primary/10 text-foreground'
                                    : 'bg-background text-muted-foreground hover:bg-muted/60'
                                }`}
                              >
                                <span className="truncate">{post.title}</span>
                                <span
                                  className={`text-[9px] font-bold uppercase ${linked ? 'text-primary' : 'text-muted-foreground/60'}`}
                                >
                                  {linked ? 'Linked' : 'Link'}
                                </span>
                              </button>
                            );
                          })}
                          {allPosts.length === 0 && (
                            <p className="text-[10px] text-muted-foreground/60">No posts available.</p>
                          )}
                        </div>
                        <p className="text-[9px] text-muted-foreground/70">
                          {linksSaving ? 'Saving…' : 'Linked posts appear on the work page.'}
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Credits */}
              <div className="rounded-2xl border border-border/60 bg-muted/10 p-3 space-y-2">
                <button
                  type="button"
                  onClick={() => setIsCreditsOpen(!isCreditsOpen)}
                  className="w-full flex items-center justify-between text-[10px] font-bold uppercase text-muted-foreground"
                >
                  <span>Credits</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isCreditsOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCreditsOpen && (
                  <div className="space-y-2">
                    {credits.map((credit, index) => (
                      <div key={index} className="flex gap-1.5 items-center">
                        <input
                          type="text"
                          value={credit.role}
                          onChange={(e) => {
                            const next = [...credits];
                            next[index] = { ...next[index], role: e.target.value };
                            updateMetadataField('credits', next);
                          }}
                          className="flex-1 rounded-xl border border-input bg-background px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Role"
                        />
                        <input
                          type="text"
                          value={credit.value}
                          onChange={(e) => {
                            const next = [...credits];
                            next[index] = { ...next[index], value: e.target.value };
                            updateMetadataField('credits', next);
                          }}
                          className="flex-1 rounded-xl border border-input bg-background px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Person / team"
                        />
                        <button
                          type="button"
                          onClick={() => updateMetadataField('credits', credits.filter((_, i) => i !== index))}
                          className="text-muted-foreground/60 hover:text-destructive p-1.5 rounded hover:bg-muted"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => updateMetadataField('credits', [...credits, { role: '', value: '' }])}
                      className="w-full text-[10px] flex items-center justify-center gap-0.5 text-primary hover:underline font-semibold py-1"
                    >
                      <Plus className="w-3 h-3" /> Add Credit
                    </button>
                  </div>
                )}
              </div>

              {/* SEO */}
              <div className="rounded-2xl border border-border/60 bg-muted/10 p-3 space-y-2">
                <button
                  type="button"
                  onClick={() => setIsSeoOpen(!isSeoOpen)}
                  className="w-full flex items-center justify-between text-[10px] font-bold uppercase text-muted-foreground"
                >
                  <span>SEO</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isSeoOpen ? 'rotate-180' : ''}`} />
                </button>
                {isSeoOpen && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={workMetadata.seoTitle || ''}
                      onChange={(e) => updateMetadataField('seoTitle', e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                      placeholder="SEO title"
                    />
                    <textarea
                      rows={3}
                      value={workMetadata.seoDescription || ''}
                      onChange={(e) => updateMetadataField('seoDescription', e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                      placeholder="SEO description"
                    />
                  </div>
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

  const updateField = (key: string, value: any) => {
    updateNodeData(selectedNode.id, { [key]: value });
  };

  const previewBlock = { type, ...data } as unknown as WorkContentBlock;

  return (
    <aside className="w-80 border-l border-border bg-card flex flex-col h-full flex-shrink-0 select-none">
      <div className="px-4 py-3 border-b border-border/60 bg-muted/10">
        <div className="text-xs font-bold text-foreground capitalize">{type} Settings</div>
        <div className="text-[10px] text-muted-foreground mt-0.5 truncate">ID: {selectedNode.id}</div>
      </div>

      {/* Mobile / Desktop preview */}
      <div className="px-4 pt-3 pb-1 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase text-muted-foreground">Preview</span>
          <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md transition ${
                previewDevice === 'desktop'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Monitor className="w-3 h-3" /> Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md transition ${
                previewDevice === 'mobile'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Smartphone className="w-3 h-3" /> Mobile
            </button>
          </div>
        </div>
        <div
          className={`rounded-xl border border-border/60 bg-muted/10 p-2 ${
            previewDevice === 'mobile' ? 'max-w-[220px] mx-auto' : ''
          }`}
        >
          <BlockPreview block={previewBlock} />
        </div>
        <p className="text-[9px] text-muted-foreground/70">
          Same block data — layout adapts to each device.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {(type === 'large-image' || type === 'banner') && (
          <>
            <MediaField
              label="Image Source"
              value={data.src || ''}
              onChange={(src) => updateField('src', src)}
              accept="image/*"
              alt={data.alt || ''}
              placeholder="Upload or paste image URL"
            />
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Alt Text</label>
              <input
                type="text"
                value={data.alt || ''}
                onChange={(e) => updateField('alt', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                placeholder="Descriptive alt text…"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Height (CSS)</label>
              <input
                type="text"
                value={data.height || ''}
                onChange={(e) => updateField('height', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. 700px"
              />
            </div>
          </>
        )}

        {(type === 'grid-2' || type === 'posters') && (
          <>
            <ImagePairEditor
              label="Images"
              images={data.images || []}
              alts={data.alts || []}
              onChange={(next) => {
                const { images, alts } = next;
                updateNodeData(selectedNode.id, { images, alts });
              }}
            />
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Height (CSS)</label>
              <input
                type="text"
                value={data.height || ''}
                onChange={(e) => updateField('height', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. 700px"
              />
            </div>
          </>
        )}

        {(type === 'mobile-showcase' || type === 'desktop-showcase') && (
          <>
            <ArrayFieldEditor
              label={type === 'mobile-showcase' ? 'Mobile Screens' : 'Desktop Screens'}
              values={data.mobile || data.desktop || []}
              placeholder="Upload or paste screenshot URL"
              onChange={(next) =>
                updateField(type === 'mobile-showcase' ? 'mobile' : 'desktop', next)
              }
            />
            <ArrayFieldEditor
              label={type === 'mobile-showcase' ? 'Desktop Screens' : 'Mobile Screens'}
              values={data.desktop || data.mobile || []}
              placeholder="Upload or paste screenshot URL"
              onChange={(next) =>
                updateField(type === 'mobile-showcase' ? 'desktop' : 'mobile', next)
              }
            />
          </>
        )}

        {type === 'bento' && (
          <>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Story</label>
              <textarea
                rows={3}
                value={data.story || ''}
                onChange={(e) => updateField('story', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                placeholder="The project story…"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Client</label>
                <input
                  type="text"
                  value={data.client || ''}
                  onChange={(e) => updateField('client', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Year</label>
                <input
                  type="text"
                  value={data.year || ''}
                  onChange={(e) => updateField('year', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                  placeholder="2026"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Timeline</label>
                <input
                  type="text"
                  value={data.timeline || ''}
                  onChange={(e) => updateField('timeline', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Role</label>
                <input
                  type="text"
                  value={data.role || ''}
                  onChange={(e) => updateField('role', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Results</label>
              <input
                type="text"
                value={data.results || ''}
                onChange={(e) => updateField('results', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. 40% increase in engagement"
              />
            </div>
            <ArrayFieldEditor
              label="Services"
              values={data.services || []}
              placeholder="e.g. Web Design"
              onChange={(next) => updateField('services', next)}
            />
            <ArrayFieldEditor
              label="Tech Stack"
              values={data.techStack || []}
              placeholder="e.g. Next.js"
              onChange={(next) => updateField('techStack', next)}
            />
          </>
        )}

        {type === 'video' && (
          <>
            <MediaField
              label="Video Source"
              value={data.src || ''}
              onChange={(src) => updateField('src', src)}
              placeholder="Upload or paste video URL"
            />
            <MediaField
              label="Poster"
              value={data.poster || ''}
              onChange={(poster) => updateField('poster', poster)}
              accept="image/*"
              placeholder="Upload or paste poster image URL"
            />
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Title</label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                placeholder="Video title"
              />
            </div>
          </>
        )}

        {type === 'embed' && (
          <>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">URL</label>
              <input
                type="text"
                value={data.url || ''}
                onChange={(e) => updateField('url', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://www.youtube.com/watch?v=…"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Aspect Ratio</label>
              <select
                value={data.aspectRatio || '16/9'}
                onChange={(e) => updateField('aspectRatio', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="16/9">16 / 9</option>
                <option value="4/3">4 / 3</option>
                <option value="1/1">1 / 1</option>
                <option value="9/16">9 / 16</option>
              </select>
            </div>
          </>
        )}

        {type === 'metrics' && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Stats</label>
            {(data.items || []).map((item: { value: string; label: string }, index: number) => (
              <div key={index} className="flex gap-1.5 items-center">
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => {
                    const next = [...(data.items || [])];
                    next[index] = { ...next[index], value: e.target.value };
                    updateField('items', next);
                  }}
                  className="flex-1 rounded-xl border border-input bg-background px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Value (e.g. 40%)"
                />
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => {
                    const next = [...(data.items || [])];
                    next[index] = { ...next[index], label: e.target.value };
                    updateField('items', next);
                  }}
                  className="flex-1 rounded-xl border border-input bg-background px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Label"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateField('items', (data.items || []).filter((_: unknown, i: number) => i !== index))
                  }
                  className="text-muted-foreground/60 hover:text-destructive p-1.5 rounded hover:bg-muted"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateField('items', [...(data.items || []), { value: '', label: '' }])}
              className="w-full text-[10px] flex items-center justify-center gap-0.5 text-primary hover:underline font-semibold py-1"
            >
              <Plus className="w-3 h-3" /> Add Stat
            </button>
          </div>
        )}

        {type === 'link' && (
          <>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Label</label>
              <input
                type="text"
                value={data.label || ''}
                onChange={(e) => updateField('label', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Visit Live Site"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">URL</label>
              <input
                type="text"
                value={data.href || ''}
                onChange={(e) => updateField('href', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://…"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
              <textarea
                rows={2}
                value={data.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                placeholder="Optional supporting text…"
              />
            </div>
          </>
        )}

        {type === 'project-credits' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Eyebrow</label>
              <input
                type="text"
                value={data.eyebrow || ''}
                onChange={(e) => updateField('eyebrow', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Project Metadata"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Title</label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Credits"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Heading Label</label>
              <input
                type="text"
                value={data.headingLabel || ''}
                onChange={(e) => updateField('headingLabel', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Project Credits"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Heading</label>
              <textarea
                rows={2}
                value={data.heading || ''}
                onChange={(e) => updateField('heading', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Crafted With\nPrecision"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Year</label>
              <input
                type="text"
                value={data.year || ''}
                onChange={(e) => updateField('year', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. 2024"
              />
            </div>

            <div className="space-y-2 pt-1 border-t border-border/60">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Credits</label>
                <button
                  type="button"
                  onClick={() =>
                    updateField('items', [
                      ...(data.items || []),
                      { label: '', value: '', variant: 'script' },
                    ])
                  }
                  className="text-[10px] flex items-center gap-0.5 text-primary hover:underline font-semibold"
                >
                  <Plus className="w-3 h-3" /> Add Credit
                </button>
              </div>
              {(data.items || []).map((item: { label: string; value: string; variant: string }, index: number) => (
                <div
                  key={index}
                  className="rounded-xl border border-border/60 bg-muted/10 p-2 space-y-1.5"
                >
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const next = [...(data.items || [])];
                        next[index] = { ...next[index], label: e.target.value };
                        updateField('items', next);
                      }}
                      className="flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Label (e.g. Art Direction)"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          'items',
                          (data.items || []).filter((_: unknown, i: number) => i !== index)
                        )
                      }
                      className="text-muted-foreground/60 hover:text-destructive p-1.5 rounded hover:bg-muted"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => {
                      const next = [...(data.items || [])];
                      next[index] = { ...next[index], value: e.target.value };
                      updateField('items', next);
                    }}
                    className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Value (the person / agency)"
                  />
                  <select
                    value={item.variant || 'script'}
                    onChange={(e) => {
                      const next = [...(data.items || [])];
                      next[index] = { ...next[index], variant: e.target.value };
                      updateField('items', next);
                    }}
                    className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="script">Script</option>
                    <option value="condensed">Condensed</option>
                    <option value="mono">Mono</option>
                  </select>
                </div>
              ))}
              {(data.items || []).length === 0 && (
                <p className="text-[9px] text-muted-foreground/60">No credits yet. Add one above.</p>
              )}
            </div>
          </div>
        )}

        {type === 'code-block-interactive' && (
          <>
            {/* General Section */}
            <div className="space-y-1.5">
              <div className="text-[9px] font-bold text-primary uppercase tracking-wider">General</div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Title</label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                placeholder="Code Block"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
              <textarea
                rows={2}
                value={data.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                placeholder="Brief description of this component..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Runtime</label>
              <select
                value={data.runtime || 'react'}
                onChange={(e) => updateField('runtime', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="react">React (TSX)</option>
                <option value="html">HTML + Tailwind</option>
              </select>
            </div>

            {/* Separator */}
            <div className="border-t border-border/40 pt-3 mt-1" />

            {/* Preview Section */}
            <div className="space-y-1.5">
              <div className="text-[9px] font-bold text-primary uppercase tracking-wider">Preview</div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Height</label>
              <input
                type="number"
                value={data.previewHeight || 400}
                onChange={(e) => updateField('previewHeight', Number(e.target.value) || 400)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Separator */}
            <div className="border-t border-border/40 pt-3 mt-1" />

            {/* Component Section */}
            <div className="space-y-1.5">
              <div className="text-[9px] font-bold text-primary uppercase tracking-wider">Component</div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Render Mode</label>
              <select
                value={data.renderMode || 'preview'}
                onChange={(e) => updateField('renderMode', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="preview">Preview (canvas + page)</option>
                <option value="component">Component (page only)</option>
                <option value="hidden">Hidden (library only)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Width Mode</label>
              <select
                value={data.widthMode || 'contained'}
                onChange={(e) => updateField('widthMode', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="contained">Contained (content width)</option>
                <option value="wide">Wide (1400px)</option>
                <option value="full-bleed">Full Bleed (100vw)</option>
              </select>
              <p className="text-[9px] text-muted-foreground">Controls how wide the block renders on the work page.</p>
            </div>
            {data.code && (
              <div className="rounded-xl border border-border/60 bg-muted/10 p-3 space-y-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Code Info</div>
                <div className="text-[10px] text-muted-foreground">
                  {data.code.split('\n').length} lines · {data.runtime}
                </div>
              </div>
            )}
            {data.runtime === 'html' && (
              <div className="rounded-xl border border-border/60 bg-muted/10 p-3 space-y-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Code Info</div>
                <div className="text-[10px] text-muted-foreground">
                  HTML: {((data.html as string) || '').split('\n').length}L · CSS: {((data.css as string) || '').split('\n').length}L · JS: {((data.js as string) || '').split('\n').length}L
                </div>
              </div>
            )}

            {/* Separator */}
            <div className="border-t border-border/40 pt-3 mt-1" />

            {/* Advanced Section */}
            <div className="space-y-1.5">
              <div className="text-[9px] font-bold text-primary uppercase tracking-wider">Advanced</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-border/60 bg-muted/10 p-2 text-center">
                <div className="text-[9px] text-muted-foreground uppercase">Version</div>
                <div className="text-xs font-bold text-foreground">v{data.version || 1}</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/10 p-2 text-center">
                <div className="text-[9px] text-muted-foreground uppercase">Library</div>
                <div className="text-xs font-bold text-foreground">{data.libraryId ? 'Linked' : 'None'}</div>
              </div>
            </div>

            {/* Open Studio Button */}
            <button
              type="button"
              onClick={() => {
                const event = new CustomEvent('open-code-editor', {
                  detail: { nodeId: selectedNode?.id },
                });
                window.dispatchEvent(event);
              }}
              className="w-full py-2.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold transition flex items-center justify-center gap-1.5 mt-2"
            >
              Open Code Studio
            </button>
          </>
        )}

        <button
          type="button"
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-destructive/30 text-destructive text-[10px] font-bold hover:bg-destructive/10 transition"
        >
          <Trash2 className="w-3 h-3" />
          Delete Block
        </button>
      </div>
    </aside>
  );
}

export default WorkInspector;
