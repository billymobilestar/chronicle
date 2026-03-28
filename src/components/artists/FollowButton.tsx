"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import Button from "@/components/ui/Button";

export default function FollowButton({
  artistId,
  initialFollowing,
  userId,
}: {
  artistId: string;
  initialFollowing: boolean;
  userId: string | null;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function toggleFollow() {
    if (!userId) {
      window.location.href = "/sign-in";
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/follows", {
        method: following ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artist_id: artistId }),
      });

      if (res.ok) {
        setFollowing(!following);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={following ? "secondary" : "primary"}
      size="md"
      loading={loading}
      onClick={toggleFollow}
    >
      <Heart className={`w-4 h-4 mr-2 ${following ? "fill-current" : ""}`} />
      {following ? "Following" : "Follow"}
    </Button>
  );
}
