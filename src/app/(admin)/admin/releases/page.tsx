"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Plus, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Release } from "@/lib/types";

export default function AdminReleasesPage() {
  const [releases, setReleases] = useState<(Release & { artist: { name: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase.from("releases").select("*, artist:artists(name)").order("release_date", { ascending: false });
      setReleases(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-cobalt">Releases</h1>
        <Link href="/admin/releases/new">
          <Button><Plus className="w-4 h-4 mr-2" />Add Release</Button>
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Artist</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {releases.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-cobalt">{r.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.artist?.name || "-"}</td>
                  <td className="px-6 py-4"><Badge>{r.release_type}</Badge></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.release_date ? formatDate(r.release_date) : "-"}</td>
                  <td className="px-6 py-4">
                    <Badge variant={r.is_published ? "success" : "warning"}>
                      {r.is_published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/releases/${r.id}`}>
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
