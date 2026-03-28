"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { STREAMING_PLATFORMS, SOCIAL_PLATFORMS } from "@/lib/constants";
import { ArrowLeft, Save, Trash2, Upload, X, Plus } from "lucide-react";
import Link from "next/link";
import type { Artist } from "@/lib/types";

export default function EditArtistPage() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  // Basic info
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [genre, setGenre] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  // Images
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  // Links
  const [streamingLinks, setStreamingLinks] = useState<Record<string, string>>({});
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  // Videos
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase.from("artists").select("*").eq("id", id).single();
      if (data) {
        setArtist(data);
        setName(data.name);
        setSlug(data.slug);
        setBio(data.bio || "");
        setShortBio(data.short_bio || "");
        setGenre(data.genre || "");
        setIsActive(data.is_active);
        setIsFeatured(data.is_featured || false);
        setProfileImageUrl(data.profile_image_url);
        setBannerImageUrl(data.banner_image_url);
        setStreamingLinks(data.streaming_links || {});
        setSocialLinks(data.social_links || {});
        setVideoUrls(data.video_urls || []);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function uploadImage(file: File, bucket: string): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      return data.url;
    }
    toast("Failed to upload image", "error");
    return null;
  }

  async function handleProfileImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProfile(true);
    const url = await uploadImage(file, "artist-images");
    if (url) setProfileImageUrl(url);
    setUploadingProfile(false);
  }

  async function handleBannerImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    const url = await uploadImage(file, "artist-images");
    if (url) setBannerImageUrl(url);
    setUploadingBanner(false);
  }

  function addVideo() {
    if (newVideoUrl.trim()) {
      setVideoUrls([...videoUrls, newVideoUrl.trim()]);
      setNewVideoUrl("");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(`/api/artists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        bio,
        short_bio: shortBio,
        genre,
        is_active: isActive,
        is_featured: isFeatured,
        profile_image_url: profileImageUrl,
        banner_image_url: bannerImageUrl,
        streaming_links: streamingLinks,
        social_links: socialLinks,
        video_urls: videoUrls,
      }),
    });

    if (res.ok) {
      toast("Artist updated!");
    } else {
      toast("Failed to update", "error");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this artist?")) return;
    const res = await fetch(`/api/artists/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Artist deleted");
      router.push("/admin/artists");
    } else {
      toast("Failed to delete", "error");
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>;
  if (!artist) return <p className="text-cobalt/40 font-body py-20 text-center">Artist not found</p>;

  return (
    <div className="max-w-2xl">
      <Link href="/admin/artists" className="inline-flex items-center gap-2 text-sm font-body text-cobalt/40 hover:text-cobalt mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Artists
      </Link>

      <h1 className="text-display-md text-cobalt font-display font-extrabold uppercase mb-8">Edit {artist.name}</h1>

      <form onSubmit={handleSave} className="space-y-8">

        {/* ===================== PHOTOS ===================== */}
        <section className="card-editorial p-6 space-y-6">
          <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide">Photos</h2>

          {/* Banner */}
          <div>
            <label className="block text-xs font-display font-bold uppercase tracking-widest text-cobalt/60 mb-2">Banner Image</label>
            {bannerImageUrl ? (
              <div className="relative aspect-[3/1] rounded-2xl overflow-hidden bg-cobalt/5">
                <Image src={bannerImageUrl} alt="Banner" fill className="object-cover" />
                <button type="button" onClick={() => setBannerImageUrl(null)} className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[3/1] rounded-2xl border-2 border-dashed border-cobalt/15 bg-cobalt/5 cursor-pointer hover:border-accent hover:bg-accent/5 transition-all">
                {uploadingBanner ? <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" /> : (
                  <><Upload className="w-6 h-6 text-cobalt/30 mb-2" /><span className="text-xs font-display font-bold uppercase tracking-wider text-cobalt/30">Upload Banner</span></>
                )}
                <input type="file" accept="image/*" onChange={handleBannerImage} className="hidden" />
              </label>
            )}
          </div>

          {/* Profile Photo */}
          <div>
            <label className="block text-xs font-display font-bold uppercase tracking-widest text-cobalt/60 mb-2">Profile Photo</label>
            <div className="flex items-center gap-4">
              {profileImageUrl ? (
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-cobalt/5 flex-shrink-0">
                  <Image src={profileImageUrl} alt="Profile" fill className="object-cover" />
                  <button type="button" onClick={() => setProfileImageUrl(null)} className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-28 h-28 rounded-2xl border-2 border-dashed border-cobalt/15 bg-cobalt/5 cursor-pointer hover:border-accent hover:bg-accent/5 transition-all flex-shrink-0">
                  {uploadingProfile ? <div className="animate-spin w-5 h-5 border-2 border-accent border-t-transparent rounded-full" /> : (
                    <><Upload className="w-5 h-5 text-cobalt/30 mb-1" /><span className="text-[10px] font-display font-bold uppercase tracking-wider text-cobalt/30">Upload</span></>
                  )}
                  <input type="file" accept="image/*" onChange={handleProfileImage} className="hidden" />
                </label>
              )}
              <p className="text-xs text-cobalt/30 font-body">Square image recommended.</p>
            </div>
          </div>
        </section>

        {/* ===================== BASIC INFO ===================== */}
        <section className="card-editorial p-6 space-y-4">
          <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide">Basic Info</h2>
          <Input id="name" label="Artist Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input id="slug" label="URL Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Input id="genre" label="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
          <Input id="shortBio" label="Short Bio" value={shortBio} onChange={(e) => setShortBio(e.target.value)} placeholder="One-liner tagline" />
          <Textarea id="bio" label="Full Bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Full artist biography..." />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
            <span className="text-sm text-cobalt/60 font-body">Active (visible on public site)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded" />
            <span className="text-sm text-cobalt/60 font-body">Featured (shown on homepage)</span>
          </label>
        </section>

        {/* ===================== STREAMING LINKS ===================== */}
        <section className="card-editorial p-6 space-y-4">
          <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide">Streaming Platforms</h2>
          <p className="text-xs text-cobalt/30 font-body">Add links to the artist&apos;s music on each platform.</p>
          {STREAMING_PLATFORMS.map((p) => (
            <Input
              key={p.key}
              id={`stream-${p.key}`}
              label={p.label}
              value={streamingLinks[p.key] || ""}
              onChange={(e) => setStreamingLinks({ ...streamingLinks, [p.key]: e.target.value })}
              placeholder={`https://${p.key.replace("_", "")}.com/...`}
            />
          ))}
        </section>

        {/* ===================== SOCIAL LINKS ===================== */}
        <section className="card-editorial p-6 space-y-4">
          <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide">Social Media</h2>
          <p className="text-xs text-cobalt/30 font-body">Links to the artist&apos;s social profiles.</p>
          {SOCIAL_PLATFORMS.map((p) => (
            <Input
              key={p.key}
              id={`social-${p.key}`}
              label={p.label}
              value={socialLinks[p.key] || ""}
              onChange={(e) => setSocialLinks({ ...socialLinks, [p.key]: e.target.value })}
              placeholder={`https://${p.key}.com/...`}
            />
          ))}
        </section>

        {/* ===================== VIDEOS ===================== */}
        <section className="card-editorial p-6 space-y-4">
          <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide">Official Videos</h2>
          <p className="text-xs text-cobalt/30 font-body">YouTube video URLs that will display on the artist&apos;s profile as a video grid.</p>

          {videoUrls.length > 0 && (
            <div className="space-y-2">
              {videoUrls.map((url, i) => (
                <div key={i} className="flex items-center gap-2 bg-cobalt/5 rounded-xl px-4 py-2.5">
                  <span className="flex-1 text-sm text-cobalt/60 font-body truncate">{url}</span>
                  <button
                    type="button"
                    onClick={() => setVideoUrls(videoUrls.filter((_, j) => j !== i))}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                id="newVideo"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVideo(); } }}
              />
            </div>
            <Button type="button" variant="secondary" onClick={addVideo} className="flex-shrink-0 self-end">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </section>

        {/* ===================== ACTIONS ===================== */}
        <div className="flex gap-3 pb-8">
          <Button type="submit" loading={saving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            Save All Changes
          </Button>
          <Button type="button" variant="danger" size="lg" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Artist
          </Button>
        </div>
      </form>
    </div>
  );
}
