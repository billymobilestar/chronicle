"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { timeAgo } from "@/lib/utils";
import type { ArtistPost } from "@/lib/types";
import { MessageCircle, Pin } from "lucide-react";
import ReactionBar from "./ReactionBar";
import CommentSection from "./CommentSection";

export default function PostCard({
  post,
  userId,
}: {
  post: ArtistPost;
  userId: string | null;
}) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="card-editorial">
      {/* Header */}
      <div className="px-6 py-5 flex items-center gap-3">
        <Link href={`/artists/${post.artist_slug}`}>
          <Avatar
            src={post.artist_image}
            alt={post.artist_name || "Artist"}
            size="md"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/artists/${post.artist_slug}`}
              className="font-display font-bold text-cobalt uppercase tracking-wide text-sm hover:text-accent transition-colors"
            >
              {post.artist_name}
            </Link>
            <Badge variant="accent">
              {post.post_type.replace("_", " ")}
            </Badge>
            {post.is_pinned && (
              <Pin className="w-3.5 h-3.5 text-accent" />
            )}
          </div>
          <p className="text-xs text-cobalt/30 font-body">{timeAgo(post.created_at)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        {post.title && (
          <h3 className="font-display font-extrabold text-cobalt uppercase tracking-wide mb-2">{post.title}</h3>
        )}
        <p className="text-sm text-cobalt/70 whitespace-pre-wrap leading-relaxed font-body">
          {post.content}
        </p>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="relative aspect-video mx-6 mb-4 rounded-2xl overflow-hidden">
          <Image
            src={post.image_url}
            alt={post.title || "Post image"}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Reactions & Comments bar */}
      <div className="px-6 py-4 border-t-2 border-cobalt/5 flex items-center justify-between">
        <ReactionBar
          postId={post.id}
          reactionCounts={post.reaction_counts || {}}
          userId={userId}
        />
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-cobalt/30 hover:text-cobalt text-sm transition-colors font-body"
        >
          <MessageCircle className="w-4 h-4" />
          {post.comment_count || 0}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentSection postId={post.id} userId={userId} />
      )}
    </div>
  );
}
