'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { RuntimeErrorBoundary } from './ErrorBoundary';
import { compileTSX } from './compileCode';
import { extractModule, type RuntimeModule } from './extractModule';
import { withTimeout, TIMEOUTS } from './timeout';
import { parseConfig, type ComponentConfig } from './parseConfig';
import { ResizablePanel } from './ResizablePanel';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { StudioToolbar } from './StudioToolbar';
import type { CodeTemplate } from './codeTemplates';
import type { PreviewDevice } from './types';

export type ViewMode = 'split' | 'code' | 'preview';

interface CodeStudioProps {
  isOpen: boolean;
  initialCode: string;
  initialRuntime: 'react' | 'html';
  initialProps: Record<string, any>;
  initialHeight: number;
  initialDescription?: string;
  onSave: (data: {
    code: string;
    runtime: 'react' | 'html';
    props: Record<string, any>;
    height: number;
    description?: string;
  }) => void;
  onClose: () => void;
}

const DEFAULT_REACT_CODE = `export const config = {
  name: "MyComponent",
  props: {
    title: "string",
  },
};

export default function MyComponent({ title }) {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">
        {title || "Hello World"}
      </h1>
      <p className="text-muted-foreground">
        Edit this code or choose a template.
      </p>
    </div>
  );
}`;

const DEFAULT_HTML_CODE = `<div class="flex flex-col items-center justify-center py-16 px-8 text-center">
  <h1 class="text-4xl font-bold mb-4">Hello World</h1>
  <p class="text-lg text-muted-foreground">
    Edit this HTML or choose a template.
  </p>
</div>`;

