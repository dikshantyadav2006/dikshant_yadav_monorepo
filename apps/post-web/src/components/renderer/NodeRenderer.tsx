'use client';

import React, { useState } from 'react';
import { 
  Quote as QuoteIcon, 
  HelpCircle, 
  BarChart2, 
  Sparkles,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import type { Block } from '@dikshant/types';

interface NodeRendererProps {
  blocks: Block[];
}

export function NodeRenderer({ blocks }: NodeRendererProps) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground/60 text-sm">
        No content blocks to display.
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 w-full max-w-none">
      {blocks.map((block) => {
        const key = block.id || Math.random().toString();
        switch (block.type) {
          case 'heading':
            return <HeadingBlock key={key} data={block.data} />;
          case 'text':
            return <TextBlock key={key} data={block.data} />;
          case 'image':
            return <ImageBlock key={key} data={block.data} />;
          case 'video':
            return <VideoBlock key={key} data={block.data} />;
          case 'gallery':
            return <GalleryBlock key={key} data={block.data} />;
          case 'quote':
            return <QuoteBlock key={key} data={block.data} />;
          case 'divider':
            return <DividerBlock key={key} />;
          case 'code-block':
            return <CodeBlock key={key} data={block.data} />;
          case 'embed':
            return <EmbedBlock key={key} data={block.data} />;
          case 'question':
            return <QuestionBlock key={key} data={block.data} />;
          case 'poll':
            return <PollBlock key={key} data={block.data} />;
          case 'button':
            return <ButtonBlock key={key} data={block.data} />;
          case 'ai-block':
            return <AIBlock key={key} data={block.data} />;
          default:
            return (
              <div key={key} className="text-xs text-muted-foreground/50 border border-dashed p-3 rounded">
                Unsupported block type: {block.type}
              </div>
            );
        }
      })}
    </div>
  );
}

// 1. Heading Block
function HeadingBlock({ data }: { data: any }) {
  const level = data.level || 2;
  const text = data.text || '';
  if (!text) return null;

  switch (level) {
    case 1:
      return <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-8 mb-4 text-foreground font-sans">{text}</h1>;
    case 2:
      return <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-8 mb-3 text-foreground font-sans">{text}</h2>;
    case 3:
      return <h3 className="text-xl sm:text-2xl font-semibold tracking-tight mt-6 mb-2 text-foreground font-sans">{text}</h3>;
    default:
      return <h4 className="text-lg font-semibold mt-4 mb-2 text-foreground font-sans">{text}</h4>;
  }
}

// 2. Text Block
function TextBlock({ data }: { data: any }) {
  const body = data.body || '';
  if (!body) return null;

  return (
    <div className="space-y-4 text-foreground/90 leading-relaxed font-normal text-base sm:text-lg">
      {body.split('\n\n').map((paragraph: string, idx: number) => {
        if (!paragraph.trim()) return null;
        return <p key={idx}>{paragraph}</p>;
      })}
    </div>
  );
}

