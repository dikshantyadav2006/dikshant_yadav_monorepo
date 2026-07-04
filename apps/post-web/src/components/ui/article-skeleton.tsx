export default function ArticleSkeleton() {
  return (
    <div className="article-skeleton" aria-hidden="true">
      <div className="space-y-6 pb-8 border-b-2 border-foreground">
        <div className="skeleton-line h-3 w-28" />
        <div className="skeleton-line h-3 w-36" />
        <div className="space-y-3 pt-2">
          <div className="skeleton-line h-10 w-full max-w-3xl" />
          <div className="skeleton-line h-10 w-4/5 max-w-2xl" />
        </div>
        <div className="skeleton-line h-5 w-full max-w-xl" />
      </div>

      <div className="metadata-bar mt-8">
        <div className="skeleton-line h-3 w-24" />
        <div className="skeleton-line h-3 w-20" />
        <div className="skeleton-line h-3 w-16" />
      </div>

      <div className="my-10 border-2 border-foreground overflow-hidden">
        <div className="skeleton-shimmer aspect-[21/9] w-full bg-secondary" />
        <div className="border-t-2 border-foreground px-4 py-2">
          <div className="skeleton-line h-3 w-40" />
        </div>
      </div>

      <div className="grid gap-12 xl:grid-cols-[1fr_220px] mt-10">
        <div className="reading-column space-y-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="skeleton-line h-4"
              style={{ width: `${88 - (index % 3) * 12}%` }}
            />
          ))}
          <div className="skeleton-line h-4 w-2/3" />
        </div>

        <aside className="hidden xl:block space-y-3">
          <div className="skeleton-line h-3 w-24" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton-line h-3 w-full" />
          ))}
        </aside>
      </div>
    </div>
  );
}

export function RelatedArticlesSkeleton() {
  return (
    <section className="mt-16 pt-10 border-t-2 border-foreground" aria-hidden="true">
      <div className="skeleton-line h-3 w-28 mb-2" />
      <div className="skeleton-line h-7 w-48 mb-8" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="dossier-frame p-5 space-y-4">
            <div className="skeleton-shimmer aspect-[16/10] w-full -mx-5 -mt-5 mb-4 border-b-2 border-foreground" />
            <div className="skeleton-line h-3 w-24" />
            <div className="skeleton-line h-6 w-full" />
            <div className="skeleton-line h-4 w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
