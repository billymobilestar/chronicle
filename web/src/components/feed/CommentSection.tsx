"use client";

import { useState, useEffect } from "react";
import Avatar from "@/components/ui/Avatar";
import { timeAgo } from "@/lib/utils";
import { Send, Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { PostComment } from "@/lib/types";

export default function CommentSection({
  postId,
  userId,
}: {
  postId: string;
  userId: string | null;
}) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();

    const supabase = getSupabaseBrowser();
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "post_comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload: { new: PostComment }) => {
          setComments((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  async function fetchComments() {
    const res = await fetch(`/api/artist-posts/${postId}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments(data);
    }
    setLoading(false);
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !userId) return;

    setSubmitting(true);
    const res = await fetch(`/api/artist-posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text.trim() }),
    });

    if (res.ok) {
      setText("");
    }
    setSubmitting(false);
  }

  return (
    <div className="border-t border-gray-50">
      {/* Comments list */}
      <div className="px-5 py-3 space-y-3 max-h-64 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar
                src={comment.profile?.avatar_url}
                alt={comment.profile?.display_name || "User"}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-cobalt">
                    {comment.profile?.display_name || "User"}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {timeAgo(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment input */}
      {userId && (
        <form onSubmit={submitComment} className="px-5 py-3 border-t border-gray-50 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="p-2 rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      )}
    </div>
  );
}
