'use client';

import React from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  RotateCw, 
  History, 
  Eye, 
  Check, 
  Loader2, 
  AlertCircle,
  Save,
  Globe
} from 'lucide-react';
import { useVisualBuilderStore } from '../../features/visual-builder/store';

interface ToolbarProps {
  postId: string;
  postTitle: string;
  postStatus: string;
  onBack: () => void;
  onToggleVersions: () => void;
  onSave: () => void;
  onPublish: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function Toolbar({
  postId,
  postTitle,
  postStatus,
  onBack,
  onToggleVersions,
  onSave,
  onPublish,
  undo,
  redo,
  canUndo,
  canRedo
}: ToolbarProps) {
  const saveStatus = useVisualBuilderStore((state) => state.saveStatus);
  const postMetadata = useVisualBuilderStore((state) => state.postMetadata);

  const title = postMetadata?.title || postTitle || 'Untitled Post';
  const status = postMetadata?.status || postStatus || 'DRAFT';

  const getSaveIndicator = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            <span>Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>Saved</span>
          </div>
        );
      case 'error':
        return (
          <button 
            onClick={onSave}
            className="flex items-center gap-1.5 text-xs text-destructive font-medium hover:underline"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Save failed. Click to retry</span>
          </button>
        );
      case 'idle':
      default:
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <span>Auto-save enabled</span>
          </div>
        );
    }
  };

  return (
    <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between select-none">
      {/* Left side: Back button and Title info */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-1.5 hover:bg-muted rounded-lg border border-border/40 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-semibold">Exit</span>
        </button>
        
        <div className="h-4 w-[1px] bg-border/60" />

        <div className="flex flex-col">
          <h2 className="text-xs font-bold text-foreground max-w-[200px] truncate font-sans">{title}</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase font-sans ${
              status === 'PUBLISHED'
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
            }`}>
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Save indicator & History controls */}
      <div className="flex items-center gap-4 bg-muted/30 border border-border/40 px-3 py-1 rounded-full">
        {getSaveIndicator()}
        
        <div className="h-3 w-[1px] bg-border/60" />

        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground transition hover:bg-muted/60"
            title="Undo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground transition hover:bg-muted/60"
            title="Redo"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right side: Save, Version History, Publish */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          className="p-2 hover:bg-muted rounded-xl border border-border/40 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
          title="Force Save (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
          <span className="text-xs font-semibold">Save</span>
        </button>

        <button
          onClick={onToggleVersions}
          className="p-2 hover:bg-muted rounded-xl border border-border/40 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5"
          title="Version History"
        >
          <History className="w-4 h-4" />
          <span className="text-xs font-semibold">Versions</span>
        </button>

        <button
          onClick={onPublish}
          className="px-3.5 py-1.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-glow-primary hover:bg-primary/95 text-xs transition flex items-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Publish</span>
        </button>
      </div>
    </header>
  );
}

export default Toolbar;
