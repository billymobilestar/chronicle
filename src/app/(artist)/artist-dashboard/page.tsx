import { getUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { Users, PenSquare, Heart } from "lucide-react";
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
        <p className="text-gray-500">No artist profile linked to your account.</p>
      </div>
    );
  }

  const { count: followerCount } = await supabase
    .from("fan_follows")
    .select("*", { count: "exact", head: true })
    .eq("artist_id", artist.id);

  const { count: postCount } = await supabase
    .from("artist_posts")
    .select("*", { count: "exact", head: true })
    .eq("artist_id", artist.id);

  const { count: totalReactions } = await supabase
    .from("post_reactions")
    .select("*, artist_posts!inner(artist_id)", { count: "exact", head: true })
    .eq("artist_posts.artist_id", artist.id);

  const stats = [
    { label: "Followers", value: followerCount || 0, icon: Users },
    { label: "Posts", value: postCount || 0, icon: PenSquare },
    { label: "Reactions", value: totalReactions || 0, icon: Heart },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-cobalt">
          Welcome back, {artist.name}
        </h1>
        <p className="text-gray-500 text-sm">Here&apos;s how your profile is doing</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm text-gray-500">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-cobalt">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
