"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard, User, PenSquare, Music, Video, Calendar,
  ShoppingBag, ExternalLink, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import NotificationBell from "./NotificationBell";

const mainLinks = [
  { href: "/artist-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/artist-profile", label: "My Profile", icon: User },
  { href: "/artist-posts", label: "Community Posts", icon: PenSquare },
];

const manageLinks = [
  { href: "/artist-releases", label: "My Releases", icon: Music },
  { href: "/artist-videos", label: "My Videos", icon: Video },
  { href: "/artist-events", label: "My Events", icon: Calendar },
  { href: "/artist-merch", label: "My Merch", icon: ShoppingBag },
];

export default function ArtistSidebar({ userId, artistSlug }: { userId: string; artistSlug?: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r-2 border-cobalt/5 flex flex-col">
      <div className="p-5 border-b-2 border-cobalt/5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/chronicle logo.jpg" alt="Chronicle" width={36} height={36} className="rounded-xl" />
          <div>
            <span className="font-display font-extrabold text-cobalt uppercase tracking-wider text-sm block">Chronicle</span>
            <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-accent">Artist</span>
          </div>
        </Link>
        <NotificationBell userId={userId} />
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <p className="px-3 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-cobalt/30 mb-2">Main</p>
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all",
                pathname === link.href ? "bg-cobalt text-white" : "text-cobalt/50 hover:bg-cobalt/5 hover:text-cobalt"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </div>

        <div>
          <p className="px-3 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-cobalt/30 mb-2">Manage</p>
          {manageLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all",
                pathname.startsWith(link.href) ? "bg-cobalt text-white" : "text-cobalt/50 hover:bg-cobalt/5 hover:text-cobalt"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </div>

        <div>
          <p className="px-3 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-cobalt/30 mb-2">View</p>
          {artistSlug && (
            <Link
              href={`/artists/${artistSlug}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium text-cobalt/50 hover:bg-cobalt/5 hover:text-cobalt transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Public Profile
            </Link>
          )}
          <Link
            href="/community"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium text-cobalt/50 hover:bg-cobalt/5 hover:text-cobalt transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            Community Feed
          </Link>
        </div>
      </nav>
    </aside>
  );
}
