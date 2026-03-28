"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import FeedList from "@/components/feed/FeedList";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { Users, Heart, ArrowRight } from "lucide-react";
import type { Artist } from "@/lib/types";

export default function FanFeedPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [followedArtists, setFollowedArtists] = useState<Artist[]>([]);
  const [suggestedArtists, setSuggestedArtists] = useState<Artist[]>([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();
      setDisplayName(profile?.display_name || "");

      // Get follows
      const { data: follows } = await supabase
        .from("fan_follows")
        .select("artist_id")
        .eq("fan_user_id", user.id);

      const followIds = (follows || []).map((f: { artist_id: string }) => f.artist_id);
      setFollowingCount(followIds.length);

      // Get followed artist details
      if (followIds.length > 0) {
        const { data: artists } = await supabase
          .from("artists")
          .select("*")
          .in("id", followIds)
          .eq("is_active", true);
        setFollowedArtists(artists || []);
      }

      // Get suggested (artists NOT followed)
      const { data: allArtists } = await supabase
        .from("artists")
        .select("*")
        .eq("is_active", true)
        .order("name")
        .limit(20);

      const suggested = (allArtists || []).filter((a: Artist) => !followIds.includes(a.id));
      setSuggestedArtists(suggested.slice(0, 6));

      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-display-md text-cobalt font-display font-extrabold uppercase">
          {getGreeting()}, {displayName || "Fan"}
        </h1>
        <p className="text-cobalt/40 font-body mt-1">
          {followingCount > 0
            ? `Following ${followingCount} artist${followingCount !== 1 ? "s" : ""}`
            : "Follow some artists to personalize your feed"}
        </p>
      </div>

      {/* Following horizontal scroll */}
      {followedArtists.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-accent" />
              Your Artists
            </h2>
            <Link href="/artists" className="text-[10px] font-display font-bold uppercase tracking-widest text-cobalt/30 hover:text-accent transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            {followedArtists.map((artist) => (
              <Link key={artist.id} href={`/artists/${artist.slug}`} className="flex-shrink-0 text-center group">
                <div className="w-16 h-16 rounded-2xl overflow-hidden mb-1.5 ring-2 ring-transparent group-hover:ring-accent transition-all">
                  <Avatar src={artist.profile_image_url} alt={artist.name} size="xl" />
                </div>
                <p className="text-[10px] font-display font-bold uppercase tracking-wider text-cobalt/60 group-hover:text-accent transition-colors truncate w-16">
                  {artist.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Suggested artists */}
      {suggestedArtists.length > 0 && followedArtists.length < 3 && (
        <div className="card-editorial p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-accent" />
            <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide text-sm">
              Suggested Artists
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {suggestedArtists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artists/${artist.slug}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-cobalt/5 transition-all group"
              >
                <Avatar src={artist.profile_image_url} alt={artist.name} size="md" />
                <div className="min-w-0">
                  <p className="text-sm font-display font-bold text-cobalt uppercase tracking-wide truncate group-hover:text-accent transition-colors">
                    {artist.name}
                  </p>
                  {artist.genre && (
                    <p className="text-[10px] text-cobalt/30 font-body">{artist.genre}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Feed */}
      <div>
        <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide text-sm mb-4">
          Your Feed
        </h2>
        <FeedList userId={userId} filterFollowed />
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}
