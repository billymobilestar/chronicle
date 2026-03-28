"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { timeAgo, cn } from "@/lib/utils";
import { Bell, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Notification } from "@/lib/types";
import Link from "next/link";
import FanSidebar from "@/components/layout/FanSidebar";
import ArtistSidebar from "@/components/layout/ArtistSidebar";
import AdminSidebar from "@/components/layout/AdminSidebar";
import MobileShell from "@/components/layout/MobileShell";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string>("fan");
  const [artistSlug, setArtistSlug] = useState<string | undefined>();

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      setRole(profile?.role || "fan");

      if (profile?.role === "artist") {
        const { data: artist } = await supabase.from("artists").select("slug").eq("user_id", user.id).single();
        setArtistSlug(artist?.slug);
      }

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
    await supabase.from("notifications").update({ is_read: true }).in("id", unread.map((n) => n.id));
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function markRead(id: string) {
    const supabase = getSupabaseBrowser();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  }

  const sidebar = role === "admin"
    ? <AdminSidebar />
    : role === "artist" && userId
    ? <ArtistSidebar userId={userId} artistSlug={artistSlug} />
    : userId
    ? <FanSidebar userId={userId} />
    : null;

  return (
    <MobileShell
      sidebar={sidebar || <div />}
      label={role === "admin" ? "Admin" : role === "artist" ? "Artist" : "Fan"}
    >
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-display-md text-cobalt font-display font-extrabold uppercase">Notifications</h1>
                <p className="text-cobalt/40 font-body text-sm">{notifications.filter((n) => !n.is_read).length} unread</p>
              </div>
              <Button variant="ghost" size="sm" onClick={markAllRead}>
                <Check className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Mark all read</span>
              </Button>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-20">
                <Bell className="w-12 h-12 text-cobalt/20 mx-auto mb-4" />
                <p className="text-cobalt/30 font-body">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && markRead(n.id)}
                    className={cn(
                      "card-editorial p-3 sm:p-4 flex gap-3 cursor-pointer transition-all hover:shadow-sm",
                      !n.is_read && "border-accent/20 bg-accent/5"
                    )}
                  >
                    <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: n.is_read ? "transparent" : "var(--accent)" }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm text-cobalt uppercase tracking-wide">{n.title}</p>
                      {n.body && <p className="text-sm text-cobalt/50 font-body mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-xs text-cobalt/30 font-body mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {n.link && (
                      <Link href={n.link} className="text-xs text-accent font-display font-bold uppercase tracking-wider self-center hover:underline flex-shrink-0">
                        View
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MobileShell>
  );
}
