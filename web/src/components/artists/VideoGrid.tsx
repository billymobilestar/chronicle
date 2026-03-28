"use client";

import { getYouTubeId } from "@/lib/utils";
import { Play } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function VideoGrid({ videoUrls }: { videoUrls: string[] }) {
  if (!videoUrls || videoUrls.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-cobalt text-lg">Official Videos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videoUrls.map((url, i) => (
          <VideoCard key={i} url={url} />
        ))}
      </div>
    </div>
  );
}

function VideoCard({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);
  const videoId = getYouTubeId(url);

  if (!videoId) return null;

  if (playing) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      className="relative aspect-video rounded-xl overflow-hidden group cursor-pointer"
    >
      <Image
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt="Video thumbnail"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-all">
        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Play className="w-6 h-6 text-cobalt ml-1" />
        </div>
      </div>
    </button>
  );
}
