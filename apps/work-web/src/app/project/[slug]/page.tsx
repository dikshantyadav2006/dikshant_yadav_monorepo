import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getProjectBySlug, getAdjacentProjects, projects } from '@/lib/projects';
import CaseStudyPage from '@/components/project/CaseStudyPage';
import ReachOut from '@/components/works/ReachOut';

const SITE_URL = 'https://work.dikshantyadav.in';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: 'Not Found' };

  const canonical = `${SITE_URL}/project/${slug}`;

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: `${project.title} — Dikshant Yadav`,
      description: project.description,
      type: 'website',
      url: canonical,
      images: project.heroImage
        ? [
            {
              url: project.heroImage,
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
      description: project.description,
      images: project.heroImage ? [project.heroImage] : undefined,
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
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const { prev, next } = getAdjacentProjects(slug);
  const canonical = `${SITE_URL}/project/${slug}`;

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
    ...(project.bento?.services && {
      about: project.bento.services.join(', '),
    }),
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

        <CaseStudyPage
          project={project}
          prevProject={prev ? { title: prev.title, image: prev.image, slug: prev.slug } : null}
          nextProject={next ? { title: next.title, image: next.image, slug: next.slug } : null}
        />
      </div>

      <ReachOut />
    </main>
  );
}
