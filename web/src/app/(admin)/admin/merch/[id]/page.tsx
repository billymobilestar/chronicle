"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import { Textarea, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { MERCH_CATEGORIES } from "@/lib/constants";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditMerchPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("apparel");
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isNew) return;
    async function load() {
      const res = await fetch(`/api/merch/${id}`);
      if (res.ok) {
        const data = await res.json();
        setName(data.name);
        setDescription(data.description || "");
        setPrice(data.price?.toString() || "");
        setCategory(data.category || "apparel");
        setIsAvailable(data.is_available);
      }
      setLoading(false);
    }
    load();
  }, [id, isNew]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = { name, description, price: price ? parseFloat(price) : null, category, is_available: isAvailable };
    const res = isNew
      ? await fetch("/api/merch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch(`/api/merch/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { toast(isNew ? "Created!" : "Updated!"); if (isNew) router.push("/admin/merch"); }
    else toast("Failed to save", "error");
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this item?")) return;
    const res = await fetch(`/api/merch/${id}`, { method: "DELETE" });
    if (res.ok) { toast("Deleted"); router.push("/admin/merch"); }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-2xl">
      <Link href="/admin/merch" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-cobalt mb-6">
        <ArrowLeft className="w-4 h-4" />Back to Merch
      </Link>
      <h1 className="text-2xl font-bold text-cobalt mb-6">{isNew ? "New Merch Item" : "Edit Item"}</h1>
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <Input id="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Textarea id="description" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input id="price" label="Price ($)" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Select id="category" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={MERCH_CATEGORIES.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} className="rounded" />
          <span className="text-sm">Available</span>
        </label>
        <div className="flex gap-3">
          <Button type="submit" loading={saving}><Save className="w-4 h-4 mr-2" />Save</Button>
          {!isNew && <Button type="button" variant="danger" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>}
        </div>
      </form>
    </div>
  );
}
