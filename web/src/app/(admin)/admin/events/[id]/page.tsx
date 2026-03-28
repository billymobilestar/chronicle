"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isNew) return;
    async function load() {
      const res = await fetch(`/api/events/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setDescription(data.description || "");
        setVenue(data.venue || "");
        setCity(data.city || "");
        setEventDate(data.event_date || "");
        setEventTime(data.event_time || "");
        setTicketUrl(data.ticket_url || "");
      }
      setLoading(false);
    }
    load();
  }, [id, isNew]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = { title, description, venue, city, event_date: eventDate, event_time: eventTime || null, ticket_url: ticketUrl || null };
    const res = isNew
      ? await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch(`/api/events/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { toast(isNew ? "Created!" : "Updated!"); if (isNew) router.push("/admin/events"); }
    else toast("Failed to save", "error");
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this event?")) return;
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) { toast("Deleted"); router.push("/admin/events"); }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-2xl">
      <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-cobalt mb-6">
        <ArrowLeft className="w-4 h-4" />Back to Events
      </Link>
      <h1 className="text-2xl font-bold text-cobalt mb-6">{isNew ? "New Event" : "Edit Event"}</h1>
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <Input id="title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Textarea id="description" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Input id="venue" label="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
          <Input id="city" label="City" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input id="eventDate" label="Date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
          <Input id="eventTime" label="Time" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
        </div>
        <Input id="ticketUrl" label="Ticket URL" value={ticketUrl} onChange={(e) => setTicketUrl(e.target.value)} />
        <div className="flex gap-3">
          <Button type="submit" loading={saving}><Save className="w-4 h-4 mr-2" />Save</Button>
          {!isNew && <Button type="button" variant="danger" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>}
        </div>
      </form>
    </div>
  );
}
