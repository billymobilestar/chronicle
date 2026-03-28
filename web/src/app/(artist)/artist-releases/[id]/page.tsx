"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Input from "@/components/ui/Input";
import { Textarea, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { RELEASE_TYPES, STREAMING_PLATFORMS } from "@/lib/constants";
import ArtistMultiSelect from "@/components/admin/ArtistMultiSelect";
import { ArrowLeft, Save, Trash2, Upload, X, Loader2, ImageIcon, Check } from "lucide-react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

interface FetchedThumb {
  url: string;
  image: string;
  source: string;
}

export default function ArtistEditReleasePage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const [, setCurrentArtistId] = useState<string | null>(null);
  // Details
  const [title, setTitle] = useState("");
  const [artistIds, setArtistIds] = useState<string[]>([]);
  const [releaseType, setReleaseType] = useState("single");
  const [releaseDate, setReleaseDate] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  // Streaming links
  const [streamingLinks, setStreamingLinks] = useState<Record<string, string>>({});
  // Cover art
  const [coverArtUrl, setCoverArtUrl] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [fetchedThumbs, setFetchedThumbs] = useState<FetchedThumb[]>([]);
  const [fetchingThumbs, setFetchingThumbs] = useState(false);
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: artist } = await supabase.from("artists").select("id").eq("user_id", user.id).single();
      if (artist) {
        setCurrentArtistId(artist.id);
        if (isNew) {
          setArtistIds([artist.id]); // Pre-select self
        }
      }

      if (!isNew) {
        const res = await fetch(`/api/releases/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title);
          setReleaseType(data.release_type);
          setReleaseDate(data.release_date || "");
          setDescription(data.description || "");
          setIsPublished(data.is_published);
          setStreamingLinks(data.streaming_links || {});
          setCoverArtUrl(data.cover_art_url || null);
          if (data.artists && data.artists.length > 0) {
            setArtistIds(
              data.artists
                .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
                .map((ra: { artist_id: string }) => ra.artist_id)
            );
          } else if (data.artist_id) {
            setArtistIds([data.artist_id]);
          }
        }
      }
      setLoading(false);
    }
    load();
  }, [id, isNew]);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "release-covers");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      setCoverArtUrl((await res.json()).url);
      toast("Cover uploaded!");
    } else toast("Failed to upload", "error");
    setUploadingCover(false);
  }

  async function fetchThumbnails() {
    const urls = Object.values(streamingLinks).filter((url) => url.trim());
    if (urls.length === 0) { toast("Add some streaming links first", "info"); return; }
    setFetchingThumbs(true);
    setFetchedThumbs([]);
    try {
      const res = await fetch("/api/fetch-thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      if (res.ok) {
        const data = await res.json();
        setFetchedThumbs(data.thumbnails || []);
        if (data.thumbnails.length === 0) toast("No thumbnails found", "info");
      }
    } catch { toast("Failed to fetch thumbnails", "error"); }
    setFetchingThumbs(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      title,
      artist_ids: artistIds,
      release_type: releaseType,
      release_date: releaseDate || null,
      description,
      is_published: isPublished,
      streaming_links: streamingLinks,
      cover_art_url: coverArtUrl,
    };
    const res = isNew
      ? await fetch("/api/releases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch(`/api/releases/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      toast(isNew ? "Release created!" : "Updated!");
      router.push("/artist-releases");
    } else toast("Failed to save", "error");
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this release?")) return;
    const res = await fetch(`/api/releases/${id}`, { method: "DELETE" });
    if (res.ok) { toast("Deleted"); router.push("/artist-releases"); }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-2xl">
      <Link href="/artist-releases" className="inline-flex items-center gap-2 text-sm font-body text-cobalt/40 hover:text-cobalt mb-6">
        <ArrowLeft className="w-4 h-4" />Back to Releases
      </Link>
      <h1 className="text-display-md text-cobalt font-display font-extrabold uppercase mb-8">
        {isNew ? "New Release" : "Edit Release"}
      </h1>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Details */}
        <section className="card-editorial p-6 space-y-4">
          <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide">Details</h2>
          <Input id="title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <ArtistMultiSelect selectedIds={artistIds} onChange={setArtistIds} label="Artists" />
          <Select id="releaseType" label="Release Type" value={releaseType} onChange={(e) => setReleaseType(e.target.value)} options={RELEASE_TYPES.map((t) => ({ value: t.value, label: t.label }))} />
          <Input id="releaseDate" label="Release Date" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
          <Textarea id="description" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="rounded" />
            <span className="text-sm text-cobalt/60 font-body">Published</span>
          </label>
        </section>

        {/* Cover Art */}
        <section className="card-editorial p-6 space-y-4">
          <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide">Cover Art</h2>
          {coverArtUrl ? (
            <div className="relative w-48 h-48 rounded-2xl overflow-hidden bg-cobalt/5">
              <Image src={coverArtUrl} alt="Cover art" fill className="object-cover" />
              <button type="button" onClick={() => setCoverArtUrl(null)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-48 h-48 rounded-2xl border-2 border-dashed border-cobalt/15 bg-cobalt/5 cursor-pointer hover:border-accent hover:bg-accent/5 transition-all">
              {uploadingCover ? <Loader2 className="w-6 h-6 text-accent animate-spin" /> : (
                <><Upload className="w-6 h-6 text-cobalt/30 mb-2" /><span className="text-xs font-display font-bold uppercase tracking-wider text-cobalt/30">Upload Cover</span></>
              )}
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
          )}
          <div className="pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={fetchThumbnails} loading={fetchingThumbs}>
              <ImageIcon className="w-4 h-4 mr-2" />Auto-fetch from streaming links
            </Button>
            <p className="text-[10px] text-cobalt/30 font-body mt-1">Fetches album art from Spotify, Apple Music, YouTube, SoundCloud.</p>
          </div>
          {fetchedThumbs.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-display font-bold uppercase tracking-widest text-cobalt/60">Choose a cover ({fetchedThumbs.length} found)</p>
              <div className="grid grid-cols-3 gap-3">
                {fetchedThumbs.map((thumb, i) => (
                  <button key={i} type="button" onClick={() => { setCoverArtUrl(thumb.image); setFetchedThumbs([]); toast(`Using cover from ${thumb.source}`); }}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${coverArtUrl === thumb.image ? "border-accent shadow-lg" : "border-cobalt/10 hover:border-accent/50"}`}>
                    <img src={thumb.image} alt={thumb.source} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-cobalt-dark/80 px-2 py-1">
                      <span className="text-[9px] font-display font-bold uppercase tracking-wider text-white">{thumb.source}</span>
                    </div>
                    {coverArtUrl === thumb.image && <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-accent rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Streaming Links */}
        <section className="card-editorial p-6 space-y-4">
          <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide">Streaming Platforms</h2>
          <p className="text-xs text-cobalt/30 font-body">Add links to where this release can be streamed or purchased.</p>
          {STREAMING_PLATFORMS.map((p) => (
            <Input key={p.key} id={`r-stream-${p.key}`} label={p.label} value={streamingLinks[p.key] || ""} onChange={(e) => setStreamingLinks({ ...streamingLinks, [p.key]: e.target.value })} placeholder={`https://...`} />
          ))}
        </section>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Button type="submit" loading={saving} size="lg"><Save className="w-4 h-4 mr-2" />{isNew ? "Create Release" : "Save Changes"}</Button>
          {!isNew && <Button type="button" variant="danger" size="lg" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>}
        </div>
      </form>
    </div>
  );
}
