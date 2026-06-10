'use client';

import React, { useState, useRef } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  children: React.ReactNode;
}

export function CodeBlock({ children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    if (!preRef.current) return;
    const codeText = preRef.current.textContent || '';
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border border-border/80 bg-card/60 shadow-premium dark:shadow-premium-dark backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">code</span>
        <button
          onClick={handleCopy}
          className="rounded-lg border border-border bg-card/85 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <pre
        ref={preRef}
        className="no-scrollbar overflow-x-auto p-4 font-mono text-[13.5px] leading-relaxed text-foreground"
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}

// Map custom MDX tags to premium components
export const mdxComponents = {
  pre: ({ children, ...props }: any) => {
    // Check if the pre element wraps a code tag
    if (React.isValidElement(children) && children.type === 'code') {
      const codeElement = children as React.ReactElement<any>;
      return <CodeBlock {...props}>{codeElement.props.children}</CodeBlock>;
    }
    return <pre className="my-6 p-4 bg-muted/40 rounded-xl overflow-auto" {...props}>{children}</pre>;
  },
  code: ({ children, ...props }: any) => (
    <code className="rounded bg-muted/80 px-1.5 py-0.5 font-mono text-[13px] text-accent font-semibold border border-border/10" {...props}>
      {children}
    </code>
  ),
  h2: ({ children, ...props }: any) => {
    const id = children?.toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '') || '';
    return (
      <h2
        id={id}
        className="font-sans group relative scroll-mt-24 mt-12 mb-5 text-2xl md:text-3xl font-extrabold tracking-tight text-foreground hover:text-accent transition-colors duration-200"
        {...props}
      >
        <a href={`#${id}`} className="absolute -left-6 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground/50">#</a>
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }: any) => {
    const id = children?.toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '') || '';
    return (
      <h3
        id={id}
        className="font-sans group relative scroll-mt-24 mt-9 mb-4 text-xl md:text-2xl font-bold tracking-tight text-foreground hover:text-accent transition-colors duration-200"
        {...props}
      >
        <a href={`#${id}`} className="absolute -left-5 top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground/50">#</a>
        {children}
      </h3>
    );
  },
  p: (props: any) => <p className="font-serif leading-[1.8] text-[17px] md:text-lg text-foreground/90 my-6 tracking-[-0.02em]" {...props} />,
  ul: (props: any) => <ul className="font-serif list-disc pl-6 my-6 space-y-2.5 text-[17px] md:text-lg leading-[1.8] tracking-[-0.02em] text-foreground/90" {...props} />,
  ol: (props: any) => <ol className="font-serif list-decimal pl-6 my-6 space-y-2.5 text-[17px] md:text-lg leading-[1.8] tracking-[-0.02em] text-foreground/90" {...props} />,
  li: (props: any) => <li className="pl-1" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-2 border-accent bg-accent/5 rounded-r-lg px-5 py-4 my-6 italic font-serif text-[17px] md:text-lg leading-[1.8] text-foreground/90 tracking-[-0.02em]" {...props} />
  ),
  a: ({ href, children, ...props }: any) => (
    <a
      href={href}
      className="underline decoration-accent/40 hover:decoration-accent underline-offset-4 text-accent font-medium transition-all"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),
};
export default mdxComponents;
