"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function SignUpPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const supabase = getSupabaseBrowser();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role: "fan",
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-offwhite">
      {/* Left - Graphic */}
      <div className="hidden lg:flex lg:w-1/2 bg-cobalt-dark items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute bottom-20 right-20 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
        </div>
        <div className="relative text-center">
          <Image
            src="/chronicle logo.jpg"
            alt="Chronicle Records"
            width={200}
            height={200}
            className="rounded-3xl mx-auto mb-8 shadow-2xl"
          />
          <h2 className="text-display-md text-white font-display font-extrabold uppercase">
            Join The<br />Story
          </h2>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-block lg:hidden mb-8">
            <Image
              src="/chronicle logo.jpg"
              alt="Chronicle Records"
              width={56}
              height={56}
              className="rounded-xl"
            />
          </Link>

          <h1 className="text-display-md text-cobalt font-display font-extrabold uppercase mb-2">
            Join Chronicle
          </h1>
          <p className="text-cobalt/40 font-body mb-8">Create your account and join the community</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 text-red-600 text-sm px-4 py-3 rounded-2xl font-body">
                {error}
              </div>
            )}

            <Input
              id="displayName"
              label="Display Name"
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-cobalt/40 mt-8 font-body">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-accent font-display font-bold uppercase text-xs tracking-wider hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
