'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
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
  Sparkles,
  Trash2
} from 'lucide-react';
import { useVisualBuilderStore } from '../../../features/visual-builder/store';

// Helper component for standard node layout on the canvas
interface BaseNodeProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  selected?: boolean;
  children: React.ReactNode;
}

function BaseNode({ id, title, icon, selected, children }: BaseNodeProps) {
  const setNodes = useVisualBuilderStore((state) => state.setNodes);
  const canvasData = useVisualBuilderStore((state) => state.canvasData);
  const activeNodeId = useVisualBuilderStore((state) => state.activeNodeId);
  const setActiveNode = useVisualBuilderStore((state) => state.setActiveNode);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes(canvasData.nodes.filter((node) => node.id !== id));
    if (activeNodeId === id) {
      setActiveNode(null);
    }
  };

  return (
    <div 
      className={`w-64 rounded-xl border bg-card text-card-foreground shadow-md transition-all duration-200 ${
        selected ? 'border-primary ring-2 ring-primary/20' : 'border-border/60'
      }`}
    >
      {/* Top Handle for sequence inputs */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-2.5 h-2.5 bg-muted-foreground border-2 border-background"
      />

      <div className="flex items-center justify-between border-b border-border/40 px-3 py-2 bg-muted/20 rounded-t-xl">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          {icon}
          <span>{title}</span>
        </div>
        <button 
          onClick={handleDelete}
          className="text-muted-foreground/60 hover:text-destructive transition-colors p-0.5 rounded hover:bg-muted"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 text-xs">
        {children}
      </div>

      {/* Bottom Handle for sequence outputs */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-2.5 h-2.5 bg-muted-foreground border-2 border-background"
      />
    </div>
  );
}

// 1. Heading Node
export function HeadingNode({ id, data, selected }: NodeProps) {
  const text = data.text || 'Untitled section';
  const level = data.level || 2;
  return (
    <BaseNode id={id} title={`Heading H${level}`} icon={<HeadingIcon className="w-3.5 h-3.5 text-blue-500" />} selected={selected}>
      <div className="font-semibold text-foreground truncate" style={{ fontSize: level === 1 ? '1.1rem' : level === 2 ? '0.95rem' : '0.85rem' }}>
        {text}
      </div>
    </BaseNode>
  );
}

// 2. Text Node
export function TextNode({ id, data, selected }: NodeProps) {
  const body = data.body || 'Type text here...';
  return (
    <BaseNode id={id} title="Text" icon={<AlignLeft className="w-3.5 h-3.5 text-emerald-500" />} selected={selected}>
      <p className="text-muted-foreground line-clamp-3 whitespace-pre-wrap leading-relaxed">
        {body}
      </p>
    </BaseNode>
  );
}

// 3. Image Node
export function ImageNode({ id, data, selected }: NodeProps) {
  const src = data.src;
  const caption = data.caption || '';
  return (
    <BaseNode id={id} title="Image" icon={<ImageIcon className="w-3.5 h-3.5 text-indigo-500" />} selected={selected}>
      {src ? (
        <div className="space-y-1.5">
          <img src={src} alt={caption} className="w-full aspect-[2/1] object-cover rounded-md border border-border/40" />
          {caption && <span className="text-[10px] text-muted-foreground line-clamp-1 italic">{caption}</span>}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4 bg-muted/30 border border-dashed border-border/60 rounded-md">
          <ImageIcon className="w-6 h-6 text-muted-foreground/40 mb-1" />
          <span className="text-[10px] text-muted-foreground/60">No image URL specified</span>
        </div>
      )}
    </BaseNode>
  );
}

// 4. Video Node
export function VideoNode({ id, data, selected }: NodeProps) {
  const src = data.src;
  const title = data.title || 'Untitled Video';
  return (
    <BaseNode id={id} title="Video" icon={<VideoIcon className="w-3.5 h-3.5 text-red-500" />} selected={selected}>
      <div className="flex items-center gap-2 p-2 bg-muted/40 rounded-md border border-border/40">
        <div className="p-1.5 bg-red-100 dark:bg-red-950/40 text-red-500 rounded">
          <VideoIcon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-foreground truncate">{title}</div>
          <div className="text-[10px] text-muted-foreground truncate">{src || 'No source URL'}</div>
        </div>
      </div>
    </BaseNode>
  );
}

// 5. Gallery Node
export function GalleryNode({ id, data, selected }: NodeProps) {
  const items = data.items || [];
  return (
    <BaseNode id={id} title="Gallery" icon={<LayoutGrid className="w-3.5 h-3.5 text-amber-500" />} selected={selected}>
      {items.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 bg-muted/20 p-1 rounded-md">
          {items.slice(0, 3).map((src: string, i: number) => (
            <img key={i} src={src} alt="" className="aspect-square object-cover rounded border border-border/40" />
          ))}
          {items.length > 3 && (
            <div className="aspect-square bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground rounded">
              +{items.length - 3}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-3 text-muted-foreground/60 border border-dashed border-border/60 rounded-md">
          Empty gallery
        </div>
      )}
    </BaseNode>
  );
}

// 6. Quote Node
export function QuoteNode({ id, data, selected }: NodeProps) {
  const quote = data.quote || 'Quote text...';
  const attribution = data.attribution;
  return (
    <BaseNode id={id} title="Quote" icon={<QuoteIcon className="w-3.5 h-3.5 text-purple-500" />} selected={selected}>
      <div className="border-l-2 border-primary pl-2 italic text-foreground">
        "{quote}"
      </div>
      {attribution && (
        <div className="text-[10px] text-muted-foreground text-right mt-1">— {attribution}</div>
      )}
    </BaseNode>
  );
}

// 7. Divider Node
export function DividerNode({ id, selected }: NodeProps) {
  return (
    <BaseNode id={id} title="Divider" icon={<Minus className="w-3.5 h-3.5 text-zinc-500" />} selected={selected}>
      <div className="py-2">
        <hr className="border-border/60" />
      </div>
    </BaseNode>
  );
}

// 8. Code Block Node
export function CodeBlockNode({ id, data, selected }: NodeProps) {
  const code = data.code || '// Write code here...';
  const language = data.language || 'typescript';
  return (
    <BaseNode id={id} title="Code Block" icon={<Code className="w-3.5 h-3.5 text-teal-500" />} selected={selected}>
      <div className="bg-muted p-2 rounded-md font-mono text-[10px] border border-border/40 space-y-1">
        <div className="flex justify-between text-[8px] text-muted-foreground uppercase border-b border-border/20 pb-0.5 font-bold">
          <span>{language}</span>
        </div>
        <pre className="overflow-hidden truncate leading-tight text-foreground">{code}</pre>
      </div>
    </BaseNode>
  );
}

// 9. Embed Node
export function EmbedNode({ id, data, selected }: NodeProps) {
  const url = data.url;
  return (
    <BaseNode id={id} title="Embed" icon={<ExternalLink className="w-3.5 h-3.5 text-pink-500" />} selected={selected}>
      <div className="flex items-center gap-1.5 text-muted-foreground truncate bg-muted/40 p-2 rounded border border-border/40">
        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-pink-500" />
        <span className="truncate">{url || 'Enter embed URL...'}</span>
      </div>
    </BaseNode>
  );
}

// 10. Question Node
export function QuestionNode({ id, data, selected }: NodeProps) {
  const prompt = data.prompt || 'Untitled question?';
  const options = data.options || [];
  return (
    <BaseNode id={id} title="Question" icon={<HelpCircle className="w-3.5 h-3.5 text-violet-500" />} selected={selected}>
      <div className="space-y-1.5">
        <div className="font-semibold text-foreground truncate">{prompt}</div>
        <div className="space-y-1">
          {options.slice(0, 3).map((opt: any, i: number) => (
            <div key={i} className="px-2 py-1 bg-muted/50 border border-border/40 rounded text-[10px] text-muted-foreground truncate">
              {opt.label || `Option ${i + 1}`}
            </div>
          ))}
          {options.length > 3 && (
            <div className="text-[9px] text-muted-foreground text-center">+{options.length - 3} more options</div>
          )}
        </div>
      </div>
    </BaseNode>
  );
}

// 11. Poll Node
export function PollNode({ id, data, selected }: NodeProps) {
  const prompt = data.prompt || 'Untitled poll?';
  const options = data.options || [];
  return (
    <BaseNode id={id} title="Poll" icon={<BarChart2 className="w-3.5 h-3.5 text-orange-500" />} selected={selected}>
      <div className="space-y-1.5">
        <div className="font-semibold text-foreground truncate">{prompt}</div>
        <div className="space-y-1">
          {options.slice(0, 3).map((opt: any, i: number) => (
            <div key={i} className="px-2 py-1 bg-muted/50 border border-border/40 rounded text-[10px] text-muted-foreground truncate">
              {opt.label || `Option ${i + 1}`}
            </div>
          ))}
        </div>
      </div>
    </BaseNode>
  );
}

// 12. Button Node
export function ButtonNode({ id, data, selected }: NodeProps) {
  const label = data.label || 'Click Here';
  return (
    <BaseNode id={id} title="Button" icon={<MousePointerClick className="w-3.5 h-3.5 text-sky-500" />} selected={selected}>
      <div className="text-center">
        <span className="inline-block px-3 py-1 bg-primary text-primary-foreground font-bold rounded-lg text-[10px] shadow-sm truncate max-w-full">
          {label}
        </span>
      </div>
    </BaseNode>
  );
}

// 13. AI Block Node
export function AIBlockNode({ id, data, selected }: NodeProps) {
  const prompt = data.prompt || 'Prompt...';
  const outputType = data.outputType || 'text';
  return (
    <BaseNode id={id} title="AI Block" icon={<Sparkles className="w-3.5 h-3.5 text-fuchsia-500" />} selected={selected}>
      <div className="flex flex-col gap-1 bg-fuchsia-500/5 p-2 rounded border border-fuchsia-500/20">
        <div className="flex items-center justify-between text-[9px] text-fuchsia-500 font-bold">
          <span>AI Generator</span>
          <span className="uppercase text-[8px] bg-fuchsia-500/10 px-1 rounded">{outputType}</span>
        </div>
        <div className="text-foreground truncate italic">"{prompt}"</div>
      </div>
    </BaseNode>
  );
}
