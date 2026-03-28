"use client";

import { useState } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { POST_TYPES } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";

export default function PostComposer({
  artistId,
  onPostCreated,
}: {
  artistId: string;
  onPostCreated?: () => void;
}) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [postType, setPostType] = useState("update");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      let imageUrl = null;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("bucket", "post-images");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          imageUrl = data.url;
        }
      }

      const res = await fetch("/api/artist-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artist_id: artistId,
          post_type: postType,
          title: title.trim() || null,
          content: content.trim(),
          image_url: imageUrl,
        }),
      });

      if (res.ok) {
        setContent("");
        setTitle("");
        setPostType("update");
        setImageFile(null);
        setImagePreview(null);
        toast("Post published!");
        onPostCreated?.();
      } else {
        toast("Failed to create post", "error");
      }
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div className="flex gap-3">
        <Select
          options={POST_TYPES.map((t) => ({ value: t.value, label: t.label }))}
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
          className="!w-auto"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind? Share an update with your fans..."
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y min-h-[100px]"
      />

      {imagePreview && (
        <div className="relative inline-block">
          <img src={imagePreview} alt="Preview" className="h-32 rounded-xl object-cover" />
          <button
            type="button"
            onClick={() => {
              setImageFile(null);
              setImagePreview(null);
            }}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <label className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
          <ImagePlus className="w-5 h-5 text-gray-400" />
          <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        </label>
        <Button type="submit" loading={loading} disabled={!content.trim()}>
          <Send className="w-4 h-4 mr-2" />
          Post
        </Button>
      </div>
    </form>
  );
}
