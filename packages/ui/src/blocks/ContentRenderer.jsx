import React from 'react';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function getBlockStyles(data) {
  const alignment = data.alignment;
  return {
    className: cn(
      alignment === 'center' && 'text-center',
      alignment === 'right' && 'text-right',
    ),
    style: {},
  };
}

function HeadingBlock({ data }) {
  const level = data.level || 2;
  const text = data.text || '';
  if (!text) return null;
  const id = text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  const base = 'font-display scroll-mt-28 text-foreground';
  if (level === 1) return <h1 id={id} className={cn(base, 'text-4xl mt-10 mb-4')}>{text}</h1>;
  if (level === 2) return <h2 id={id} className={cn(base, 'text-3xl mt-12 mb-4 border-b border-foreground/20 pb-2')}>{text}</h2>;
  if (level === 3) return <h3 id={id} className={cn(base, 'text-2xl mt-8 mb-3')}>{text}</h3>;
  return <h4 id={id} className={cn(base, 'text-xl mt-6 mb-2')}>{text}</h4>;
}

function TextBlock({ data }) {
  const body = data.body || '';
  if (!body) return null;
  return (
    <div className="font-serif text-lg leading-[1.85] text-foreground/90 space-y-5">
      {body.split('\n\n').map((p, i) => p.trim() ? <p key={i}>{p}</p> : null)}
    </div>
  );
}

function ImageBlock({ data }) {
  const src = data.src;
  const caption = data.caption || '';
  const alt = data.alt || caption || 'Document image';
  const layout = data.layout || 'auto';
  if (!src) return null;

  const isPortrait = layout === 'portrait';
  const isFullWidth = layout === 'full-width';

  const figureClassName = cn(
    'my-8 border-2 border-foreground overflow-hidden bg-card',
    isPortrait && 'mx-auto max-w-[540px]',
    isFullWidth && 'relative left-1/2 -translate-x-1/2',
  );

  const figureStyle = isFullWidth
    ? { width: 'min(1200px, calc(100vw - 2rem))', boxShadow: '4px 4px 0 hsl(var(--foreground))' }
    : { boxShadow: '4px 4px 0 hsl(var(--foreground))' };

  let aspectClass = 'aspect-[4/3]';
  if (layout === 'wide') aspectClass = 'aspect-video';
  else if (layout === 'portrait') aspectClass = 'aspect-[3/4]';
  else if (layout === 'standard') aspectClass = 'aspect-[4/3]';

  return (
    <figure className={figureClassName} style={figureStyle}>
      <div className={cn('relative w-full bg-secondary max-h-[90vh]', aspectClass)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-contain" />
      </div>
      {caption && (
        <figcaption className="border-t-2 border-foreground bg-secondary/50 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Fig. — {caption}
        </figcaption>
      )}
    </figure>
  );
}

function VideoBlock({ data }) {
  const src = data.src;
  const title = data.title || '';
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
        <figcaption className="border-t-2 border-foreground px-4 py-2 font-mono text-[10px] uppercase tracking-wider">{title}</figcaption>
      )}
    </figure>
  );
}

