'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiFetch from '@/lib/api';

interface ReactionBoardProps {
  postId: string;
}

type ReactionKey = 'FIRE' | 'LOVE' | 'INSIGHTFUL';

const REACTIONS: Record<ReactionKey, { emoji: string; type: string }> = {
  FIRE: { emoji: '🔥', type: 'FIRE' },
  LOVE: { emoji: '🚀', type: 'LOVE' },
  INSIGHTFUL: { emoji: '🧠', type: 'INSIGHTFUL' },
};

export default function ReactionBoard({ postId }: ReactionBoardProps) {
  const queryClient = useQueryClient();

  const { data: reactionData, isLoading } = useQuery({
    queryKey: ['reactions', postId],
    queryFn: () => apiFetch<{ counts: Record<string, number>; userReactions: string[] }>(`/reactions/${postId}`),
    enabled: !!postId,
  });

  const mutation = useMutation({
    mutationFn: (type: string) =>
      apiFetch('/reactions', { method: 'POST', body: JSON.stringify({ postId, type }) }),
    onSuccess: (data) => {
      queryClient.setQueryData(['reactions', postId], {
        counts: data.counts,
        userReactions: data.userReactions,
      });
    },
  });

  const counts = reactionData?.counts || { FIRE: 0, LOVE: 0, INSIGHTFUL: 0, LIKE: 0 };
  const userReactions = reactionData?.userReactions || [];

  if (isLoading) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-14 animate-pulse bg-secondary border border-foreground/20" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="dossier-label mb-3">Reader Response</p>
      <div className="flex gap-2">
        {(Object.keys(REACTIONS) as ReactionKey[]).map((key) => {
          const { emoji, type } = REACTIONS[key];
          const count = counts[type] || 0;
          const active = userReactions.includes(type);

          return (
            <button
              key={key}
              onClick={() => !mutation.isPending && mutation.mutate(type)}
              className={`flex items-center gap-1.5 px-3 py-2 border-2 font-mono text-xs transition-colors ${
                active
                  ? 'bg-foreground text-card border-foreground'
                  : 'border-foreground/30 hover:border-foreground'
              }`}
            >
              <span>{emoji}</span>
              <span>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
