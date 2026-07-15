export interface ContentBlockLargeImage {
  type: 'large-image';
  src: string;
  alt: string;
  height?: string;
}

export interface ContentBlockGrid2 {
  type: 'grid-2';
  images: [string, string];
  alts: [string, string];
  height?: string;
}

export interface ContentBlockBanner {
  type: 'banner';
  src: string;
  alt: string;
  height?: string;
}

export interface ContentBlockPosters {
  type: 'posters';
  images: [string, string];
  alts: [string, string];
  height?: string;
}

export interface ContentBlockMobileShowcase {
  type: 'mobile-showcase';
  mobile: string[];
  desktop?: string[];
}

export interface ContentBlockDesktopShowcase {
  type: 'desktop-showcase';
  desktop: string[];
  mobile?: string[];
}

export type ContentBlock =
  | ContentBlockLargeImage
  | ContentBlockGrid2
  | ContentBlockBanner
  | ContentBlockPosters
  | ContentBlockMobileShowcase
  | ContentBlockDesktopShowcase;

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

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  heroImage: string;
  image: string;
  overview: string;
  contentBlocks: ContentBlock[];
  bento: ProjectBento;
  credits: ProjectCredit[];
  nextProject: {
    title: string;
    image: string;
    slug: string;
  };
  description?: string;
  techStack?: string[];
  link?: string;
}
