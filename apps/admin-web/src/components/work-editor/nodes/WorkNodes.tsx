'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Image as ImageIcon, LayoutGrid, Monitor, Smartphone, Trash2, Square } from 'lucide-react';
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
