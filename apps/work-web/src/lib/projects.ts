import { Project } from '@/types/project';

export const projects: Project[] = [
  {
    id: '01',
    slug: 'luxury-watch-brand',
    title: 'Luxury Watch Brand',
    category: 'Web Design',
    year: '2026',
    image: 'https://picsum.photos/seed/watch/800/600',
    description:
      'A premium e-commerce experience crafted for a luxury watch brand. Minimal interface, maximum impact.',
    techStack: ['React', 'GSAP', 'Three.js'],
  },
  {
    id: '02',
    slug: 'bespoke-luxury-porsche',
    title: 'Bespoke Luxury Porsche',
    category: 'Web Design',
    year: '2026',
    image: 'https://picsum.photos/seed/porsche/800/600',
    description:
      'Custom configurator and showcase for bespoke Porsche builds. Every detail engineered for elegance.',
    techStack: ['Next.js', 'Framer Motion', 'Tailwind'],
  },
  {
    id: '03',
    slug: 'naggys',
    title: "Naggy's",
    category: 'Art Direction & Web Design',
    year: '2024',
    image: 'https://picsum.photos/seed/naggys/800/600',
    description:
      'Brand identity and web presence for a modern restaurant. Warm tones, inviting typography.',
    techStack: ['React', 'GSAP', 'Prismic'],
  },
  {
    id: '04',
    slug: 'pinegold-ira',
    title: 'PineGold IRA',
    category: 'Art Direction & Web Design',
    year: '2024',
    image: 'https://picsum.photos/seed/pinegold/800/600',
    description:
      'Financial services platform with premium brand experience. Trust through design.',
    techStack: ['Next.js', 'Framer Motion', 'Sanity'],
  },
  {
    id: '05',
    slug: 'loris-academy',
    title: "Lori's Academy",
    category: 'Art Direction & Web Design',
    year: '2024',
    image: 'https://picsum.photos/seed/loris/800/600',
    description:
      'Educational platform with engaging visual storytelling. Learning meets aesthetics.',
    techStack: ['React', 'Tailwind', 'Contentful'],
  },
  {
    id: '06',
    slug: 'lightwaves',
    title: 'Lightwaves',
    category: 'Art Direction & Web Design',
    year: '2023',
    image: 'https://picsum.photos/seed/lightwaves/800/600',
    description:
      'Creative agency portfolio with immersive visual experience. Light as a design language.',
    techStack: ['React', 'Three.js', 'GSAP'],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacentProjects(slug: string) {
  const index = projects.findIndex((p) => p.slug === slug);
  const prev = index > 0 ? projects[index - 1] : null;
  const next = index < projects.length - 1 ? projects[index + 1] : null;
  return { prev, next };
}
