"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Plus, Pencil } from "lucide-react";
import type { MerchItem } from "@/lib/types";

export default function AdminMerchPage() {
  const [items, setItems] = useState<MerchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase.from("merch_items").select("*").order("sort_order");
      setItems(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-cobalt">Merchandise</h1>
        <Link href="/admin/merch/new">
          <Button><Plus className="w-4 h-4 mr-2" />Add Item</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-cobalt">{item.name}</td>
                  <td className="px-6 py-4 text-sm">{item.price ? `$${item.price}` : "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.category || "-"}</td>
                  <td className="px-6 py-4">
                    <Badge variant={item.is_available ? "success" : "danger"}>
                      {item.is_available ? "Available" : "Hidden"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/merch/${item.id}`}>
                      <Button variant="ghost" size="sm"><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
