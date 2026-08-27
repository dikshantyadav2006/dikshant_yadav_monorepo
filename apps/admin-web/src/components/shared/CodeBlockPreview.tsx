'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { compileTSX } from './compileCode';
import { validateSource, extractModule, type RuntimeModule } from './extractModule';
import { importMap } from './importMap';
import { RuntimeErrorBoundary } from './ErrorBoundary';
import { withTimeout, TIMEOUTS } from './timeout';

interface CodeBlockPreviewProps {
  code: string;
  runtime: 'react' | 'html';
  props?: Record<string, any>;
  height?: number;
  html?: string;
  css?: string;
  js?: string;
}

export function CodeBlockPreview({
  code,
  runtime,
  props = {},
  height = 400,
  html = '',
  css = '',
  js = '',
}: CodeBlockPreviewProps) {
  if (runtime === 'html') {
    return <HtmlPreview html={html} css={css} js={js} height={height} />;
  }

  if (!code.trim()) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
        Click edit to open the code editor
      </div>
    );
  }

  return (
    <RuntimeErrorBoundary>
      <ReactRuntimePreview code={code} props={props} height={height} />
    </RuntimeErrorBoundary>
  );
}

function ReactRuntimePreview({
  code,
  props,
  height,
}: {
  code: string;
  props: Record<string, any>;
  height: number;
}) {
  const [mod, setMod] = useState<RuntimeModule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const compile = useCallback(async () => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    try {
      validateSource(code);
      const compiled = await withTimeout(
        () => compileTSX(code),
        TIMEOUTS.compile,
        'Compilation',
      );
      if (cancelled) return;

      const extracted = extractModule(compiled);
      if (cancelled) return;

      setMod(extracted);
    } catch (err) {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : 'Compilation failed');
      }
    } finally {
      if (!cancelled) setLoading(false);
    }

    return () => { cancelled = true; };
  }, [code]);

  useEffect(() => {
    const cleanup = compile();
    return () => { cleanup?.then?.((fn) => fn?.()); };
  }, [compile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-destructive text-xs font-mono whitespace-pre-wrap overflow-auto" style={{ height }}>
        {error}
      </div>
    );
  }

  if (!mod?.Component) return null;

  const Component = mod.Component;

  return (
    <div style={{ height }} className="overflow-auto">
      <Component {...props} />
    </div>
  );
}

function HtmlPreview({ html, css, js, height }: { html: string; css: string; js: string; height: number }) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const buildSrcdoc = useCallback(() => {
    const root = document.documentElement;
    const computed = getComputedStyle(root);
    const vars = [
      '--background', '--foreground', '--card', '--card-foreground',
      '--popover', '--popover-foreground', '--primary', '--primary-foreground',
      '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
      '--accent', '--accent-foreground', '--destructive', '--destructive-foreground',
      '--border', '--input', '--ring', '--radius',
    ];

    const rootStyles = vars.map((v) => `${v}: ${computed.getPropertyValue(v)};`).join('\n      ');

    const jsBlock = js && js.trim() ? `<script>\n${js}\n<\/script>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            background: 'hsl(${computed.getPropertyValue('--background').trim()})',
            foreground: 'hsl(${computed.getPropertyValue('--foreground').trim()})',
            primary: { DEFAULT: 'hsl(${computed.getPropertyValue('--primary').trim()})', foreground: 'hsl(${computed.getPropertyValue('--primary-foreground').trim()})' },
            secondary: { DEFAULT: 'hsl(${computed.getPropertyValue('--secondary').trim()})', foreground: 'hsl(${computed.getPropertyValue('--secondary-foreground').trim()})' },
            muted: { DEFAULT: 'hsl(${computed.getPropertyValue('--muted').trim()})', foreground: 'hsl(${computed.getPropertyValue('--muted-foreground').trim()})' },
            accent: { DEFAULT: 'hsl(${computed.getPropertyValue('--accent').trim()})', foreground: 'hsl(${computed.getPropertyValue('--accent-foreground').trim()})' },
            destructive: { DEFAULT: 'hsl(${computed.getPropertyValue('--destructive').trim()})', foreground: 'hsl(${computed.getPropertyValue('--destructive-foreground').trim()})' },
            card: { DEFAULT: 'hsl(${computed.getPropertyValue('--card').trim()})', foreground: 'hsl(${computed.getPropertyValue('--card-foreground').trim()})' },
            border: 'hsl(${computed.getPropertyValue('--border').trim()})',
            input: 'hsl(${computed.getPropertyValue('--input').trim()})',
            ring: 'hsl(${computed.getPropertyValue('--ring').trim()})',
          },
          borderRadius: {
            lg: 'var(--radius)',
            md: 'calc(var(--radius) - 2px)',
            sm: 'calc(var(--radius) - 4px)',
          },
        },
      },
    };
  <\/script>
  <style>
    :root {
      ${rootStyles}
    }
    body {
      margin: 0;
      padding: 16px;
      font-family: system-ui, -apple-system, sans-serif;
      background: hsl(${computed.getPropertyValue('--background').trim()});
      color: hsl(${computed.getPropertyValue('--foreground').trim()});
    }
    #root {
      width: 100%;
    }
    ${css || ''}
  </style>
</head>
<body>
  <div id="root">
    ${html || ''}
  </div>
  ${jsBlock}
</body>
</html>`;
  }, [html, css, js]);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = buildSrcdoc();
    }
  }, [buildSrcdoc]);

  return (
    <iframe
      ref={iframeRef}
      style={{ height, width: '100%', border: 'none' }}
      sandbox="allow-scripts"
      title="HTML Preview"
    />
  );
}
