"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { timeAgo } from "@/lib/utils";
import type { ArtistPost } from "@/lib/types";
import { MessageCircle, Pin, ExternalLink, Clock } from "lucide-react";
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
        {post.artist_slug ? (
          <Link href={`/artists/${post.artist_slug}`}>
            <Avatar src={post.artist_image} alt={post.artist_name || "Artist"} size="md" />
          </Link>
        ) : (
          <Avatar src={post.artist_image} alt={post.artist_name || "Chronicle Records"} size="md" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {post.artist_slug ? (
              <Link href={`/artists/${post.artist_slug}`} className="font-display font-bold text-cobalt uppercase tracking-wide text-sm hover:text-accent transition-colors">
                {post.artist_name}
              </Link>
            ) : (
              <span className="font-display font-bold text-cobalt uppercase tracking-wide text-sm">
                {post.artist_name || "Chronicle Records"}
              </span>
            )}
            <PostTypeBadge type={post.post_type} />
            {post.is_pinned && <Pin className="w-3.5 h-3.5 text-accent" />}
          </div>
          <p className="text-xs text-cobalt/30 font-body">{timeAgo(post.created_at)}</p>
        </div>
      </div>

      {/* Tagged artists */}
      {post.tagged_artists && post.tagged_artists.length > 0 && (
        <div className="px-6 pb-2 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-display font-bold uppercase tracking-widest text-cobalt/30">Featuring</span>
          {post.tagged_artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artists/${artist.slug}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 hover:bg-accent/20 transition-colors"
            >
              <Avatar src={artist.profile_image_url} alt={artist.name} size="sm" />
              <span className="text-[10px] font-display font-bold uppercase tracking-wider text-accent">{artist.name}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="px-6 pb-4">
        {post.title && (
          <h3 className="font-display font-extrabold text-cobalt uppercase tracking-wide mb-2">{post.title}</h3>
        )}
        {post.content && (
          <p className="text-sm text-cobalt/70 whitespace-pre-wrap leading-relaxed font-body">{post.content}</p>
        )}
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="relative aspect-video mx-6 mb-4 rounded-2xl overflow-hidden">
          <Image src={post.image_url} alt={post.title || "Post image"} fill className="object-cover" />
        </div>
      )}

      {/* Link Preview */}
      {post.post_type === "link_share" && post.link_url && (
        <div className="mx-6 mb-4">
          <a href={post.link_url} target="_blank" rel="noopener noreferrer" className="flex gap-3 p-3 rounded-xl bg-cobalt/5 border-2 border-cobalt/10 hover:border-accent/30 transition-all group">
            {post.link_image && (
              <img src={post.link_image} alt="" className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              {post.link_title && <p className="text-sm font-display font-bold text-cobalt group-hover:text-accent transition-colors truncate">{post.link_title}</p>}
              {post.link_description && <p className="text-xs text-cobalt/40 font-body line-clamp-2 mt-1">{post.link_description}</p>}
              <p className="text-[10px] text-cobalt/30 font-body mt-1 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                {new URL(post.link_url).hostname}
              </p>
            </div>
          </a>
        </div>
      )}

      {/* Countdown */}
      {post.post_type === "countdown" && post.countdown_date && (
        <div className="mx-6 mb-4">
          <CountdownTimer targetDate={post.countdown_date} label={post.countdown_label || "Coming Soon"} />
        </div>
      )}

      {/* Poll */}
      {post.post_type === "poll" && post.poll && (
        <div className="mx-6 mb-4">
          <PollDisplay poll={post.poll} userId={userId} />
        </div>
      )}

      {/* Reactions & Comments */}
      <div className="px-6 py-4 border-t-2 border-cobalt/5 flex items-center justify-between">
        <ReactionBar postId={post.id} reactionCounts={post.reaction_counts || {}} userId={userId} />
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-cobalt/30 hover:text-cobalt text-sm transition-colors font-body"
        >
          <MessageCircle className="w-4 h-4" />
          {post.comment_count || 0}
        </button>
      </div>

      {showComments && <CommentSection postId={post.id} userId={userId} />}
    </div>
  );
}

function PostTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    announcement: "Announcement",
    update: "Update",
    behind_the_scenes: "BTS",
    release_drop: "New Release",
    video_premiere: "Video",
    media: "Media",
    link_share: "Link",
    countdown: "Countdown",
    poll: "Poll",
  };
  return <Badge variant="accent">{labels[type] || type}</Badge>;
}

function CountdownTimer({ targetDate, label }: { targetDate: string; label: string }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const isPast = new Date(targetDate) <= new Date();

  return (
    <div className="bg-gradient-editorial rounded-2xl p-6 text-white text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-accent-glow" />
        <span className="text-xs font-display font-bold uppercase tracking-[0.2em] text-accent-glow">{label}</span>
      </div>
      {isPast ? (
        <p className="text-display-md font-display font-extrabold uppercase text-neon">It&apos;s Here!</p>
      ) : (
        <div className="flex justify-center gap-4">
          {[
            { val: timeLeft.days, label: "Days" },
            { val: timeLeft.hours, label: "Hrs" },
            { val: timeLeft.minutes, label: "Min" },
            { val: timeLeft.seconds, label: "Sec" },
          ].map((unit) => (
            <div key={unit.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-display font-extrabold tabular-nums">{String(unit.val).padStart(2, "0")}</p>
              <p className="text-[10px] font-display font-bold uppercase tracking-widest text-white/40">{unit.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getTimeLeft(targetDate: string) {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function PollDisplay({
  poll,
  userId,
}: {
  poll: { options: { id: string; label: string; votes: number }[]; total_votes: number; user_vote: string | null };
  userId: string | null;
}) {
  const [userVote, setUserVote] = useState(poll.user_vote);
  const [votes, setVotes] = useState(poll.options.map((o) => o.votes));
  const [totalVotes, setTotalVotes] = useState(poll.total_votes);
  const [voting, setVoting] = useState(false);

  const hasVoted = !!userVote;

  async function handleVote(optionId: string, index: number) {
    if (!userId || hasVoted) return;
    setVoting(true);

    const res = await fetch("/api/polls/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ option_id: optionId }),
    });

    if (res.ok) {
      setUserVote(optionId);
      const newVotes = [...votes];
      newVotes[index]++;
      setVotes(newVotes);
      setTotalVotes(totalVotes + 1);
    }
    setVoting(false);
  }

  return (
    <div className="space-y-2">
      {poll.options.map((option, i) => {
        const pct = totalVotes > 0 ? Math.round((votes[i] / totalVotes) * 100) : 0;
        const isSelected = userVote === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => handleVote(option.id, i)}
            disabled={hasVoted || voting || !userId}
            className={`relative w-full text-left px-4 py-3 rounded-xl border-2 transition-all overflow-hidden ${
              isSelected
                ? "border-accent bg-accent/5"
                : hasVoted
                ? "border-cobalt/10 bg-cobalt/5"
                : "border-cobalt/10 hover:border-accent/50 cursor-pointer"
            }`}
          >
            {/* Progress bar */}
            {hasVoted && (
              <div
                className="absolute inset-y-0 left-0 bg-accent/10 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            )}
            <div className="relative flex items-center justify-between">
              <span className="text-sm font-body text-cobalt">{option.label}</span>
              {hasVoted && (
                <span className="text-xs font-display font-bold text-cobalt/50">{pct}%</span>
              )}
            </div>
          </button>
        );
      })}
      <p className="text-[10px] text-cobalt/30 font-body text-center">
        {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
        {!userId && " · Sign in to vote"}
      </p>
    </div>
  );
}
