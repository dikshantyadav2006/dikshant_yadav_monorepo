'use client';

import React, { useState } from 'react';
import { X, Monitor, Smartphone } from 'lucide-react';
import type { WorkContentBlock } from '@dikshant/types';
import { orderNodes } from '../../features/work-builder/serializer';
import { useWorkBuilderStore } from '../../features/work-builder/store';
import { BlockPreview } from './BlockPreview';

interface WorkPreviewPanelProps {
  onClose: () => void;
}

type PreviewDevice = 'desktop' | 'mobile';

export function WorkPreviewPanel({ onClose }: WorkPreviewPanelProps) {
  const canvasData = useWorkBuilderStore((state) => state.canvasData);
  const workMetadata = useWorkBuilderStore((state) => state.workMetadata);
  const [device, setDevice] = useState<PreviewDevice>('desktop');

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

          {/* Device toggle */}
          <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-0.5">
            <button
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md transition ${
                device === 'desktop' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Monitor className="w-3 h-3" /> Desktop
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md transition ${
                device === 'mobile' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Smartphone className="w-3 h-3" /> Mobile
            </button>
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
          <div className={device === 'mobile' ? 'mx-auto max-w-[390px] border-x border-zinc-200 shadow-xl' : ''}>
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

            {/* Overview / credits teaser */}
            {(workMetadata?.overview || workMetadata?.description) && (
              <section className="border-t border-zinc-200 bg-zinc-50 px-6 py-12">
                <div className="mx-auto max-w-3xl space-y-4">
                  {workMetadata.overview && (
                    <p className="text-lg text-zinc-700">{workMetadata.overview}</p>
                  )}
                  {workMetadata.description && (
                    <p className="text-sm leading-relaxed text-zinc-600">{workMetadata.description}</p>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkPreviewPanel;
