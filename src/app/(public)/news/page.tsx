import { getSupabaseAdmin } from "@/lib/supabase";
import NewsCard from "@/components/news/NewsCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News",
  description: "Latest news and announcements from Chronicle Records.",
};

export const revalidate = 60;

export default async function NewsPage() {
  const supabase = getSupabaseAdmin();
  const { data: articles } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <div>
      <div className="bg-cobalt-dark py-20 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto">
          <p className="font-display font-bold text-xs uppercase tracking-[0.2em] text-accent-glow mb-4">
            Latest Updates
          </p>
          <h1 className="text-display-lg text-white font-display font-extrabold uppercase">
            News
          </h1>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-cobalt/30 text-lg font-body">No news yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
