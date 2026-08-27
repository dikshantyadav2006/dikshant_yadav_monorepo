export type Role = 'ADMIN';

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';

export type WorkStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type ContentFormat = 'MARKDOWN' | 'MDX';

export type ReactionType = 'LIKE' | 'LOVE' | 'INSIGHTFUL' | 'FIRE';

export type MediaType = 'IMAGE' | 'VIDEO' | 'RAW';

export type CanvasNodeType =
  | 'text'
  | 'heading'
  | 'image'
  | 'video'
  | 'gallery'
  | 'quote'
  | 'divider'
  | 'code-block'
  | 'question'
  | 'poll'
  | 'embed'
  | 'button'
  | 'ai-block'
  | 'code-block-interactive';

export type EdgeConditionType = 'equals' | 'contains' | 'truthy' | 'falsy';

export interface EdgeCondition {
  type: EdgeConditionType;
  value?: string;
}

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface CanvasNode<TData = Record<string, unknown>> {
  id: string;
  type: CanvasNodeType | string;
  position: CanvasPosition;
  data: TData;
}

export interface CanvasEdge<TData = Record<string, unknown>> {
  id: string;
  source: string;
  target: string;
  condition?: EdgeCondition | null;
  data?: TData | null;
}

export interface Block {
  id: string;
  type: string;
  data: Record<string, any>;
}

export interface CanvasData {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  blocks?: Block[];
}

export type ImageLayout = 'auto' | 'wide' | 'standard' | 'portrait' | 'full-width';

export interface ImageFocalPoint {
  x: number;
  y: number;
}

export interface ImageNodeData {
  src: string;
  alt?: string;
  caption?: string;
  mediaId?: string | null;
  width?: number | null;
  height?: number | null;
  blurDataUrl?: string | null;
  dominantColor?: string | null;
  responsiveMeta?: Record<string, any> | null;
  layout?: ImageLayout;
  focalPoint?: ImageFocalPoint | null;
}

