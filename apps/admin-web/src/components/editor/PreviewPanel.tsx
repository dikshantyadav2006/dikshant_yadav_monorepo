'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { X, Smartphone, Tablet, Monitor, Share2, Copy, Check, Clock, User, Calendar } from 'lucide-react';
import { ContentRenderer } from '@dikshant/ui';
import type { Post } from '@dikshant/types';
import { useVisualBuilderStore } from '../../features/visual-builder/store';
import { orderNodes } from '../../features/visual-builder/serializer';
import apiFetch from '../../lib/api';

// Public post web color scheme (matches post-web globals.css)
const THEME = {
  background: '#EDE4D5',
  foreground: '#141414',
  card: '#F5F0E8',
  secondary: '#E6DDD0',
  mutedForeground: '#595959',
  stamp: '#B33A3A',
  fontSerif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  fontDisplay: '"SF Pro Display", "Inter", "Arial Narrow", sans-serif',
  fontMono: '"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace',
};

interface PreviewPanelProps {
  post: Post | null;
  onClose: () => void;
}

type Device = 'mobile' | 'tablet' | 'desktop';

const DEVICE_WIDTH: Record<Device, string> = {
  mobile: '375px',
  tablet: '768px',
  desktop: '100%',
};

const DEVICES: { key: Device; label: string; icon: React.ReactNode }[] = [
  { key: 'mobile', label: 'Mobile', icon: <Smartphone className="w-4 h-4" /> },
  { key: 'tablet', label: 'Tablet', icon: <Tablet className="w-4 h-4" /> },
  { key: 'desktop', label: 'Desktop', icon: <Monitor className="w-4 h-4" /> },
];

const EXPIRY_OPTIONS = [
  { label: '1 hour', value: 3600000 },
  { label: '24 hours', value: 86400000 },
  { label: '7 days', value: 604800000 },
  { label: '30 days', value: 2592000000 },
  { label: 'No expiry', value: -1 },
];

