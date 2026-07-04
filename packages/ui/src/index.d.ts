import React from 'react';

interface Block {
  id: string;
  type: string;
  data: Record<string, any>;
}

interface ContentRendererProps {
  blocks: Block[];
}

export const ContentRenderer: React.FC<ContentRendererProps>;

export declare const HeadingBlock: React.FC<{ data: Record<string, unknown> }>;
export declare const TextBlock: React.FC<{ data: Record<string, unknown> }>;
export declare const ImageBlock: React.FC<{ data: Record<string, unknown> }>;
export declare const VideoBlock: React.FC<{ data: Record<string, unknown> }>;
export declare const GalleryBlock: React.FC<{ data: Record<string, unknown> }>;
export declare const QuoteBlock: React.FC<{ data: Record<string, unknown> }>;
export declare const DividerBlock: React.FC<{ data: Record<string, unknown> }>;
export declare const CodeBlock: React.FC<{ data: Record<string, unknown> }>;
export declare const EmbedBlock: React.FC<{ data: Record<string, unknown> }>;
export declare const QuestionBlock: React.FC<{ data: Record<string, unknown> }>;
export declare const PollBlock: React.FC<{ data: Record<string, unknown> }>;
export declare const ButtonBlock: React.FC<{ data: Record<string, unknown> }>;
export declare const AIBlock: React.FC<{ data: Record<string, unknown> }>;

export declare const Button: React.FC<{ children?: React.ReactNode; onClick?: () => void }>;
