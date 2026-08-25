'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
  X,
  Play,
  Code,
  Columns2,
  ChevronDown,
  FileCode2,
} from 'lucide-react';
import { RuntimeErrorBoundary } from './ErrorBoundary';
import { compileTSX } from './compileCode';
import { extractModule, type RuntimeModule } from './extractModule';
import { withTimeout, TIMEOUTS } from './timeout';
import { parseConfig, type ComponentConfig } from './parseConfig';
import { codeTemplates, type CodeTemplate } from './codeTemplates';

interface CodeEditorModalProps {
  isOpen: boolean;
  initialCode: string;
  initialRuntime: 'react' | 'html';
  initialProps: Record<string, any>;
  initialHeight: number;
  onSave: (data: {
    code: string;
    runtime: 'react' | 'html';
    props: Record<string, any>;
    height: number;
    config?: ComponentConfig;
  }) => void;
  onClose: () => void;
}

type ViewMode = 'split' | 'code' | 'preview';

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

export function CodeEditorModal({
  isOpen,
  initialCode,
  initialRuntime,
  initialProps,
  initialHeight,
  onSave,
  onClose,
}: CodeEditorModalProps) {
  const [code, setCode] = useState(initialCode || DEFAULT_REACT_CODE);
  const [runtime, setRuntime] = useState<'react' | 'html'>(initialRuntime);
  const [props, setProps] = useState<Record<string, any>>(initialProps);
  const [height, setHeight] = useState(initialHeight);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [showTemplates, setShowTemplates] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [compiledModule, setCompiledModule] = useState<RuntimeModule | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [config, setConfig] = useState<ComponentConfig | undefined>(undefined);
  const [templateSearch, setTemplateSearch] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    if (runtime === 'react' && !initialCode) {
      setCode(DEFAULT_REACT_CODE);
    } else if (runtime === 'html' && !initialCode) {
      setCode(DEFAULT_HTML_CODE);
    }
  }, [runtime, initialCode]);

  const handleSave = useCallback(() => {
    onSave({ code, runtime, props, height, config });
  }, [code, runtime, props, height, config, onSave]);

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
    setShowTemplates(false);
    setPreviewKey((k) => k + 1);
  }, []);

  const filteredTemplates = codeTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(templateSearch.toLowerCase()),
  );

  const configProps = config?.props || {};
  const propKeys = Object.keys(configProps);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleSave]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <FileCode2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">Code Editor</span>
          </div>

          {/* Runtime Selector */}
          <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
            <button
              onClick={() => setRuntime('react')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                runtime === 'react'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              React TSX
            </button>
            <button
              onClick={() => setRuntime('html')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                runtime === 'html'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              HTML
            </button>
          </div>

          {/* Templates */}
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-muted/40 transition"
            >
              Templates <ChevronDown className="w-3 h-3" />
            </button>
            {showTemplates && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-2 border-b border-border">
                  <input
                    type="text"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-input bg-background outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                </div>
                <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                  {filteredTemplates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleApplyTemplate(t)}
                      className="w-full text-left p-3 rounded-lg hover:bg-muted/40 transition group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition">
                          {t.name}
                        </span>
                        <span className="text-[9px] font-bold uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {t.category}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {t.description}
                      </div>
                    </button>
                  ))}
                  {filteredTemplates.length === 0 && (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      No templates found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Height */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground font-semibold">Height:</span>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value) || 400)}
              className="w-16 px-2 py-1 text-xs rounded-lg border border-input bg-background outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode */}
          <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
            <button
              onClick={() => setViewMode('preview')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'preview' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Preview"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'split' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Split"
            >
              <Columns2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'code' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        {viewMode !== 'preview' && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} border-r border-border`}>
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
              }}
            />
          </div>
        )}

        {/* Preview */}
        {viewMode !== 'code' && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} bg-muted/5`}>
            <div className="h-full overflow-auto">
              {runtime === 'react' ? (
                <RuntimeErrorBoundary key={previewKey}>
                  {compileError ? (
                    <div className="p-4 text-destructive text-xs font-mono whitespace-pre-wrap">
                      {compileError}
                    </div>
                  ) : compiledModule?.Component ? (
                    <div style={{ height }}>
                      {React.createElement(compiledModule.Component, props)}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  )}
                </RuntimeErrorBoundary>
              ) : (
                <HtmlPreviewInline code={code} height={height} key={previewKey} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Props Bar */}
      {runtime === 'react' && propKeys.length > 0 && (
        <div className="px-4 py-2 border-t border-border bg-card flex items-center gap-4 flex-wrap">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Props:</span>
          {propKeys.map((key) => {
            const type = configProps[key];
            return (
              <div key={key} className="flex items-center gap-1.5">
                <label className="text-[10px] text-muted-foreground font-semibold">{key}:</label>
                {type === 'boolean' ? (
                  <button
                    onClick={() => setProps((p) => ({ ...p, [key]: !p[key] }))}
                    className={`w-8 h-4 rounded-full transition ${
                      props[key] ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white transition-transform ${
                        props[key] ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                ) : type === 'number' ? (
                  <input
                    type="number"
                    value={props[key] || 0}
                    onChange={(e) => setProps((p) => ({ ...p, [key]: Number(e.target.value) }))}
                    className="w-20 px-2 py-1 text-xs rounded-lg border border-input bg-background outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <input
                    type="text"
                    value={props[key] || ''}
                    onChange={(e) => setProps((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-40 px-2 py-1 text-xs rounded-lg border border-input bg-background outline-none focus:ring-1 focus:ring-primary"
                    placeholder={key}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
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
