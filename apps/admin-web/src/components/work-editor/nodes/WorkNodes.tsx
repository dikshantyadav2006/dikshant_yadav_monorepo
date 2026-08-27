'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Image as ImageIcon,
  LayoutGrid,
  Monitor,
  Smartphone,
  Trash2,
  Square,
  Play,
  Link2,
  BarChart3,
  Blocks,
  Award,
  FileText,
} from 'lucide-react';
import { useWorkBuilderStore } from '../../../features/work-builder/store';

interface BaseNodeProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  selected?: boolean;
  children: React.ReactNode;
}

function BaseNode({ id, title, icon, selected, children }: BaseNodeProps) {
  const setNodes = useWorkBuilderStore((state) => state.setNodes);
  const canvasData = useWorkBuilderStore((state) => state.canvasData);
  const activeNodeId = useWorkBuilderStore((state) => state.activeNodeId);
  const setActiveNode = useWorkBuilderStore((state) => state.setActiveNode);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes(canvasData.nodes.filter((node) => node.id !== id));
    if (activeNodeId === id) {
      setActiveNode(null);
    }
  };

  return (
    <div
      className={`w-72 rounded-xl border bg-card text-card-foreground shadow-md transition-all duration-200 ${
        selected ? 'border-primary ring-2 ring-primary/20' : 'border-border/60'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2.5 h-2.5 bg-muted-foreground border-2 border-background"
      />

      <div className="flex items-center justify-between border-b border-border/40 px-3 py-2 bg-muted/20 rounded-t-xl">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          {icon}
          <span>{title}</span>
        </div>
        <button
          onClick={handleDelete}
          className="text-muted-foreground/60 hover:text-destructive transition-colors p-0.5 rounded hover:bg-muted"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 text-xs">{children}</div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 bg-muted-foreground border-2 border-background"
      />
    </div>
  );
}

function ImagePreview({ src, alt }: { src: string; alt: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || 'Image preview'}
      className="w-full aspect-[16/9] object-cover rounded-lg border border-border/50 bg-muted/40"
    />
  ) : (
    <div className="flex aspect-[16/9] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-muted-foreground/60">
      <ImageIcon className="w-5 h-5" />
    </div>
  );
}

function DualImagePreview({ images, alts }: { images: string[]; alts: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {[0, 1].map((i) =>
        images[i] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={images[i]}
            alt={alts[i] || `Image ${i + 1}`}
            className="w-full aspect-[3/4] object-cover rounded-lg border border-border/50 bg-muted/40"
          />
        ) : (
          <div
            key={i}
            className="flex aspect-[3/4] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-muted-foreground/60"
          >
            <ImageIcon className="w-4 h-4" />
          </div>
        ),
      )}
    </div>
  );
}

function ShowcasePreview({ items, variant }: { items: string[]; variant: 'mobile' | 'desktop' }) {
  const shown = items.filter(Boolean).slice(0, 2);
  return (
    <div className="flex gap-1.5">
      {shown.length === 0 && (
        <div className="flex flex-1 aspect-[3/4] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-muted-foreground/60">
          {variant === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
        </div>
      )}
      {shown.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={src}
          alt={`${variant} ${i + 1}`}
          className="w-1/2 aspect-[3/4] object-cover rounded-lg border border-border/50 bg-muted/40"
        />
      ))}
      {items.filter(Boolean).length > 2 && (
        <span className="text-[9px] text-muted-foreground self-center">
          +{items.filter(Boolean).length - 2}
        </span>
      )}
    </div>
  );
}

export function LargeImageNode({ id, data, selected }: NodeProps) {
  return (
    <BaseNode
      id={id}
      title="Large Image"
      icon={<ImageIcon className="w-3.5 h-3.5 text-indigo-500" />}
      selected={selected}
    >
      <ImagePreview src={data.src} alt={data.alt} />
      {data.height && <div className="mt-1.5 text-[9px] text-muted-foreground">Height: {data.height}</div>}
    </BaseNode>
  );
}

export function AboutNode({ id, data, selected }: NodeProps) {
  return (
    <BaseNode
      id={id}
      title="About"
      icon={<FileText className="w-3.5 h-3.5 text-green-500" />}
      selected={selected}
    >
      <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5 space-y-1">
        <div className="text-[9px] text-muted-foreground/70">{data.eyebrow || 'The Project'}</div>
        <div className="text-[12px] font-condensed font-black uppercase leading-none">{data.heading || 'About'}</div>
        {data.title && <div className="text-[10px] font-semibold truncate">{data.title}</div>}
        {data.body && <div className="text-[9px] text-muted-foreground line-clamp-2">{data.body}</div>}
        {!data.body && <div className="text-[9px] text-muted-foreground/60">No overview text yet.</div>}
      </div>
    </BaseNode>
  );
}

export function Grid2Node({ id, data, selected }: NodeProps) {
  return (
    <BaseNode
      id={id}
      title="2-Column Grid"
      icon={<LayoutGrid className="w-3.5 h-3.5 text-amber-500" />}
      selected={selected}
    >
      <DualImagePreview images={data.images || []} alts={data.alts || []} />
    </BaseNode>
  );
}

export function BannerNode({ id, data, selected }: NodeProps) {
  return (
    <BaseNode
      id={id}
      title="Banner"
      icon={<Square className="w-3.5 h-3.5 text-sky-500" />}
      selected={selected}
    >
      {data.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.src}
          alt={data.alt || 'Banner preview'}
          className="w-full aspect-[21/9] object-cover rounded-lg border border-border/50 bg-muted/40"
        />
      ) : (
        <div className="flex aspect-[21/9] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-muted-foreground/60">
          <ImageIcon className="w-5 h-5" />
        </div>
      )}
      {data.height && <div className="mt-1.5 text-[9px] text-muted-foreground">Height: {data.height}</div>}
    </BaseNode>
  );
}

export function PostersNode({ id, data, selected }: NodeProps) {
  return (
    <BaseNode
      id={id}
      title="Posters"
      icon={<LayoutGrid className="w-3.5 h-3.5 text-pink-500" />}
      selected={selected}
    >
      <DualImagePreview images={data.images || []} alts={data.alts || []} />
    </BaseNode>
  );
}

export function MobileShowcaseNode({ id, data, selected }: NodeProps) {
  return (
    <BaseNode
      id={id}
      title="Mobile Showcase"
      icon={<Smartphone className="w-3.5 h-3.5 text-emerald-500" />}
      selected={selected}
    >
      <ShowcasePreview items={data.mobile || []} variant="mobile" />
    </BaseNode>
  );
}

export function DesktopShowcaseNode({ id, data, selected }: NodeProps) {
  return (
    <BaseNode
      id={id}
      title="Desktop Showcase"
      icon={<Monitor className="w-3.5 h-3.5 text-violet-500" />}
      selected={selected}
    >
      <ShowcasePreview items={data.desktop || []} variant="desktop" />
    </BaseNode>
  );
}

export function BentoNode({ id, data, selected }: NodeProps) {
  const cards = [
    data.story ? 'Story' : null,
    data.client ? 'Client' : null,
    data.services?.length ? 'Services' : null,
    data.results ? 'Results' : null,
  ].filter(Boolean);
  return (
    <BaseNode
      id={id}
      title="Project Bento"
      icon={<Blocks className="w-3.5 h-3.5 text-orange-500" />}
      selected={selected}
    >
      <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5 space-y-1.5">
        {cards.length === 0 ? (
          <div className="text-[9px] text-muted-foreground/60">No bento fields filled yet.</div>
        ) : (
          cards.map((card) => (
            <div key={card} className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">{card}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            </div>
          ))
        )}
      </div>
    </BaseNode>
  );
}

export function VideoNode({ id, data, selected }: NodeProps) {
  return (
    <BaseNode
      id={id}
      title="Video"
      icon={<Play className="w-3.5 h-3.5 text-rose-500" />}
      selected={selected}
    >
      {data.poster || data.src ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.poster || data.src}
            alt={data.title || 'Video preview'}
            className="w-full aspect-video object-cover rounded-lg border border-border/50 bg-muted/40"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-white fill-white" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-muted-foreground/60">
          <Play className="w-5 h-5" />
        </div>
      )}
    </BaseNode>
  );
}

export function EmbedNode({ id, data, selected }: NodeProps) {
  return (
    <BaseNode
      id={id}
      title="Embed"
      icon={<Link2 className="w-3.5 h-3.5 text-cyan-500" />}
      selected={selected}
    >
      <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5">
        <div className="text-[9px] text-muted-foreground">aspect {data.aspectRatio || '16/9'}</div>
        <div className="text-[10px] font-medium truncate mt-0.5">
          {data.url || 'Paste a YouTube / Vimeo URL'}
        </div>
      </div>
    </BaseNode>
  );
}

export function MetricsNode({ id, data, selected }: NodeProps) {
  const items = Array.isArray(data.items) ? data.items : [];
  return (
    <BaseNode
      id={id}
      title="Metrics"
      icon={<BarChart3 className="w-3.5 h-3.5 text-lime-500" />}
      selected={selected}
    >
      <div className="grid grid-cols-2 gap-1.5">
        {items.length === 0 && (
          <div className="col-span-2 flex aspect-[3/1] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-muted-foreground/60">
            <BarChart3 className="w-4 h-4" />
          </div>
        )}
        {items.slice(0, 4).map((item: { value?: string; label?: string }, i: number) => (
          <div key={i} className="rounded-lg border border-border/50 bg-muted/20 p-2">
            <div className="text-[11px] font-bold truncate">{item.value || '—'}</div>
            <div className="text-[9px] text-muted-foreground truncate">{item.label || 'Label'}</div>
          </div>
        ))}
      </div>
    </BaseNode>
  );
}

export function LinkNode({ id, data, selected }: NodeProps) {
  return (
    <BaseNode
      id={id}
      title="Link / CTA"
      icon={<Link2 className="w-3.5 h-3.5 text-blue-500" />}
      selected={selected}
    >
      <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5 space-y-1">
        <div className="text-[11px] font-bold truncate">{data.label || 'Link label'}</div>
        <div className="text-[9px] text-muted-foreground truncate">{data.href || 'https://…'}</div>
        {data.description && (
          <div className="text-[9px] text-muted-foreground/70 line-clamp-2">{data.description}</div>
        )}
      </div>
    </BaseNode>
  );
}

export function ProjectCreditsNode({ id, data, selected }: NodeProps) {
  const items = Array.isArray(data.items) ? data.items : [];
  return (
    <BaseNode
      id={id}
      title="Project Credits"
      icon={<Award className="w-3.5 h-3.5 text-teal-500" />}
      selected={selected}
    >
      <div className="space-y-1.5">
        <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5">
          <div className="text-[9px] text-muted-foreground/70">{data.eyebrow || 'Project Metadata'}</div>
          <div className="text-[13px] font-bold leading-none mt-0.5">{data.title || 'Credits'}</div>
        </div>
        {items.length === 0 && (
          <div className="text-[9px] text-muted-foreground/60">No credits added yet.</div>
        )}
        {items.map((item: { label?: string; value?: string }, i: number) => (
          <div key={i} className="flex items-center justify-between gap-2 text-[10px]">
            <span className="text-muted-foreground">{item.label || `Credit ${i + 1}`}</span>
            <span className="text-foreground truncate">{item.value || '—'}</span>
          </div>
        ))}
        {data.year && (
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Year</span>
            <span className="text-foreground">{data.year}</span>
          </div>
        )}
      </div>
    </BaseNode>
  );
}
