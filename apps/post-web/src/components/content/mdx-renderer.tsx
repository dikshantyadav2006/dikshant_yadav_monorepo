'use client';

import React, { useState, useRef } from 'react';
import { Check, Copy } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface CodeBlockProps {
  children: React.ReactNode;
}

function CodeBlock({ children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    if (!preRef.current) return;
    try {
      await navigator.clipboard.writeText(preRef.current.textContent || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="my-8 border-2 border-foreground overflow-hidden font-mono text-sm">
      <div className="flex items-center justify-between border-b-2 border-foreground bg-secondary px-4 py-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">code</span>
        <button onClick={handleCopy} className="p-1 hover:bg-foreground hover:text-card transition-colors" aria-label="Copy code">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <pre ref={preRef} className="p-4 overflow-x-auto bg-card leading-relaxed no-scrollbar" {...props}>
        {children}
      </pre>
    </div>
  );
}

export const mdxComponents = {
  pre: ({ children, ...props }: React.ComponentProps<'pre'>) => {
    if (React.isValidElement(children) && (children as React.ReactElement).type === 'code') {
      const codeEl = children as React.ReactElement<{ children: React.ReactNode }>;
      return <CodeBlock {...props}>{codeEl.props.children}</CodeBlock>;
    }
    return <pre className="my-6 p-4 border border-foreground/30 overflow-auto font-mono text-sm" {...props}>{children}</pre>;
  },
  code: ({ children, ...props }: React.ComponentProps<'code'>) => (
    <code className="font-mono text-sm bg-secondary px-1.5 py-0.5 border border-foreground/20" {...props}>
      {children}
    </code>
  ),
  h2: ({ children, ...props }: React.ComponentProps<'h2'>) => {
    const id = slugify(String(children));
    return (
      <h2 id={id} className="font-display scroll-mt-28 mt-12 mb-4 text-3xl border-b border-foreground/20 pb-2" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }: React.ComponentProps<'h3'>) => {
    const id = slugify(String(children));
    return (
      <h3 id={id} className="font-display scroll-mt-28 mt-8 mb-3 text-2xl" {...props}>
        {children}
      </h3>
    );
  },
  p: (props: React.ComponentProps<'p'>) => (
    <p className="font-serif text-lg leading-[1.85] text-foreground/90 my-5" {...props} />
  ),
  ul: (props: React.ComponentProps<'ul'>) => (
    <ul className="font-serif list-disc pl-6 my-5 space-y-2 text-lg leading-[1.85]" {...props} />
  ),
  ol: (props: React.ComponentProps<'ol'>) => (
    <ol className="font-serif list-decimal pl-6 my-5 space-y-2 text-lg leading-[1.85]" {...props} />
  ),
  blockquote: (props: React.ComponentProps<'blockquote'>) => (
    <blockquote className="my-8 border-l-4 border-foreground pl-6 py-2 font-display text-xl italic" {...props} />
  ),
  a: ({ href, children, ...props }: React.ComponentProps<'a'>) => (
    <a
      href={href}
      className="underline underline-offset-4 decoration-foreground/40 hover:decoration-foreground font-medium"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),
};

export default mdxComponents;
