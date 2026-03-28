import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import type { Artist } from "@/lib/types";

export default function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link href={`/artists/${artist.slug}`} className="group block">
      <div className="card-editorial hover-editorial">
        <div className="aspect-[3/4] relative bg-cobalt/5">
          {artist.profile_image_url ? (
            <Image
              src={artist.profile_image_url}
              alt={artist.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-editorial">
              <span className="text-display-md text-white/20 font-display font-extrabold uppercase">
                {artist.name.charAt(0)}
              </span>
            </div>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-cobalt-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-4 left-4 right-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
            <span className="font-display font-bold text-xs text-white uppercase tracking-widest">
              View Profile &rarr;
            </span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-display font-extrabold text-cobalt text-lg uppercase tracking-wide group-hover:text-accent transition-colors">
            {artist.name}
          </h3>
          {artist.genre && (
            <Badge className="mt-2">{artist.genre}</Badge>
          )}
          {artist.short_bio && (
            <p className="text-sm text-cobalt/40 mt-2 line-clamp-2 font-body">{artist.short_bio}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
