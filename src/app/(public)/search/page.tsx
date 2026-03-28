import SearchBar from "@/components/search/SearchBar";
import { getSupabaseAdmin } from "@/lib/supabase";
import ArtistCard from "@/components/artists/ArtistCard";
import MerchCard from "@/components/merch/MerchCard";
import NewsCard from "@/components/news/NewsCard";
import type { Metadata } from "next";
import type { Artist, MerchItem, Announcement } from "@/lib/types";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim();

  let artists: Artist[] = [];
  let merch: MerchItem[] = [];
  let news: Announcement[] = [];

  if (query) {
    const supabase = getSupabaseAdmin();
    const pattern = `%${query}%`;

    const [artistRes, merchRes, newsRes] = await Promise.all([
      supabase
        .from("artists")
        .select("*")
        .eq("is_active", true)
        .ilike("name", pattern)
        .limit(8),
      supabase
        .from("merch_items")
        .select("*, artist:artists(id, name, slug)")
        .eq("is_available", true)
        .ilike("name", pattern)
        .limit(8),
      supabase
        .from("announcements")
        .select("*")
        .eq("is_published", true)
        .ilike("title", pattern)
        .limit(6),
    ]);

    artists = artistRes.data || [];
    merch = merchRes.data || [];
    news = newsRes.data || [];
  }

  const totalResults = artists.length + merch.length + news.length;

  return (
    <div className="section-padding">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cobalt mb-4">Search</h1>
          <SearchBar initialQuery={query} large />
        </div>

        {query && (
          <div className="space-y-10">
            <p className="text-sm text-gray-500">
              {totalResults} result{totalResults !== 1 ? "s" : ""} for &quot;{query}&quot;
            </p>

            {artists.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-cobalt mb-4">Artists</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {artists.map((a) => (
                    <ArtistCard key={a.id} artist={a} />
                  ))}
                </div>
              </section>
            )}

            {merch.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-cobalt mb-4">Merchandise</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {merch.map((m) => (
                    <MerchCard key={m.id} item={m} />
                  ))}
                </div>
              </section>
            )}

            {news.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-cobalt mb-4">News</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {news.map((n) => (
                    <NewsCard key={n.id} article={n} />
                  ))}
                </div>
              </section>
            )}

            {totalResults === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  No results found for &quot;{query}&quot;
                </p>
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              Search for artists, merchandise, or news articles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
