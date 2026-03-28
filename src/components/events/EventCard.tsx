import { Calendar, MapPin, ExternalLink } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { Event } from "@/lib/types";

export default function EventCard({ event }: { event: Event }) {
  const isPast = new Date(event.event_date) < new Date();

  return (
    <div className="card-editorial hover-editorial p-6 flex gap-5">
      {/* Date block */}
      <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-cobalt text-white flex flex-col items-center justify-center">
        <span className="text-2xl font-display font-extrabold leading-none">
          {new Date(event.event_date).getDate()}
        </span>
        <span className="text-[10px] font-display font-bold uppercase tracking-widest text-white/60">
          {new Date(event.event_date).toLocaleString("en-US", { month: "short" })}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display font-extrabold text-cobalt uppercase tracking-wide">{event.title}</h3>
          {isPast && <Badge>Past</Badge>}
        </div>

        {event.artist && (
          <p className="text-sm text-accent font-display font-bold uppercase tracking-wider">{event.artist.name}</p>
        )}

        <div className="flex flex-wrap gap-4 mt-3 text-sm text-cobalt/40 font-body">
          {event.venue && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {event.venue}{event.city ? `, ${event.city}` : ""}
            </span>
          )}
          {event.event_time && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {event.event_time}
              {event.doors_time && ` (Doors: ${event.doors_time})`}
            </span>
          )}
        </div>
      </div>

      {event.ticket_url && !isPast && (
        <a
          href={event.ticket_url}
          target="_blank"
          rel="noopener noreferrer"
          className="self-center font-display font-bold text-xs uppercase tracking-widest bg-accent text-white px-5 py-3 rounded-full hover:bg-accent-hover transition-all duration-300 hover:scale-105 flex items-center gap-1.5 flex-shrink-0"
        >
          Tickets
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}
