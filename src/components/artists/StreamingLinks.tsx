"use client";

import { ExternalLink, Music, Cloud, Waves } from "lucide-react";
import { STREAMING_PLATFORMS } from "@/lib/constants";

const iconMap: Record<string, React.ReactNode> = {
  music: <Music className="w-5 h-5" />,
  youtube: <Music className="w-5 h-5" />,
  cloud: <Cloud className="w-5 h-5" />,
  waves: <Waves className="w-5 h-5" />,
};

export default function StreamingLinks({ links }: { links: Record<string, string> }) {
  const activeLinks = STREAMING_PLATFORMS.filter((p) => links[p.key]);

  if (activeLinks.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-cobalt text-lg">Listen Now</h3>
      <div className="flex flex-wrap gap-2">
        {activeLinks.map((platform) => (
          <a
            key={platform.key}
            href={links[platform.key]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pale-sky hover:bg-wisteria text-cobalt font-medium text-sm transition-all hover:-translate-y-0.5"
          >
            {iconMap[platform.icon] || <ExternalLink className="w-5 h-5" />}
            {platform.label}
          </a>
        ))}
      </div>
    </div>
  );
}
