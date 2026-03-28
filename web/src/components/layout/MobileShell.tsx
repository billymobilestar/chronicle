"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function MobileShell({
  sidebar,
  children,
  label,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        {sidebar}
      </div>

      {/* Mobile overlay */}
      {open && (
        <>
          <div className="fixed inset-0 bg-cobalt-dark/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden animate-slide-in-left">
            <div onClick={() => setOpen(false)}>
              {sidebar}
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-offwhite/90 backdrop-blur-md border-b-2 border-cobalt/5 px-4 h-14 flex items-center gap-3">
          <button onClick={() => setOpen(true)} className="p-1.5 text-cobalt">
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/chronicle logo.jpg" alt="Chronicle" width={28} height={28} className="rounded-lg" />
            <span className="font-display font-extrabold text-cobalt text-sm uppercase tracking-wider">
              Chronicle
            </span>
          </Link>
          {label && (
            <span className="text-[9px] font-display font-bold uppercase tracking-[0.2em] text-accent ml-auto">
              {label}
            </span>
          )}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
