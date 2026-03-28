"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Users,
  MessageSquare,
  User,
  Send,
  Search,
  Music,
  Calendar,
  ShoppingBag,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import NotificationBell from "./NotificationBell";

const mainLinks = [
  { href: "/feed", label: "My Feed", icon: Home },
  { href: "/community", label: "Community", icon: MessageSquare },
];

const exploreLinks = [
  { href: "/artists", label: "Artists", icon: Users },
  { href: "/releases", label: "Releases", icon: Music },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/merch", label: "Merch", icon: ShoppingBag },
  { href: "/search", label: "Search", icon: Search },
];

const accountLinks = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/feedback", label: "Feedback", icon: Send },
];

export default function FanSidebar({ userId }: { userId: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r-2 border-cobalt/5 flex flex-col">
      <div className="p-5 border-b-2 border-cobalt/5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/chronicle logo.jpg" alt="Chronicle" width={36} height={36} className="rounded-xl" />
          <span className="font-display font-extrabold text-cobalt uppercase tracking-wider text-sm">Chronicle</span>
        </Link>
        <NotificationBell userId={userId} />
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-8">
        <SidebarSection label="Main" links={mainLinks} pathname={pathname} />
        <SidebarSection label="Explore" links={exploreLinks} pathname={pathname} />
        <SidebarSection label="Account" links={accountLinks} pathname={pathname} />
      </nav>
    </aside>
  );
}

function SidebarSection({
  label,
  links,
  pathname,
}: {
  label: string;
  links: { href: string; label: string; icon: React.ElementType }[];
  pathname: string;
}) {
  return (
    <div>
      <p className="px-3 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-cobalt/30 mb-3">
        {label}
      </p>
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
    </div>
  );
}
