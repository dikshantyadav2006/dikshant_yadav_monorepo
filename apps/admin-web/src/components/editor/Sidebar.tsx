'use client';

import React, { useState } from 'react';
import { 
  Heading as HeadingIcon, 
  AlignLeft, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  LayoutGrid, 
  Quote as QuoteIcon, 
  Minus, 
  Code, 
  ExternalLink, 
  HelpCircle, 
  BarChart2, 
  MousePointerClick, 
  Sparkles
} from 'lucide-react';

interface BlockItem {
  type: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface BlockCategory {
  title: string;
  items: BlockItem[];
}

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<'blocks' | 'templates'>('blocks');

  const categories: BlockCategory[] = [
    {
      title: 'BASIC',
      items: [
        { type: 'heading', label: 'Heading', icon: <HeadingIcon className="w-4 h-4 text-blue-500" />, description: 'Section headers (H1, H2, H3)' },
        { type: 'text', label: 'Text', icon: <AlignLeft className="w-4 h-4 text-emerald-500" />, description: 'Paragraph text' },
        { type: 'divider', label: 'Divider', icon: <Minus className="w-4 h-4 text-zinc-500" />, description: 'Horizontal line separator' },
        { type: 'quote', label: 'Quote', icon: <QuoteIcon className="w-4 h-4 text-purple-500" />, description: 'Blockquotes and attributions' },
      ]
    },
    {
      title: 'MEDIA',
      items: [
        { type: 'image', label: 'Image', icon: <ImageIcon className="w-4 h-4 text-indigo-500" />, description: 'Upload or link an image' },
        { type: 'video', label: 'Video', icon: <VideoIcon className="w-4 h-4 text-red-500" />, description: 'Embed a video player' },
        { type: 'gallery', label: 'Gallery', icon: <LayoutGrid className="w-4 h-4 text-amber-500" />, description: 'A grid or carousel of images' },
        { type: 'embed', label: 'Embed', icon: <ExternalLink className="w-4 h-4 text-pink-500" />, description: 'Interactive iframes and web links' },
      ]
    },
    {
      title: 'CODE',
      items: [
        { type: 'code-block', label: 'Code Block', icon: <Code className="w-4 h-4 text-teal-500" />, description: 'Syntax highlighted code' },
      ]
    },
    {
      title: 'INTERACTIVE',
      items: [
        { type: 'question', label: 'Question', icon: <HelpCircle className="w-4 h-4 text-violet-500" />, description: 'Interactive user question block' },
        { type: 'poll', label: 'Poll', icon: <BarChart2 className="w-4 h-4 text-orange-500" />, description: 'Multi-option survey block' },
        { type: 'button', label: 'Button', icon: <MousePointerClick className="w-4 h-4 text-sky-500" />, description: 'Call-to-action button link' },
        { type: 'ai-block', label: 'AI Block', icon: <Sparkles className="w-4 h-4 text-fuchsia-500" />, description: 'AI content generator block' },
      ]
    }
  ];

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-full flex-shrink-0 select-none">
      {/* Tabs Selector */}
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
          categories.map((category) => (
            <div key={category.title} className="space-y-2.5">
              <h4 className="text-[10px] font-bold tracking-wider text-muted-foreground/80">
                {category.title}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {category.items.map((item) => (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, item.type)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/40 hover:border-border cursor-grab active:cursor-grabbing transition-all group"
                  >
                    <div className="p-1.5 rounded-lg bg-muted group-hover:bg-background border border-border/30 transition-colors">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-foreground">{item.label}</div>
                      <div className="text-[9px] text-muted-foreground/80 truncate">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-[10px] text-muted-foreground/60">No templates defined yet.</span>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
