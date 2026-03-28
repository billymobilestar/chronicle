"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { STREAMING_PLATFORMS, SOCIAL_PLATFORMS } from "@/lib/constants";
import { Pencil, Save, ExternalLink, Camera, ArrowRight, Music, Video } from "lucide-react";
import { getYouTubeId, formatDate } from "@/lib/utils";
import type { Artist } from "@/lib/types";

export default function ArtistProfileEditorPage() {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  // Editable fields
  const [bio, setBio] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [genre, setGenre] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const [streamingLinks, setStreamingLinks] = useState<Record<string, string>>({});
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  // Data from join tables (read-only on this page, managed via dedicated pages)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [releases, setReleases] = useState<any[]>([]);
  const [videos, setVideos] = useState<{ id: string; title: string | null; youtube_url: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.from("artists").select("*").eq("user_id", user.id).single();
      if (data) {
        setArtist(data);
        setBio(data.bio || "");
        setShortBio(data.short_bio || "");
        setGenre(data.genre || "");
        setProfileImageUrl(data.profile_image_url);
        setBannerImageUrl(data.banner_image_url);
        setStreamingLinks(data.streaming_links || {});
        setSocialLinks(data.social_links || {});

        // Fetch releases via join table
        const { data: relLinks } = await supabase.from("release_artists").select("release_id").eq("artist_id", data.id);
        const relIds = (relLinks || []).map((r: { release_id: string }) => r.release_id);
        if (relIds.length > 0) {
          const { data: relData } = await supabase.from("releases").select("id, title, release_type, release_date, cover_art_url, is_published").in("id", relIds).order("release_date", { ascending: false });
          setReleases(relData || []);
        }

        // Fetch videos via join table
        const { data: vidLinks } = await supabase.from("video_artists").select("video_id").eq("artist_id", data.id);
        const vidIds = (vidLinks || []).map((v: { video_id: string }) => v.video_id);
        if (vidIds.length > 0) {
          const { data: vidData } = await supabase.from("videos").select("id, title, youtube_url").in("id", vidIds).eq("is_published", true).order("sort_order");
          setVideos(vidData || []);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  async function uploadImage(file: File): Promise<string | null> {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "artist-images");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setUploading(false);
    if (res.ok) return (await res.json()).url;
    toast("Upload failed", "error");
    return null;
  }

  async function saveSection(fields: Record<string, unknown>) {
    if (!artist) return;
    setSaving(true);
    const res = await fetch(`/api/artists/${artist.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    if (res.ok) {
      toast("Saved!");
      setEditSection(null);
      const supabase = getSupabaseBrowser();
      const { data } = await supabase.from("artists").select("*").eq("id", artist.id).single();
      if (data) setArtist(data);
    } else {
      toast("Failed to save", "error");
    }
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>;
  if (!artist) return <div className="text-center py-20"><p className="text-cobalt/40 font-body">No artist profile found.</p></div>;

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8">
      {/* Banner */}
      <div className="relative h-56 sm:h-72 bg-gradient-editorial group">
        {bannerImageUrl && (
          <Image src={bannerImageUrl} alt="Banner" fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <label className="absolute top-4 right-4 p-2.5 bg-black/40 text-white rounded-xl cursor-pointer hover:bg-black/60 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100">
          {uploading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Camera className="w-5 h-5" />}
          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const url = await uploadImage(file);
            if (url) { setBannerImageUrl(url); saveSection({ banner_image_url: url }); }
          }} />
        </label>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* Profile header */}
        <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row items-start sm:items-end gap-5">
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-cobalt/10 flex-shrink-0 group">
            {profileImageUrl ? (
              <Image src={profileImageUrl} alt={artist.name} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-cobalt">
                <span className="text-4xl font-display font-extrabold text-white">{artist.name.charAt(0)}</span>
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = await uploadImage(file);
                if (url) { setProfileImageUrl(url); saveSection({ profile_image_url: url }); }
              }} />
            </label>
          </div>

          <div className="flex-1">
            <h1 className="text-display-md text-cobalt font-display font-extrabold uppercase">{artist.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {artist.genre && <Badge>{artist.genre}</Badge>}
              <span className="text-sm text-cobalt/30 font-body">/{artist.slug}</span>
            </div>
          </div>

          <Link href={`/artists/${artist.slug}`} className="inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest text-cobalt/40 hover:text-accent transition-colors">
            View Public <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Bio Section */}
        <Section
          title="About"
          isEditing={editSection === "bio"}
          onEdit={() => setEditSection("bio")}
          onSave={() => saveSection({ bio, short_bio: shortBio, genre })}
          onCancel={() => setEditSection(null)}
          saving={saving}
        >
          {editSection === "bio" ? (
            <div className="space-y-4">
              <Input id="genre" label="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
              <Input id="shortBio" label="Tagline" value={shortBio} onChange={(e) => setShortBio(e.target.value)} placeholder="One-liner" />
              <Textarea id="bio" label="Full Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
          ) : (
            <div>
              {artist.short_bio && <p className="text-sm text-accent font-display font-bold uppercase tracking-wider mb-3">{artist.short_bio}</p>}
              {artist.bio ? (
                <p className="text-sm text-cobalt/60 font-body whitespace-pre-wrap leading-relaxed">{artist.bio}</p>
              ) : (
                <p className="text-sm text-cobalt/30 font-body italic">No bio yet. Click edit to add one.</p>
              )}
            </div>
          )}
        </Section>

        {/* Streaming Links */}
        <Section
          title="Streaming Platforms"
          isEditing={editSection === "streaming"}
          onEdit={() => setEditSection("streaming")}
          onSave={() => saveSection({ streaming_links: streamingLinks })}
          onCancel={() => setEditSection(null)}
          saving={saving}
        >
          {editSection === "streaming" ? (
            <div className="space-y-3">
              {STREAMING_PLATFORMS.map((p) => (
                <Input key={p.key} id={`s-${p.key}`} label={p.label} value={streamingLinks[p.key] || ""} onChange={(e) => setStreamingLinks({ ...streamingLinks, [p.key]: e.target.value })} placeholder={`https://...`} />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {STREAMING_PLATFORMS.filter((p) => streamingLinks[p.key]).map((p) => (
                <a key={p.key} href={streamingLinks[p.key]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cobalt/5 text-sm font-body text-cobalt hover:bg-accent hover:text-white transition-all">
                  {p.label} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ))}
              {STREAMING_PLATFORMS.every((p) => !streamingLinks[p.key]) && (
                <p className="text-sm text-cobalt/30 font-body italic">No streaming links yet.</p>
              )}
            </div>
          )}
        </Section>

        {/* Social Links */}
        <Section
          title="Social Media"
          isEditing={editSection === "social"}
          onEdit={() => setEditSection("social")}
          onSave={() => saveSection({ social_links: socialLinks })}
          onCancel={() => setEditSection(null)}
          saving={saving}
        >
          {editSection === "social" ? (
            <div className="space-y-3">
              {SOCIAL_PLATFORMS.map((p) => (
                <Input key={p.key} id={`so-${p.key}`} label={p.label} value={socialLinks[p.key] || ""} onChange={(e) => setSocialLinks({ ...socialLinks, [p.key]: e.target.value })} placeholder={`https://...`} />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {SOCIAL_PLATFORMS.filter((p) => socialLinks[p.key]).map((p) => (
                <a key={p.key} href={socialLinks[p.key]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cobalt/5 text-sm font-body text-cobalt hover:bg-accent hover:text-white transition-all">
                  {p.label} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ))}
              {SOCIAL_PLATFORMS.every((p) => !socialLinks[p.key]) && (
                <p className="text-sm text-cobalt/30 font-body italic">No social links yet.</p>
              )}
            </div>
          )}
        </Section>

        {/* Releases (from join table - managed via /artist-releases) */}
        <div className="py-8 border-b border-cobalt/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide">Releases</h2>
            <Link href="/artist-releases" className="inline-flex items-center gap-1 text-[10px] font-display font-bold uppercase tracking-widest text-cobalt/40 hover:text-accent transition-colors">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {releases.length > 0 ? (
            <div className="space-y-2">
              {releases.map((r) => (
                <Link key={r.id} href={`/artist-releases/${r.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-cobalt/5 hover:bg-cobalt/10 transition-colors">
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
                  <Pencil className="w-3.5 h-3.5 text-cobalt/20" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-cobalt/30 font-body italic mb-3">No releases yet.</p>
              <Link href="/artist-releases/new"><Button size="sm">Add First Release</Button></Link>
            </div>
          )}
        </div>

        {/* Videos (from join table - managed via /artist-videos) */}
        <div className="py-8 border-b border-cobalt/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide">Official Videos</h2>
            <Link href="/artist-videos" className="inline-flex items-center gap-1 text-[10px] font-display font-bold uppercase tracking-widest text-cobalt/40 hover:text-accent transition-colors">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {videos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {videos.map((v) => {
                const ytId = getYouTubeId(v.youtube_url);
                return ytId ? (
                  <Link key={v.id} href={`/artist-videos/${v.id}`} className="group">
                    <div className="aspect-video rounded-xl overflow-hidden bg-cobalt/5 relative">
                      <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={v.title || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Video className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    {v.title && <p className="text-[10px] font-display font-bold text-cobalt/60 uppercase tracking-wider truncate mt-1.5">{v.title}</p>}
                  </Link>
                ) : null;
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-cobalt/30 font-body italic mb-3">No videos yet.</p>
              <Link href="/artist-videos/new"><Button size="sm">Add First Video</Button></Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title, isEditing, onEdit, onSave, onCancel, saving, children,
}: {
  title: string; isEditing: boolean; onEdit: () => void; onSave: () => void; onCancel: () => void; saving: boolean; children: React.ReactNode;
}) {
  return (
    <div className="py-8 border-b border-cobalt/5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide">{title}</h2>
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
            <Button size="sm" loading={saving} onClick={onSave}><Save className="w-3.5 h-3.5 mr-1" />Save</Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={onEdit}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
        )}
      </div>
      {children}
    </div>
  );
}
