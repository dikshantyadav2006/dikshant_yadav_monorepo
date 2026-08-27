'use client';

import React from 'react';
import type { WorkContentBlock } from '@dikshant/types';
import { Play, Link2, BarChart3 } from 'lucide-react';

export function BlockPreview({ block }: { block: WorkContentBlock }) {
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

    case 'bento':
      return (
        <div className="grid grid-cols-2 gap-[6px]">
          {[
            ['Story', block.story],
            ['Client', block.client],
            ['Year', block.year],
            ['Services', block.services.join(' / ')],
            ['Timeline', block.timeline],
            ['Role', block.role],
            ['Tech Stack', block.techStack.join(' / ')],
            ['Results', block.results],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border/50 bg-muted/20 p-2.5 min-h-[52px]">
              <div className="text-[9px] font-bold uppercase text-muted-foreground">{label}</div>
              <div className="text-[10px] mt-0.5 leading-snug line-clamp-2">{value || '—'}</div>
            </div>
          ))}
        </div>
      );

    case 'video':
      return block.src || block.poster ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.poster || block.src}
            alt={block.title || 'Video preview'}
            className="w-full aspect-video object-cover rounded-lg"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-border/50 text-muted-foreground/60 text-xs">
          Video block
        </div>
      );

    case 'embed':
      return (
        <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-border/50 text-muted-foreground/60 text-xs flex-col gap-1">
          <Link2 className="w-4 h-4" />
          <span className="max-w-[80%] truncate">{block.url || 'Paste a YouTube / Vimeo URL'}</span>
        </div>
      );

    case 'metrics':
      return block.items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[6px]">
          {block.items.map((item, i) => (
            <div key={i} className="rounded-lg border border-border/50 bg-muted/20 p-3">
              <div className="text-[14px] font-bold truncate">{item.value || '—'}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">{item.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border/50 text-muted-foreground/60 text-xs">
          <BarChart3 className="w-4 h-4 mr-1.5" /> Metrics block
        </div>
      );

    case 'link':
      return (
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-[13px] font-bold truncate">{block.label || 'Link label'}</div>
            {block.description && (
              <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                {block.description}
              </div>
            )}
          </div>
          <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
        </div>
      );

    case 'project-credits': {
      const items = block.items || [];
      return (
        <div className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-2">
          <div className="text-center">
            <div className="text-[9px] text-muted-foreground">{block.eyebrow || 'Project Metadata'}</div>
            <div className="font-script text-2xl leading-none mt-1">{block.title || 'Credits'}</div>
          </div>
          {items.length === 0 ? (
            <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border/50 text-muted-foreground/60 text-xs">
              Project Credits block
            </div>
          ) : (
            items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-[10px]">
                <span className="text-muted-foreground">{item.label || `Credit ${i + 1}`}</span>
                <span className="truncate">{item.value || '—'}</span>
              </div>
            ))
          )}
          {block.year && (
            <div className="flex items-center justify-between border-t border-border/50 pt-1.5 text-[10px]">
              <span className="text-muted-foreground">Year</span>
              <span>{block.year}</span>
            </div>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}