// 3. Image Block
function ImageBlock({ data }: { data: any }) {
  const src = data.src;
  const caption = data.caption || '';
  const alt = data.alt || caption || 'Image';
  if (!src) return null;

  return (
    <figure className="my-6 space-y-2 overflow-hidden rounded-xl border border-border/40 bg-muted/10 p-1.5 shadow-sm transition hover:shadow-md">
      <img
        src={src}
        alt={alt}
        className="w-full h-auto rounded-lg max-h-[500px] object-cover"
        loading="lazy"
      />
      {caption && (
        <figcaption className="text-center text-xs text-muted-foreground/80 italic px-4">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// 4. Video Block
function VideoBlock({ data }: { data: any }) {
  const src = data.src;
  const title = data.title || 'Video Player';
  if (!src) return null;

  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const getVimeoEmbedUrl = (url: string) => {
    const regExp = /vimeo\.com\/(?:video\/)?([0-9]+)/;
    const match = url.match(regExp);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  };

  const youtubeUrl = getYoutubeEmbedUrl(src);
  const vimeoUrl = getVimeoEmbedUrl(src);

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm">
      {youtubeUrl || vimeoUrl ? (
        <div className="relative aspect-video w-full">
          <iframe
            src={youtubeUrl || vimeoUrl || ''}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      ) : (
        <div className="p-1">
          <video src={src} controls className="w-full rounded-lg max-h-[500px] object-cover" />
        </div>
      )}
      {title && (
        <div className="px-4 py-2 border-t border-border/20 bg-muted/20">
          <p className="text-xs font-semibold text-foreground/80 truncate">{title}</p>
        </div>
      )}
    </div>
  );
}

// 5. Gallery Block
function GalleryBlock({ data }: { data: any }) {
  const items = data.items || [];
  if (items.length === 0) return null;

  return (
    <div className="my-6">
      <div className={`grid gap-3 ${
        items.length === 1 
          ? 'grid-cols-1' 
          : items.length === 2 
            ? 'grid-cols-2' 
            : 'grid-cols-2 md:grid-cols-3'
      }`}>
        {items.map((src: string, i: number) => (
          <div key={i} className="relative group aspect-video overflow-hidden rounded-xl border border-border/40 bg-muted/20 shadow-sm transition hover:shadow-md">
            <img
              src={src}
              alt={`Gallery image ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// 6. Quote Block
function QuoteBlock({ data }: { data: any }) {
  const quote = data.quote || '';
  const attribution = data.attribution || '';
  if (!quote) return null;

  return (
    <blockquote className="my-8 relative pl-6 border-l-4 border-accent bg-accent/5 py-4 pr-4 rounded-r-xl">
      <QuoteIcon className="absolute top-2 left-2 w-8 h-8 text-accent/10 pointer-events-none" />
      <p className="text-lg md:text-xl font-medium text-foreground italic leading-relaxed">
        "{quote}"
      </p>
      {attribution && (
        <footer className="mt-2 text-sm text-muted-foreground/80 font-semibold text-right">
          — {attribution}
        </footer>
      )}
    </blockquote>
  );
}

// 7. Divider Block
function DividerBlock() {
  return (
    <div className="py-6 flex items-center justify-center">
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}

// 8. Code Block
function CodeBlock({ data }: { data: any }) {
  const code = data.code || '';
  const language = data.language || 'text';
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border/60 bg-muted dark:bg-zinc-950 shadow-sm font-mono text-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-zinc-100 dark:bg-zinc-900">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{language}</span>
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          title="Copy Code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-foreground leading-relaxed"><code>{code}</code></pre>
      </div>
    </div>
  );
}

// 9. Embed Block
function EmbedBlock({ data }: { data: any }) {
  const url = data.url;
  if (!url) return null;

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border/40 bg-muted/10 shadow-sm">
      <div className="relative aspect-video w-full">
        <iframe
          src={url}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </div>
  );
}

// 10. Question Block
function QuestionBlock({ data }: { data: any }) {
  const prompt = data.prompt || '';
  const options = data.options || [];
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  if (!prompt) return null;

  return (
    <div className="my-6 p-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-violet-500/10 text-violet-500 rounded-xl mt-0.5 border border-violet-500/20">
          <HelpCircle className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1">
          <h4 className="text-base sm:text-lg font-bold text-foreground leading-snug">{prompt}</h4>
        </div>
      </div>
      {options.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {options.map((opt: any, idx: number) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold flex items-center justify-between ${
                  isSelected
                    ? 'bg-violet-500 text-white border-violet-500 shadow-md'
                    : 'bg-background hover:bg-muted/40 border-border/60 text-foreground/80 hover:text-foreground'
                }`}
              >
                <span>{opt.label || `Option ${idx + 1}`}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 11. Poll Block
function PollBlock({ data }: { data: any }) {
  const prompt = data.prompt || '';
  const options = data.options || [];
  const [votedIdx, setVotedIdx] = useState<number | null>(null);

  if (!prompt) return null;

  const totalVotes = options.reduce((sum: number, opt: any) => sum + (opt.votes || 0), 0) + (votedIdx !== null ? 1 : 0);

  return (
    <div className="my-6 p-5 rounded-2xl border border-orange-500/20 bg-orange-500/5 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl mt-0.5 border border-orange-500/20">
          <BarChart2 className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1">
          <h4 className="text-base sm:text-lg font-bold text-foreground leading-snug">{prompt}</h4>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2.5">
        {options.map((opt: any, idx: number) => {
          const rawVotes = opt.votes || 0;
          const votes = votedIdx === idx ? rawVotes + 1 : rawVotes;
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          const isVoted = votedIdx === idx;

          return (
            <button
              key={idx}
              onClick={() => votedIdx === null && setVotedIdx(idx)}
              className="relative w-full text-left rounded-xl border border-border/60 hover:border-orange-500/30 overflow-hidden bg-background h-12 transition-all"
              disabled={votedIdx !== null}
            >
              <div 
                className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                  isVoted ? 'bg-orange-500/25' : 'bg-muted'
                }`}
                style={{ width: `${percentage}%` }}
              />
              <div className="absolute inset-0 px-4 flex items-center justify-between text-sm font-semibold text-foreground/90">
                <span className={isVoted ? 'text-orange-500 font-bold' : ''}>
                  {opt.label || `Option ${idx + 1}`}
                </span>
                {votedIdx !== null && (
                  <span className="text-xs text-muted-foreground/80">{percentage}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 12. Button Block
function ButtonBlock({ data }: { data: any }) {
  const label = data.label || 'Continue';
  const href = data.href || '#';
  if (!label) return null;

  return (
    <div className="my-6 text-center">
      <a
        href={href}
        className="inline-flex items-center gap-1.5 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-glow-primary hover:bg-primary/95 transition-all text-sm group"
      >
        <span>{label}</span>
        <ExternalLink className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}

// 13. AI Block
function AIBlock({ data }: { data: any }) {
  const prompt = data.prompt || '';
  const output = data.output || 'Generate creative solutions and answers with the power of artificial intelligence.';
  const outputType = data.outputType || 'text';

  if (!prompt) return null;

  return (
    <div className="my-6 rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 overflow-hidden shadow-sm relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/10 blur-2xl pointer-events-none rounded-full" />
      <div className="p-4 border-b border-fuchsia-500/10 flex items-center justify-between bg-fuchsia-500/5">
        <div className="flex items-center gap-2 text-xs font-bold text-fuchsia-500">
          <Sparkles className="w-4 h-4 text-fuchsia-500 animate-pulse" />
          <span>AI Block</span>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider bg-fuchsia-500/10 text-fuchsia-500 px-2 py-0.5 rounded-full">
          {outputType}
        </span>
      </div>
      <div className="p-5 space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Prompt</span>
          <p className="text-sm font-semibold italic text-foreground/80 leading-relaxed">"{prompt}"</p>
        </div>
        <hr className="border-fuchsia-500/10" />
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Output</span>
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{output}</p>
        </div>
      </div>
    </div>
  );
}
