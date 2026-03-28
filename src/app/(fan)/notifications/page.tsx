"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { timeAgo } from "@/lib/utils";
import { Bell, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Notification } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setNotifications(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function markAllRead() {
    const supabase = getSupabaseBrowser();
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unread.map((n) => n.id));

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );
  }

  async function markRead(id: string) {
    const supabase = getSupabaseBrowser();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cobalt">Notifications</h1>
          <p className="text-gray-500 text-sm">
            {notifications.filter((n) => !n.is_read).length} unread
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={markAllRead}>
          <Check className="w-4 h-4 mr-1" />
          Mark all read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markRead(n.id)}
              className={cn(
                "bg-white rounded-xl border p-4 flex gap-3 cursor-pointer transition-all hover:shadow-sm",
                n.is_read ? "border-gray-100" : "border-accent/20 bg-accent/5"
              )}
            >
              <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: n.is_read ? "transparent" : "var(--accent)" }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-cobalt">{n.title}</p>
                {n.body && <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>}
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
              </div>
              {n.link && (
                <Link
                  href={n.link}
                  className="text-xs text-accent font-medium self-center hover:underline"
                >
                  View
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
