"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import Link from "next/link";

export default function NewArtistPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [genre, setGenre] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const res = await fetch("/api/artists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        slug: slug || slugify(name),
        bio,
        short_bio: shortBio,
        genre,
        profile_image_url: profileImageUrl,
        banner_image_url: bannerImageUrl,
      }),
    });

    if (res.ok) {
      toast("Artist created!");
      router.push("/admin/artists");
    } else {
      const data = await res.json();
      toast(data.error || "Failed to create artist", "error");
    }
    setSaving(false);
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/artists" className="inline-flex items-center gap-2 text-sm font-body text-cobalt/40 hover:text-cobalt mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Artists
      </Link>

      <h1 className="text-display-md text-cobalt font-display font-extrabold uppercase mb-8">Add New Artist</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Images */}
        <section className="card-editorial p-6 space-y-6">
          <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide">Photos</h2>

          {/* Banner */}
          <div>
            <label className="block text-xs font-display font-bold uppercase tracking-widest text-cobalt/60 mb-2">
              Banner Image
            </label>
            {bannerImageUrl ? (
              <div className="relative aspect-[3/1] rounded-2xl overflow-hidden bg-cobalt/5">
                <Image src={bannerImageUrl} alt="Banner" fill className="object-cover" />
                <button type="button" onClick={() => setBannerImageUrl(null)} className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[3/1] rounded-2xl border-2 border-dashed border-cobalt/15 bg-cobalt/5 cursor-pointer hover:border-accent hover:bg-accent/5 transition-all">
                {uploadingBanner ? (
                  <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-cobalt/30 mb-2" />
                    <span className="text-xs font-display font-bold uppercase tracking-wider text-cobalt/30">Upload Banner</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleBannerImage} className="hidden" />
              </label>
            )}
          </div>

          {/* Profile */}
          <div>
            <label className="block text-xs font-display font-bold uppercase tracking-widest text-cobalt/60 mb-2">
              Profile Photo
            </label>
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
                  {uploadingProfile ? (
                    <div className="animate-spin w-5 h-5 border-2 border-accent border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-cobalt/30 mb-1" />
                      <span className="text-[10px] font-display font-bold uppercase tracking-wider text-cobalt/30">Upload</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleProfileImage} className="hidden" />
                </label>
              )}
              <p className="text-xs text-cobalt/30 font-body">Square image recommended.</p>
            </div>
          </div>
        </section>

        {/* Basic Info */}
        <section className="card-editorial p-6 space-y-4">
          <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide">Basic Info</h2>
          <Input
            id="name"
            label="Artist Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug || slug === slugify(name)) {
                setSlug(slugify(e.target.value));
              }
            }}
            required
          />
          <Input id="slug" label="URL Slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated-from-name" />
          <Input id="genre" label="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
          <Input id="shortBio" label="Short Bio" value={shortBio} onChange={(e) => setShortBio(e.target.value)} placeholder="One-liner" />
          <Textarea id="bio" label="Full Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        </section>

        <Button type="submit" loading={saving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          Create Artist
        </Button>
      </form>
    </div>
  );
}
