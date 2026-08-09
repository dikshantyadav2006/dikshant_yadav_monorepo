'use client';

import { WorkDetail } from '@/types/project';
import CaseStudyHero from './CaseStudyHero';
import AboutSection from './AboutSection';
import ContentBlockRenderer from './ContentBlockRenderer';
import CreditsSection from './CreditsSection';
import NextProjectSection from './NextProjectSection';

interface CaseStudyPageProps {
  project: WorkDetail;
}

export default function CaseStudyPage({ project }: CaseStudyPageProps) {
  const blocks = project.contentBlocks ?? [];

  return (
    <div>
      <CaseStudyHero
        image={project.heroImageUrl ?? ''}
        title={project.title}
        subtitle={project.subtitle ?? ''}
      />

      {/* Divider */}
      <div className="h-[1px] bg-border mx-1 my-[60px]" />

      <AboutSection overview={project.overview ?? ''} title={project.title} />

      {blocks.length > 0 && <ContentBlockRenderer blocks={blocks} />}

      <CreditsSection credits={project.credits ?? []} year={project.year ?? ''} />

      <NextProjectSection prevProject={project.prev ?? null} nextProject={project.next ?? null} />
    </div>
  );
}
