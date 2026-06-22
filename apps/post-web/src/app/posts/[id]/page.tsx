import { redirect, notFound } from 'next/navigation';
import { getPost, getPostPath } from '@/lib/posts';

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Legacy route — redirects to /posts/[id]/[slug] */
export default async function LegacyPostRedirect({ params }: PageProps) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();
  redirect(getPostPath(post));
}