export function CodeStudio({
  isOpen,
  initialCode,
  initialRuntime,
  initialProps,
  initialHeight,
  initialDescription = '',
  onSave,
  onClose,
}: CodeStudioProps) {
  const [code, setCode] = useState(initialCode || DEFAULT_REACT_CODE);
  const [runtime, setRuntime] = useState<'react' | 'html'>(initialRuntime);
  const [props, setProps] = useState<Record<string, any>>(initialProps);
  const [height, setHeight] = useState(initialHeight);
  const [description, setDescription] = useState(initialDescription);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [previewKey, setPreviewKey] = useState(0);
  const [compiledModule, setCompiledModule] = useState<RuntimeModule | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [config, setConfig] = useState<ComponentConfig | undefined>(undefined);
  const [version, setVersion] = useState(1);
  const [versionHistory, setVersionHistory] = useState<
    Array<{ version: number; savedAt: string; code: string }>
  >([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const title = config?.name || 'Untitled Component';

  // Compile on code change
  const handleCodeChange = useCallback((value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPreviewKey((k) => k + 1);
    }, 500);
  }, []);

  useEffect(() => {
    if (runtime !== 'react' || !code.trim()) {
      setCompiledModule(null);
      setCompileError(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const compiled = await withTimeout(
          () => compileTSX(code),
          TIMEOUTS.compile,
          'Compilation',
        );
        if (cancelled) return;

        const mod = extractModule(compiled);
        if (cancelled) return;

        setCompiledModule(mod);
        setCompileError(null);

        const parsedConfig = parseConfig(code);
        if (parsedConfig) {
          setConfig(parsedConfig);
          // Auto-set description from config
          if (parsedConfig.description) {
            setDescription(parsedConfig.description);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setCompileError(err instanceof Error ? err.message : 'Compilation failed');
          setCompiledModule(null);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [code, runtime, previewKey]);

  // Sync defaults on runtime switch
  useEffect(() => {
    if (runtime === 'react' && !initialCode) {
      setCode(DEFAULT_REACT_CODE);
    } else if (runtime === 'html' && !initialCode) {
      setCode(DEFAULT_HTML_CODE);
    }
  }, [runtime, initialCode]);

  // Sync initial values when studio opens
  useEffect(() => {
    if (isOpen) {
      setCode(initialCode || DEFAULT_REACT_CODE);
      setRuntime(initialRuntime);
      setProps(initialProps);
      setHeight(initialHeight);
      setDescription(initialDescription);
      setPreviewKey((k) => k + 1);
    }
  }, [isOpen, initialCode, initialRuntime, initialProps, initialHeight, initialDescription]);

  const handleSave = useCallback(() => {
    onSave({ code, runtime, props, height, description });
  }, [code, runtime, props, height, description, onSave]);

  const handleSaveToHistory = useCallback(() => {
    setVersion((v) => v + 1);
    setVersionHistory((prev) => [
      { version: version + 1, savedAt: new Date().toISOString(), code },
      ...prev,
    ]);
  }, [version, code]);

  const handleSaveWithHistory = useCallback(() => {
    handleSaveToHistory();
    handleSave();
  }, [handleSaveToHistory, handleSave]);

  const handleRun = useCallback(() => {
    setPreviewKey((k) => k + 1);
  }, []);

  const handleApplyTemplate = useCallback((template: CodeTemplate) => {
    setCode(template.code);
    setRuntime(template.runtime);
    if (template.config?.props) {
      const defaults: Record<string, any> = {};
      for (const [key, type] of Object.entries(template.config.props)) {
        if (type === 'string') defaults[key] = '';
        else if (type === 'number') defaults[key] = 0;
        else if (type === 'boolean') defaults[key] = false;
        else if (type === 'string[]') defaults[key] = [];
        else defaults[key] = '';
      }
      setProps(defaults);
    }
    if (template.config?.name) {
      // Title updates via config parse
    }
    setPreviewKey((k) => k + 1);
  }, []);

  const handleLoadVersion = useCallback((versionCode: string) => {
    setCode(versionCode);
    setPreviewKey((k) => k + 1);
  }, []);

  const handleExport = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.${runtime === 'react' ? 'tsx' : 'html'}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, title, runtime]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveWithHistory();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleSaveWithHistory, handleRun]);

  if (!isOpen) return null;

  // HTML preview iframe
  const htmlPreviewElement = <HtmlPreviewInline code={code} height={height} key={previewKey} />;

  // React preview element
  const reactPreviewElement = (
    <RuntimeErrorBoundary key={previewKey}>
      {compileError ? (
        <div className="p-4 text-destructive text-xs font-mono whitespace-pre-wrap">
          {compileError}
        </div>
      ) : compiledModule?.Component ? (
        React.createElement(compiledModule.Component, props)
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </RuntimeErrorBoundary>
  );

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-background animate-in fade-in duration-150">
      {/* Toolbar */}
      <StudioToolbar
        runtime={runtime}
        onRuntimeChange={setRuntime}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        previewDevice={previewDevice}
        onPreviewDeviceChange={setPreviewDevice}
        onSave={handleSaveWithHistory}
        onRun={handleRun}
        onExport={handleExport}
        onClose={onClose}
      />

      {/* 3-Panel Workspace */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanel
          defaultLeftWidth={240}
          defaultRightWidth={400}
          minPanelWidth={180}
          left={
            <LeftPanel
              currentCode={code}
              runtime={runtime}
              title={title}
              version={version}
              versionHistory={versionHistory}
              onSelectTemplate={handleApplyTemplate}
              onLoadVersion={handleLoadVersion}
            />
          }
          center={
            <div className="h-full flex flex-col">
              {viewMode !== 'preview' ? (
                <div className="flex-1">
                  <Editor
                    height="100%"
                    language={runtime === 'html' ? 'html' : 'typescript'}
                    theme="vs-dark"
                    value={code}
                    onChange={handleCodeChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      fontFamily: 'var(--font-mono), monospace',
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on',
                      padding: { top: 16, bottom: 16 },
                      bracketPairColorization: { enabled: true },
                      suggest: { showKeywords: true },
                      glyphMargin: false,
                      folding: true,
                      lineDecorationsWidth: 8,
                    }}
                  />
                </div>
              ) : (
                <div className="flex-1 bg-muted/5 overflow-auto">
                  {runtime === 'react' ? reactPreviewElement : htmlPreviewElement}
                </div>
              )}
            </div>
          }
          right={
            <RightPanel
              runtime={runtime}
              compiledModule={compiledModule}
              compileError={compileError}
              previewKey={previewKey}
              config={config}
              props={props}
              onPropsChange={setProps}
              reactPreview={reactPreviewElement}
              htmlPreview={htmlPreviewElement}
              previewDevice={previewDevice}
              onPreviewDeviceChange={setPreviewDevice}
            />
          }
        />
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between h-6 px-3 border-t border-border bg-card text-[10px] text-muted-foreground flex-shrink-0">
        <div className="flex items-center gap-3">
          <span>{runtime === 'react' ? 'TypeScript React' : 'HTML'}</span>
          <span>UTF-8</span>
          <span>{code.split('\n').length} lines</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Version {version}</span>
          <span>Ctrl+S to save</span>
          <span>Ctrl+Enter to run</span>
        </div>
      </div>
    </div>
  );
}

function HtmlPreviewInline({ code, height }: { code: string; height: number }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    const root = document.documentElement;
    const computed = getComputedStyle(root);

    const vars = [
      '--background', '--foreground', '--card', '--card-foreground',
      '--primary', '--primary-foreground', '--secondary', '--secondary-foreground',
      '--muted', '--muted-foreground', '--accent', '--accent-foreground',
      '--border', '--input', '--ring', '--radius',
    ];

    const rootStyles = vars.map((v) => `${v}: ${computed.getPropertyValue(v)};`).join('\n      ');

    const srcdoc = `<!DOCTYPE html>
<html><head>
<script src="https://cdn.tailwindcss.com"><\/script>
<script>
tailwind.config={theme:{extend:{colors:{background:'hsl(${computed.getPropertyValue('--background').trim()})',foreground:'hsl(${computed.getPropertyValue('--foreground').trim()})',primary:{DEFAULT:'hsl(${computed.getPropertyValue('--primary').trim()})',foreground:'hsl(${computed.getPropertyValue('--primary-foreground').trim()})'},secondary:{DEFAULT:'hsl(${computed.getPropertyValue('--secondary').trim()})',foreground:'hsl(${computed.getPropertyValue('--secondary-foreground').trim()})'},muted:{DEFAULT:'hsl(${computed.getPropertyValue('--muted').trim()})',foreground:'hsl(${computed.getPropertyValue('--muted-foreground').trim()})'},accent:{DEFAULT:'hsl(${computed.getPropertyValue('--accent').trim()})',foreground:'hsl(${computed.getPropertyValue('--accent-foreground').trim()})'},destructive:{DEFAULT:'hsl(${computed.getPropertyValue('--destructive').trim()})',foreground:'hsl(${computed.getPropertyValue('--destructive-foreground').trim()})'},card:{DEFAULT:'hsl(${computed.getPropertyValue('--card').trim()})',foreground:'hsl(${computed.getPropertyValue('--card-foreground').trim()})'},border:'hsl(${computed.getPropertyValue('--border').trim()})',input:'hsl(${computed.getPropertyValue('--input').trim()})',ring:'hsl(${computed.getPropertyValue('--ring').trim()})'}}}})<\/script>
<style>:root{${rootStyles}}body{margin:0;padding:16px;font-family:system-ui,-apple-system,sans-serif;background:hsl(${computed.getPropertyValue('--background').trim()});color:hsl(${computed.getPropertyValue('--foreground').trim()});}</style>
</head><body>${code}</body></html>`;

    iframeRef.current.srcdoc = srcdoc;
  }, [code]);

  return (
    <iframe
      ref={iframeRef}
      style={{ height, width: '100%', border: 'none' }}
      sandbox="allow-scripts"
      title="HTML Preview"
    />
  );
}
