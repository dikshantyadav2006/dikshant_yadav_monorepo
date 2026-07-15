export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  year: string;
  image: string;
  description?: string;
  techStack?: string[];
  link?: string;
}
