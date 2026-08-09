import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@dikshant/database';

interface SeedBento {
  story: string;
  client: string;
  year: string;
  services: string[];
  timeline: string;
  role: string;
  techStack: string[];
  results: string;
}

interface SeedWork {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  heroImageUrl: string;
  imageUrl: string;
  overview: string;
  description: string;
  techStack: string[];
  credits: { role: string; value: string }[];
  bento: SeedBento;
  contentBlocks: Array<Record<string, any>>;
  publishedAt: string;
}

const SEED_WORKS: SeedWork[] = [
  {
    slug: 'luxury-watch-brand',
    title: 'Luxury Watch Brand',
    subtitle: 'PROJECT FOR LUXURY WATCHES',
    category: 'Web Design',
    year: '2026',
    heroImageUrl: 'https://picsum.photos/seed/watch-hero/1400/900',
    imageUrl: 'https://picsum.photos/seed/watch/800/600',
    overview:
      'A premium e-commerce experience crafted for a luxury watch brand. The design language speaks to precision engineering and timeless elegance. Every interaction was designed to mirror the meticulous craftsmanship of the timepieces themselves.',
    description:
      'A premium e-commerce experience crafted for a luxury watch brand. Minimal interface, maximum impact.',
    techStack: ['React', 'GSAP', 'Three.js'],
    credits: [
      { role: 'Design', value: 'Dikshant Yadav' },
      { role: 'Development', value: 'Dikshant Yadav' },
      { role: 'Branding', value: 'Studio Collective' },
    ],
    bento: {
      story: 'A premium e-commerce experience crafted for a luxury watch brand. The design language speaks to precision engineering and timeless elegance.',
      client: 'Luxury Watch Brand',
      year: '2026',
      services: ['Web Design', 'E-Commerce', 'UI/UX'],
      timeline: '8 Weeks',
      role: 'Lead Designer & Developer',
      techStack: ['React', 'GSAP', 'Three.js'],
      results: '40% increase in online engagement, 25% boost in conversion rate',
    },
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
    publishedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    slug: 'bespoke-luxury-porsche',
    title: 'Bespoke Luxury Porsche',
    subtitle: 'CUSTOM PORSCHE CONFIGURATOR',
    category: 'Web Design',
    year: '2026',
    heroImageUrl: 'https://picsum.photos/seed/porsche-hero/1400/900',
    imageUrl: 'https://picsum.photos/seed/porsche/800/600',
    overview:
      'Custom configurator and showcase for bespoke Porsche builds. Every detail engineered for elegance. The platform allows customers to explore and personalize their dream vehicles with an immersive digital experience.',
    description:
      'Custom configurator and showcase for bespoke Porsche builds. Every detail engineered for elegance.',
    techStack: ['Next.js', 'Framer Motion', 'Tailwind'],
    credits: [
      { role: 'Design', value: 'Dikshant Yadav' },
      { role: 'Development', value: 'Dikshant Yadav' },
    ],
    bento: {
      story: 'Custom configurator and showcase for bespoke Porsche builds. Every detail engineered for elegance. The platform allows customers to explore and personalize their dream vehicles.',
      client: 'Porsche',
      year: '2026',
      services: ['Web Design', 'Configurator', 'UI/UX'],
      timeline: '12 Weeks',
      role: 'Lead Designer & Developer',
      techStack: ['Next.js', 'Framer Motion', 'Tailwind'],
      results: '60% increase in configurator usage, 35% boost in lead generation',
    },
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
    publishedAt: '2026-05-01T00:00:00.000Z',
  },
  {
    slug: 'naggys',
    title: "Naggy's",
    subtitle: 'MODERN RESTAURANT IDENTITY',
    category: 'Art Direction & Web Design',
    year: '2024',
    heroImageUrl: 'https://picsum.photos/seed/naggys-hero/1400/900',
    imageUrl: 'https://picsum.photos/seed/naggys/800/600',
    overview:
      'Brand identity and web presence for a modern restaurant. Warm tones, inviting typography. The visual language bridges culinary artistry with digital elegance, creating an experience that feels as welcoming as the restaurant itself.',
    description:
      'Brand identity and web presence for a modern restaurant. Warm tones, inviting typography.',
    techStack: ['React', 'GSAP', 'Prismic'],
    credits: [
      { role: 'Design', value: 'Dikshant Yadav' },
      { role: 'Development', value: 'Dikshant Yadav' },
      { role: 'Branding', value: 'Studio Collective' },
    ],
    bento: {
      story: 'Brand identity and web presence for a modern restaurant. Warm tones, inviting typography. The visual language bridges culinary artistry with digital elegance.',
      client: "Naggy's Restaurant",
      year: '2024',
      services: ['Art Direction', 'Branding', 'Web Design'],
      timeline: '6 Weeks',
      role: 'Art Director & Designer',
      techStack: ['React', 'GSAP', 'Prismic'],
      results: '50% increase in reservations, 30% boost in social engagement',
    },
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
    publishedAt: '2025-06-01T00:00:00.000Z',
  },
  {
    slug: 'pinegold-ira',
    title: 'PineGold IRA',
    subtitle: 'FINANCIAL SERVICES PLATFORM',
    category: 'Art Direction & Web Design',
    year: '2024',
    heroImageUrl: 'https://picsum.photos/seed/pinegold-hero/1400/900',
    imageUrl: 'https://picsum.photos/seed/pinegold/800/600',
    overview:
      'Financial services platform with premium brand experience. Trust through design. The interface communicates stability and sophistication while maintaining approachability for both seasoned investors and newcomers.',
    description:
      'Financial services platform with premium brand experience. Trust through design.',
    techStack: ['Next.js', 'Framer Motion', 'Sanity'],
    credits: [
      { role: 'Design', value: 'Dikshant Yadav' },
      { role: 'Development', value: 'Dikshant Yadav' },
    ],
    bento: {
      story: 'Financial services platform with premium brand experience. Trust through design. The interface communicates stability and sophistication while maintaining approachability.',
      client: 'PineGold IRA',
      year: '2024',
      services: ['Art Direction', 'Web Design', 'UI/UX'],
      timeline: '10 Weeks',
      role: 'Lead Designer & Developer',
      techStack: ['Next.js', 'Framer Motion', 'Sanity'],
      results: '45% increase in user retention, 30% boost in account signups',
    },
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
    publishedAt: '2025-05-01T00:00:00.000Z',
  },
  {
    slug: 'loris-academy',
    title: "Lori's Academy",
    subtitle: 'PIANO ACADEMY WEBSITE',
    category: 'Art Direction & Web Design',
    year: '2024',
    heroImageUrl: 'https://picsum.photos/seed/loris-hero/1400/900',
    imageUrl: 'https://picsum.photos/seed/loris/800/600',
    overview:
      'Educational platform with engaging visual storytelling. Learning meets aesthetics. The design captures the elegance of musical education while providing an intuitive booking and learning experience.',
    description:
      'Educational platform with engaging visual storytelling. Learning meets aesthetics.',
    techStack: ['React', 'Tailwind', 'Contentful'],
    credits: [
      { role: 'Design', value: 'Dikshant Yadav' },
      { role: 'Development', value: 'Dikshant Yadav' },
      { role: 'Branding', value: 'Studio Collective' },
    ],
    bento: {
      story: 'Educational platform with engaging visual storytelling. Learning meets aesthetics. The design captures the elegance of musical education while providing an intuitive booking experience.',
      client: "Lori's Balance Piano Academy",
      year: '2024',
      services: ['Art Direction', 'Branding', 'Web Design'],
      timeline: '8 Weeks',
      role: 'Art Director & Designer',
      techStack: ['React', 'Tailwind', 'Contentful'],
      results: '55% increase in class bookings, 40% boost in student engagement',
    },
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
        desktop: ['https://picsum.photos/seed/loris-desk1/1400/800'],
      },
      {
        type: 'banner',
        src: 'https://picsum.photos/seed/loris-banner/1400/350',
        alt: "Lori's banner",
      },
    ],
    publishedAt: '2025-04-01T00:00:00.000Z',
  },
  {
    slug: 'lightwaves',
    title: 'Lightwaves',
    subtitle: 'CREATIVE AGENCY PORTFOLIO',
    category: 'Art Direction & Web Design',
    year: '2023',
    heroImageUrl: 'https://picsum.photos/seed/lightwaves-hero/1400/900',
    imageUrl: 'https://picsum.photos/seed/lightwaves/800/600',
    overview:
      'Creative agency portfolio with immersive visual experience. Light as a design language. The site plays with luminance and transparency to create a memorable digital presence that reflects the agency creative philosophy.',
    description:
      'Creative agency portfolio with immersive visual experience. Light as a design language.',
    techStack: ['React', 'Three.js', 'GSAP'],
    credits: [
      { role: 'Design', value: 'Dikshant Yadav' },
      { role: 'Development', value: 'Dikshant Yadav' },
    ],
    bento: {
      story: 'Creative agency portfolio with immersive visual experience. Light as a design language. The site plays with luminance and transparency to create a memorable digital presence.',
      client: 'Lightwaves Agency',
      year: '2023',
      services: ['Art Direction', 'Web Design', 'Development'],
      timeline: '10 Weeks',
      role: 'Lead Designer & Developer',
      techStack: ['React', 'Three.js', 'GSAP'],
      results: '70% increase in client inquiries, 50% boost in portfolio views',
    },
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
    publishedAt: '2024-06-01T00:00:00.000Z',
  },
];

