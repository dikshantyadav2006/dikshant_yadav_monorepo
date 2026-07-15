import { projects } from '@/lib/projects';
import WorksHero from '@/components/works/WorksHero';
import WorksHeader from '@/components/works/WorksHeader';
import ProjectGrid from '@/components/works/ProjectGrid';
import WorksCTA from '@/components/works/WorksCTA';
import ComingSoon from '@/components/works/ComingSoon';
import ReachOut from '@/components/works/ReachOut';

export default function WorksPage() {
  return (
    <main className="min-h-screen">
      <WorksHero />
      <div className="max-w-[1800px] mx-auto px-1">
        <WorksHeader />
        <ProjectGrid projects={projects} />
        <WorksCTA />
        <ComingSoon />
        <ReachOut />
      </div>
    </main>
  );
}
