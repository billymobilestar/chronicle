import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import ArtistSidebar from "@/components/layout/ArtistSidebar";
import MobileShell from "@/components/layout/MobileShell";

export default async function ArtistLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  const supabase = getSupabaseAdmin();
  const { data: artist } = await supabase
    .from("artists")
    .select("slug")
    .eq("user_id", user.id)
    .single();

  return (
    <MobileShell sidebar={<ArtistSidebar userId={user.id} artistSlug={artist?.slug} />} label="Artist">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
    </MobileShell>
  );
}
