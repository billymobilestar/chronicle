import Link from "next/link";
import Image from "next/image";

export default function PublicFooter() {
  return (
    <footer className="bg-cobalt-dark text-white overflow-hidden">
      {/* Giant text */}
      <div className="border-b border-white/10 py-16 px-6">
        <div className="max-w-[1400px] mx-auto">
          <p className="font-display text-display-xl text-white/10 uppercase select-none">
            Chronicle
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/chronicle logo.jpg"
                alt="Chronicle Records"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <span className="font-display font-extrabold text-lg uppercase tracking-wider">
                Chronicle
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed font-body">
              Discover new music, connect with artists, and be part of the story.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-white/40 mb-6">
              Explore
            </h3>
            <div className="flex flex-col gap-3">
              {["Artists", "Releases", "Events", "Merch"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="text-sm text-white/60 hover:text-white transition-colors font-body"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-white/40 mb-6">
              Community
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { label: "News", href: "/news" },
                { label: "Join", href: "/sign-up" },
                { label: "Feedback", href: "/feedback" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm text-white/60 hover:text-white transition-colors font-body"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div>
            <h3 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-white/40 mb-6">
              Stay Connected
            </h3>
            <p className="text-sm text-white/50 mb-6 font-body">
              Join the community and never miss a drop.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex font-display font-bold text-sm uppercase tracking-wider bg-accent text-white px-6 py-3 rounded-full hover:bg-accent-hover transition-all duration-300 hover:scale-105"
            >
              Sign Up Free
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30 font-body">
            &copy; {new Date().getFullYear()} Chronicle Records. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-white/30 font-body">Privacy</span>
            <span className="text-xs text-white/30 font-body">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
