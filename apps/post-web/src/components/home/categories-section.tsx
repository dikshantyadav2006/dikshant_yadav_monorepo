import Link from 'next/link';
import type { Category } from '@dikshant/types';
import DossierFrame from '@/components/layout/dossier-frame';
import DossierLabel from '@/components/ui/dossier-label';

interface CategoriesSectionProps {
  categories: Category[];
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <section>
      <DossierLabel className="mb-2">Archive Index</DossierLabel>
      <h2 className="font-display text-3xl mb-8 section-rule">Categories</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/categories/${cat.slug}`}>
            <DossierFrame className="h-full hover:-translate-y-0.5 transition-transform cursor-pointer group">
              <DossierLabel>Section</DossierLabel>
              <h3 className="font-display text-xl mt-2 group-hover:underline underline-offset-4">
                {cat.name}
              </h3>
              {cat.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{cat.description}</p>
              )}
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-4">
                View dossiers →
              </p>
            </DossierFrame>
          </Link>
        ))}
      </div>
    </section>
  );
}
