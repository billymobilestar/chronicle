"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { Plus, Pencil, Video } from "lucide-react";
import { getYouTubeId } from "@/lib/utils";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function ArtistVideosPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: artist } = await supabase.from("artists").select("id").eq("user_id", user.id).single();
      if (artist) {
        const res = await fetch(`/api/videos?artist_id=${artist.id}`);
        if (res.ok) setVideos(await res.json());
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
          <h1 className="text-display-md text-cobalt font-display font-extrabold uppercase">My Videos</h1>
          <p className="text-cobalt/40 font-body text-sm">Manage your official videos</p>
        </div>
        <Link href="/artist-videos/new">
          <Button><Plus className="w-4 h-4 mr-2" />Add Video</Button>
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-16 card-editorial">
          <Video className="w-10 h-10 text-cobalt/20 mx-auto mb-3" />
          <p className="text-cobalt/30 font-body">No videos yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => {
            const ytId = getYouTubeId(video.youtube_url);
            return (
              <div key={video.id} className="card-editorial p-5 flex gap-5 items-center">
                {ytId && (
                  <div className="w-32 aspect-video rounded-xl overflow-hidden bg-cobalt/5 flex-shrink-0">
                    <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-cobalt uppercase tracking-wide text-sm truncate">
                    {video.title || video.youtube_url}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {(video.artists || []).map((va: { artist_id: string; artist?: { name: string; profile_image_url: string | null } }) => (
                      <div key={va.artist_id} className="flex items-center gap-1.5 bg-cobalt/5 rounded-full px-2.5 py-1">
                        <Avatar src={va.artist?.profile_image_url} alt={va.artist?.name || ""} size="sm" />
                        <span className="text-[10px] font-display font-bold uppercase tracking-wider text-cobalt/60">{va.artist?.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Badge variant={video.is_published ? "success" : "warning"}>
                  {video.is_published ? "Published" : "Draft"}
                </Badge>
                <Link href={`/artist-videos/${video.id}`}>
                  <Button variant="ghost" size="sm"><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
