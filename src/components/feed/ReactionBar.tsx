"use client";

import { useState } from "react";
import { REACTION_EMOJIS, REACTION_TYPES, type ReactionType } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function ReactionBar({
  postId,
  reactionCounts,
  userId,
}: {
  postId: string;
  reactionCounts: Partial<Record<ReactionType, number>>;
  userId: string | null;
}) {
  const [counts, setCounts] = useState(reactionCounts);
  const [userReactions, setUserReactions] = useState<Set<ReactionType>>(new Set());

  async function toggleReaction(reaction: ReactionType) {
    if (!userId) {
      window.location.href = "/sign-in";
      return;
    }

    const isActive = userReactions.has(reaction);

    // Optimistic update
    const newReactions = new Set(userReactions);
    const newCounts = { ...counts };
    if (isActive) {
      newReactions.delete(reaction);
      newCounts[reaction] = Math.max(0, (newCounts[reaction] || 0) - 1);
    } else {
      newReactions.add(reaction);
      newCounts[reaction] = (newCounts[reaction] || 0) + 1;
    }
    setUserReactions(newReactions);
    setCounts(newCounts);

    await fetch(`/api/artist-posts/${postId}/reactions`, {
      method: isActive ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reaction }),
    });
  }

  return (
    <div className="flex items-center gap-1">
      {REACTION_TYPES.map((reaction) => {
        const count = counts[reaction] || 0;
        const isActive = userReactions.has(reaction);
        return (
          <button
            key={reaction}
            onClick={() => toggleReaction(reaction)}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all",
              isActive
                ? "bg-accent/10 text-accent"
                : "hover:bg-gray-100 text-gray-500"
            )}
          >
            <span>{REACTION_EMOJIS[reaction]}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
