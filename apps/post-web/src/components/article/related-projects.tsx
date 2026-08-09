import type { LinkedWork } from '@/lib/posts';
import { WORK_SITE_URL } from '@/lib/constants';
import DossierLabel from '@/components/ui/dossier-label';

interface RelatedProjectsProps {
  works: LinkedWork[];
}

export default function RelatedProjects({ works }: RelatedProjectsProps) {
  if (works.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t-2 border-foreground">
      <DossierLabel className="mb-2">Field Notes</DossierLabel>
      <h2 className="font-display text-2xl mb-8">Related Projects</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((work) => {
          const cover = work.imageUrl || work.heroImageUrl;
          return (
            <a
              key={work.id}
              href={`${WORK_SITE_URL}/project/${work.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col h-full"
            >
              {cover && (
                <div className="relative aspect-[16/10] overflow-hidden border-2 border-foreground">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover}
                    alt={work.title}
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              )}
              <div className="flex flex-col justify-between flex-1 pt-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    {work.category || (work.year ? `Case Study ${work.year}` : 'Case Study')}
                  </p>
                  <h3 className="font-display text-lg leading-snug group-hover:underline underline-offset-4 line-clamp-2">
                    {work.title}
                  </h3>
                </div>
                {work.subtitle && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{work.subtitle}</p>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
