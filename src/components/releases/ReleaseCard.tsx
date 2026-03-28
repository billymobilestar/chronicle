import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import type { Release } from "@/lib/types";

export default function ReleaseCard({ release }: { release: Release }) {
  const streamingEntries = Object.entries(release.streaming_links || {}).filter(
    ([, url]) => url
  );

  return (
    <div className="card-editorial hover-editorial group">
      <div className="aspect-square relative bg-cobalt-dark">
        {release.cover_art_url ? (
          <Image
            src={release.cover_art_url}
            alt={release.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-accent">
            <span className="text-6xl opacity-30">&#x1F3B5;</span>
          </div>
        )}
      </div>
      <div className="p-5 space-y-2">
        <Badge variant="accent">{release.release_type}</Badge>
        <h3 className="font-display font-extrabold text-cobalt uppercase tracking-wide">{release.title}</h3>
        {release.artists && release.artists.length > 0 ? (
          <p className="text-sm text-cobalt/40 font-body">
            {release.artists
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((ra) => ra.artist?.name)
              .filter(Boolean)
              .join(release.artists.some((ra) => ra.role === "featured") ? " ft. " : ", ")}
          </p>
        ) : release.artist ? (
          <p className="text-sm text-cobalt/40 font-body">{release.artist.name}</p>
        ) : null}
        {release.release_date && (
          <p className="text-xs text-cobalt/30 font-body">{formatDate(release.release_date)}</p>
        )}
        {streamingEntries.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-3">
            {streamingEntries.slice(0, 3).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-cobalt/5 text-cobalt text-[10px] font-display font-bold uppercase tracking-wider hover:bg-accent hover:text-white transition-all duration-300"
              >
                {platform.replace("_", " ")}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
