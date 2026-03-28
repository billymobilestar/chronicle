import { getSupabaseAdmin } from "@/lib/supabase";
import ArtistCard from "@/components/artists/ArtistCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artists",
  description: "Discover the Chronicle Records artist roster.",
};

export const revalidate = 60;

export default async function ArtistsPage() {
  const supabase = getSupabaseAdmin();
  const { data: artists } = await supabase
    .from("artists")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  return (
    <div>
      {/* Header */}
      <div className="bg-cobalt-dark py-20 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto">
          <p className="font-display font-bold text-xs uppercase tracking-[0.2em] text-accent-glow mb-4">
            The Roster
          </p>
          <h1 className="text-display-lg text-white font-display font-extrabold uppercase">
            Our Artists
          </h1>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        {artists && artists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-cobalt/30 text-lg font-body">Artists coming soon. Stay tuned.</p>
          </div>
        )}
      </div>
    </div>
  );
}
