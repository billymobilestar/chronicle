import { redirect } from "next/navigation";
import { getUser, getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import FanSidebar from "@/components/layout/FanSidebar";
import ArtistSidebar from "@/components/layout/ArtistSidebar";
import AdminSidebar from "@/components/layout/AdminSidebar";
import MobileShell from "@/components/layout/MobileShell";
import FeedList from "@/components/feed/FeedList";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Community" };

export default async function CommunityPage() {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  const profile = await getCurrentUser();
  const role = profile?.role || "fan";

  let artistSlug: string | undefined;
  if (role === "artist") {
    const supabase = getSupabaseAdmin();
    const { data: artist } = await supabase.from("artists").select("slug").eq("user_id", user.id).single();
    artistSlug = artist?.slug;
  }

  const sidebar = role === "admin"
    ? <AdminSidebar />
    : role === "artist"
    ? <ArtistSidebar userId={user.id} artistSlug={artistSlug} />
    : <FanSidebar userId={user.id} />;

  return (
    <MobileShell sidebar={sidebar} label={role === "admin" ? "Admin" : role === "artist" ? "Artist" : "Fan"}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-display-md text-cobalt font-display font-extrabold uppercase">Community</h1>
          <p className="text-cobalt/40 font-body text-sm">All posts from artists and Chronicle Records</p>
        </div>
        <FeedList userId={user.id} />
      </div>
    </MobileShell>
  );
}
