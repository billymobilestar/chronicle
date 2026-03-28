import { getUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Users, PenSquare, Music, Video, Calendar, ShoppingBag, ArrowRight, ExternalLink } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatDate, getYouTubeId } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Artist Dashboard" };

export default async function ArtistDashboardPage() {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  const supabase = getSupabaseAdmin();

  const { data: artist } = await supabase
    .from("artists")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!artist) {
    return (
      <div className="text-center py-20">
        <p className="text-cobalt/40 font-body">No artist profile linked to your account.</p>
      </div>
    );
  }

  // Stats
  const [
    { count: followerCount },
    { count: postCount },
  ] = await Promise.all([
    supabase.from("fan_follows").select("*", { count: "exact", head: true }).eq("artist_id", artist.id),
    supabase.from("artist_posts").select("*", { count: "exact", head: true }).eq("artist_id", artist.id),
  ]);

  // Releases via join table
  const { data: releaseLinks } = await supabase
    .from("release_artists")
    .select("release_id")
    .eq("artist_id", artist.id);
  const releaseIds = (releaseLinks || []).map((r) => r.release_id);

  let releases: { id: string; title: string; release_type: string; release_date: string | null; cover_art_url: string | null; is_published: boolean }[] = [];
  if (releaseIds.length > 0) {
    const { data } = await supabase
      .from("releases")
      .select("id, title, release_type, release_date, cover_art_url, is_published")
      .in("id", releaseIds)
      .order("release_date", { ascending: false })
      .limit(5);
    releases = data || [];
  }

  // Videos via join table
  const { data: videoLinks } = await supabase
    .from("video_artists")
    .select("video_id")
    .eq("artist_id", artist.id);
  const videoIds = (videoLinks || []).map((v) => v.video_id);

  let videos: { id: string; title: string | null; youtube_url: string }[] = [];
  if (videoIds.length > 0) {
    const { data } = await supabase
      .from("videos")
      .select("id, title, youtube_url")
      .in("id", videoIds)
      .eq("is_published", true)
      .order("sort_order")
      .limit(6);
    videos = data || [];
  }

  // Events
  const { data: events } = await supabase
    .from("events")
    .select("id, title, event_date, venue, city")
    .eq("artist_id", artist.id)
    .gte("event_date", new Date().toISOString().split("T")[0])
    .order("event_date", { ascending: true })
    .limit(4);

  // Merch
  const { data: merch } = await supabase
    .from("merch_items")
    .select("id, name, price, category")
    .eq("artist_id", artist.id)
    .eq("is_available", true)
    .order("sort_order")
    .limit(4);

  // Recent posts
  const { data: recentPosts } = await supabase
    .from("artist_posts")
    .select("id, title, content, post_type, created_at")
    .eq("artist_id", artist.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const stats = [
    { label: "Followers", value: followerCount || 0, icon: Users },
    { label: "Posts", value: postCount || 0, icon: PenSquare },
    { label: "Releases", value: releases.length, icon: Music },
    { label: "Videos", value: videos.length, icon: Video },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-display-md text-cobalt font-display font-extrabold uppercase">
          {artist.name}
        </h1>
        <p className="text-cobalt/40 font-body mt-1">Artist Dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card-editorial p-5">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-accent" />
              <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-cobalt/40">{stat.label}</span>
            </div>
            <p className="text-2xl font-display font-extrabold text-cobalt">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Releases */}
      <DashboardSection title="My Releases" icon={Music} href="/artist-releases" count={releases.length}>
        {releases.length === 0 ? (
          <p className="text-cobalt/30 font-body text-sm py-4">No releases yet.</p>
        ) : (
          <div className="space-y-2">
            {releases.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-cobalt/5">
                {r.cover_art_url ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <Image src={r.cover_art_url} alt={r.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-cobalt/10 flex items-center justify-center flex-shrink-0">
                    <Music className="w-4 h-4 text-cobalt/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display font-bold text-cobalt uppercase tracking-wide truncate">{r.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="accent">{r.release_type}</Badge>
                    {r.release_date && <span className="text-[10px] text-cobalt/30 font-body">{formatDate(r.release_date)}</span>}
                  </div>
                </div>
                <Badge variant={r.is_published ? "success" : "warning"}>{r.is_published ? "Live" : "Draft"}</Badge>
              </div>
            ))}
          </div>
        )}
      </DashboardSection>

      {/* Videos */}
      <DashboardSection title="My Videos" icon={Video} href="/artist-profile" count={videos.length}>
        {videos.length === 0 ? (
          <p className="text-cobalt/30 font-body text-sm py-4">No videos linked yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {videos.map((v) => {
              const ytId = getYouTubeId(v.youtube_url);
              return ytId ? (
                <div key={v.id} className="space-y-1.5">
                  <div className="aspect-video rounded-xl overflow-hidden bg-cobalt/5 relative">
                    <Image src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={v.title || ""} fill className="object-cover" />
                  </div>
                  {v.title && <p className="text-[10px] font-display font-bold text-cobalt/60 uppercase tracking-wider truncate">{v.title}</p>}
                </div>
              ) : null;
            })}
          </div>
        )}
      </DashboardSection>

      {/* Events */}
      <DashboardSection title="Upcoming Events" icon={Calendar} href="/artist-events" count={(events || []).length}>
        {!events || events.length === 0 ? (
          <p className="text-cobalt/30 font-body text-sm py-4">No upcoming events.</p>
        ) : (
          <div className="space-y-2">
            {events.map((e) => (
              <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-cobalt/5">
                <div className="w-10 h-10 rounded-lg bg-cobalt text-white flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-sm font-display font-extrabold leading-none">{new Date(e.event_date).getDate()}</span>
                  <span className="text-[8px] font-display font-bold uppercase">{new Date(e.event_date).toLocaleString("en", { month: "short" })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display font-bold text-cobalt uppercase tracking-wide truncate">{e.title}</p>
                  {e.venue && <p className="text-[10px] text-cobalt/30 font-body">{e.venue}{e.city ? `, ${e.city}` : ""}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardSection>

      {/* Merch */}
      <DashboardSection title="My Merch" icon={ShoppingBag} href="/artist-merch" count={(merch || []).length}>
        {!merch || merch.length === 0 ? (
          <p className="text-cobalt/30 font-body text-sm py-4">No merch items.</p>
        ) : (
          <div className="space-y-2">
            {merch.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-cobalt/5">
                <div className="w-10 h-10 rounded-lg bg-cobalt/10 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-4 h-4 text-cobalt/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display font-bold text-cobalt uppercase tracking-wide truncate">{m.name}</p>
                  <div className="flex items-center gap-2">
                    {m.category && <Badge>{m.category}</Badge>}
                    {m.price && <span className="text-xs font-display font-bold text-cobalt">${m.price}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardSection>

      {/* Recent Posts */}
      <DashboardSection title="Recent Posts" icon={PenSquare} href="/artist-posts" count={(recentPosts || []).length}>
        {!recentPosts || recentPosts.length === 0 ? (
          <p className="text-cobalt/30 font-body text-sm py-4">No posts yet.</p>
        ) : (
          <div className="space-y-2">
            {recentPosts.map((p) => (
              <div key={p.id} className="p-3 rounded-xl bg-cobalt/5">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="accent">{p.post_type}</Badge>
                  <span className="text-[10px] text-cobalt/30 font-body">{formatDate(p.created_at)}</span>
                </div>
                {p.title && <p className="text-sm font-display font-bold text-cobalt uppercase tracking-wide">{p.title}</p>}
                <p className="text-xs text-cobalt/50 font-body line-clamp-2">{p.content}</p>
              </div>
            ))}
          </div>
        )}
      </DashboardSection>

      {/* Public profile link */}
      <Link
        href={`/artists/${artist.slug}`}
        className="card-editorial p-5 flex items-center justify-between hover:border-accent/30 transition-all group"
      >
        <div className="flex items-center gap-3">
          <ExternalLink className="w-5 h-5 text-accent" />
          <span className="font-display font-bold text-cobalt uppercase tracking-wide text-sm group-hover:text-accent transition-colors">
            View Public Profile
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-cobalt/30 group-hover:text-accent transition-colors" />
      </Link>
    </div>
  );
}

function DashboardSection({
  title, icon: Icon, href, count, children,
}: {
  title: string; icon: React.ElementType; href: string; count: number; children: React.ReactNode;
}) {
  return (
    <div className="card-editorial p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-accent" />
          <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide text-sm">{title}</h2>
          <span className="text-[10px] font-display font-bold text-cobalt/30 bg-cobalt/5 px-2 py-0.5 rounded-full">{count}</span>
        </div>
        <Link href={href} className="text-[10px] font-display font-bold uppercase tracking-widest text-cobalt/30 hover:text-accent transition-colors flex items-center gap-1">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {children}
    </div>
  );
}
