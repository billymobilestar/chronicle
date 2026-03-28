import { getSupabaseAdmin } from "@/lib/supabase";
import { Users, Music, ShoppingBag, Calendar, MessageSquare, Newspaper } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const supabase = getSupabaseAdmin();

  const [
    { count: artistCount },
    { count: fanCount },
    { count: releaseCount },
    { count: eventCount },
    { count: merchCount },
    { count: newsCount },
    { count: feedbackCount },
  ] = await Promise.all([
    supabase.from("artists").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "fan"),
    supabase.from("releases").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("merch_items").select("*", { count: "exact", head: true }),
    supabase.from("announcements").select("*", { count: "exact", head: true }),
    supabase.from("fan_feedback").select("*", { count: "exact", head: true }).eq("is_read", false),
  ]);

  const stats = [
    { label: "Artists", value: artistCount || 0, icon: Users, href: "/admin/artists", color: "bg-blue-500" },
    { label: "Fans", value: fanCount || 0, icon: Users, href: "/admin", color: "bg-green-500" },
    { label: "Releases", value: releaseCount || 0, icon: Music, href: "/admin/releases", color: "bg-purple-500" },
    { label: "Events", value: eventCount || 0, icon: Calendar, href: "/admin/events", color: "bg-orange-500" },
    { label: "Merch Items", value: merchCount || 0, icon: ShoppingBag, href: "/admin/merch", color: "bg-pink-500" },
    { label: "News Articles", value: newsCount || 0, icon: Newspaper, href: "/admin/news", color: "bg-cyan-500" },
    { label: "Unread Feedback", value: feedbackCount || 0, icon: MessageSquare, href: "/admin/feedback", color: "bg-yellow-500" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cobalt">Admin Dashboard</h1>
        <p className="text-gray-500">Overview of Chronicle Records</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 hover-lift">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold text-cobalt">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
