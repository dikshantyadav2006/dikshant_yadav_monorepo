'use client';

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  LayoutGrid,
  Square,
  Monitor,
  Smartphone,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { workTemplates, builtInWorkNodeDefinitions } from '@dikshant/node-registry';
import { useWorkBuilderStore } from '../../features/work-builder/store';

const NODE_ICONS: Record<string, React.ReactNode> = {
  'large-image': <ImageIcon className="w-4 h-4 text-indigo-500" />,
  'grid-2': <LayoutGrid className="w-4 h-4 text-amber-500" />,
  banner: <Square className="w-4 h-4 text-sky-500" />,
  posters: <LayoutGrid className="w-4 h-4 text-pink-500" />,
  'mobile-showcase': <Smartphone className="w-4 h-4 text-emerald-500" />,
  'desktop-showcase': <Monitor className="w-4 h-4 text-violet-500" />,
};

export function WorkSidebar() {
  const [activeTab, setActiveTab] = useState<'blocks' | 'templates'>('blocks');
  const setNodes = useWorkBuilderStore((state) => state.setNodes);
  const setEdges = useWorkBuilderStore((state) => state.setEdges);
  const canvasData = useWorkBuilderStore((state) => state.canvasData);
  const setActiveNode = useWorkBuilderStore((state) => state.setActiveNode);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const applyTemplate = (templateId: string) => {
    const template = workTemplates.find((t) => t.id === templateId);
    if (!template) return;

    const idMap = new Map<string, string>();
    const existingIds = new Set(canvasData.nodes.map((n) => n.id));

    const newNodes = template.nodes.map((node) => {
      let nextId = `${node.type}-${crypto.randomUUID().slice(0, 8)}`;
      while (existingIds.has(nextId)) {
        nextId = `${node.type}-${crypto.randomUUID().slice(0, 8)}`;
      }
      idMap.set(node.id, nextId);
      return {
        id: nextId,
        type: node.type,
        position: { ...node.position },
        data: structuredClone(node.data || {}),
      };
    });

    const newEdges = template.edges
      .map((edge) => ({
        id: `${edge.id}-${crypto.randomUUID().slice(0, 6)}`,
        source: idMap.get(edge.source) ?? edge.source,
        target: idMap.get(edge.target) ?? edge.target,
      }))
      .filter((edge) => idMap.has(edge.source) && idMap.has(edge.target));

    setNodes([...canvasData.nodes, ...newNodes]);
    setEdges([...canvasData.edges, ...newEdges]);
    if (newNodes.length > 0) {
      setActiveNode(newNodes[0].id);
    }
  };

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-full flex-shrink-0 select-none">
      <div className="flex border-b border-border/60 bg-muted/20 p-1.5 gap-1">
        <button
          onClick={() => setActiveTab('blocks')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'blocks'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Blocks
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'templates'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Templates
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
        {activeTab === 'blocks' ? (
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold tracking-wider text-muted-foreground/80">
              PORTFOLIO
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {builtInWorkNodeDefinitions.map((item) => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/40 hover:border-border cursor-grab active:cursor-grabbing transition-all group"
                >
                  <div className="p-1.5 rounded-lg bg-muted group-hover:bg-background border border-border/30 transition-colors">
                    {NODE_ICONS[item.type] ?? <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-foreground">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {workTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template.id)}
                className="w-full text-left rounded-xl border border-border/50 bg-background/50 hover:bg-muted/40 hover:border-border transition-all p-3 space-y-1.5 group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <div className="text-xs font-bold text-foreground">{template.name}</div>
                </div>
                <div className="text-[9px] text-muted-foreground leading-snug">{template.description}</div>
                <div className="text-[9px] font-semibold text-muted-foreground/80">
                  {template.nodes.length} blocks
                </div>
              </button>
            ))}
            {workTemplates.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground/60 mt-2">No templates yet.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

export default WorkSidebar;
