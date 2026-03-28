"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Newspaper,
  ShoppingBag,
  Calendar,
  Music,
  Video,
  MessageSquare,
  Megaphone,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/community", label: "Community", icon: Megaphone },
  { href: "/admin/artists", label: "Artists", icon: Users },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/merch", label: "Merchandise", icon: ShoppingBag },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/releases", label: "Releases", icon: Music },
  { href: "/admin/videos", label: "Videos", icon: Video },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen sticky top-0 bg-cobalt-dark text-white flex flex-col">
      <div className="p-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image src="/chronicle logo.jpg" alt="Chronicle" width={36} height={36} className="rounded-xl" />
          <div>
            <span className="font-display font-extrabold uppercase tracking-wider text-sm block">Chronicle</span>
            <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-accent-glow">Admin</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all",
              pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
                ? "bg-white/15 text-white"
                : "text-white/40 hover:bg-white/5 hover:text-white/70"
            )}
          >
            <link.icon className="w-4.5 h-4.5" />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium text-white/40 hover:bg-white/5 hover:text-white/70 transition-all"
        >
          <ExternalLink className="w-4.5 h-4.5" />
          View Public Site
        </Link>
      </div>
    </aside>
  );
}
