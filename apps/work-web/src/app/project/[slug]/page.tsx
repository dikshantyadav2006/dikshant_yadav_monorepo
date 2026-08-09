import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getWorks, getWork } from '@/lib/api';
import CaseStudyPage from '@/components/project/CaseStudyPage';
import { AccentProvider } from '@/components/project/AccentContext';
import ColorTracker from '@/components/ui/ColorTracker';
import ReachOut from '@/components/works/ReachOut';

export const revalidate = 60;

const SITE_URL = 'https://work.dikshantyadav.in';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const works = await getWorks();
  return works.map((work) => ({
    slug: work.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getWork(slug);
  if (!project) return { title: 'Not Found' };

  const canonical = `${SITE_URL}/project/${slug}`;

  return {
    title: project.title,
    description: project.description ?? undefined,
    openGraph: {
      title: `${project.title} — Dikshant Yadav`,
      description: project.description ?? undefined,
      type: 'website',
      url: canonical,
      images: project.heroImageUrl
        ? [
            {
              url: project.heroImageUrl,
              width: 1400,
              height: 900,
              alt: project.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} — Dikshant Yadav`,
      description: project.description ?? undefined,
      images: project.heroImageUrl ? [project.heroImageUrl] : undefined,
    },
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getWork(slug);

  if (!project) {
    notFound();
  }

  const canonical = `${SITE_URL}/project/${slug}`;

  const bentoBlock = project.contentBlocks?.find((block) => block.type === 'bento');
  const about = bentoBlock?.type === 'bento' ? bentoBlock.services.join(', ') : undefined;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    url: canonical,
    author: {
      '@type': 'Person',
      name: 'Dikshant Yadav',
      url: 'https://www.dikshantyadav.in',
    },
    dateCreated: project.year,
    keywords: project.techStack?.join(', '),
    ...(about && { about }),
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="max-w-[1800px] mx-auto px-1">
        {/* Back link */}
        <div className="pt-6">
          <Link
            href="/"
            className="font-sans text-[11px] uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity duration-300"
          >
            ← Back to Works
          </Link>
        </div>

        <AccentProvider swatchColor={project.swatchColor} heroImageUrl={project.heroImageUrl}>
          <CaseStudyPage project={project} />
          <ColorTracker />
        </AccentProvider>
      </div>

      <ReachOut />
    </main>
  );
}
