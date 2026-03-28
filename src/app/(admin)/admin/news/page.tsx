"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Plus, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Announcement } from "@/lib/types";

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      setArticles(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-cobalt">News & Announcements</h1>
        <Link href="/admin/news/new">
          <Button><Plus className="w-4 h-4 mr-2" />New Article</Button>
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
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-cobalt">{a.title}</td>
                  <td className="px-6 py-4">
                    <Badge variant={a.is_published ? "success" : "warning"}>
                      {a.is_published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(a.created_at)}</td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/news/${a.id}`}>
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
