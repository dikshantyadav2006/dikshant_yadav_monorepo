'use client';

import React, { useState } from 'react';
import SmartImage from '@/components/ui/smart-image';
import {
  Quote as QuoteIcon,
  HelpCircle,
  BarChart2,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import type { Block } from '@dikshant/types';
import { cn, slugify } from '@/lib/utils';

interface ContentRendererProps {
  blocks: Block[];
}

function getBlockStyles(data: Record<string, unknown>) {
  const alignment = data.alignment as string | undefined;
  const marginTop = typeof data.marginTop === 'number' ? data.marginTop : undefined;
  const marginBottom = typeof data.marginBottom === 'number' ? data.marginBottom : undefined;

  return {
    className: cn(
      alignment === 'center' && 'text-center',
      alignment === 'right' && 'text-right',
      data.background === 'muted' && 'bg-secondary/50 p-4 border border-foreground/10',
      data.background === 'accent' && 'bg-foreground/5 p-4 border-l-4 border-foreground',
    ),
    style: {
      marginTop: marginTop ? `${marginTop}px` : undefined,
      marginBottom: marginBottom ? `${marginBottom}px` : undefined,
    } as React.CSSProperties,
  };
}

export default function ContentRenderer({ blocks }: ContentRendererProps) {
  if (!blocks?.length) {
    return (
      <p className="text-center py-12 text-muted-foreground font-serif italic">
        This dossier contains no published content blocks.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {blocks.map((block) => {
        const key = block.id;
        const styles = getBlockStyles(block.data);

        switch (block.type) {
          case 'heading':
            return (
              <div key={key} style={styles.style} className={styles.className}>
                <HeadingBlock data={block.data} />
              </div>
            );
          case 'text':
            return (
              <div key={key} style={styles.style} className={styles.className}>
                <TextBlock data={block.data} />
              </div>
            );
          case 'image':
            return (
              <div key={key} style={styles.style} className={styles.className}>
                <ImageBlock data={block.data} />
              </div>
            );
          case 'video':
            return (
              <div key={key} style={styles.style} className={styles.className}>
                <VideoBlock data={block.data} />
              </div>
            );
          case 'gallery':
            return (
              <div key={key} style={styles.style} className={styles.className}>
                <GalleryBlock data={block.data} />
              </div>
            );
          case 'quote':
            return (
              <div key={key} style={styles.style} className={styles.className}>
                <QuoteBlock data={block.data} />
              </div>
            );
          case 'divider':
            return <DividerBlock key={key} />;
          case 'code-block':
            return (
              <div key={key} style={styles.style} className={styles.className}>
                <CodeBlock data={block.data} />
              </div>
            );
          case 'embed':
            return (
              <div key={key} style={styles.style} className={styles.className}>
                <EmbedBlock data={block.data} />
              </div>
            );
          case 'question':
            return (
              <div key={key} style={styles.style} className={styles.className}>
                <QuestionBlock data={block.data} />
              </div>
            );
          case 'poll':
            return (
              <div key={key} style={styles.style} className={styles.className}>
                <PollBlock data={block.data} />
              </div>
            );
          case 'button':
            return (
              <div key={key} style={styles.style} className={styles.className}>
                <ButtonBlock data={block.data} />
              </div>
            );
          case 'ai-block':
            return (
              <div key={key} style={styles.style} className={styles.className}>
                <AIBlock data={block.data} />
              </div>
            );
          default:
            return (
              <div key={key} className="font-mono text-xs border-2 border-dashed border-foreground/30 p-3 text-muted-foreground">
                Unsupported block: {block.type}
              </div>
            );
        }
      })}
    </div>
  );
}

function HeadingBlock({ data }: { data: Record<string, unknown> }) {
  const level = (data.level as number) || 2;
  const text = (data.text as string) || '';
  if (!text) return null;

  const id = slugify(text);
  const base = 'font-display scroll-mt-28 text-foreground';

  if (level === 1) {
    return <h1 id={id} className={cn(base, 'text-4xl mt-10 mb-4')}>{text}</h1>;
  }
  if (level === 2) {
    return <h2 id={id} className={cn(base, 'text-3xl mt-12 mb-4 border-b border-foreground/20 pb-2')}>{text}</h2>;
  }
  if (level === 3) {
    return <h3 id={id} className={cn(base, 'text-2xl mt-8 mb-3')}>{text}</h3>;
  }
  return <h4 id={id} className={cn(base, 'text-xl mt-6 mb-2')}>{text}</h4>;
}

function TextBlock({ data }: { data: Record<string, unknown> }) {
  const body = (data.body as string) || '';
  if (!body) return null;

  return (
    <div className="font-serif text-lg leading-[1.85] text-foreground/90 space-y-5">
      {body.split('\n\n').map((paragraph, idx) =>
        paragraph.trim() ? <p key={idx}>{paragraph}</p> : null,
      )}
    </div>
  );
}

function ImageBlock({ data }: { data: Record<string, unknown> }) {
  const src = data.src as string;
  const caption = (data.caption as string) || '';
  const alt = (data.alt as string) || caption || 'Document image';
  if (!src) return null;

  return (
    <figure className="my-8 border-2 border-foreground overflow-hidden">
      <div className="relative aspect-[16/10] w-full bg-secondary">
        <SmartImage src={src} alt={alt} fill className="object-cover" sizes="680px" />
      </div>
      {caption && (
        <figcaption className="border-t-2 border-foreground bg-secondary/50 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Fig. — {caption}
        </figcaption>
      )}
    </figure>
  );
}

function VideoBlock({ data }: { data: Record<string, unknown> }) {
  const src = data.src as string;
  const title = (data.title as string) || 'Video';
  if (!src) return null;

  const youtubeMatch = src.match(/(?:youtu\.be\/|v=)([^#&?]+)/);
  const vimeoMatch = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const embedUrl = youtubeMatch
    ? `https://www.youtube.com/embed/${youtubeMatch[1]}`
    : vimeoMatch
      ? `https://player.vimeo.com/video/${vimeoMatch[1]}`
      : null;

  return (
    <figure className="my-8 border-2 border-foreground overflow-hidden">
      {embedUrl ? (
        <div className="relative aspect-video">
          <iframe src={embedUrl} title={title} allowFullScreen className="absolute inset-0 w-full h-full border-0" />
        </div>
      ) : (
        <video src={src} controls className="w-full" />
      )}
      {title && (
        <figcaption className="border-t-2 border-foreground px-4 py-2 font-mono text-[10px] uppercase tracking-wider">
          {title}
        </figcaption>
      )}
    </figure>
  );
}

function GalleryBlock({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as string[]) || [];
  if (!items.length) return null;

  return (
    <div className={cn('my-8 grid gap-2 border-2 border-foreground p-2', items.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
      {items.map((src, i) => (
        <div key={i} className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <SmartImage src={src} alt={`Gallery ${i + 1}`} fill className="object-cover" sizes="340px" />
        </div>
      ))}
    </div>
  );
}

function QuoteBlock({ data }: { data: Record<string, unknown> }) {
  const quote = (data.quote as string) || '';
  const attribution = (data.attribution as string) || '';
  if (!quote) return null;

  return (
    <blockquote className="my-10 relative border-l-4 border-foreground pl-8 pr-4 py-4 bg-secondary/30">
      <QuoteIcon className="absolute top-2 left-2 h-6 w-6 text-foreground/10" />
      <p className="font-display text-2xl italic leading-snug text-foreground">&ldquo;{quote}&rdquo;</p>
      {attribution && (
        <footer className="mt-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          — {attribution}
        </footer>
      )}
    </blockquote>
  );
}

function DividerBlock() {
  return (
    <div className="py-6 flex items-center gap-4">
      <div className="flex-1 border-t-2 border-foreground" />
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">§</span>
      <div className="flex-1 border-t-2 border-foreground" />
    </div>
  );
}

function CodeBlock({ data }: { data: Record<string, unknown> }) {
  const code = (data.code as string) || '';
  const language = (data.language as string) || 'text';
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 border-2 border-foreground overflow-hidden font-mono text-sm">
      <div className="flex items-center justify-between border-b-2 border-foreground bg-secondary px-4 py-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{language}</span>
        <button onClick={handleCopy} className="p-1 hover:bg-foreground hover:text-card transition-colors" aria-label="Copy code">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto bg-card leading-relaxed"><code>{code}</code></pre>
    </div>
  );
}

function EmbedBlock({ data }: { data: Record<string, unknown> }) {
  const url = data.url as string;
  if (!url) return null;

  return (
    <div className="my-8 border-2 border-foreground overflow-hidden">
      <div className="relative aspect-video">
        <iframe src={url} allowFullScreen className="absolute inset-0 w-full h-full border-0" />
      </div>
    </div>
  );
}

function QuestionBlock({ data }: { data: Record<string, unknown> }) {
  const prompt = (data.prompt as string) || '';
  const options = (data.options as { label?: string }[]) || [];
  const [selected, setSelected] = useState<number | null>(null);
  if (!prompt) return null;

  return (
    <div className="my-8 border-2 border-foreground p-5 bg-secondary/20">
      <div className="flex items-start gap-3 mb-4">
        <HelpCircle className="h-5 w-5 shrink-0 mt-0.5" />
        <p className="font-display text-lg">{prompt}</p>
      </div>
      <div className="space-y-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => setSelected(idx)}
            className={cn(
              'w-full text-left px-4 py-3 border-2 font-mono text-xs uppercase tracking-wide transition-colors',
              selected === idx ? 'bg-foreground text-card border-foreground' : 'border-foreground/30 hover:border-foreground',
            )}
          >
            {opt.label || `Option ${idx + 1}`}
          </button>
        ))}
      </div>
    </div>
  );
}

function PollBlock({ data }: { data: Record<string, unknown> }) {
  const prompt = (data.prompt as string) || '';
  const options = (data.options as { label?: string; votes?: number }[]) || [];
  const [votedIdx, setVotedIdx] = useState<number | null>(null);
  if (!prompt) return null;

  const totalVotes = options.reduce((s, o) => s + (o.votes || 0), 0) + (votedIdx !== null ? 1 : 0);

  return (
    <div className="my-8 border-2 border-foreground p-5">
      <div className="flex items-start gap-3 mb-4">
        <BarChart2 className="h-5 w-5 shrink-0 mt-0.5" />
        <p className="font-display text-lg">{prompt}</p>
      </div>
      <div className="space-y-2">
        {options.map((opt, idx) => {
          const votes = (opt.votes || 0) + (votedIdx === idx ? 1 : 0);
          const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          return (
            <button
              key={idx}
              onClick={() => votedIdx === null && setVotedIdx(idx)}
              disabled={votedIdx !== null}
              className="relative w-full h-10 border border-foreground/30 overflow-hidden text-left"
            >
              <div className="absolute inset-y-0 left-0 bg-foreground/10 transition-all" style={{ width: `${pct}%` }} />
              <div className="relative px-4 flex items-center justify-between h-full font-mono text-[11px] uppercase">
                <span>{opt.label || `Option ${idx + 1}`}</span>
                {votedIdx !== null && <span>{pct}%</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ButtonBlock({ data }: { data: Record<string, unknown> }) {
  const label = (data.label as string) || 'Continue';
  const href = (data.href as string) || '#';

  return (
    <div className="my-8 text-center">
      <a
        href={href}
        className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground text-card px-6 py-3 font-mono text-xs uppercase tracking-wider hover:bg-card hover:text-foreground transition-colors"
      >
        {label}
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}

function AIBlock({ data }: { data: Record<string, unknown> }) {
  const prompt = (data.prompt as string) || '';
  const output = (data.output as string) || 'AI-generated content block.';
  const outputType = (data.outputType as string) || 'text';
  if (!prompt) return null;

  return (
    <div className="my-8 border-2 border-dashed border-foreground/40 p-5 bg-secondary/20">
      <div className="flex items-center gap-2 mb-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        AI Block — {outputType}
      </div>
      <p className="text-sm italic text-muted-foreground mb-3">&ldquo;{prompt}&rdquo;</p>
      <div className="border-t border-foreground/20 pt-3 font-serif leading-relaxed">{output}</div>
    </div>
  );
}
