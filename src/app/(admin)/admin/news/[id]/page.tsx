"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditNewsPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isNew) return;
    async function load() {
      const res = await fetch(`/api/news/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setSlug(data.slug);
        setContent(data.content);
        setExcerpt(data.excerpt || "");
        setIsPublished(data.is_published);
      }
      setLoading(false);
    }
    load();
  }, [id, isNew]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = {
      title,
      slug: slug || slugify(title),
      content,
      excerpt,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    };

    const res = isNew
      ? await fetch("/api/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch(`/api/news/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    if (res.ok) {
      toast(isNew ? "Article created!" : "Article updated!");
      if (isNew) router.push("/admin/news");
    } else {
      toast("Failed to save", "error");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this article?")) return;
    const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
    if (res.ok) { toast("Deleted"); router.push("/admin/news"); }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-2xl">
      <Link href="/admin/news" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-cobalt mb-6">
        <ArrowLeft className="w-4 h-4" />Back to News
      </Link>
      <h1 className="text-2xl font-bold text-cobalt mb-6">{isNew ? "New Article" : "Edit Article"}</h1>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <Input id="title" label="Title" value={title} onChange={(e) => { setTitle(e.target.value); if (isNew) setSlug(slugify(e.target.value)); }} required />
        <Input id="slug" label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <Input id="excerpt" label="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Brief summary" />
        <Textarea id="content" label="Content" value={content} onChange={(e) => setContent(e.target.value)} required />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="rounded" />
          <span className="text-sm">Published</span>
        </label>
        <div className="flex gap-3">
          <Button type="submit" loading={saving}><Save className="w-4 h-4 mr-2" />Save</Button>
          {!isNew && <Button type="button" variant="danger" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>}
        </div>
      </form>
    </div>
  );
}
