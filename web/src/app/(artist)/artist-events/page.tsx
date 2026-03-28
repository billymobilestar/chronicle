"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { Plus, Pencil, Calendar, Save, MapPin } from "lucide-react";

export default function ArtistEventsPage() {
  const [artistId, setArtistId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: artist } = await supabase.from("artists").select("id").eq("user_id", user.id).single();
      if (artist) {
        setArtistId(artist.id);
        fetchEvents(artist.id);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function fetchEvents(aid: string) {
    const supabase = getSupabaseBrowser();
    const { data } = await supabase.from("events").select("*").eq("artist_id", aid).order("event_date", { ascending: false });
    setEvents(data || []);
  }

  function openNew() {
    setEditId(null); setTitle(""); setDescription(""); setVenue(""); setCity(""); setEventDate(""); setEventTime(""); setTicketUrl("");
    setShowForm(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function openEdit(e: any) {
    setEditId(e.id); setTitle(e.title); setDescription(e.description || ""); setVenue(e.venue || ""); setCity(e.city || ""); setEventDate(e.event_date || ""); setEventTime(e.event_time || ""); setTicketUrl(e.ticket_url || "");
    setShowForm(true);
  }

  async function handleSave() {
    if (!artistId || !title.trim() || !eventDate) return;
    setSaving(true);
    const body = { title, description, venue, city, event_date: eventDate, event_time: eventTime || null, ticket_url: ticketUrl || null, artist_id: artistId, is_published: true };

    const res = editId
      ? await fetch(`/api/events/${editId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    if (res.ok) {
      toast(editId ? "Updated!" : "Event added!");
      setShowForm(false);
      fetchEvents(artistId);
    } else toast("Failed to save", "error");
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-display-md text-cobalt font-display font-extrabold uppercase">My Events</h1>
          <p className="text-cobalt/40 font-body text-sm">Manage your shows and events</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />New Event</Button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 card-editorial">
          <Calendar className="w-10 h-10 text-cobalt/20 mx-auto mb-3" />
          <p className="text-cobalt/30 font-body">No events yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="card-editorial p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-cobalt flex-shrink-0 text-white flex flex-col items-center justify-center">
                <span className="text-lg font-display font-extrabold leading-none">{new Date(e.event_date).getDate()}</span>
                <span className="text-[9px] font-display font-bold uppercase">{new Date(e.event_date).toLocaleString("en", { month: "short" })}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-cobalt uppercase tracking-wide text-sm">{e.title}</h3>
                {e.venue && <p className="text-xs text-cobalt/30 font-body flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{e.venue}{e.city ? `, ${e.city}` : ""}</p>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => openEdit(e)}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit Event" : "New Event"} className="max-w-lg">
        <div className="space-y-4">
          <Input id="e-title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea id="e-desc" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input id="e-venue" label="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
            <Input id="e-city" label="City" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input id="e-date" label="Date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
            <Input id="e-time" label="Time" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
          </div>
          <Input id="e-tickets" label="Ticket URL" value={ticketUrl} onChange={(e) => setTicketUrl(e.target.value)} placeholder="https://..." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
