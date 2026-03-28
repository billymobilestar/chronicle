"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Menu, X, User, LayoutDashboard, LogOut, Music, Video, Calendar,
  ShoppingBag, PenSquare, MessageSquare, Bell, Settings,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

const navLinks = [
  { href: "/artists", label: "Artists" },
  { href: "/releases", label: "Releases" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/merch", label: "Merch" },
];

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowser();

    async function getSession() {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u ? { id: u.id, email: u.email } : null);

      if (u) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", u.id)
          .single();
        setRole(profile?.role ?? null);
      }
    }

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: { user: { id: string; email?: string } } | null) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        supabase.from("profiles").select("role").eq("id", session.user.id).single()
          .then(({ data }: { data: { role: string } | null }) => setRole(data?.role ?? null));
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setShowUserMenu(false);
    router.push("/");
    router.refresh();
  }

  const artistMenuLinks = [
    { href: "/artist-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/artist-profile", label: "My Profile", icon: User },
    { href: "/artist-posts", label: "Community Posts", icon: PenSquare },
    { href: "/artist-releases", label: "My Releases", icon: Music },
    { href: "/artist-videos", label: "My Videos", icon: Video },
    { href: "/artist-events", label: "My Events", icon: Calendar },
    { href: "/artist-merch", label: "My Merch", icon: ShoppingBag },
    { href: "/community", label: "Community Feed", icon: MessageSquare },
    { href: "/notifications", label: "Notifications", icon: Bell },
  ];

  const adminMenuLinks = [
    { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
    { href: "/admin/community", label: "Community", icon: MessageSquare },
    { href: "/admin/artists", label: "Manage Artists", icon: User },
    { href: "/admin/releases", label: "Manage Releases", icon: Music },
    { href: "/feed", label: "Fan View", icon: Settings },
  ];

  const fanMenuLinks = [
    { href: "/feed", label: "My Feed", icon: LayoutDashboard },
    { href: "/community", label: "Community", icon: MessageSquare },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
  ];

  function getMenuLinks() {
    if (role === "admin") return adminMenuLinks;
    if (role === "artist") return artistMenuLinks;
    return fanMenuLinks;
  }

  return (
    <nav className="sticky top-0 z-50 bg-offwhite/90 backdrop-blur-md border-b-2 border-cobalt/5">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/chronicle logo.jpg"
              alt="Chronicle Records"
              width={44}
              height={44}
              className="rounded-xl group-hover:rotate-6 transition-transform duration-300"
            />
            <span className="font-display font-extrabold text-cobalt text-lg uppercase tracking-wider hidden sm:block">
              Chronicle
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-5 py-2 font-display font-semibold text-sm uppercase tracking-wider text-cobalt/70 hover:text-cobalt transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-cobalt/5 hover:bg-cobalt/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-cobalt flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block font-display font-semibold text-xs uppercase tracking-wider text-cobalt">
                    {role === "admin" ? "Admin" : role === "artist" ? "Artist" : "Account"}
                  </span>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border-2 border-cobalt/5 shadow-xl z-50 py-2 animate-scale-in max-h-[80vh] overflow-y-auto">
                      <p className="px-4 py-2 text-xs text-cobalt/40 font-body truncate">{user.email}</p>
                      {role && (
                        <p className="px-4 pb-2 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-accent">
                          {role === "admin" ? "Super Admin" : role === "artist" ? "Artist Account" : "Fan Account"}
                        </p>
                      )}
                      <div className="border-t border-cobalt/5 my-1" />

                      {getMenuLinks().map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-body text-cobalt hover:bg-cobalt/5 transition-colors"
                        >
                          <link.icon className="w-4 h-4 text-cobalt/40" />
                          {link.label}
                        </Link>
                      ))}

                      <div className="border-t border-cobalt/5 my-1" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-body text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="hidden sm:inline-flex font-display font-semibold text-sm uppercase tracking-wider text-cobalt/70 hover:text-cobalt px-4 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="hidden sm:inline-flex font-display font-bold text-sm uppercase tracking-wider bg-cobalt text-white px-6 py-2.5 rounded-full hover:bg-accent transition-all duration-300 hover:scale-105"
                >
                  Join
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-cobalt"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-6 border-t-2 border-cobalt/5 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 font-display font-bold text-lg uppercase tracking-wider text-cobalt hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {user && (
                <>
                  <div className="border-t border-cobalt/5 my-3" />
                  <p className="px-4 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-cobalt/30 mb-2">
                    {role === "admin" ? "Admin" : role === "artist" ? "Artist" : "Account"}
                  </p>
                  {getMenuLinks().map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 font-body text-sm text-cobalt/70 hover:text-cobalt transition-colors"
                    >
                      <link.icon className="w-4 h-4 text-cobalt/40" />
                      {link.label}
                    </Link>
                  ))}
                </>
              )}

              <div className="flex gap-3 mt-4 px-4">
                {user ? (
                  <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="btn-secondary text-sm flex-1 !py-3">
                    Sign Out
                  </button>
                ) : (
                  <>
                    <Link href="/sign-in" className="btn-secondary text-sm flex-1 text-center !py-3" onClick={() => setMobileOpen(false)}>
                      Sign In
                    </Link>
                    <Link href="/sign-up" className="btn-primary text-sm flex-1 text-center !py-3" onClick={() => setMobileOpen(false)}>
                      Join
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
