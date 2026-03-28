"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { timeAgo } from "@/lib/utils";
import { Check, Mail } from "lucide-react";
import type { FanFeedback } from "@/lib/types";

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FanFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase.from("fan_feedback").select("*").order("created_at", { ascending: false });
      setFeedback(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function markRead(id: string) {
    const supabase = getSupabaseBrowser();
    await supabase.from("fan_feedback").update({ is_read: true }).eq("id", id);
    setFeedback((prev) => prev.map((f) => (f.id === id ? { ...f, is_read: true } : f)));
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cobalt">Fan Feedback</h1>
        <p className="text-gray-500 text-sm">{feedback.filter((f) => !f.is_read).length} unread</p>
      </div>

      {feedback.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400">No feedback yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map((f) => (
            <div key={f.id} className={`bg-white rounded-2xl border p-5 ${f.is_read ? "border-gray-100" : "border-accent/20 bg-accent/5"}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={f.category === "bug" ? "danger" : f.category === "feature_request" ? "accent" : "default"}>
                    {f.category}
                  </Badge>
                  {f.subject && <span className="font-semibold text-cobalt">{f.subject}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{timeAgo(f.created_at)}</span>
                  {!f.is_read && (
                    <Button variant="ghost" size="sm" onClick={() => markRead(f.id)}>
                      <Check className="w-3.5 h-3.5 mr-1" />Read
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{f.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
