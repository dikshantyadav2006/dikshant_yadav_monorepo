'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

let esbuildinitialized = false;
let esbuildModule: any = null;

async function initEsbuild() {
  if (esbuildinitialized) return esbuildModule;
  esbuildModule = await import('esbuild-wasm');
  await esbuildModule.initialize({
    wasmURL: 'https://cdn.jsdelivr.net/npm/esbuild-wasm@0.28.2/esbuild.wasm',
  });
  esbuildinitialized = true;
  return esbuildModule;
}

async function compileTSX(code: string): Promise<string> {
  const esbuild = await initEsbuild();
  const result = await esbuild.transform(code, {
    loader: 'tsx',
    jsx: 'automatic',
    target: 'es2020',
    format: 'esm',
    minify: false,
  });
  return result.code;
}

function extractModule(compiledCode: string): { Component: React.ComponentType<any> | null } {
  const forbidden = ['process.env', 'require('];
  for (const pattern of forbidden) {
    if (compiledCode.includes(pattern)) {
      throw new Error(`Forbidden pattern detected: ${pattern}`);
    }
  }

  try {
    const moduleObj: any = { exports: {} };
    const exportsObj: any = {};
    const fn = new Function('module', 'exports', compiledCode);
    fn(moduleObj, exportsObj);

    const target = moduleObj.exports?.default
      ? moduleObj.exports
      : exportsObj.default
        ? exportsObj
        : moduleObj.exports;

    const Component = target?.default || target?.Component || null;
    return { Component };
  } catch {
    return { Component: null };
  }
}

const IMPORT_MAP: Record<string, any> = {
  react: React,
  'react-dom': require('react-dom'),
  'react-dom/client': require('react-dom/client'),
};

function resolveImport(specifier: string): any {
  return IMPORT_MAP[specifier] || null;
}

interface CodeBlockInteractiveProps {
  data: Record<string, unknown>;
}

export function CodeBlockInteractive({ data }: CodeBlockInteractiveProps) {
  const runtime = (data.runtime as string) || 'react';
  const code = (data.code as string) || '';
  const props = (data.props as Record<string, any>) || {};
  const height = (data.previewHeight as number) || 400;

  if (runtime === 'html') {
    return <HtmlCodeBlock code={code} height={height} />;
  }

  if (!code.trim()) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        No code to display
      </div>
    );
  }

  return <ReactCodeBlock code={code} props={props} height={height} />;
}

function ReactCodeBlock({
  code,
  props,
  height,
}: {
  code: string;
  props: Record<string, any>;
  height: number;
}) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const compiled = await compileTSX(code);
        if (cancelled) return;

        const mod = extractModule(compiled);
        if (cancelled) return;

        if (mod.Component) {
          setComponent(() => mod.Component);
        } else {
          setError('No default export found. Export a React component as default.');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to compile');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [code]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-40" />
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

  if (!Component) return null;

  return (
    <div style={{ height }} className="overflow-auto">
      <Component {...props} />
    </div>
  );
}

function HtmlCodeBlock({ code, height }: { code: string; height: number }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const buildSrcdoc = useCallback(() => {
    const root = document.documentElement;
    const computed = getComputedStyle(root);

    const vars = [
      '--background', '--foreground', '--card', '--card-foreground',
      '--primary', '--primary-foreground', '--secondary', '--secondary-foreground',
      '--muted', '--muted-foreground', '--accent', '--accent-foreground',
      '--destructive', '--destructive-foreground',
      '--border', '--input', '--ring', '--radius',
    ];

    const rootStyles = vars.map((v) => `${v}: ${computed.getPropertyValue(v)};`).join('\n      ');

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
    :root { ${rootStyles} }
    body {
      margin: 0;
      padding: 16px;
      font-family: system-ui, -apple-system, sans-serif;
      background: hsl(${computed.getPropertyValue('--background').trim()});
      color: hsl(${computed.getPropertyValue('--foreground').trim()});
    }
  </style>
</head>
<body>
  ${code}
</body>
</html>`;
  }, [code]);

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

export default CodeBlockInteractive;
