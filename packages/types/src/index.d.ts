export type Role = 'ADMIN';

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';

export type ContentFormat = 'MARKDOWN' | 'MDX';

export type ReactionType = 'LIKE' | 'LOVE' | 'INSIGHTFUL' | 'FIRE';

export type MediaType = 'IMAGE';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
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
  ogImageId?: string | null;
  title: string;
  slug: string;
  excerpt?: string | null;
  status: PostStatus;
  featured: boolean;
  readingTime: number;
  toc?: any | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex: boolean;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations (optional/populated)
  author?: User;
  category?: Category | null;
  featuredImage?: Media | null;
  ogImage?: Media | null;
  content?: PostContent | null;
  tags?: { tag: Tag }[] | Tag[];
  _count?: {
    views?: number;
    reactions?: number;
    bookmarks?: number;
  };
}

