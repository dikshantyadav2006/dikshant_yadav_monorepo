'use client';

import { Project } from '@/types/project';
import CaseStudyHero from './CaseStudyHero';
import AboutSection from './AboutSection';
import SectionHeading from './SectionHeading';
import ContentBlockRenderer from './ContentBlockRenderer';
import ProjectBento from './ProjectBento';
import CreditsSection from './CreditsSection';
import NextProjectSection from './NextProjectSection';

interface CaseStudyPageProps {
  project: Project;
}

export default function CaseStudyPage({ project }: CaseStudyPageProps) {
  const hasBranding = project.contentBlocks.some(
    (b) => b.type === 'large-image' || b.type === 'posters' || b.type === 'grid-2' || b.type === 'banner'
  );
  const hasWebsite = project.contentBlocks.some(
    (b) => b.type === 'desktop-showcase' || b.type === 'mobile-showcase'
  );

  return (
    <div>
      <CaseStudyHero
        image={project.heroImage}
        title={project.title}
        subtitle={project.subtitle}
      />

      {/* Divider */}
      <div className="h-[1px] bg-border mx-1 my-[60px]" />

      <AboutSection overview={project.overview} title={project.title} />

      {project.bento && <ProjectBento {...project.bento} />}

      {hasBranding && (
        <>
          <SectionHeading title="Brand Identity" subtitle="Visual System" />
          <ContentBlockRenderer
            blocks={project.contentBlocks.filter(
              (b) =>
                b.type === 'large-image' ||
                b.type === 'grid-2' ||
                b.type === 'banner' ||
                b.type === 'posters'
            )}
          />
        </>
      )}

      {hasWebsite && (
        <>
          <SectionHeading title="The Website" subtitle="Digital Experience" />
          <ContentBlockRenderer
            blocks={project.contentBlocks.filter(
              (b) => b.type === 'desktop-showcase' || b.type === 'mobile-showcase'
            )}
          />
        </>
      )}

      <CreditsSection credits={project.credits} year={project.year} />

      <NextProjectSection
        title={project.nextProject.title}
        image={project.nextProject.image}
        slug={project.nextProject.slug}
      />
    </div>
  );
}
