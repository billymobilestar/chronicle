import Image from "next/image";
import Badge from "@/components/ui/Badge";
import type { MerchItem } from "@/lib/types";

export default function MerchCard({ item }: { item: MerchItem }) {
  return (
    <div className="card-editorial hover-editorial group">
      <div className="aspect-square relative bg-cream">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl opacity-20">&#x1F455;</span>
          </div>
        )}
        {item.category && (
          <div className="absolute top-4 left-4">
            <Badge>{item.category}</Badge>
          </div>
        )}
      </div>
      <div className="p-5 space-y-2">
        <h3 className="font-display font-extrabold text-cobalt uppercase tracking-wide">{item.name}</h3>
        {item.artist && (
          <p className="text-xs text-cobalt/40 font-display uppercase tracking-wider">by {item.artist.name}</p>
        )}
        {item.description && (
          <p className="text-sm text-cobalt/50 line-clamp-2 font-body">{item.description}</p>
        )}
        <div className="flex items-center justify-between pt-3">
          {item.price && (
            <span className="text-xl font-display font-extrabold text-cobalt">
              ${item.price.toFixed(2)}
            </span>
          )}
          <span className="font-display font-bold text-[10px] uppercase tracking-widest text-accent bg-accent/10 px-3 py-1.5 rounded-full">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
}
