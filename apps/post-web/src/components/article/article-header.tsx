import Link from 'next/link';
import type { Post } from '@dikshant/types';
import DossierLabel from '@/components/ui/dossier-label';
import ArchiveStamp from '@/components/ui/archive-stamp';
import { formatDate, formatDossierId } from '@/lib/utils';
import { getPostTags } from '@/lib/posts';

interface ArticleHeaderProps {
  post: Post;
}

export default function ArticleHeader({ post }: ArticleHeaderProps) {
  const tags = getPostTags(post);

  return (
    <header className="relative space-y-6 pb-8 border-b-2 border-foreground">
      <ArchiveStamp
        text={post.featured ? 'Priority' : 'Published'}
        className="absolute -top-2 right-0 hidden md:block"
      />

      <Link
        href="/"
        className="inline-block font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Return to Archive
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <DossierLabel variant="classified">
          {post.category?.name || 'Intelligence Report'}
        </DossierLabel>
        <span className="font-mono text-[10px] text-muted-foreground">
          Ref: {formatDossierId(post.id)}
        </span>
      </div>

      <h1 className="editorial-headline text-4xl sm:text-5xl md:text-6xl max-w-4xl">
        {post.title}
      </h1>

      {post.excerpt && (
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl font-serif italic">
          {post.excerpt}
        </p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="font-mono text-[10px] uppercase tracking-wider border border-foreground/30 px-2 py-0.5 hover:bg-foreground hover:text-card transition-colors"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