const BLOCK_ROW_HEIGHT = 160;

function toCanvasData(seed: SeedWork) {
  const nodes: Array<Record<string, any>> = [];
  const pushNode = (type: string, data: Record<string, any>) => {
    nodes.push({
      id: crypto.randomUUID(),
      type,
      position: { x: 0, y: nodes.length * BLOCK_ROW_HEIGHT },
      data,
    });
  };

  pushNode('bento', seed.bento);
  for (const block of seed.contentBlocks) {
    const { type, ...data } = block;
    pushNode(type, data);
  }

  return { nodes, edges: [] };
}

async function ensureAdmin() {
  const existing = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash('dikshant_secure_password_123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@dikshantyadav.in',
      name: 'Dikshant Yadav',
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log('[SEED] Created bootstrap admin: admin@dikshantyadav.in');
  return admin;
}

async function main() {
  const admin = await ensureAdmin();

  for (const seed of SEED_WORKS) {
    const canvasData = toCanvasData(seed);
    const data = {
      authorId: admin.id,
      title: seed.title,
      slug: seed.slug,
      subtitle: seed.subtitle,
      category: seed.category,
      year: seed.year,
      heroImageUrl: seed.heroImageUrl,
      imageUrl: seed.imageUrl,
      overview: seed.overview,
      description: seed.description,
      techStack: seed.techStack,
      credits: seed.credits,
      status: 'PUBLISHED' as const,
      seoTitle: seed.title,
      seoDescription: seed.overview,
      canvasData,
      currentVersion: 1,
      publishedAt: new Date(seed.publishedAt),
    };

    await prisma.work.upsert({
      where: { slug: seed.slug },
      update: data,
      create: data,
    });
    console.log(`[SEED] Upserted work: ${seed.slug}`);
  }

  const total = await prisma.work.count({ where: { status: 'PUBLISHED' } });
  console.log(`[SEED] Done. ${total} published work(s) in database.`);
}

main()
  .catch((error) => {
    console.error('[SEED] Failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
