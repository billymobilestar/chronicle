"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import { Textarea, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { MERCH_CATEGORIES } from "@/lib/constants";
import { Plus, Pencil, ShoppingBag, Save } from "lucide-react";

export default function ArtistMerchPage() {
  const [artistId, setArtistId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // Form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("apparel");
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
        fetchItems(artist.id);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function fetchItems(aid: string) {
    const supabase = getSupabaseBrowser();
    const { data } = await supabase.from("merch_items").select("*").eq("artist_id", aid).order("sort_order");
    setItems(data || []);
  }

  function openNew() {
    setEditId(null); setName(""); setDescription(""); setPrice(""); setCategory("apparel");
    setShowForm(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function openEdit(m: any) {
    setEditId(m.id); setName(m.name); setDescription(m.description || ""); setPrice(m.price?.toString() || ""); setCategory(m.category || "apparel");
    setShowForm(true);
  }

  async function handleSave() {
    if (!artistId || !name.trim()) return;
    setSaving(true);
    const body = { name, description, price: price ? parseFloat(price) : null, category, artist_id: artistId, is_available: true };

    const res = editId
      ? await fetch(`/api/merch/${editId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch("/api/merch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    if (res.ok) {
      toast(editId ? "Updated!" : "Merch added!");
      setShowForm(false);
      fetchItems(artistId);
    } else toast("Failed to save", "error");
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-display-md text-cobalt font-display font-extrabold uppercase">My Merch</h1>
          <p className="text-cobalt/40 font-body text-sm">Manage your merchandise</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />New Item</Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 card-editorial">
          <ShoppingBag className="w-10 h-10 text-cobalt/20 mx-auto mb-3" />
          <p className="text-cobalt/30 font-body">No merch yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((m) => (
            <div key={m.id} className="card-editorial p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-cobalt/5 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-6 h-6 text-cobalt/30" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-cobalt uppercase tracking-wide text-sm">{m.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge>{m.category}</Badge>
                  {m.price && <span className="text-sm font-display font-bold text-cobalt">${m.price}</span>}
                </div>
              </div>
              <Badge variant={m.is_available ? "success" : "warning"}>{m.is_available ? "Active" : "Hidden"}</Badge>
              <Button variant="ghost" size="sm" onClick={() => openEdit(m)}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit Merch" : "New Merch"} className="max-w-lg">
        <div className="space-y-4">
          <Input id="m-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Textarea id="m-desc" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input id="m-price" label="Price ($)" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Select id="m-cat" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={MERCH_CATEGORIES.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
