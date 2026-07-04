import { notFound } from 'next/navigation';
import { ContentRenderer } from '@dikshant/ui';
import { type Block } from '@dikshant/types';
import { resolveBlocks } from '@/lib/canvas';

interface Props {
  params: Promise<{ token: string }>;
}

async function getSharedPost(token: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const res = await fetch(`${apiUrl}/share/${token}`, { cache: 'no-store' });

  if (!res.ok) return null;
  return res.json();
}

export default async function SharedPostPage({ params }: Props) {
  const { token } = await params;
  const data = await getSharedPost(token);

  if (!data?.post) {
    notFound();
  }

  const { post } = data;

  let blocks: Block[] = [];
  if (post.canvasData) {
    blocks = resolveBlocks(post.canvasData);
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-[680px] mx-auto px-4 sm:px-8 py-12">
        <div className="mb-8 pb-8 border-b-2 border-foreground">
          <h1 className="editorial-headline text-4xl sm:text-5xl mb-4">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-muted-foreground font-serif italic">
              {post.excerpt}
            </p>
          )}
        </div>

        {blocks.length > 0 ? (
          <ContentRenderer blocks={blocks} />
        ) : (
          <p className="text-center py-12 text-muted-foreground font-serif italic">
            This shared dossier contains no content blocks.
          </p>
        )}
      </div>
    </main>
  );
}
