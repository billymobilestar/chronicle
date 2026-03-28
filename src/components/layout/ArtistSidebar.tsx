"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, User, PenSquare, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import NotificationBell from "./NotificationBell";

const links = [
  { href: "/artist-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/artist-profile", label: "My Profile", icon: User },
  { href: "/artist-posts", label: "My Posts", icon: PenSquare },
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

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all",
              pathname === link.href
                ? "bg-cobalt text-white"
                : "text-cobalt/50 hover:bg-cobalt/5 hover:text-cobalt"
            )}
          >
            <link.icon className="w-4.5 h-4.5" />
            {link.label}
          </Link>
        ))}

        {artistSlug && (
          <Link
            href={`/artists/${artistSlug}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium text-cobalt/50 hover:bg-cobalt/5 hover:text-cobalt transition-all"
          >
            <ExternalLink className="w-4.5 h-4.5" />
            Public Profile
          </Link>
        )}
      </nav>

      <div className="p-4 border-t-2 border-cobalt/5">
        <Link
          href="/community"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium text-cobalt/50 hover:bg-cobalt/5 hover:text-cobalt transition-all"
        >
          Community Feed
        </Link>
      </div>
    </aside>
  );
}
