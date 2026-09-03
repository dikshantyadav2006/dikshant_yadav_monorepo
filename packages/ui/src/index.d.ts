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

export declare const CodeBlockInteractive: React.FC<{ data: Record<string, unknown> }>;

export declare const Button: React.FC<{ children?: React.ReactNode; onClick?: () => void }>;

export declare const TextSwap: React.FC<{ text: string; stagger?: number; className?: string }>;

interface DirectionalCursorProps {
  active?: boolean;
  clicked?: boolean;
  label?: string;
  rotation?: number;
  scaled?: boolean;
  arrowRotation?: number;
}

export declare const DirectionalCursor: React.FC<DirectionalCursorProps>;

interface GlowCursorProps {
  color?: string;
  secondaryColor?: string;
  trailLength?: number;
  trailWidth?: number;
  trailTaper?: number;
  followSpeed?: number;
  glowIntensity?: number;
  glowSpread?: number;
  hotspot?: number;
  brightness?: number;
  opacity?: number;
  pulseSpeed?: number;
  noiseStrength?: number;
  idleFade?: boolean;
  idleTimeout?: number;
  fadeDuration?: number;
  blendMode?: 'normal' | 'screen' | 'plus-lighter';
  maxDevicePixelRatio?: number;
  enabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const GlowCursor: React.FC<GlowCursorProps>;

export interface DepthCarouselItem {
  image: string;
  alt?: string;
  category?: string;
  title?: string;
}

export interface DepthCarouselRef {
  setFocus: (index: number, animate?: boolean) => void;
  navigateBy: (step: number) => void;
  getActive: () => number;
}

export interface DepthCarouselProps {
  items?: Array<string | DepthCarouselItem>;
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  tint?: string;
  depth?: number;
  spread?: number;
  tilt?: number;
  tiltDirection?: 'left' | 'right';
  perspective?: number;
  visibleCards?: number;
  falloff?: number;
  blur?: number;
  duration?: number;
  ease?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  onChange?: (index: number, item: DepthCarouselItem | undefined) => void;
  className?: string;
}

export declare const DepthCarousel: React.ForwardRefExoticComponent<
  DepthCarouselProps & React.RefAttributes<DepthCarouselRef>
>;

interface NotFoundPageProps {
  LinkComponent?: React.ElementType;
  linkProp?: 'href' | 'to';
  homeHref?: string;
  connectHref?: string;
  code?: string;
  title?: string;
  description?: string;
  cursorEvents?: CursorEvents | null;
}

export declare const NotFoundPage: React.FC<NotFoundPageProps>;

interface DomainItem {
  id?: string;
  prefix: string;
  label: string;
  href: string;
  lineColor: string;
  icon?: string;
}

interface CursorEvents {
  addCursor: (mode: string) => void;
  removeCursor: (mode: string) => void;
  cursorModes: Record<string, string>;
}

interface DomainNetworkProps {
  domains?: DomainItem[];
  domain?: string;
  activeColor?: string;
  autoRotateInterval?: number;
  resumeDelay?: number;
  cursorEvents?: CursorEvents | null;
  className?: string;
}

export declare const DomainNetwork: React.FC<DomainNetworkProps>;
export declare const defaultDomains: DomainItem[];
