'use client';

import React, { useState } from 'react';
import {
  Code,
  Layout,
  Clock,
  Package,
  FileCode2,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { TemplateGallery } from './TemplateGallery';
import type { CodeTemplate } from './codeTemplates';

type LeftTab = 'code' | 'templates' | 'versions' | 'shared';

interface LeftPanelProps {
  currentCode: string;
  runtime: 'react' | 'html';
  title: string;
  version: number;
  versionHistory: Array<{ version: number; savedAt: string; code: string; html?: string; css?: string; js?: string }>;
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  onSelectTemplate: (template: CodeTemplate) => void;
  onLoadVersion: (v: { code: string; html?: string; css?: string; js?: string }) => void;
}

export function LeftPanel({
  currentCode,
  runtime,
  title,
  version,
  versionHistory,
  htmlCode = '',
  cssCode = '',
  jsCode = '',
  onSelectTemplate,
  onLoadVersion,
}: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<LeftTab>('templates');
  const lineCount = runtime === 'html'
    ? (htmlCode.split('\n').length + cssCode.split('\n').length + jsCode.split('\n').length)
    : (currentCode ? currentCode.split('\n').length : 0);

  return (
    <div className="h-full flex flex-col bg-card border-r border-border/40">
      {/* Tab Bar */}
      <div className="flex border-b border-border/40">
        {([
          { key: 'code', icon: <Code className="w-3.5 h-3.5" />, label: 'Code' },
          { key: 'templates', icon: <Layout className="w-3.5 h-3.5" />, label: 'Templates' },
          { key: 'versions', icon: <Clock className="w-3.5 h-3.5" />, label: 'Versions' },
          { key: 'shared', icon: <Package className="w-3.5 h-3.5" />, label: 'Library' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-semibold transition border-b-2 ${
              activeTab === tab.key
                ? 'text-primary border-primary bg-primary/5'
                : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'code' && (
          <div className="p-3 space-y-3">
            {/* File Info */}
            <div className="rounded-xl border border-border/40 bg-background/50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">{title || 'Untitled'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                <div>Runtime: <span className="font-semibold text-foreground uppercase">{runtime}</span></div>
                <div>Lines: <span className="font-semibold text-foreground">{lineCount}</span></div>
                <div>Version: <span className="font-semibold text-foreground">v{version}</span></div>
              </div>
            </div>

            {/* File Tree Placeholder */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase px-1">Files</div>
              {runtime === 'html' ? (
                <>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-primary/5 text-primary text-xs font-medium">
                    <ChevronRight className="w-3 h-3 rotate-90" />
                    <FileCode2 className="w-3 h-3" />
                    component.html
                    <span className="text-[9px] text-muted-foreground ml-auto">{htmlCode.split('\n').length}L</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted/30 transition">
                    <ChevronRight className="w-3 h-3 rotate-90" />
                    <FileCode2 className="w-3 h-3" />
                    styles.css
                    <span className="text-[9px] text-muted-foreground/60 ml-auto">{cssCode.split('\n').length}L</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted/30 transition">
                    <ChevronRight className="w-3 h-3 rotate-90" />
                    <FileCode2 className="w-3 h-3" />
                    script.js
                    <span className="text-[9px] text-muted-foreground/60 ml-auto">{jsCode.split('\n').length}L</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-primary/5 text-primary text-xs font-medium">
                  <ChevronRight className="w-3 h-3 rotate-90" />
                  <FileCode2 className="w-3 h-3" />
                  component.tsx
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <TemplateGallery onSelect={onSelectTemplate} />
        )}

        {activeTab === 'versions' && (
          <div className="p-3 space-y-2">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Version History</div>
            {versionHistory.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <Clock className="w-5 h-5 mx-auto mb-2 opacity-40" />
                <p>No versions saved yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {versionHistory.map((v) => (
                  <button
                    key={v.version}
                    onClick={() => onLoadVersion(v)}
                    className="w-full text-left p-2.5 rounded-lg border border-border/40 hover:border-primary/40 hover:bg-muted/20 transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground group-hover:text-primary transition">
                        v{v.version}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(v.savedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {v.code.split('\n').length} lines
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'shared' && (
          <div className="p-3 space-y-3">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Shared Components</div>
            <div className="text-center py-8 text-xs text-muted-foreground">
              <Package className="w-5 h-5 mx-auto mb-2 opacity-40" />
              <p className="mb-3">Save components to reuse across editors</p>
              <button className="flex items-center gap-1.5 mx-auto px-3 py-1.5 text-[10px] font-semibold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition">
                <Plus className="w-3 h-3" />
                Save Current as Component
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
