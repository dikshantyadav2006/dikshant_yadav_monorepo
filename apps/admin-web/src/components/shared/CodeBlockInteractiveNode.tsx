'use client';

import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Code, Pencil, Trash2, Clock, FileCode2 } from 'lucide-react';
import { CodeStudio } from './CodeStudio';
import type { CodeBlockInteractiveData } from './types';

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never saved';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface CodeBlockInteractiveNodeProps extends NodeProps {
  data: CodeBlockInteractiveData;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<CodeBlockInteractiveData>) => void;
}

export function CodeBlockInteractiveNode({
  id,
  data,
  selected,
  onDelete,
  onUpdate,
}: CodeBlockInteractiveNodeProps) {
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  const runtime = data.runtime || 'react';
  const code = data.code || '';
  const htmlCode = data.html || '';
  const cssCode = data.css || '';
  const jsCode = data.js || '';
  const renderMode = data.renderMode || 'preview';
  const title = data.title || 'Code Block';
  const description = data.description || '';
  const lineCount = runtime === 'html'
    ? (htmlCode.split('\n').length + cssCode.split('\n').length + jsCode.split('\n').length)
    : (code ? code.split('\n').length : 0);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(id);
    },
    [id, onDelete],
  );

  const handleStudioSave = useCallback(
    (saveData: {
      code: string;
      runtime: 'react' | 'html';
      props: Record<string, any>;
      height: number;
      description?: string;
      html?: string;
      css?: string;
      js?: string;
    }) => {
      onUpdate(id, {
        code: saveData.code,
        runtime: saveData.runtime,
        props: saveData.props,
        previewHeight: saveData.height,
        description: saveData.description ?? data.description,
        html: saveData.html,
        css: saveData.css,
        js: saveData.js,
        version: (data.version || 1) + 1,
        lastSavedAt: new Date().toISOString(),
      });
      setIsStudioOpen(false);
    },
    [id, data.version, data.description, onUpdate],
  );

  return (
    <>
      <div
        className={`w-64 rounded-xl border bg-card text-card-foreground shadow-md transition-all duration-200 ${
          selected ? 'border-primary ring-2 ring-primary/20' : 'border-border/60'
        }`}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="w-2.5 h-2.5 bg-muted-foreground border-2 border-background"
        />

        {/* Card Body — lightweight metadata only */}
        <div className="p-4 flex flex-col gap-3">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Code className="w-3.5 h-3.5 text-cyan-500" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-foreground truncate">{title}</div>
                {renderMode === 'hidden' && (
                  <span className="text-[8px] bg-muted px-1 py-0.5 rounded font-bold uppercase">
                    Library
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleDelete}
              className="flex-shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors p-0.5 rounded hover:bg-muted"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {/* Description */}
          {description && (
            <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileCode2 className="w-3 h-3" />
              <span className="font-medium uppercase">{runtime}</span>
            </div>
            {lineCount > 0 && (
              <span>{lineCount} lines</span>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
            <Clock className="w-2.5 h-2.5" />
            <span>Updated {timeAgo(data.lastSavedAt || null)}</span>
          </div>

          {/* Open Editor Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsStudioOpen(true);
            }}
            className="w-full py-2 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 text-foreground text-[11px] font-semibold transition flex items-center justify-center gap-1.5"
          >
            <Pencil className="w-3 h-3" />
            {code.trim() || htmlCode.trim() ? 'Open Editor' : 'Write Code'}
          </button>
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2.5 h-2.5 bg-muted-foreground border-2 border-background"
        />
      </div>

      {/* Code Studio — portaled to document.body, outside ReactFlow */}
      {createPortal(
        <CodeStudio
          isOpen={isStudioOpen}
          initialCode={code}
          initialRuntime={runtime}
          initialProps={data.props || {}}
          initialHeight={data.previewHeight || 400}
          initialDescription={description}
          initialHtml={htmlCode}
          initialCss={cssCode}
          initialJs={jsCode}
          onSave={handleStudioSave}
          onClose={() => setIsStudioOpen(false)}
        />,
        document.body,
      )}
    </>
  );
}
