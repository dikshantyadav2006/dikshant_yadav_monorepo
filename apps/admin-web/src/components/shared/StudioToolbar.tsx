'use client';

import React from 'react';
import {
  X,
  Play,
  Code,
  Columns2,
  Monitor,
  Tablet,
  Smartphone,
  Save,
  Rocket,
  Download,
  FileCode2,
} from 'lucide-react';
import type { ViewMode } from './CodeStudio';
import type { PreviewDevice } from './types';
import { PREVIEW_DEVICES } from './types';

interface StudioToolbarProps {
  runtime: 'react' | 'html';
  onRuntimeChange: (runtime: 'react' | 'html') => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  previewDevice: PreviewDevice;
  onPreviewDeviceChange: (device: PreviewDevice) => void;
  onSave: () => void;
  onRun: () => void;
  onPublish?: () => void;
  onExport?: () => void;
  onClose: () => void;
}

export function StudioToolbar({
  runtime,
  onRuntimeChange,
  viewMode,
  onViewModeChange,
  previewDevice,
  onPreviewDeviceChange,
  onSave,
  onRun,
  onPublish,
  onExport,
  onClose,
}: StudioToolbarProps) {
  return (
    <div className="flex items-center justify-between h-11 px-3 border-b border-border bg-card flex-shrink-0">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {/* Logo */}
        <div className="flex items-center gap-1.5 pr-2 border-r border-border/40">
          <FileCode2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold">Code Studio</span>
        </div>

        {/* Runtime Selector */}
        <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
          <button
            onClick={() => onRuntimeChange('react')}
            className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition ${
              runtime === 'react'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            React
          </button>
          <button
            onClick={() => onRuntimeChange('html')}
            className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition ${
              runtime === 'html'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            HTML
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-border/40" />

        {/* View Mode */}
        <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
          <button
            onClick={() => onViewModeChange('code')}
            className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md transition ${
              viewMode === 'code' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Code only"
          >
            <Code className="w-3 h-3" />
            Code
          </button>
          <button
            onClick={() => onViewModeChange('split')}
            className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md transition ${
              viewMode === 'split' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Split view"
          >
            <Columns2 className="w-3 h-3" />
            Split
          </button>
          <button
            onClick={() => onViewModeChange('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md transition ${
              viewMode === 'preview' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Preview only"
          >
            <Play className="w-3 h-3" />
            Preview
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-border/40" />

        {/* Device Preview */}
        <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
          {(['desktop', 'tablet', 'mobile'] as PreviewDevice[]).map((device) => (
            <button
              key={device}
              onClick={() => onPreviewDeviceChange(device)}
              className={`p-1.5 rounded-md transition ${
                previewDevice === device
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={PREVIEW_DEVICES[device].label}
            >
              {device === 'desktop' && <Monitor className="w-3.5 h-3.5" />}
              {device === 'tablet' && <Tablet className="w-3.5 h-3.5" />}
              {device === 'mobile' && <Smartphone className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onRun}
          className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold rounded-lg border border-border hover:bg-muted/40 transition"
          title="Run (Ctrl+Enter)"
        >
          <Play className="w-3 h-3" />
          Run
        </button>
        <button
          onClick={onSave}
          className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
          title="Save (Ctrl+S)"
        >
          <Save className="w-3 h-3" />
          Save
        </button>
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold rounded-lg border border-border hover:bg-muted/40 transition"
            title="Export Component"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
        )}
        {onPublish && (
          <button
            onClick={onPublish}
            className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            title="Publish"
          >
            <Rocket className="w-3 h-3" />
            Publish
          </button>
        )}
        <div className="w-px h-5 bg-border/40 mx-0.5" />
        <button
          onClick={onClose}
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
