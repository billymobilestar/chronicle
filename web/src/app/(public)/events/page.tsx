import { getSupabaseAdmin } from "@/lib/supabase";
import EventCard from "@/components/events/EventCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming shows and events from Chronicle Records artists.",
};

export const revalidate = 60;

export default async function EventsPage() {
  const supabase = getSupabaseAdmin();

  const { data: upcoming } = await supabase
    .from("events")
    .select("*, artist:artists(id, name, slug)")
    .eq("is_published", true)
    .gte("event_date", new Date().toISOString().split("T")[0])
    .order("event_date", { ascending: true });

  const { data: past } = await supabase
    .from("events")
    .select("*, artist:artists(id, name, slug)")
    .eq("is_published", true)
    .lt("event_date", new Date().toISOString().split("T")[0])
    .order("event_date", { ascending: false })
    .limit(10);

  return (
    <div>
      <div className="bg-cobalt-dark py-20 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto">
          <p className="font-display font-bold text-xs uppercase tracking-[0.2em] text-accent-glow mb-4">
            Don&apos;t Miss Out
          </p>
          <h1 className="text-display-lg text-white font-display font-extrabold uppercase">
            Events & Shows
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-16">
        <section className="mb-16">
          <h2 className="font-display font-extrabold text-cobalt text-xl uppercase tracking-wider mb-6">Upcoming</h2>
          {upcoming && upcoming.length > 0 ? (
            <div className="space-y-4">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 card-editorial">
              <p className="text-cobalt/30 font-body">No upcoming events. Check back soon.</p>
            </div>
          )}
        </section>

        {past && past.length > 0 && (
          <section>
            <h2 className="font-display font-extrabold text-cobalt/40 text-xl uppercase tracking-wider mb-6">Past Events</h2>
            <div className="space-y-4 opacity-60">
              {past.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
