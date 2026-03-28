"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import { Textarea, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import PostCard from "@/components/feed/PostCard";
import {
  Send, ImagePlus, X, Link2, Clock, BarChart3,
  Music, Video, Megaphone, Image as ImageIcon
} from "lucide-react";
import ArtistMultiSelect from "@/components/admin/ArtistMultiSelect";
import type { ArtistPost } from "@/lib/types";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

const POST_TYPES = [
  { value: "announcement", label: "Announcement", icon: Megaphone, description: "Text + optional image" },
  { value: "release_drop", label: "Release Drop", icon: Music, description: "Feature an existing release" },
  { value: "video_premiere", label: "Video Premiere", icon: Video, description: "Feature an existing video" },
  { value: "media", label: "Media Post", icon: ImageIcon, description: "Photo/image + caption" },
  { value: "link_share", label: "Link Share", icon: Link2, description: "External URL with preview" },
  { value: "countdown", label: "Countdown", icon: Clock, description: "Timer counting down to a date" },
  { value: "poll", label: "Poll", icon: BarChart3, description: "Question with voteable options" },
];

export default function AdminCommunityPage() {
  const [postType, setPostType] = useState("announcement");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // Link share
  const [linkUrl, setLinkUrl] = useState("");
  const [linkPreview, setLinkPreview] = useState<{ title: string; description: string; image: string; site_name: string } | null>(null);
  const [fetchingLink, setFetchingLink] = useState(false);
  // Release/Video selectors
  const [releases, setReleases] = useState<{ id: string; title: string; cover_art_url: string | null }[]>([]);
  const [videos, setVideos] = useState<{ id: string; title: string; youtube_url: string }[]>([]);
  const [selectedReleaseId, setSelectedReleaseId] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState("");
  // Countdown
  const [countdownDate, setCountdownDate] = useState("");
  const [countdownTime, setCountdownTime] = useState("");
  const [countdownLabel, setCountdownLabel] = useState("");
  // Poll
  const [pollOptions, setPollOptions] = useState(["", ""]);
  // Tagged artists
  const [taggedArtistIds, setTaggedArtistIds] = useState<string[]>([]);
  // State
  const [posting, setPosting] = useState(false);
  const [posts, setPosts] = useState<ArtistPost[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      // Load releases and videos for selectors
      const [relRes, vidRes] = await Promise.all([
        fetch("/api/releases"),
        fetch("/api/videos"),
      ]);
      if (relRes.ok) setReleases(await relRes.json());
      if (vidRes.ok) setVideos(await vidRes.json());

      // Load recent posts
      fetchPosts();
    }
    load();
  }, []);

  async function fetchPosts() {
    const res = await fetch("/api/artist-posts");
    if (res.ok) setPosts(await res.json());
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function fetchLinkPreview() {
    if (!linkUrl.trim()) return;
    setFetchingLink(true);
    try {
      const res = await fetch("/api/link-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkUrl }),
      });
      if (res.ok) {
        setLinkPreview(await res.json());
      } else {
        toast("Couldn't fetch link preview", "error");
      }
    } catch {
      toast("Failed to fetch preview", "error");
    }
    setFetchingLink(false);
  }

  function addPollOption() {
    if (pollOptions.length < 6) setPollOptions([...pollOptions, ""]);
  }

  function removePollOption(index: number) {
    if (pollOptions.length > 2) setPollOptions(pollOptions.filter((_, i) => i !== index));
  }

  function resetForm() {
    setTitle("");
    setContent("");
    setImageFile(null);
    setImagePreview(null);
    setLinkUrl("");
    setLinkPreview(null);
    setSelectedReleaseId("");
    setSelectedVideoId("");
    setCountdownDate("");
    setCountdownTime("");
    setCountdownLabel("");
    setPollOptions(["", ""]);
    setTaggedArtistIds([]);
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() && postType !== "poll") return;

    setPosting(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("bucket", "post-images");
        const upRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (upRes.ok) imageUrl = (await upRes.json()).url;
      }

      const body: Record<string, unknown> = {
        is_label_post: true,
        post_type: postType,
        title: title.trim() || null,
        content: content.trim(),
        image_url: imageUrl,
        tagged_artist_ids: taggedArtistIds.length > 0 ? taggedArtistIds : undefined,
      };

      if (postType === "link_share" && linkPreview) {
        body.link_url = linkUrl;
        body.link_title = linkPreview.title;
        body.link_description = linkPreview.description;
        body.link_image = linkPreview.image;
      }

      if (postType === "release_drop" && selectedReleaseId) {
        body.related_release_id = selectedReleaseId;
      }

      if (postType === "video_premiere" && selectedVideoId) {
        body.related_video_id = selectedVideoId;
      }

      if (postType === "countdown") {
        const dt = countdownDate + (countdownTime ? `T${countdownTime}:00` : "T00:00:00");
        body.countdown_date = new Date(dt).toISOString();
        body.countdown_label = countdownLabel || title || "Coming Soon";
      }

      if (postType === "poll") {
        body.poll_options = pollOptions.filter((o) => o.trim());
        if ((body.poll_options as string[]).length < 2) {
          toast("Poll needs at least 2 options", "error");
          setPosting(false);
          return;
        }
      }

      const res = await fetch("/api/artist-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast("Posted to community!");
        resetForm();
        fetchPosts();
      } else {
        const data = await res.json();
        toast(data.error || "Failed to post", "error");
      }
    } catch {
      toast("Something went wrong", "error");
    }
    setPosting(false);
  }

  const currentType = POST_TYPES.find((t) => t.value === postType);

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-display-md text-cobalt font-display font-extrabold uppercase">Community</h1>
        <p className="text-cobalt/40 font-body text-sm">Post as Chronicle Records to the community feed</p>
      </div>

      {/* Composer */}
      <form onSubmit={handlePost} className="card-editorial p-6 space-y-5 mb-10">
        {/* Post type selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {POST_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => { setPostType(type.value); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                postType === type.value
                  ? "bg-cobalt text-white"
                  : "bg-cobalt/5 text-cobalt/60 hover:bg-cobalt/10"
              }`}
            >
              <type.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-display font-bold uppercase tracking-wider truncate">{type.label}</span>
            </button>
          ))}
        </div>

        <p className="text-[10px] text-cobalt/30 font-body">{currentType?.description}</p>

        {/* Title (optional for most, required for countdown) */}
        <Input
          id="post-title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={postType === "poll" ? "Your question..." : "Post title (optional)"}
          required={postType === "poll"}
        />

        {/* Content */}
        <Textarea
          id="post-content"
          label={postType === "poll" ? "Description (optional)" : "Content"}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What do you want to share?"
          required={postType !== "poll"}
        />

        {/* Image upload (for announcement, media) */}
        {(postType === "announcement" || postType === "media") && (
          <div>
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-40 rounded-xl object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cobalt/5 text-cobalt/50 cursor-pointer hover:bg-cobalt/10 transition-all">
                <ImagePlus className="w-4 h-4" />
                <span className="text-sm font-body">Add Image</span>
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </label>
            )}
          </div>
        )}

        {/* Link share */}
        {postType === "link_share" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="link-url"
                  label="URL"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={fetchLinkPreview} loading={fetchingLink} className="self-end">
                Preview
              </Button>
            </div>
            {linkPreview && (
              <div className="flex gap-3 p-3 rounded-xl bg-cobalt/5 border border-cobalt/10">
                {linkPreview.image && (
                  <img src={linkPreview.image} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs text-cobalt/40 font-body">{linkPreview.site_name}</p>
                  <p className="text-sm font-display font-bold text-cobalt truncate">{linkPreview.title}</p>
                  <p className="text-xs text-cobalt/50 font-body line-clamp-2">{linkPreview.description}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Release selector */}
        {postType === "release_drop" && (
          <Select
            id="release-select"
            label="Select Release"
            value={selectedReleaseId}
            onChange={(e) => setSelectedReleaseId(e.target.value)}
            options={[
              { value: "", label: "Choose a release..." },
              ...releases.map((r) => ({ value: r.id, label: r.title })),
            ]}
          />
        )}

        {/* Video selector */}
        {postType === "video_premiere" && (
          <Select
            id="video-select"
            label="Select Video"
            value={selectedVideoId}
            onChange={(e) => setSelectedVideoId(e.target.value)}
            options={[
              { value: "", label: "Choose a video..." },
              ...videos.map((v) => ({ value: v.id, label: v.title || v.youtube_url })),
            ]}
          />
        )}

        {/* Countdown */}
        {postType === "countdown" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input id="countdown-date" label="Target Date" type="date" value={countdownDate} onChange={(e) => setCountdownDate(e.target.value)} required />
              <Input id="countdown-time" label="Time (optional)" type="time" value={countdownTime} onChange={(e) => setCountdownTime(e.target.value)} />
            </div>
            <Input id="countdown-label" label="Countdown Label" value={countdownLabel} onChange={(e) => setCountdownLabel(e.target.value)} placeholder="e.g. Until the drop..." />
          </div>
        )}

        {/* Poll options */}
        {postType === "poll" && (
          <div className="space-y-3">
            <label className="block text-xs font-display font-bold uppercase tracking-widest text-cobalt/60">
              Poll Options
            </label>
            {pollOptions.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  id={`poll-opt-${i}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...pollOptions];
                    newOpts[i] = e.target.value;
                    setPollOptions(newOpts);
                  }}
                  placeholder={`Option ${i + 1}`}
                />
                {pollOptions.length > 2 && (
                  <button type="button" onClick={() => removePollOption(i)} className="p-2 text-red-400 hover:text-red-600 self-end">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {pollOptions.length < 6 && (
              <Button type="button" variant="ghost" size="sm" onClick={addPollOption}>
                + Add Option
              </Button>
            )}
          </div>
        )}

        {/* Tag artists */}
        <div className="border-t-2 border-cobalt/5 pt-5">
          <ArtistMultiSelect
            selectedIds={taggedArtistIds}
            onChange={setTaggedArtistIds}
            label="Tag Artists (optional)"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={posting}>
            <Send className="w-4 h-4 mr-2" />
            Post as Chronicle Records
          </Button>
        </div>
      </form>

      {/* Recent posts */}
      <div className="space-y-4">
        <h2 className="font-display font-extrabold text-cobalt uppercase tracking-wide">Recent Posts</h2>
        {posts.length === 0 ? (
          <p className="text-cobalt/30 font-body text-center py-12">No posts yet</p>
        ) : (
          posts.slice(0, 20).map((post) => (
            <PostCard key={post.id} post={post} userId={userId} />
          ))
        )}
      </div>
    </div>
  );
}
