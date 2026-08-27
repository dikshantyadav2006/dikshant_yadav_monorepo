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
import { StudioToolbar, type HtmlEditorTab } from './StudioToolbar';
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
  initialHtml?: string;
  initialCss?: string;
  initialJs?: string;
  onSave: (data: {
    code: string;
    runtime: 'react' | 'html';
    props: Record<string, any>;
    height: number;
    description?: string;
    html?: string;
    css?: string;
    js?: string;
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

const DEFAULT_HTML_MARKUP = `<section class="py-16 px-8 text-center">
  <h1 class="text-4xl font-bold mb-4">Hello World</h1>
  <p class="text-lg text-muted-foreground">
    Edit this HTML or choose a template.
  </p>
</section>`;

const DEFAULT_HTML_CSS = ``;

const DEFAULT_HTML_JS = `console.log("loaded");`;

function extractFromFullDoc(code: string): { html: string; css: string; js: string } {
  if (!code || !code.trim()) return { html: '', css: '', js: '' };
  const trimmed = code.trim();
  const isFullDoc = /^\s*<!doctype/i.test(trimmed) || /<html[\s>]/i.test(trimmed);
  if (!isFullDoc) return { html: code, css: '', js: '' };

  let html = '';
  let css = '';
  let js = '';

  const bodyMatch = trimmed.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    html = bodyMatch[1]
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .trim();
  }

  const styleMatches = trimmed.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  if (styleMatches) {
    css = styleMatches
      .map((m) => m.replace(/<\/?style[^>]*>/gi, ''))
      .join('\n')
      .trim();
  }

  const scriptMatches = trimmed.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
  if (scriptMatches) {
    js = scriptMatches
      .map((m) => m.replace(/<\/?script[^>]*>/gi, ''))
      .filter((s) => {
        const t = s.trim();
        return t && !t.includes('tailwind.config') && !t.includes('cdn.tailwindcss.com');
      })
      .join('\n')
      .trim();
  }

  return { html, css, js };
}

function looksLikeFullDoc(code: string): boolean {
  if (!code || !code.trim()) return false;
  const trimmed = code.trim();
  return /^\s*<!doctype/i.test(trimmed) || /<html[\s>]/i.test(trimmed);
}

export function CodeStudio({
  isOpen,
  initialCode,
  initialRuntime,
  initialProps,
  initialHeight,
  initialDescription = '',
  initialHtml = '',
  initialCss = '',
  initialJs = '',
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
    Array<{ version: number; savedAt: string; code: string; html: string; css: string; js: string }>
  >([]);
  const [htmlCode, setHtmlCode] = useState(initialHtml || DEFAULT_HTML_MARKUP);
  const [cssCode, setCssCode] = useState(initialCss || DEFAULT_HTML_CSS);
  const [jsCode, setJsCode] = useState(initialJs || DEFAULT_HTML_JS);
  const [activeEditorTab, setActiveEditorTab] = useState<HtmlEditorTab>('html');
  const [extractionWarning, setExtractionWarning] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<any>(null);

  const title = config?.name || 'Untitled Component';

  const handleCodeChange = useCallback((value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPreviewKey((k) => k + 1);
    }, 500);
  }, []);

  const handleHtmlChange = useCallback((value: string | undefined) => {
    setHtmlCode(value || '');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPreviewKey((k) => k + 1);
    }, 500);
  }, []);

  const handleCssChange = useCallback((value: string | undefined) => {
    setCssCode(value || '');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPreviewKey((k) => k + 1);
    }, 500);
  }, []);

  const handleJsChange = useCallback((value: string | undefined) => {
    setJsCode(value || '');
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

  useEffect(() => {
    if (runtime === 'react' && !initialCode) {
      setCode(DEFAULT_REACT_CODE);
    } else if (runtime === 'html' && !initialCode && !initialHtml) {
      setHtmlCode(DEFAULT_HTML_MARKUP);
      setCssCode(DEFAULT_HTML_CSS);
      setJsCode(DEFAULT_HTML_JS);
    }
  }, [runtime, initialCode, initialHtml]);

  useEffect(() => {
    if (isOpen) {
      setCode(initialCode || (initialRuntime === 'html' ? '' : DEFAULT_REACT_CODE));
      setRuntime(initialRuntime);
      setProps(initialProps);
      setHeight(initialHeight);
      setDescription(initialDescription);
      setHtmlCode(initialHtml || DEFAULT_HTML_MARKUP);
      setCssCode(initialCss || DEFAULT_HTML_CSS);
      setJsCode(initialJs || DEFAULT_HTML_JS);
      setExtractionWarning(null);
      setPreviewKey((k) => k + 1);
    }
  }, [isOpen, initialCode, initialRuntime, initialProps, initialHeight, initialDescription, initialHtml, initialCss, initialJs]);

  const handleSave = useCallback(() => {
    if (runtime === 'html') {
      onSave({ code: '', runtime, props, height, description, html: htmlCode, css: cssCode, js: jsCode });
    } else {
      onSave({ code, runtime, props, height, description });
    }
  }, [code, runtime, props, height, description, htmlCode, cssCode, jsCode, onSave]);

  const handleSaveToHistory = useCallback(() => {
    setVersion((v) => v + 1);
    setVersionHistory((prev) => [
      {
        version: version + 1,
        savedAt: new Date().toISOString(),
        code,
        html: htmlCode,
        css: cssCode,
        js: jsCode,
      },
      ...prev,
    ]);
  }, [version, code, htmlCode, cssCode, jsCode]);

  const handleSaveWithHistory = useCallback(() => {
    handleSaveToHistory();
    handleSave();
  }, [handleSaveToHistory, handleSave]);

  const handleRun = useCallback(() => {
    setPreviewKey((k) => k + 1);
  }, []);

  const handleApplyTemplate = useCallback((template: CodeTemplate) => {
    if (template.runtime === 'html') {
      setHtmlCode(template.html || template.code || '');
      setCssCode(template.css || '');
      setJsCode(template.js || '');
      setCode('');
    } else {
      setCode(template.code);
      setHtmlCode('');
      setCssCode('');
      setJsCode('');
    }
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
    setPreviewKey((k) => k + 1);
  }, []);

  const handleLoadVersion = useCallback((v: { code: string; html?: string; css?: string; js?: string }) => {
    setCode(v.code);
    setHtmlCode(v.html || '');
    setCssCode(v.css || '');
    setJsCode(v.js || '');
    setPreviewKey((k) => k + 1);
  }, []);

  const handleExport = useCallback(() => {
    let content: string;
    let filename: string;

    if (runtime === 'html') {
      content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
${cssCode}
  </style>
</head>
<body>
${htmlCode}
${jsCode ? `<script>\n${jsCode}\n</script>` : ''}
</body>
</html>`;
      filename = `${title.replace(/\s+/g, '-').toLowerCase()}.html`;
    } else {
      content = code;
      filename = `${title.replace(/\s+/g, '-').toLowerCase()}.tsx`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, htmlCode, cssCode, jsCode, title, runtime]);

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

  const handleEditorPaste = (e: any) => {
    if (runtime !== 'html' || activeEditorTab !== 'html') return;
    const text = e.target?.getModel?.()?.getValueInRange(e.target.getSelection());
    if (!text) return;
    if (looksLikeFullDoc(text)) {
      const extracted = extractFromFullDoc(text);
      e.preventDefault();
      e.target.executeEdits('paste', [{
        range: e.target.getSelection(),
        text: extracted.html,
      }]);
      if (extracted.css) {
        setCssCode((prev) => (prev ? prev + '\n' + extracted.css : extracted.css));
      }
      if (extracted.js) {
        setJsCode((prev) => (prev ? prev + '\n' + extracted.js : extracted.js));
      }
      setExtractionWarning('Full HTML document detected. Markup, styles, and scripts have been separated into their respective panels.');
      setTimeout(() => setExtractionWarning(null), 5000);
    }
  };

  const htmlPreviewElement = (
    <HtmlPreviewInline html={htmlCode} css={cssCode} js={jsCode} height={height} key={previewKey} />
  );

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

  const getEditorLanguage = () => {
    if (runtime === 'react') return 'typescript';
    switch (activeEditorTab) {
      case 'html': return 'html';
      case 'css': return 'css';
      case 'js': return 'javascript';
      default: return 'html';
    }
  };

  const getEditorValue = () => {
    if (runtime === 'react') return code;
    switch (activeEditorTab) {
      case 'html': return htmlCode;
      case 'css': return cssCode;
      case 'js': return jsCode;
      default: return htmlCode;
    }
  };

  const getEditorOnChange = () => {
    if (runtime === 'react') return handleCodeChange;
    switch (activeEditorTab) {
      case 'html': return handleHtmlChange;
      case 'css': return handleCssChange;
      case 'js': return handleJsChange;
      default: return handleHtmlChange;
    }
  };

  const totalLines = runtime === 'html'
    ? (htmlCode.split('\n').length + cssCode.split('\n').length + jsCode.split('\n').length)
    : code.split('\n').length;

  return (
    <div className="fixed inset-0 z-[999999] flex flex-col bg-background animate-in fade-in duration-150">
      {/* Toolbar */}
      <StudioToolbar
        runtime={runtime}
        onRuntimeChange={setRuntime}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        previewDevice={previewDevice}
        onPreviewDeviceChange={setPreviewDevice}
        htmlEditorTab={activeEditorTab}
        onHtmlEditorTabChange={setActiveEditorTab}
        onSave={handleSaveWithHistory}
        onRun={handleRun}
        onExport={handleExport}
        onClose={onClose}
      />

      {/* Extraction Warning */}
      {extractionWarning && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-600 text-[11px] font-medium flex-shrink-0">
          <span>{extractionWarning}</span>
        </div>
      )}

      {/* 3-Panel Workspace */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanel
          defaultLeftWidth={240}
          defaultRightWidth={400}
          minPanelWidth={180}
          left={
            <LeftPanel
              currentCode={runtime === 'html' ? htmlCode : code}
              runtime={runtime}
              title={title}
              version={version}
              versionHistory={versionHistory}
              htmlCode={htmlCode}
              cssCode={cssCode}
              jsCode={jsCode}
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
                    language={getEditorLanguage()}
                    theme="vs-dark"
                    value={getEditorValue()}
                    onChange={getEditorOnChange()}
                    onMount={(editor) => { editorRef.current = editor; }}
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
          <span>{runtime === 'react' ? 'TypeScript React' : `HTML + CSS + JS`}</span>
          <span>UTF-8</span>
          <span>{totalLines} lines</span>
          {runtime === 'html' && (
            <span className="text-muted-foreground/60">
              {htmlCode.split('\n').length}h · {cssCode.split('\n').length}c · {jsCode.split('\n').length}j
            </span>
          )}
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

function HtmlPreviewInline({ html, css, js, height }: { html: string; css: string; js: string; height: number }) {
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

    const jsBlock = js && js.trim() ? `<script>\n${js}\n<\/script>` : '';

    const srcdoc = `<!DOCTYPE html>
<html><head>
<script src="https://cdn.tailwindcss.com"><\/script>
<script>
tailwind.config={theme:{extend:{colors:{background:'hsl(${computed.getPropertyValue('--background').trim()})',foreground:'hsl(${computed.getPropertyValue('--foreground').trim()})',primary:{DEFAULT:'hsl(${computed.getPropertyValue('--primary').trim()})',foreground:'hsl(${computed.getPropertyValue('--primary-foreground').trim()})'},secondary:{DEFAULT:'hsl(${computed.getPropertyValue('--secondary').trim()})',foreground:'hsl(${computed.getPropertyValue('--secondary-foreground').trim()})'},muted:{DEFAULT:'hsl(${computed.getPropertyValue('--muted').trim()})',foreground:'hsl(${computed.getPropertyValue('--muted-foreground').trim()})'},accent:{DEFAULT:'hsl(${computed.getPropertyValue('--accent').trim()})',foreground:'hsl(${computed.getPropertyValue('--accent-foreground').trim()})'},destructive:{DEFAULT:'hsl(${computed.getPropertyValue('--destructive').trim()})',foreground:'hsl(${computed.getPropertyValue('--destructive-foreground').trim()})'},card:{DEFAULT:'hsl(${computed.getPropertyValue('--card').trim()})',foreground:'hsl(${computed.getPropertyValue('--card-foreground').trim()})'},border:'hsl(${computed.getPropertyValue('--border').trim()})',input:'hsl(${computed.getPropertyValue('--input').trim()})',ring:'hsl(${computed.getPropertyValue('--ring').trim()})'}}}})<\/script>
<style>:root{${rootStyles}}body{margin:0;padding:16px;font-family:system-ui,-apple-system,sans-serif;background:hsl(${computed.getPropertyValue('--background').trim()});color:hsl(${computed.getPropertyValue('--foreground').trim()});}#root{width:100%;}${css || ''}</style>
</head><body><div id="root">${html || ''}</div>${jsBlock}</body></html>`;

    iframeRef.current.srcdoc = srcdoc;
  }, [html, css, js]);

  return (
    <iframe
      ref={iframeRef}
      style={{ height, width: '100%', border: 'none' }}
      sandbox="allow-scripts"
      title="HTML Preview"
    />
  );
}