function formatDate(date: string | null | undefined): string {
  if (!date) return 'Unpublished';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatDossierId(id: string): string {
  return `DOS-${id.slice(0, 8).toUpperCase()}`;
}

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

function getPostTags(p: Post): { id: string; name: string; slug: string }[] {
  if (!p.tags) return [];
  return p.tags.map((t) => {
    if ('tag' in t && t.tag) return { id: t.tag.id, name: t.tag.name, slug: t.tag.slug };
    return { id: (t as any).id, name: (t as any).name, slug: (t as any).slug };
  });
}

export default function PreviewPanel({ post, onClose }: PreviewPanelProps) {
  const canvasData = useVisualBuilderStore((s) => s.canvasData);
  const postMetadata = useVisualBuilderStore((s) => s.postMetadata);
  const [device, setDevice] = useState<Device>('desktop');
  const [showShare, setShowShare] = useState(false);
  const [shareLinks, setShareLinks] = useState<any[]>([]);
  const [expiry, setExpiry] = useState(86400000);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const blocks = useMemo(() => {
    if (!canvasData.nodes.length) return [];
    return orderNodes(canvasData.nodes, canvasData.edges);
  }, [canvasData]);

  const tags = useMemo(() => (post ? getPostTags(post) : []), [post]);

  const featuredImage = post?.featuredImage ?? post?.featuredBannerImage ?? null;
  const featuredImageUrl = featuredImage?.publicUrl || postMetadata?.featuredBannerImageUrl || '';
  const featuredImageAlt = featuredImage?.alt || postMetadata?.featuredBannerImageAlt || post?.title || '';

  const coverTitle = post?.title || postMetadata?.title || 'Untitled Post';
  const coverExcerpt = post?.excerpt || postMetadata?.excerpt || '';

  useEffect(() => {
    const actualPostId = window.location.pathname.match(/\/posts\/([^/]+)/)?.[1];
    if (actualPostId) {
      apiFetch(`/posts/${actualPostId}/share-links`).then(setShareLinks).catch(() => {});
    }
  }, []);

  const generateLink = async () => {
    const actualPostId = window.location.pathname.match(/\/posts\/([^/]+)/)?.[1];
    if (!actualPostId) return;

    setGenerating(true);
    try {
      const link = await apiFetch(`/posts/${actualPostId}/share-links`, {
        method: 'POST',
        body: JSON.stringify({
          expiresInMs: expiry === -1 ? null : expiry,
        }),
      });
      setShareLinks((prev) => [link, ...prev]);
    } catch (err) {
      console.error('Failed to generate share link', err);
    } finally {
      setGenerating(false);
    }
  };

  const deleteLink = async (id: string) => {
    try {
      await apiFetch(`/share-links/${id}`, { method: 'DELETE' });
      setShareLinks((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error('Failed to delete share link', err);
    }
  };

  const copyToClipboard = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getShareUrl = (token: string) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.protocol}//${window.location.hostname}:3000/share/${token}`;
  };

  const getExpiryLabel = (expiresAt: string | null) => {
    if (!expiresAt) return 'No expiry';
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.round(diff / 3600000);
    if (hours < 24) return `${hours}h`;
    const days = Math.round(hours / 24);
    return `${days}d`;
  };

  const styles = {
    article: {
      animation: 'articleFadeIn 420ms cubic-bezier(0.22, 1, 0.36, 1) both',
    },
    headline: {
      fontFamily: THEME.fontDisplay,
      color: THEME.foreground,
      lineHeight: 1.05,
      letterSpacing: '-0.02em',
    },
    metadataBar: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      alignItems: 'center',
      gap: '1rem',
      borderTop: '2px solid ' + THEME.foreground,
      borderBottom: '2px solid ' + THEME.foreground,
      padding: '0.75rem 0',
      fontFamily: THEME.fontMono,
      fontSize: '10px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.1em',
      color: THEME.mutedForeground,
    },
    dossierLabel: {
      fontFamily: THEME.fontMono,
      fontSize: '10px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.2em',
      color: THEME.mutedForeground,
    },
    classifiedLabel: {
      fontFamily: THEME.fontMono,
      fontSize: '10px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.2em',
      color: THEME.stamp,
      fontWeight: 700,
    },
    tag: {
      fontFamily: THEME.fontMono,
      fontSize: '10px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.1em',
      border: '1px solid ' + THEME.foreground + '30',
      padding: '1px 8px',
    },
  };

  return (
    <div className="flex-1 h-full flex flex-col" style={{ background: THEME.background, color: THEME.foreground }}>
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: THEME.foreground, background: THEME.card }}
      >
        <div className="flex items-center gap-2">
          {DEVICES.map((d) => (
            <button
              key={d.key}
              onClick={() => setDevice(d.key)}
              style={{
                border: device === d.key
                  ? '2px solid ' + THEME.foreground
                  : '1px solid ' + THEME.foreground + '40',
                background: device === d.key ? THEME.foreground : THEME.card,
                color: device === d.key ? THEME.card : THEME.mutedForeground,
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold transition-all"
            >
              {d.icon}
              {d.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShare(!showShare)}
            style={{
              border: showShare
                ? '2px solid ' + THEME.foreground
                : '1px solid ' + THEME.foreground + '40',
              background: showShare ? THEME.foreground : THEME.card,
              color: showShare ? THEME.card : THEME.mutedForeground,
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold transition-all"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-none border"
            style={{ borderColor: THEME.foreground + '40', color: THEME.mutedForeground }}
            title="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Set public post-web CSS variables so ContentRenderer uses correct colors */}
      <style>{`
        .preview-theme {
          --background: 38 35% 92%;
          --foreground: 0 0% 8%;
          --card: 40 30% 96%;
          --card-foreground: 0 0% 8%;
          --popover: 40 30% 96%;
          --popover-foreground: 0 0% 8%;
          --primary: 0 0% 8%;
          --primary-foreground: 40 30% 96%;
          --secondary: 38 25% 88%;
          --secondary-foreground: 0 0% 8%;
          --muted: 38 20% 86%;
          --muted-foreground: 0 0% 35%;
          --accent: 0 0% 8%;
          --accent-foreground: 40 30% 96%;
          --destructive: 0 72% 45%;
          --destructive-foreground: 0 0% 98%;
          --border: 0 0% 8%;
          --input: 38 20% 82%;
          --ring: 0 0% 8%;
          --radius: 0px;
        }
      `}</style>

      {showShare ? (
        /* Share Panel */
        <div className="flex-1 overflow-auto p-6 flex justify-center preview-theme" style={{ background: THEME.background }}>
          <div className="w-full max-w-2xl space-y-6">
            <div
              className="p-6"
              style={{
                background: THEME.card,
                border: '2px solid ' + THEME.foreground,
                boxShadow: '4px 4px 0 ' + THEME.foreground,
              }}
            >
              <h3 style={{ fontFamily: THEME.fontDisplay, fontSize: '1.125rem', marginBottom: '1rem', color: THEME.foreground }}>
                Generate Private Share Link
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    style={{
                      fontFamily: THEME.fontMono,
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: THEME.mutedForeground,
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Link Expiry
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EXPIRY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setExpiry(opt.value)}
                        style={{
                          border: expiry === opt.value
                            ? '2px solid ' + THEME.foreground
                            : '1px solid ' + THEME.foreground + '40',
                          background: expiry === opt.value ? THEME.foreground : THEME.background,
                          color: expiry === opt.value ? THEME.card : THEME.mutedForeground,
                        }}
                        className="px-3 py-2 rounded-none text-xs font-bold transition-all"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateLink}
                  disabled={generating}
                  style={{
                    background: THEME.foreground,
                    color: THEME.card,
                    border: '2px solid ' + THEME.foreground,
                  }}
                  className="w-full py-2.5 font-bold rounded-none text-xs transition flex items-center justify-center gap-2"
                >
                  {generating ? 'Generating...' : 'Generate Private Link'}
                </button>
              </div>
            </div>

            {shareLinks.length > 0 && (
              <div
                className="p-6"
                style={{
                  background: THEME.card,
                  border: '2px solid ' + THEME.foreground,
                  boxShadow: '4px 4px 0 ' + THEME.foreground,
                }}
              >
                <h3 style={{ fontFamily: THEME.fontDisplay, fontSize: '1.125rem', marginBottom: '1rem', color: THEME.foreground }}>
                  Share Links
                </h3>
                <div className="space-y-3">
                  {shareLinks.map((link) => {
                    const url = getShareUrl(link.token);
                    return (
                      <div key={link.id} style={{ border: '1px solid ' + THEME.foreground + '60' }} className="p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className="flex items-center gap-2"
                            style={{ fontFamily: THEME.fontMono, fontSize: '10px', color: THEME.mutedForeground }}
                          >
                            <Clock className="w-3 h-3" />
                            {getExpiryLabel(link.expiresAt)}
                          </div>
                          <button
                            onClick={() => deleteLink(link.id)}
                            style={{ color: THEME.stamp, fontSize: '10px', fontWeight: 600 }}
                            className="hover:underline"
                          >
                            Delete
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            readOnly
                            value={url}
                            className="flex-1 px-3 py-1.5 text-xs"
                            style={{
                              fontFamily: THEME.fontMono,
                              border: '1px solid ' + THEME.foreground + '60',
                              background: THEME.background,
                              color: THEME.foreground,
                            }}
                          />
                          <button
                            onClick={() => copyToClipboard(url, link.id)}
                            className="p-1.5 border"
                            style={{ borderColor: THEME.foreground + '40' }}
                            title="Copy link"
                          >
                            {copiedId === link.id
                              ? <Check className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
                              : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div className="flex justify-center pt-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`}
                            alt="QR Code"
                            className="w-24 h-24"
                            style={{ border: '1px solid ' + THEME.foreground + '40' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Preview Panel - mirrors public post-web page exactly */
        <div className="flex-1 overflow-auto flex justify-center preview-theme" style={{ background: THEME.background }}>
          <div
            className="min-h-[400px] transition-all duration-300"
            style={{
              width: DEVICE_WIDTH[device],
              maxWidth: '100%',
              background: THEME.background,
              color: THEME.foreground,
            }}
          >
            <article style={styles.article}>
              {/* Article Header - matches post-web ArticleHeader component */}
              <header
                style={{
                  position: 'relative',
                  paddingBottom: '2rem',
                  borderBottom: '2px solid ' + THEME.foreground,
                  padding: '2rem 1rem',
                }}
                className="max-w-[680px] mx-auto"
              >
                {/* Return link */}
                <span
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: THEME.mutedForeground,
                    display: 'inline-block',
                    marginBottom: '1rem',
                  }}
                >
                  ← Return to Archive
                </span>

                {/* Category + Dossier ID */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={styles.classifiedLabel}>
                    {post?.category?.name || 'Intelligence Report'}
                  </span>
                  <span style={styles.dossierLabel}>
                    Ref: {formatDossierId(post?.id || '00000000')}
                  </span>
                </div>

                {/* Title */}
                <h1
                  style={{
                    ...styles.headline,
                    fontSize: device === 'mobile' ? '2rem' : device === 'tablet' ? '2.5rem' : '3.5rem',
                    maxWidth: '56rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  {coverTitle}
                </h1>

                {/* Excerpt */}
                {coverExcerpt && (
                  <p
                    style={{
                      fontSize: '1.25rem',
                      color: THEME.mutedForeground,
                      lineHeight: 1.625,
                      maxWidth: '42rem',
                      fontFamily: THEME.fontSerif,
                      fontStyle: 'italic',
                      marginBottom: '1rem',
                    }}
                  >
                    {coverExcerpt}
                  </p>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem' }}>
                    {tags.map((tag) => (
                      <span
                        key={tag.id}
                        style={{
                          ...styles.tag,
                          color: THEME.foreground,
                          cursor: 'default',
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {/* Metadata Bar - matches post-web MetadataBar component */}
              <div style={styles.metadataBar} className="max-w-[680px] mx-auto px-4">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <User style={{ width: '14px', height: '14px' }} />
                  {post?.author?.name || 'Dikshant Yadav'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Calendar style={{ width: '14px', height: '14px' }} />
                  {formatDate(post?.publishedAt)}
                </span>
                {post?.readingTime !== undefined && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Clock style={{ width: '14px', height: '14px' }} />
                    {post.readingTime} min read
                  </span>
                )}
                {post?.category && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontWeight: 700,
                      color: THEME.foreground,
                    }}
                  >
                    {post.category.name}
                  </span>
                )}
              </div>

              {/* Featured Banner Image - matches post-web page.tsx layout */}
              {featuredImageUrl && (
                <figure
                  style={{
                    margin: '2.5rem 1rem',
                    border: '2px solid ' + THEME.foreground,
                    overflow: 'hidden',
                  }}
                  className="max-w-[680px] mx-auto"
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '21 / 9',
                      background: THEME.secondary,
                      overflow: 'hidden',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featuredImageUrl}
                      alt={featuredImageAlt}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'grayscale(100%)',
                      }}
                    />
                  </div>
                  <figcaption
                    style={{
                      borderTop: '2px solid ' + THEME.foreground,
                      padding: '0.5rem 1rem',
                      fontFamily: THEME.fontMono,
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: THEME.mutedForeground,
                    }}
                  >
                    Cover — {coverTitle}
                  </figcaption>
                </figure>
              )}

              {/* Content Blocks */}
              <div
                className="px-4 pb-16"
                style={{
                  marginTop: featuredImageUrl ? '0' : '2.5rem',
                }}
              >
                <div
                  className="max-w-[680px] mx-auto"
                  style={{
                    animation: 'articleContentFadeIn 520ms cubic-bezier(0.22, 1, 0.36, 1) 80ms both',
                  }}
                >
                  {blocks.length === 0 ? (
                    <p
                      style={{
                        textAlign: 'center',
                        padding: '3rem 0',
                        color: THEME.mutedForeground,
                        fontFamily: THEME.fontSerif,
                        fontStyle: 'italic',
                        fontSize: '0.875rem',
                      }}
                    >
                      No blocks on the canvas yet. Drag blocks from the sidebar to start building.
                    </p>
                  ) : (
                    <ContentRenderer blocks={blocks} />
                  )}
                </div>
              </div>
            </article>
          </div>
        </div>
      )}

      {/* Inject animation keyframes */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes articleFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes articleContentFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `,
      }} />
    </div>
  );
}
