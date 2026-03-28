import { getSupabaseAdmin } from "@/lib/supabase";
import MerchCard from "@/components/merch/MerchCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merch",
  description: "Official Chronicle Records merchandise.",
};

export const revalidate = 60;

export default async function MerchPage() {
  const supabase = getSupabaseAdmin();
  const { data: items } = await supabase
    .from("merch_items")
    .select("*, artist:artists(id, name, slug)")
    .eq("is_available", true)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="bg-cobalt-dark py-20 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto">
          <p className="font-display font-bold text-xs uppercase tracking-[0.2em] text-accent-glow mb-4">
            Official Gear
          </p>
          <h1 className="text-display-lg text-white font-display font-extrabold uppercase">
            Merchandise
          </h1>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        {items && items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <MerchCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-20">&#x1F455;</div>
            <p className="text-cobalt/30 text-lg mb-2 font-display font-bold uppercase">Merch store coming soon</p>
            <p className="text-cobalt/20 text-sm font-body">Check back for exclusive drops.</p>
          </div>
        )}
      </div>
    </div>
  );
}
