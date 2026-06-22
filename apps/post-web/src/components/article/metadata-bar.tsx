import { Clock, Eye, User, Calendar } from 'lucide-react';
import type { Post } from '@dikshant/types';
import { formatDate } from '@/lib/utils';

interface MetadataBarProps {
  post: Post;
}

export default function MetadataBar({ post }: MetadataBarProps) {
  return (
    <div className="metadata-bar text-muted-foreground my-8">
      <span className="flex items-center gap-1.5">
        <User className="h-3.5 w-3.5" />
        {post.author?.name || 'Dikshant Yadav'}
      </span>
      <span className="flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5" />
        {formatDate(post.publishedAt)}
      </span>
      <span className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" />
        {post.readingTime} min read
      </span>
      {post._count?.views !== undefined && (
        <span className="flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5" />
          {post._count.views} views
        </span>
      )}
      {post.category && (
        <span className="ml-auto font-bold text-foreground">
          {post.category.name}
        </span>
      )}
    </div>
  );
}
