import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getProjectBySlug, getAdjacentProjects, projects } from '@/lib/projects';
import CaseStudyPage from '@/components/project/CaseStudyPage';
import ReachOut from '@/components/works/ReachOut';

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

  return {
    title: `${project.title} — Dikshant Yadav`,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const { prev, next } = getAdjacentProjects(slug);

  return (
    <main className="min-h-screen">
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
