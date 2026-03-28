"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import ArtistMultiSelect from "@/components/admin/ArtistMultiSelect";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { getYouTubeId } from "@/lib/utils";

export default function EditVideoPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [description, setDescription] = useState("");
  const [artistIds, setArtistIds] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isNew) return;
    async function load() {
      const res = await fetch(`/api/videos/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title || "");
        setYoutubeUrl(data.youtube_url);
        setDescription(data.description || "");
        setIsPublished(data.is_published);
        if (data.artists) {
          setArtistIds(data.artists.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order).map((va: { artist_id: string }) => va.artist_id));
        }
      }
      setLoading(false);
    }
    load();
  }, [id, isNew]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;
    setSaving(true);

    const body = {
      title: title || null,
      youtube_url: youtubeUrl,
      description: description || null,
      artist_ids: artistIds,
      is_published: isPublished,
    };

    const res = isNew
      ? await fetch("/api/videos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch(`/api/videos/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    if (res.ok) { toast(isNew ? "Video added!" : "Updated!"); if (isNew) router.push("/admin/videos"); }
    else toast("Failed to save", "error");
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this video?")) return;
    const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
    if (res.ok) { toast("Deleted"); router.push("/admin/videos"); }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>;

  const ytId = getYouTubeId(youtubeUrl);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/videos" className="inline-flex items-center gap-2 text-sm font-body text-cobalt/40 hover:text-cobalt mb-6">
        <ArrowLeft className="w-4 h-4" />Back to Videos
      </Link>
      <h1 className="text-display-md text-cobalt font-display font-extrabold uppercase mb-8">{isNew ? "Add Video" : "Edit Video"}</h1>

      <form onSubmit={handleSave} className="space-y-8">
        <section className="card-editorial p-6 space-y-4">
          <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide">Video Details</h2>

          <Input
            id="youtubeUrl"
            label="YouTube URL"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            required
          />

          {/* Preview */}
          {ytId && (
            <div className="aspect-video rounded-2xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}

          <Input id="title" label="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Auto-detected from YouTube if left blank" />
          <Textarea id="description" label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        </section>

        <section className="card-editorial p-6 space-y-4">
          <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide">Artists</h2>
          <p className="text-xs text-cobalt/30 font-body">Tag all artists that appear in this video. It will show on each tagged artist&apos;s profile.</p>
          <ArtistMultiSelect
            selectedIds={artistIds}
            onChange={setArtistIds}
          />
        </section>

        <section className="card-editorial p-6 space-y-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="rounded" />
            <span className="text-sm text-cobalt/60 font-body">Published (visible on artist profiles)</span>
          </label>
        </section>

        <div className="flex gap-3 pb-8">
          <Button type="submit" loading={saving} size="lg"><Save className="w-4 h-4 mr-2" />Save</Button>
          {!isNew && <Button type="button" variant="danger" size="lg" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>}
        </div>
      </form>
    </div>
  );
}
