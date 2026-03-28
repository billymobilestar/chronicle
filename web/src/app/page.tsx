import Link from "next/link";
import Image from "next/image";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import ArtistCard from "@/components/artists/ArtistCard";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ArrowRight, Music, Users, Calendar, ShoppingBag, Mic2, Sparkles } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Artists",
    description: "Explore our roster and find your next obsession.",
    href: "/artists",
    color: "bg-accent",
  },
  {
    icon: Music,
    title: "Releases",
    description: "New drops. Pre-saves. Exclusive content.",
    href: "/releases",
    color: "bg-cobalt",
  },
  {
    icon: Calendar,
    title: "Events",
    description: "Shows, listening parties, pop-ups. Be there.",
    href: "/events",
    color: "bg-french-blue",
  },
  {
    icon: ShoppingBag,
    title: "Merch",
    description: "Rep the label. Exclusive Chronicle gear.",
    href: "/merch",
    color: "bg-cobalt-dark",
  },
  {
    icon: Mic2,
    title: "Artist Feed",
    description: "Direct from the artists. Behind the scenes. Raw.",
    href: "/sign-up",
    color: "bg-accent",
  },
  {
    icon: Sparkles,
    title: "Community",
    description: "Connect with fans. React. Comment. Belong.",
    href: "/sign-up",
    color: "bg-cobalt",
  },
];

export const revalidate = 60;

export default async function HomePage() {
  const supabase = getSupabaseAdmin();
  const { data: featuredArtists } = await supabase
    .from("artists")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("name", { ascending: true })
    .limit(8);

  return (
    <div className="min-h-screen flex flex-col bg-offwhite">
      <PublicNavbar />

      {/* ============================================ */}
      {/* HERO */}
      {/* ============================================ */}
      <section className="relative bg-cobalt-dark overflow-hidden min-h-[90vh] flex items-center">
        {/* Background texture */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-french-blue/20 blur-[120px]" />
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }} />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                <span className="font-body text-xs text-white/70 uppercase tracking-widest">Now Streaming</span>
              </div>

              <h1 className="text-display-xl text-white font-display font-extrabold uppercase leading-[0.85] mb-8">
                Chron
                <span className="text-accent-glow">i</span>
                cle
                <br />
                <span className="text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.3)]">
                  Records
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-white/50 max-w-lg mb-10 font-body leading-relaxed">
                Discover new music. Connect with artists. Be part of the story.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/sign-up" className="btn-accent text-center">
                  Join the Community
                </Link>
                <Link href="/artists" className="btn-secondary !border-white/20 !text-white hover:!bg-white hover:!text-cobalt text-center">
                  Explore Artists
                </Link>
              </div>
            </div>

            {/* Right - Logo graphic */}
            <div className="hidden lg:flex justify-center items-center relative">
              <div className="relative">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-3xl bg-accent/20 blur-3xl scale-110" />
                <Image
                  src="/chronicle logo.jpg"
                  alt="Chronicle Records"
                  width={400}
                  height={400}
                  className="rounded-3xl relative z-10 shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* MARQUEE STRIP */}
      {/* ============================================ */}
      <div className="diagonal-stripe">
        <div className="marquee-track animate-marquee">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="text-sm tracking-[0.3em] mx-8 flex-shrink-0">
              NEW MUSIC &bull; CHRONICLE RECORDS &bull; CONNECT &bull; DISCOVER &bull; COMMUNITY &bull;{" "}
            </span>
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* FEATURED ARTISTS */}
      {/* ============================================ */}
      {featuredArtists && featuredArtists.length > 0 && (
        <section className="section-padding section-offwhite">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="font-display font-bold text-xs uppercase tracking-[0.2em] text-accent mb-4">
                  The Roster
                </p>
                <h2 className="text-display-lg text-cobalt font-display font-extrabold uppercase">
                  Featured Artists
                </h2>
              </div>
              <Link
                href="/artists"
                className="hidden sm:flex items-center gap-2 font-display font-bold text-sm uppercase tracking-wider text-cobalt/40 hover:text-accent transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>

            <Link
              href="/artists"
              className="sm:hidden flex items-center justify-center gap-2 mt-8 font-display font-bold text-sm uppercase tracking-wider text-accent"
            >
              View All Artists
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* FEATURES GRID */}
      {/* ============================================ */}
      <section className="section-padding section-cream">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="font-display font-bold text-xs uppercase tracking-[0.2em] text-accent mb-4">
              Everything You Need
            </p>
            <h2 className="text-display-lg text-cobalt font-display font-extrabold uppercase">
              One Place.<br />All The Music.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link key={feature.title} href={feature.href} className="group">
                <div className="card-editorial p-8 h-full hover-editorial">
                  <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-display font-extrabold text-cobalt text-xl uppercase tracking-wide mb-3 group-hover:text-accent transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-cobalt/50 font-body leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-accent font-display font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explore
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA SECTION */}
      {/* ============================================ */}
      <section className="relative bg-cobalt overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px]" />

        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 py-24 sm:py-32">
          <div className="max-w-3xl">
            <p className="font-display font-bold text-xs uppercase tracking-[0.2em] text-accent-glow mb-6">
              Join The Story
            </p>
            <h2 className="text-display-lg text-white font-display font-extrabold uppercase mb-6">
              Ready to be<br />
              part of it?
            </h2>
            <p className="text-lg text-white/40 max-w-xl mb-10 font-body leading-relaxed">
              Sign up for free and get direct access to artist updates, exclusive content,
              and the Chronicle community.
            </p>
            <Link href="/sign-up" className="btn-neon inline-flex items-center gap-3">
              Create Your Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
