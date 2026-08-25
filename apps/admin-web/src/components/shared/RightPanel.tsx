'use client';

import React, { useState } from 'react';
import {
  Eye,
  AlertTriangle,
  Sliders,
  Monitor,
  Tablet,
  Smartphone,
} from 'lucide-react';
import { RuntimeErrorBoundary } from './ErrorBoundary';
import type { RuntimeModule } from './extractModule';
import type { ComponentConfig } from './parseConfig';
import type { PreviewDevice } from './types';
import { PREVIEW_DEVICES } from './types';

type RightTab = 'preview' | 'errors' | 'props';

interface RightPanelProps {
  runtime: 'react' | 'html';
  compiledModule: RuntimeModule | null;
  compileError: string | null;
  previewKey: number;
  config: ComponentConfig | undefined;
  props: Record<string, any>;
  onPropsChange: (props: Record<string, any>) => void;
  reactPreview: React.ReactNode;
  htmlPreview: React.ReactNode;
  previewDevice: PreviewDevice;
  onPreviewDeviceChange: (device: PreviewDevice) => void;
}

export function RightPanel({
  runtime,
  compiledModule,
  compileError,
  previewKey,
  config,
  props,
  onPropsChange,
  reactPreview,
  htmlPreview,
  previewDevice,
  onPreviewDeviceChange,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<RightTab>('preview');
  const configProps = config?.props || {};
  const propKeys = Object.keys(configProps);

  const deviceWidth = PREVIEW_DEVICES[previewDevice].width;

  return (
    <div className="h-full flex flex-col bg-card border-l border-border/40">
      {/* Tab Bar */}
      <div className="flex border-b border-border/40">
        {([
          { key: 'preview', icon: <Eye className="w-3.5 h-3.5" />, label: 'Preview', badge: 0 },
          { key: 'errors', icon: <AlertTriangle className="w-3.5 h-3.5" />, label: 'Errors', badge: compileError ? 1 : 0 },
          { key: 'props', icon: <Sliders className="w-3.5 h-3.5" />, label: 'Props', badge: propKeys.length },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-semibold transition border-b-2 ${
              activeTab === tab.key
                ? 'text-primary border-primary bg-primary/5'
                : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge ? (
              <span className="min-w-4 h-3.5 flex items-center justify-center text-[8px] font-bold bg-primary text-primary-foreground rounded-full px-1">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'preview' && (
          <div className="h-full flex flex-col">
            {/* Device Switcher */}
            <div className="flex items-center justify-center gap-1 px-3 py-2 border-b border-border/20 bg-muted/10">
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

            {/* Preview Frame */}
            <div className="flex-1 overflow-auto bg-muted/5 flex justify-center">
              <div
                className="h-full overflow-auto bg-background transition-all duration-300"
                style={{ width: deviceWidth || '100%', maxWidth: '100%' }}
              >
                {runtime === 'react' ? (
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
                ) : (
                  htmlPreview
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="p-3 overflow-auto h-full">
            {compileError ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                  <span className="text-xs font-bold text-destructive">Compile Error</span>
                </div>
                <pre className="text-[11px] font-mono text-destructive/80 whitespace-pre-wrap leading-relaxed">
                  {compileError}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <AlertTriangle className="w-5 h-5 mb-2 opacity-40" />
                <span className="text-xs">No errors</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'props' && (
          <div className="p-3 space-y-3 overflow-auto h-full">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Component Props</div>
            {propKeys.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <Sliders className="w-5 h-5 mx-auto mb-2 opacity-40" />
                <p>No props defined in config</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  Add <code className="bg-muted px-1 rounded">export const config = &#123; props: &#123; &#125; &#125;</code> to your code
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {propKeys.map((key) => {
                  const type = configProps[key];
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-foreground">{key}</label>
                        <span className="text-[9px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {type}
                        </span>
                      </div>
                      {type === 'boolean' ? (
                        <button
                          onClick={() => onPropsChange({ ...props, [key]: !props[key] })}
                          className={`w-full h-7 rounded-lg text-[11px] font-semibold transition ${
                            props[key]
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {props[key] ? 'true' : 'false'}
                        </button>
                      ) : type === 'number' ? (
                        <input
                          type="number"
                          value={props[key] || 0}
                          onChange={(e) => onPropsChange({ ...props, [key]: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-input bg-background outline-none focus:ring-1 focus:ring-primary"
                        />
                      ) : (
                        <input
                          type="text"
                          value={props[key] || ''}
                          onChange={(e) => onPropsChange({ ...props, [key]: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-input bg-background outline-none focus:ring-1 focus:ring-primary"
                          placeholder={key}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