export interface PostVersion {
  id: string;
  postId: string;
  version: number;
  canvasData: CanvasData;
  savedById?: string | null;
  changeLabel?: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  uploadedById: string;
  type: MediaType;
  key: string;
  bucket: string;
  publicUrl: string;
  fileName: string;
  contentType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  blurDataUrl?: string | null;
  dominantColor?: string | null;
  responsiveMeta?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostContent {
  id: string;
  postId: string;
  format: ContentFormat;
  body: string;
  compiledBody?: string | null;
  plainText?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  id: string;
  postId: string;
  type: ReactionType;
  visitorHash: string;
  createdAt: string;
}

export interface View {
  id: string;
  postId?: string | null;
  path: string;
  visitorHash: string;
  referrer?: string | null;
  country?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  categoryId?: string | null;
  featuredImageId?: string | null;
  featuredBannerImageId?: string | null;
  featuredBannerImageMeta?: {
    layout?: ImageLayout;
    focalPoint?: ImageFocalPoint;
  } | null;
  ogImageId?: string | null;
  title: string;
  slug: string;
  excerpt?: string | null;
  status: PostStatus;
  featured: boolean;
  featuredPinned: boolean;
  readingTime: number;
  toc?: any | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex: boolean;
  canvasData?: CanvasData | null;
  currentVersion: number;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations (optional/populated)
  author?: User;
  category?: Category | null;
  featuredImage?: Media | null;
  featuredBannerImage?: Media | null;
  ogImage?: Media | null;
  content?: PostContent | null;
  tags?: { tag: Tag }[] | Tag[];
  _count?: {
    views?: number;
    reactions?: number;
    bookmarks?: number;
  };
}

export interface HomepageConfig {
  featuredLayout?: 'hero-grid';
  heroSectionStyle?: 'editorial';
  showLatestArticles?: boolean;
  showPopularArticles?: boolean;
  showCategories?: boolean;
  showTrendingTopics?: boolean;
}

export interface SocialLink {
  platform: string;
  label: string;
  url: string;
}

export interface SiteConfig {
  id: string;
  homepageFeaturedCount: number;
  homepageConfig?: HomepageConfig | null;
  autosaveEnabled: boolean;
  autosaveIntervalMs: number;
  socialLinks?: SocialLink[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShareLink {
  id: string;
  postId: string;
  token: string;
  expiresAt: string | null;
  createdAt: string;
}

export interface UserPreferences {
  userId: string;
  autosaveEnabled: boolean;
  autosaveIntervalMs: number;
  compactEditorMode: boolean;
  focusMode: boolean;
  defaultVisibility: PostStatus;
  defaultFeatured: boolean;
  defaultImageLayout?: ImageLayout | null;
  defaultHeroImageStyle?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type WorkContentBlock =
  | {
      type: 'large-image';
      src: string;
      alt: string;
      height?: string;
    }
  | {
      type: 'about';
      eyebrow?: string;
      heading?: string;
      title?: string;
      body?: string;
    }
  | {
      type: 'grid-2';
      images: [string, string];
      alts: [string, string];
      height?: string;
    }
  | {
      type: 'banner';
      src: string;
      alt: string;
      height?: string;
    }
  | {
      type: 'posters';
      images: [string, string];
      alts: [string, string];
      height?: string;
    }
  | {
      type: 'mobile-showcase';
      mobile: string[];
      desktop?: string[];
    }
  | {
      type: 'desktop-showcase';
      desktop: string[];
      mobile?: string[];
    }
  | {
      type: 'bento';
      story: string;
      client: string;
      year: string;
      services: string[];
      timeline: string;
      role: string;
      techStack: string[];
      results: string;
    }
  | {
      type: 'video';
      src: string;
      title?: string;
      poster?: string;
    }
  | {
      type: 'embed';
      url: string;
      aspectRatio?: string;
    }
  | {
      type: 'metrics';
      items: {
        value: string;
        label: string;
      }[];
    }
  | {
      type: 'link';
      label: string;
      href: string;
      description?: string;
    }
  | {
      type: 'code-block-interactive';
      title?: string;
      description?: string;
      runtime: 'react' | 'html';
      code: string;
      html?: string;
      css?: string;
      js?: string;
      props?: Record<string, any>;
      previewHeight?: number;
      renderMode?: 'preview' | 'component' | 'hidden';
      version?: number;
      widthMode?: 'contained' | 'wide' | 'full-bleed';
    }
  | {
      type: 'project-credits';
      eyebrow?: string;
      title?: string;
      headingLabel?: string;
      heading?: string;
      year?: string;
      items: ProjectCreditBlockItem[];
    };

export interface ProjectCreditBlockItem {
  label: string;
  value: string;
  variant: 'script' | 'condensed' | 'mono';
}

export interface WorkAboutBlock {
  eyebrow?: string;
  heading?: string;
  title?: string;
  body?: string;
}

export interface ProjectCredit {
  role: string;
  value: string;
}

export interface ProjectBento {
  story: string;
  client: string;
  year: string;
  services: string[];
  timeline: string;
  role: string;
  techStack: string[];
  results: string;
}

export interface WorkLink {
  postId: string;
  workId: string;
  sortOrder: number;
  createdAt: string;
}

export interface WorkVersion {
  id: string;
  workId: string;
  version: number;
  canvasData: CanvasData;
  savedById?: string | null;
  changeLabel?: string | null;
  createdAt: string;
}

export interface Work {
  id: string;
  authorId: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  category?: string | null;
  year?: string | null;
  heroImageUrl?: string | null;
  imageUrl?: string | null;
  overview?: string | null;
  description?: string | null;
  techStack?: string[] | null;
  link?: string | null;
  swatchColor?: string | null;
  credits?: ProjectCredit[] | null;
  status: WorkStatus;
  featured: boolean;
  featuredPinned: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  noIndex: boolean;
  canvasData?: CanvasData | null;
  currentVersion: number;
  publishedAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  // Derived / populated
  contentBlocks?: WorkContentBlock[] | null;

  // Relations (optional/populated)
  author?: User;
  posts?: Post[];
  workLinks?: WorkLink[];

  _count?: {
    postLinks?: number;
  };
}
