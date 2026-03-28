"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Plus, Pencil, Music } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

export default function ArtistReleasesPage() {
  const [, setArtistId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: artist } = await supabase.from("artists").select("id").eq("user_id", user.id).single();
      if (artist) {
        setArtistId(artist.id);
        // Fetch releases via join table
        const { data: links } = await supabase.from("release_artists").select("release_id").eq("artist_id", artist.id);
        const releaseIds = (links || []).map((l: { release_id: string }) => l.release_id);
        if (releaseIds.length > 0) {
          const { data: relData } = await supabase
            .from("releases")
            .select("*")
            .in("id", releaseIds)
            .order("release_date", { ascending: false });
          setReleases(relData || []);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-display-md text-cobalt font-display font-extrabold uppercase">My Releases</h1>
          <p className="text-cobalt/40 font-body text-sm">Manage your music releases</p>
        </div>
        <Link href={`/artist-releases/new`}>
          <Button><Plus className="w-4 h-4 mr-2" />New Release</Button>
        </Link>
      </div>

      {releases.length === 0 ? (
        <div className="text-center py-16 card-editorial">
          <Music className="w-10 h-10 text-cobalt/20 mx-auto mb-3" />
          <p className="text-cobalt/30 font-body">No releases yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {releases.map((r) => (
            <div key={r.id} className="card-editorial p-5 flex items-center gap-4">
              {r.cover_art_url ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative">
                  <Image src={r.cover_art_url} alt={r.title} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-cobalt/5 flex items-center justify-center flex-shrink-0">
                  <Music className="w-6 h-6 text-cobalt/30" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-cobalt uppercase tracking-wide text-sm">{r.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="accent">{r.release_type}</Badge>
                  {r.release_date && <span className="text-xs text-cobalt/30 font-body">{formatDate(r.release_date)}</span>}
                </div>
              </div>
              <Badge variant={r.is_published ? "success" : "warning"}>{r.is_published ? "Live" : "Draft"}</Badge>
              <Link href={`/artist-releases/${r.id}`}>
                <Button variant="ghost" size="sm"><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
