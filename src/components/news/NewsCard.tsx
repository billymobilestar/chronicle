import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import type { Announcement } from "@/lib/types";

export default function NewsCard({ article }: { article: Announcement }) {
  return (
    <Link href={`/news/${article.id}`} className="group block">
      <div className="card-editorial hover-editorial">
        {article.cover_image_url && (
          <div className="aspect-video relative">
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        )}
        <div className="p-6 space-y-3">
          <p className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-accent">
            {article.published_at ? formatDate(article.published_at) : formatDate(article.created_at)}
          </p>
          <h3 className="font-display font-extrabold text-cobalt text-xl uppercase tracking-wide group-hover:text-accent transition-colors leading-tight">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-sm text-cobalt/40 line-clamp-3 font-body leading-relaxed">{article.excerpt}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
