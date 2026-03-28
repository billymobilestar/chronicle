"use client";

import { useState, useEffect } from "react";
import PostCard from "./PostCard";
import { Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { ArtistPost } from "@/lib/types";

export default function FeedList({
  userId,
  filterFollowed,
}: {
  userId: string | null;
  filterFollowed?: boolean;
}) {
  const [posts, setPosts] = useState<ArtistPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();

    const supabase = getSupabaseBrowser();
    const channel = supabase
      .channel("feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "artist_posts" },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filterFollowed]);

  async function fetchPosts() {
    const params = new URLSearchParams();
    if (filterFollowed) params.set("followed", "true");

    const res = await fetch(`/api/artist-posts?${params}`);
    if (res.ok) {
      const data = await res.json();
      setPosts(data);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">
          {filterFollowed
            ? "Follow some artists to see their posts here!"
            : "No posts yet. Check back soon!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} userId={userId} />
      ))}
    </div>
  );
}
