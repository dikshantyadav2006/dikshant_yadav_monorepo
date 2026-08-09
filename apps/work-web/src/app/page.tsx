import { getWorks } from '@/lib/api';
import WorksHero from '@/components/works/WorksHero';
import ProjectGrid from '@/components/works/ProjectGrid';
import WorksCTA from '@/components/works/WorksCTA';
import ComingSoon from '@/components/works/ComingSoon';
import ReachOut from '@/components/works/ReachOut';

export const revalidate = 60;

export default async function WorksPage() {
  const works = await getWorks();

  return (
    <main className="min-h-screen">
      <WorksHero />
      <div className="max-w-[1800px] mx-auto px-1">
        <ProjectGrid projects={works} />
        <WorksCTA />
        <ComingSoon />
        <ReachOut />
      </div>
    </main>
  );
}
