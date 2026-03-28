import { getSupabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import Image from "next/image";
import { notFound } from "next/navigation";
import StreamingLinks from "@/components/artists/StreamingLinks";
import VideoGrid from "@/components/artists/VideoGrid";
import FollowButton from "@/components/artists/FollowButton";
import ReleaseCard from "@/components/releases/ReleaseCard";
import Badge from "@/components/ui/Badge";
import { ExternalLink } from "lucide-react";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import type { Metadata } from "next";
import type { Release } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = getSupabaseAdmin();
  const { data: artist } = await supabase
    .from("artists")
    .select("name, short_bio")
    .eq("slug", params.slug)
    .single();

  if (!artist) return { title: "Artist Not Found" };
  return {
    title: artist.name,
    description: artist.short_bio || `${artist.name} on Chronicle Records.`,
  };
}

export default async function ArtistProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = getSupabaseAdmin();

  const { data: artist } = await supabase
    .from("artists")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single();

  if (!artist) notFound();

  const user = await getUser();

  let isFollowing = false;
  if (user) {
    const { data: follow } = await supabase
      .from("fan_follows")
      .select("id")
      .eq("fan_user_id", user.id)
      .eq("artist_id", artist.id)
      .single();
    isFollowing = !!follow;
  }

  // Fetch releases via join table
  const { data: releaseArtistLinks } = await supabase
    .from("release_artists")
    .select("release_id")
    .eq("artist_id", artist.id);

  const releaseIds = (releaseArtistLinks || []).map((ra) => ra.release_id);
  let releases: Release[] = [];
  if (releaseIds.length > 0) {
    const { data: relData } = await supabase
      .from("releases")
      .select("*")
      .in("id", releaseIds)
      .eq("is_published", true)
      .order("release_date", { ascending: false })
      .limit(6);

    // Attach all artists for each release
    const { data: allReleaseArtists } = await supabase
      .from("release_artists")
      .select("*, artist:artists(id, name, slug, profile_image_url)")
      .in("release_id", releaseIds);

    releases = (relData || []).map((r) => ({
      ...r,
      artists: (allReleaseArtists || []).filter((ra) => ra.release_id === r.id),
      artist: (allReleaseArtists || []).find((ra) => ra.release_id === r.id && ra.role === "primary")?.artist || null,
    }));
  }

  // Fetch videos via join table
  const { data: videoArtistLinks } = await supabase
    .from("video_artists")
    .select("video_id")
    .eq("artist_id", artist.id);

  const videoIds = (videoArtistLinks || []).map((va) => va.video_id);
  let videos: string[] = [];
  if (videoIds.length > 0) {
    const { data: vidData } = await supabase
      .from("videos")
      .select("youtube_url")
      .in("id", videoIds)
      .eq("is_published", true)
      .order("sort_order");
    videos = (vidData || []).map((v) => v.youtube_url);
  }

  // Follower count
  const { count: followerCount } = await supabase
    .from("fan_follows")
    .select("*", { count: "exact", head: true })
    .eq("artist_id", artist.id);

  const socialEntries = Object.entries(
    (artist.social_links || {}) as Record<string, string>
  ).filter(([, url]) => url);

  return (
    <div>
      {/* Banner */}
      <div className="relative h-48 sm:h-64 md:h-80 bg-gradient-cobalt">
        {artist.banner_image_url && (
          <Image
            src={artist.banner_image_url}
            alt={`${artist.name} banner`}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile header */}
        <div className="relative -mt-16 sm:-mt-20 mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-5">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-pale-sky flex-shrink-0">
            {artist.profile_image_url ? (
              <Image
                src={artist.profile_image_url}
                alt={artist.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-cobalt">
                <span className="text-5xl font-bold text-white">
                  {artist.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-cobalt">
                {artist.name}
              </h1>
              {artist.genre && <Badge className="text-sm">{artist.genre}</Badge>}
            </div>
            <p className="text-gray-500 text-sm">
              {followerCount || 0} followers
            </p>
          </div>

          <FollowButton
            artistId={artist.id}
            initialFollowing={isFollowing}
            userId={user?.id ?? null}
          />
        </div>

        {/* Bio */}
        {artist.bio && (
          <div className="mb-10">
            <p className="text-gray-700 leading-relaxed max-w-3xl whitespace-pre-wrap">
              {artist.bio}
            </p>
          </div>
        )}

        {/* Social Links */}
        {socialEntries.length > 0 && (
          <div className="mb-10">
            <h3 className="font-bold text-cobalt text-lg mb-3">Connect</h3>
            <div className="flex flex-wrap gap-2">
              {socialEntries.map(([key, url]) => {
                const platform = SOCIAL_PLATFORMS.find((p) => p.key === key);
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-cobalt hover:border-accent hover:text-accent transition-all"
                  >
                    {platform?.label || key}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Streaming Links */}
        <div className="mb-10">
          <StreamingLinks links={artist.streaming_links || {}} />
        </div>

        {/* Video Grid */}
        <div className="mb-10">
          <VideoGrid videoUrls={videos} />
        </div>

        {/* Releases */}
        {releases && releases.length > 0 && (
          <div className="mb-10">
            <h3 className="font-bold text-cobalt text-lg mb-4">Releases</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {releases.map((release) => (
                <ReleaseCard key={release.id} release={release} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
