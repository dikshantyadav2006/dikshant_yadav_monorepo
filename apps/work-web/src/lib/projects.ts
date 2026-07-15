import { Project } from '@/types/project';

export const projects: Project[] = [
  {
    id: '01',
    slug: 'luxury-watch-brand',
    title: 'Luxury Watch Brand',
    subtitle: 'PROJECT FOR LUXURY WATCHES',
    category: 'Web Design',
    year: '2026',
    heroImage: 'https://picsum.photos/seed/watch-hero/1400/900',
    image: 'https://picsum.photos/seed/watch/800/600',
    overview:
      'A premium e-commerce experience crafted for a luxury watch brand. The design language speaks to precision engineering and timeless elegance. Every interaction was designed to mirror the meticulous craftsmanship of the timepieces themselves.',
    contentBlocks: [
      {
        type: 'large-image',
        src: 'https://picsum.photos/seed/watch-large/1400/700',
        alt: 'Watch brand showcase',
      },
      {
        type: 'grid-2',
        images: [
          'https://picsum.photos/seed/watch-grid1/700/500',
          'https://picsum.photos/seed/watch-grid2/700/500',
        ],
        alts: ['Watch detail 1', 'Watch detail 2'],
      },
      {
        type: 'banner',
        src: 'https://picsum.photos/seed/watch-banner/1400/350',
        alt: 'Watch banner',
      },
      {
        type: 'posters',
        images: [
          'https://picsum.photos/seed/watch-poster1/700/1000',
          'https://picsum.photos/seed/watch-poster2/700/1000',
        ],
        alts: ['Watch poster 1', 'Watch poster 2'],
      },
      {
        type: 'desktop-showcase',
        desktop: [
          'https://picsum.photos/seed/watch-desk1/1400/800',
          'https://picsum.photos/seed/watch-desk2/1400/800',
        ],
      },
    ],
    credits: [
      { role: 'Design', value: 'Dikshant Yadav' },
      { role: 'Development', value: 'Dikshant Yadav' },
      { role: 'Branding', value: 'Studio Collective' },
    ],
    nextProject: {
      title: 'Bespoke Luxury Porsche',
      image: 'https://picsum.photos/seed/porsche/800/600',
      slug: 'bespoke-luxury-porsche',
    },
    description:
      'A premium e-commerce experience crafted for a luxury watch brand. Minimal interface, maximum impact.',
    techStack: ['React', 'GSAP', 'Three.js'],
  },
  {
    id: '02',
    slug: 'bespoke-luxury-porsche',
    title: 'Bespoke Luxury Porsche',
    subtitle: 'CUSTOM PORSCHE CONFIGURATOR',
    category: 'Web Design',
    year: '2026',
    heroImage: 'https://picsum.photos/seed/porsche-hero/1400/900',
    image: 'https://picsum.photos/seed/porsche/800/600',
    overview:
      'Custom configurator and showcase for bespoke Porsche builds. Every detail engineered for elegance. The platform allows customers to explore and personalize their dream vehicles with an immersive digital experience.',
    contentBlocks: [
      {
        type: 'large-image',
        src: 'https://picsum.photos/seed/porsche-large/1400/700',
        alt: 'Porsche showcase',
      },
      {
        type: 'grid-2',
        images: [
          'https://picsum.photos/seed/porsche-grid1/700/500',
          'https://picsum.photos/seed/porsche-grid2/700/500',
        ],
        alts: ['Porsche interior', 'Porsche exterior'],
      },
      {
        type: 'banner',
        src: 'https://picsum.photos/seed/porsche-banner/1400/350',
        alt: 'Porsche banner',
      },
      {
        type: 'desktop-showcase',
        desktop: [
          'https://picsum.photos/seed/porsche-desk1/1400/800',
          'https://picsum.photos/seed/porsche-desk2/1400/800',
        ],
        mobile: [
          'https://picsum.photos/seed/porsche-mob1/400/800',
          'https://picsum.photos/seed/porsche-mob2/400/800',
        ],
      },
    ],
    credits: [
      { role: 'Design', value: 'Dikshant Yadav' },
      { role: 'Development', value: 'Dikshant Yadav' },
    ],
    nextProject: {
      title: "Naggy's",
      image: 'https://picsum.photos/seed/naggys/800/600',
      slug: 'naggys',
    },
    description:
      'Custom configurator and showcase for bespoke Porsche builds. Every detail engineered for elegance.',
    techStack: ['Next.js', 'Framer Motion', 'Tailwind'],
  },
  {
    id: '03',
    slug: 'naggys',
    title: "Naggy's",
    subtitle: 'MODERN RESTAURANT IDENTITY',
    category: 'Art Direction & Web Design',
    year: '2024',
    heroImage: 'https://picsum.photos/seed/naggys-hero/1400/900',
    image: 'https://picsum.photos/seed/naggys/800/600',
    overview:
      'Brand identity and web presence for a modern restaurant. Warm tones, inviting typography. The visual language bridges culinary artistry with digital elegance, creating an experience that feels as welcoming as the restaurant itself.',
    contentBlocks: [
      {
        type: 'large-image',
        src: 'https://picsum.photos/seed/naggys-large/1400/700',
        alt: 'Naggys brand showcase',
      },
      {
        type: 'posters',
        images: [
          'https://picsum.photos/seed/naggys-poster1/700/1000',
          'https://picsum.photos/seed/naggys-poster2/700/1000',
        ],
        alts: ['Menu poster', 'Brand poster'],
      },
      {
        type: 'grid-2',
        images: [
          'https://picsum.photos/seed/naggys-grid1/700/500',
          'https://picsum.photos/seed/naggys-grid2/700/500',
        ],
        alts: ['Restaurant interior', 'Food photography'],
      },
      {
        type: 'banner',
        src: 'https://picsum.photos/seed/naggys-banner/1400/350',
        alt: 'Naggys banner',
      },
      {
        type: 'mobile-showcase',
        mobile: [
          'https://picsum.photos/seed/naggys-mob1/400/800',
          'https://picsum.photos/seed/naggys-mob2/400/800',
        ],
      },
    ],
    credits: [
      { role: 'Design', value: 'Dikshant Yadav' },
      { role: 'Development', value: 'Dikshant Yadav' },
      { role: 'Branding', value: 'Studio Collective' },
    ],
    nextProject: {
      title: 'PineGold IRA',
      image: 'https://picsum.photos/seed/pinegold/800/600',
      slug: 'pinegold-ira',
    },
    description:
      'Brand identity and web presence for a modern restaurant. Warm tones, inviting typography.',
    techStack: ['React', 'GSAP', 'Prismic'],
  },
  {
    id: '04',
    slug: 'pinegold-ira',
    title: 'PineGold IRA',
    subtitle: 'FINANCIAL SERVICES PLATFORM',
    category: 'Art Direction & Web Design',
    year: '2024',
    heroImage: 'https://picsum.photos/seed/pinegold-hero/1400/900',
    image: 'https://picsum.photos/seed/pinegold/800/600',
    overview:
      'Financial services platform with premium brand experience. Trust through design. The interface communicates stability and sophistication while maintaining approachability for both seasoned investors and newcomers.',
    contentBlocks: [
      {
        type: 'large-image',
        src: 'https://picsum.photos/seed/pinegold-large/1400/700',
        alt: 'PineGold showcase',
      },
      {
        type: 'grid-2',
        images: [
          'https://picsum.photos/seed/pinegold-grid1/700/500',
          'https://picsum.photos/seed/pinegold-grid2/700/500',
        ],
        alts: ['Dashboard view', 'Analytics'],
      },
      {
        type: 'desktop-showcase',
        desktop: [
          'https://picsum.photos/seed/pinegold-desk1/1400/800',
          'https://picsum.photos/seed/pinegold-desk2/1400/800',
        ],
      },
      {
        type: 'banner',
        src: 'https://picsum.photos/seed/pinegold-banner/1400/350',
        alt: 'PineGold banner',
      },
    ],
    credits: [
      { role: 'Design', value: 'Dikshant Yadav' },
      { role: 'Development', value: 'Dikshant Yadav' },
    ],
    nextProject: {
      title: "Lori's Academy",
      image: 'https://picsum.photos/seed/loris/800/600',
      slug: 'loris-academy',
    },
    description:
      'Financial services platform with premium brand experience. Trust through design.',
    techStack: ['Next.js', 'Framer Motion', 'Sanity'],
  },
  {
    id: '05',
    slug: 'loris-academy',
    title: "Lori's Academy",
    subtitle: 'PIANO ACADEMY WEBSITE',
    category: 'Art Direction & Web Design',
    year: '2024',
    heroImage: 'https://picsum.photos/seed/loris-hero/1400/900',
    image: 'https://picsum.photos/seed/loris/800/600',
    overview:
      'Educational platform with engaging visual storytelling. Learning meets aesthetics. The design captures the elegance of musical education while providing an intuitive booking and learning experience.',
    contentBlocks: [
      {
        type: 'large-image',
        src: 'https://picsum.photos/seed/loris-large/1400/700',
        alt: "Lori's Academy showcase",
      },
      {
        type: 'posters',
        images: [
          'https://picsum.photos/seed/loris-poster1/700/1000',
          'https://picsum.photos/seed/loris-poster2/700/1000',
        ],
        alts: ['Class poster', 'Recital poster'],
      },
      {
        type: 'grid-2',
        images: [
          'https://picsum.photos/seed/loris-grid1/700/500',
          'https://picsum.photos/seed/loris-grid2/700/500',
        ],
        alts: ['Studio photo', 'Student session'],
      },
      {
        type: 'mobile-showcase',
        mobile: [
          'https://picsum.photos/seed/loris-mob1/400/800',
          'https://picsum.photos/seed/loris-mob2/400/800',
        ],
        desktop: [
          'https://picsum.photos/seed/loris-desk1/1400/800',
        ],
      },
      {
        type: 'banner',
        src: 'https://picsum.photos/seed/loris-banner/1400/350',
        alt: "Lori's banner",
      },
    ],
    credits: [
      { role: 'Design', value: 'Dikshant Yadav' },
      { role: 'Development', value: 'Dikshant Yadav' },
      { role: 'Branding', value: 'Studio Collective' },
    ],
    nextProject: {
      title: 'Lightwaves',
      image: 'https://picsum.photos/seed/lightwaves/800/600',
      slug: 'lightwaves',
    },
    description:
      'Educational platform with engaging visual storytelling. Learning meets aesthetics.',
    techStack: ['React', 'Tailwind', 'Contentful'],
  },
  {
    id: '06',
    slug: 'lightwaves',
    title: 'Lightwaves',
    subtitle: 'CREATIVE AGENCY PORTFOLIO',
    category: 'Art Direction & Web Design',
    year: '2023',
    heroImage: 'https://picsum.photos/seed/lightwaves-hero/1400/900',
    image: 'https://picsum.photos/seed/lightwaves/800/600',
    overview:
      'Creative agency portfolio with immersive visual experience. Light as a design language. The site plays with luminance and transparency to create a memorable digital presence that reflects the agency creative philosophy.',
    contentBlocks: [
      {
        type: 'large-image',
        src: 'https://picsum.photos/seed/lightwaves-large/1400/700',
        alt: 'Lightwaves showcase',
      },
      {
        type: 'grid-2',
        images: [
          'https://picsum.photos/seed/lightwaves-grid1/700/500',
          'https://picsum.photos/seed/lightwaves-grid2/700/500',
        ],
        alts: ['Agency work 1', 'Agency work 2'],
      },
      {
        type: 'desktop-showcase',
        desktop: [
          'https://picsum.photos/seed/lightwaves-desk1/1400/800',
          'https://picsum.photos/seed/lightwaves-desk2/1400/800',
        ],
      },
      {
        type: 'banner',
        src: 'https://picsum.photos/seed/lightwaves-banner/1400/350',
        alt: 'Lightwaves banner',
      },
    ],
    credits: [
      { role: 'Design', value: 'Dikshant Yadav' },
      { role: 'Development', value: 'Dikshant Yadav' },
    ],
    nextProject: {
      title: 'Luxury Watch Brand',
      image: 'https://picsum.photos/seed/watch/800/600',
      slug: 'luxury-watch-brand',
    },
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