function GalleryBlock({ data }) {
  const items = data.items || [];
  if (!items.length) return null;

  return (
    <div className="my-8 border-2 border-foreground bg-card p-2" style={{ boxShadow: '4px 4px 0 hsl(var(--foreground))' }}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((src, i) => (
          <div key={i} className="relative overflow-hidden bg-secondary" style={{ aspectRatio: '1' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

function QuoteBlock({ data }) {
  const quote = data.quote || '';
  const attribution = data.attribution || '';
  if (!quote) return null;

  return (
    <blockquote className="my-10 relative border-l-4 border-foreground pl-8 pr-4 py-4 bg-secondary/30">
      <p className="font-display text-2xl italic leading-snug text-foreground">&ldquo;{quote}&rdquo;</p>
      {attribution && (
        <footer className="mt-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">— {attribution}</footer>
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

function CodeBlock({ data }) {
  const code = data.code || '';
  const language = data.language || 'text';
  if (!code) return null;

  return (
    <div className="my-8 border-2 border-foreground overflow-hidden font-mono text-sm">
      <div className="flex items-center justify-between border-b-2 border-foreground bg-secondary px-4 py-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{language}</span>
      </div>
      <pre className="p-4 overflow-x-auto bg-card leading-relaxed"><code>{code}</code></pre>
    </div>
  );
}

function EmbedBlock({ data }) {
  const url = data.url;
  if (!url) return null;

  return (
    <div className="my-8 border-2 border-foreground overflow-hidden">
      <div className="relative aspect-video">
        <iframe src={url} allowFullScreen className="absolute inset-0 w-full h-full border-0" />
      </div>
    </div>
  );
}

function QuestionBlock({ data }) {
  const prompt = data.prompt || '';
  const options = data.options || [];
  if (!prompt) return null;

  return (
    <div className="my-8 border-2 border-foreground p-5 bg-secondary/20">
      <p className="font-display text-lg mb-4">{prompt}</p>
      <div className="space-y-2">
        {options.map((opt, idx) => (
          <div key={idx} className="w-full px-4 py-3 border-2 border-foreground/30 font-mono text-xs uppercase tracking-wide">
            {opt.label || `Option ${idx + 1}`}
          </div>
        ))}
      </div>
    </div>
  );
}

function PollBlock({ data }) {
  const prompt = data.prompt || '';
  const options = data.options || [];
  if (!prompt) return null;

  const totalVotes = options.reduce((s, o) => s + (o.votes || 0), 0) || 1;

  return (
    <div className="my-8 border-2 border-foreground p-5">
      <p className="font-display text-lg mb-4">{prompt}</p>
      <div className="space-y-2">
        {options.map((opt, idx) => {
          const pct = Math.round(((opt.votes || 0) / totalVotes) * 100);
          return (
            <div key={idx} className="relative w-full h-10 border border-foreground/30 overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-foreground/10 transition-all" style={{ width: `${pct}%` }} />
              <div className="relative px-4 flex items-center justify-between h-full font-mono text-[11px] uppercase">
                <span>{opt.label || `Option ${idx + 1}`}</span>
                <span>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ButtonBlock({ data }) {
  const label = data.label || 'Continue';
  const href = data.href || '#';

  return (
    <div className="my-8 text-center">
      <a
        href={href}
        className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground text-card px-6 py-3 font-mono text-xs uppercase tracking-wider hover:bg-card hover:text-foreground transition-colors"
      >
        {label}
      </a>
    </div>
  );
}

function AIBlock({ data }) {
  const prompt = data.prompt || '';
  const output = data.output || 'AI-generated content block.';
  const outputType = data.outputType || 'text';
  if (!prompt) return null;

  return (
    <div className="my-8 border-2 border-dashed border-foreground/40 p-5 bg-secondary/20">
      <div className="flex items-center gap-2 mb-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>AI Block — {outputType}</span>
      </div>
      <p className="text-sm italic text-muted-foreground mb-3">&ldquo;{prompt}&rdquo;</p>
      <div className="border-t border-foreground/20 pt-3 font-serif leading-relaxed">{output}</div>
    </div>
  );
}

const blockRenderers = {
  heading: HeadingBlock,
  text: TextBlock,
  image: ImageBlock,
  video: VideoBlock,
  gallery: GalleryBlock,
  quote: QuoteBlock,
  divider: DividerBlock,
  'code-block': CodeBlock,
  embed: EmbedBlock,
  question: QuestionBlock,
  poll: PollBlock,
  button: ButtonBlock,
  'ai-block': AIBlock,
};

export default function ContentRenderer({ blocks }) {
  if (!blocks?.length) {
    return (
      <p className="text-center py-12 text-muted-foreground font-serif italic">
        This dossier contains no published content blocks.
      </p>
    );
  }

  return (
    <div className="space-y-8 reading-column">
      {blocks.map((block) => {
        const Renderer = blockRenderers[block.type];
        const styles = getBlockStyles(block.data);

        if (!Renderer) {
          return (
            <div key={block.id} className="font-mono text-xs border-2 border-dashed border-foreground/30 p-3 text-muted-foreground">
              Unsupported block: {block.type}
            </div>
          );
        }

        return (
          <div key={block.id} style={styles.style} className={styles.className}>
            <Renderer data={block.data} />
          </div>
        );
      })}
    </div>
  );
}

export {
  HeadingBlock,
  TextBlock,
  ImageBlock,
  VideoBlock,
  GalleryBlock,
  QuoteBlock,
  DividerBlock,
  CodeBlock,
  EmbedBlock,
  QuestionBlock,
  PollBlock,
  ButtonBlock,
  AIBlock,
};
