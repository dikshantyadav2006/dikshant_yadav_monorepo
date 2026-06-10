'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import apiFetch from '../lib/api';

interface ReactionBoardProps {
  postId: string;
}

type ReactionKey = 'FIRE' | 'LOVE' | 'INSIGHTFUL';

const REACTION_CONFIG: Record<ReactionKey, { emoji: string; label: string; prismaType: string }> = {
  FIRE: { emoji: '🔥', label: 'Hot', prismaType: 'FIRE' },
  LOVE: { emoji: '🚀', label: 'Rocket', prismaType: 'LOVE' },
  INSIGHTFUL: { emoji: '🧠', label: 'Mind Blown', prismaType: 'INSIGHTFUL' },
};

export function ReactionBoard({ postId }: ReactionBoardProps) {
  const queryClient = useQueryClient();

  const { data: reactionData, isLoading } = useQuery({
    queryKey: ['reactions', postId],
    queryFn: () => apiFetch(`/reactions/${postId}`),
    enabled: !!postId,
  });

  const mutation = useMutation({
    mutationFn: (type: string) =>
      apiFetch('/reactions', {
        method: 'POST',
        body: JSON.stringify({ postId, type }),
      }),
    onSuccess: (data, variables) => {
      // Optimistic update or refetch
      queryClient.setQueryData(['reactions', postId], {
        counts: data.counts,
        userReactions: data.userReactions,
      });

      // Fire confetti if reaction was added (and not removed)
      if (data.reacted) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#a855f7', '#6366f1', '#06b6d4'],
        });
      }
    },
  });

  const handleReact = (type: string) => {
    if (mutation.isPending) return;
    mutation.mutate(type);
  };

  const counts = reactionData?.counts || { FIRE: 0, LOVE: 0, INSIGHTFUL: 0, LIKE: 0 };
  const userReactions = reactionData?.userReactions || [];

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-16 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
        Reactions
      </h4>
      <div className="flex items-center gap-3">
        {(Object.keys(REACTION_CONFIG) as ReactionKey[]).map((key) => {
          const config = REACTION_CONFIG[key];
          const count = counts[config.prismaType as keyof typeof counts] || 0;
          const hasReacted = userReactions.includes(config.prismaType);

          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleReact(config.prismaType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${
                hasReacted
                  ? 'bg-accent/10 border-accent text-accent shadow-glow-accent'
                  : 'bg-card/50 hover:bg-card border-border hover:border-muted-foreground/30 text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-lg">{config.emoji}</span>
              <span>{count}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
export default ReactionBoard;
