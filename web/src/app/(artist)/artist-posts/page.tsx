"use client";

import { useState, useEffect } from "react";
import PostComposer from "@/components/feed/PostComposer";
import PostCard from "@/components/feed/PostCard";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { Loader2 } from "lucide-react";
import type { ArtistPost, Artist } from "@/lib/types";

export default function ArtistPostsPage() {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [posts, setPosts] = useState<ArtistPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: artistData } = await supabase
        .from("artists")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (artistData) {
        setArtist(artistData);
        fetchPosts(artistData.id);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function fetchPosts(artistId: string) {
    const res = await fetch(`/api/artist-posts?artist_id=${artistId}`);
    if (res.ok) {
      const data = await res.json();
      setPosts(data);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  if (!artist) {
    return <div className="text-center py-20"><p className="text-gray-500">No artist profile found.</p></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cobalt">My Posts</h1>
        <p className="text-gray-500 text-sm">Share updates with your fans</p>
      </div>

      <div className="space-y-6">
        <PostComposer
          artistId={artist.id}
          onPostCreated={() => fetchPosts(artist.id)}
        />

        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} userId={userId} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">You haven&apos;t posted anything yet. Share your first update!</p>
          </div>
        )}
      </div>
    </div>
  );
}
