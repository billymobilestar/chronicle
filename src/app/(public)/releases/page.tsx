import { getSupabaseAdmin } from "@/lib/supabase";
import ReleaseCard from "@/components/releases/ReleaseCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Releases",
  description: "Latest music releases from Chronicle Records.",
};

export const revalidate = 60;

export default async function ReleasesPage() {
  const supabase = getSupabaseAdmin();
  const { data: releases } = await supabase
    .from("releases")
    .select("*, artist:artists(id, name, slug)")
    .eq("is_published", true)
    .order("release_date", { ascending: false });

  return (
    <div>
      <div className="bg-cobalt-dark py-20 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto">
          <p className="font-display font-bold text-xs uppercase tracking-[0.2em] text-accent-glow mb-4">
            New Music
          </p>
          <h1 className="text-display-lg text-white font-display font-extrabold uppercase">
            Releases
          </h1>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        {releases && releases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {releases.map((release) => (
              <ReleaseCard key={release.id} release={release} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-20">&#x1F3B5;</div>
            <p className="text-cobalt/30 text-lg font-display font-bold uppercase">New music coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
