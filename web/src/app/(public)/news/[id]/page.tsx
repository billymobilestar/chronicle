import { getSupabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("announcements")
    .select("title, excerpt")
    .eq("id", params.id)
    .single();

  if (!data) return { title: "Not Found" };
  return { title: data.title, description: data.excerpt };
}

export default async function NewsDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getSupabaseAdmin();
  const { data: article } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", params.id)
    .eq("is_published", true)
    .single();

  if (!article) notFound();

  return (
    <div className="section-padding">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-cobalt transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to News
        </Link>

        {article.cover_image_url && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-8">
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <p className="text-accent font-semibold text-sm mb-2">
          {article.published_at
            ? formatDate(article.published_at)
            : formatDate(article.created_at)}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-cobalt mb-6">
          {article.title}
        </h1>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {article.content}
          </p>
        </div>
      </div>
    </div>
  );
}
