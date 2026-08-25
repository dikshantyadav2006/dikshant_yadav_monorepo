'use client';

import React, { useState, useCallback } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Code, Pencil, Trash2, Eye, EyeOff, Blocks } from 'lucide-react';
import { CodeBlockPreview } from './CodeBlockPreview';
import { CodeEditorModal } from './CodeEditorModal';
import { parseConfig, type ComponentConfig } from './parseConfig';
import type { CodeBlockInteractiveData } from './types';

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
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const runtime = data.runtime || 'react';
  const code = data.code || '';
  const props = data.props || {};
  const height = data.previewHeight || 400;
  const renderMode = data.renderMode || 'preview';
  const title = data.title || 'Code Block';

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(id);
    },
    [id, onDelete],
  );

  const handleSave = useCallback(
    (saveData: {
      code: string;
      runtime: 'react' | 'html';
      props: Record<string, any>;
      height: number;
      config?: ComponentConfig;
    }) => {
      onUpdate(id, {
        code: saveData.code,
        runtime: saveData.runtime,
        props: saveData.props,
        previewHeight: saveData.height,
        version: (data.version || 1) + 1,
      });
      setIsEditorOpen(false);
    },
    [id, data.version, onUpdate],
  );

  return (
    <>
      <div
        className={`w-72 rounded-xl border bg-card text-card-foreground shadow-md transition-all duration-200 ${
          selected ? 'border-primary ring-2 ring-primary/20' : 'border-border/60'
        }`}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="w-2.5 h-2.5 bg-muted-foreground border-2 border-background"
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-3 py-2 bg-muted/20 rounded-t-xl">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Code className="w-3.5 h-3.5 text-cyan-500" />
            <span>{title || 'Code Block'}</span>
            {renderMode === 'hidden' && (
              <span className="text-[8px] bg-muted px-1 py-0.5 rounded font-bold uppercase">
                Lib
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditorOpen(true);
              }}
              className="text-muted-foreground/60 hover:text-primary transition-colors p-0.5 rounded hover:bg-muted"
              title="Open Code Editor"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="text-muted-foreground/60 hover:text-destructive transition-colors p-0.5 rounded hover:bg-muted"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="p-3 text-xs">
          {renderMode === 'hidden' ? (
            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
              <Blocks className="w-6 h-6 mb-2 opacity-40" />
              <span className="text-[10px]">Library component</span>
            </div>
          ) : code.trim() ? (
            <div className="rounded-lg border border-border/40 overflow-hidden bg-background/50">
              <div className="flex items-center justify-between px-2 py-1 bg-muted/30 border-b border-border/20">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">
                  {runtime} preview
                </span>
                <div className="flex items-center gap-1">
                  {renderMode === 'component' && (
                    <Eye className="w-2.5 h-2.5 text-primary" />
                  )}
                  <span className="text-[8px] text-muted-foreground/60">
                    v{data.version || 1}
                  </span>
                </div>
              </div>
              <div className="max-h-48 overflow-hidden">
                <CodeBlockPreview
                  code={code}
                  runtime={runtime}
                  props={props}
                  height={Math.min(height, 200)}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditorOpen(true);
              }}
              className="w-full flex flex-col items-center justify-center py-8 border border-dashed border-border/60 rounded-lg hover:border-primary/40 hover:bg-muted/20 transition cursor-pointer"
            >
              <Code className="w-6 h-6 text-muted-foreground/40 mb-2" />
              <span className="text-[10px] text-muted-foreground/60 font-semibold">
                Click to write code
              </span>
            </button>
          )}
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2.5 h-2.5 bg-muted-foreground border-2 border-background"
        />
      </div>

      {/* Code Editor Modal */}
      <CodeEditorModal
        isOpen={isEditorOpen}
        initialCode={code}
        initialRuntime={runtime}
        initialProps={props}
        initialHeight={height}
        onSave={handleSave}
        onClose={() => setIsEditorOpen(false)}
      />
    </>
  );
}
