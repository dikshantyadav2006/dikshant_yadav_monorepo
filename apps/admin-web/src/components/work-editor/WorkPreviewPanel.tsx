'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { WorkContentBlock } from '@dikshant/types';
import { orderNodes } from '../../features/work-builder/serializer';
import { useWorkBuilderStore } from '../../features/work-builder/store';

interface WorkPreviewPanelProps {
  onClose: () => void;
}

function BlockPreview({ block }: { block: WorkContentBlock }) {
  switch (block.type) {
    case 'large-image':
    case 'banner':
      return block.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={block.src}
          alt={block.alt}
          className="w-full object-contain md:h-[700px] md:object-cover"
          style={block.height ? { '--img-h': block.height } as React.CSSProperties : undefined}
        />
      ) : (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border/50 text-muted-foreground/60 text-xs">
          {block.type === 'large-image' ? 'Large image block' : 'Banner block'}
        </div>
      );

    case 'grid-2':
    case 'posters':
      return (
        <div className="grid grid-cols-2 gap-[10px]">
          {[0, 1].map((i) =>
            block.images[i] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={block.images[i]}
                alt={block.alts[i] || ''}
                className="w-full aspect-[3/4] object-cover rounded-lg"
              />
            ) : (
              <div
                key={i}
                className="flex aspect-[3/4] items-center justify-center rounded-xl border border-dashed border-border/50 text-muted-foreground/60 text-xs"
              >
                Image {i + 1}
              </div>
            ),
          )}
        </div>
      );

    case 'mobile-showcase':
    case 'desktop-showcase': {
      const primary = block.type === 'mobile-showcase' ? block.mobile : block.desktop;
      const secondary = block.type === 'mobile-showcase' ? block.desktop : block.mobile;
      return (
        <div className="space-y-[10px]">
          {secondary && secondary.length > 0 && (
            <div className="flex flex-col gap-[10px]">
              {secondary.filter(Boolean).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`sec-${i}`}
                  src={src}
                  alt=""
                  className="w-full object-contain md:h-[500px] md:object-cover"
                />
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-[10px]">
            {primary.filter(Boolean).map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`pri-${i}`}
                src={src}
                alt=""
                className="w-full aspect-[3/4] object-cover rounded-lg"
              />
            ))}
            {primary.filter(Boolean).length === 0 && (
              <div className="col-span-2 flex h-32 items-center justify-center rounded-xl border border-dashed border-border/50 text-muted-foreground/60 text-xs">
                {block.type} block
              </div>
            )}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

export function WorkPreviewPanel({ onClose }: WorkPreviewPanelProps) {
  const canvasData = useWorkBuilderStore((state) => state.canvasData);
  const workMetadata = useWorkBuilderStore((state) => state.workMetadata);

  const blocks = orderNodes(canvasData.nodes, canvasData.edges).map((node) => ({
    type: node.type,
    ...(node.data ?? {}),
  })) as unknown as WorkContentBlock[];

  return (
    <div className="flex flex-1 h-full bg-zinc-950 overflow-hidden">
      {/* Browser chrome frame */}
      <div className="flex flex-col flex-1 bg-white text-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            dikshantyadav.in/works/{workMetadata?.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-500 hover:bg-zinc-200 transition"
            title="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Hero */}
          <section className="bg-zinc-100 px-6 py-12">
            <div className="mx-auto max-w-4xl text-center">
              {workMetadata?.category && (
                <div className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                  {workMetadata.category}
                </div>
              )}
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900">
                {workMetadata?.title || 'Untitled Work'}
              </h1>
              {workMetadata?.subtitle && (
                <p className="mt-2 text-base text-zinc-600">{workMetadata.subtitle}</p>
              )}
              {workMetadata?.year && (
                <div className="mt-3 text-xs font-medium text-zinc-400">{workMetadata.year}</div>
              )}
              {workMetadata?.heroImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={workMetadata.heroImageUrl}
                  alt=""
                  className="mt-8 w-full object-cover aspect-[16/9]"
                />
              )}
            </div>
          </section>

          {/* Content blocks */}
          <section className="px-1 py-[60px]">
            <div className="flex flex-col gap-[60px] md:gap-[80px]">
              {blocks.map((block, i) => (
                <BlockPreview key={i} block={block} />
              ))}
              {blocks.length === 0 && (
                <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-zinc-300 px-6 py-16 text-center">
                  <p className="text-sm text-zinc-500">
                    No blocks yet — drag blocks from the palette onto the canvas.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Overview / bento teaser */}
          {(workMetadata?.overview || workMetadata?.description || workMetadata?.bento?.story) && (
            <section className="border-t border-zinc-200 bg-zinc-50 px-6 py-12">
              <div className="mx-auto max-w-3xl space-y-4">
                {workMetadata.overview && (
                  <p className="text-lg text-zinc-700">{workMetadata.overview}</p>
                )}
                {workMetadata.description && (
                  <p className="text-sm leading-relaxed text-zinc-600">{workMetadata.description}</p>
                )}
                {workMetadata.bento?.story && (
                  <p className="text-sm leading-relaxed text-zinc-600">{workMetadata.bento.story}</p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkPreviewPanel;
