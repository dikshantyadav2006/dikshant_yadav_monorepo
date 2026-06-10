import React from 'react';
import PostForm from '../../../../components/post-form';

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Post</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new article for dikshant.post
        </p>
      </div>
      <PostForm />
    </div>
  );
}
