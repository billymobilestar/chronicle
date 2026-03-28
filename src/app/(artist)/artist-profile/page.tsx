"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { STREAMING_PLATFORMS, SOCIAL_PLATFORMS } from "@/lib/constants";
import { Plus, X, Save } from "lucide-react";
import type { Artist } from "@/lib/types";

export default function ArtistProfileEditorPage() {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [genre, setGenre] = useState("");
  const [streamingLinks, setStreamingLinks] = useState<Record<string, string>>({});
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("artists")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setArtist(data);
        setBio(data.bio || "");
        setShortBio(data.short_bio || "");
        setGenre(data.genre || "");
        setStreamingLinks(data.streaming_links || {});
        setSocialLinks(data.social_links || {});
        setVideoUrls(data.video_urls || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!artist) return;
    setSaving(true);

    const supabase = getSupabaseBrowser();
    const { error } = await supabase
      .from("artists")
      .update({
        bio,
        short_bio: shortBio,
        genre,
        streaming_links: streamingLinks,
        social_links: socialLinks,
        video_urls: videoUrls,
      })
      .eq("id", artist.id);

    if (error) {
      toast("Failed to save", "error");
    } else {
      toast("Profile updated!");
    }
    setSaving(false);
  }

  function addVideo() {
    if (newVideoUrl.trim()) {
      setVideoUrls([...videoUrls, newVideoUrl.trim()]);
      setNewVideoUrl("");
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>;
  }

  if (!artist) {
    return <div className="text-center py-20"><p className="text-gray-500">No artist profile found.</p></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cobalt">Edit Profile</h1>
        <p className="text-gray-500 text-sm">Update your artist information</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-cobalt">Basic Info</h2>
          <Input id="genre" label="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="e.g. Hip Hop, R&B" />
          <Input id="shortBio" label="Short Bio (one-liner)" value={shortBio} onChange={(e) => setShortBio(e.target.value)} placeholder="A brief tagline" />
          <Textarea id="bio" label="Full Bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell fans about yourself..." />
        </section>

        {/* Streaming Links */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-cobalt">Streaming Platforms</h2>
          {STREAMING_PLATFORMS.map((p) => (
            <Input
              key={p.key}
              id={`stream-${p.key}`}
              label={p.label}
              value={streamingLinks[p.key] || ""}
              onChange={(e) => setStreamingLinks({ ...streamingLinks, [p.key]: e.target.value })}
              placeholder={`Your ${p.label} URL`}
            />
          ))}
        </section>

        {/* Social Links */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-cobalt">Social Media</h2>
          {SOCIAL_PLATFORMS.map((p) => (
            <Input
              key={p.key}
              id={`social-${p.key}`}
              label={p.label}
              value={socialLinks[p.key] || ""}
              onChange={(e) => setSocialLinks({ ...socialLinks, [p.key]: e.target.value })}
              placeholder={`Your ${p.label} URL`}
            />
          ))}
        </section>

        {/* Videos */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-cobalt">Official Videos</h2>
          <div className="space-y-2">
            {videoUrls.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-1 text-sm text-gray-600 truncate">{url}</span>
                <button
                  type="button"
                  onClick={() => setVideoUrls(videoUrls.filter((_, j) => j !== i))}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              id="newVideo"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              placeholder="YouTube video URL"
              className="flex-1"
            />
            <Button type="button" variant="secondary" onClick={addVideo}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </section>

        <Button type="submit" loading={saving} size="lg">
          <Save className="w-5 h-5 mr-2" />
          Save Changes
        </Button>
      </form>
    </div>
  );
}
