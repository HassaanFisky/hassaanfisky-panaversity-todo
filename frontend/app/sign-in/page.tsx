// e:/panaversity/hackathon-2-todo/hackathon-2/frontend/app/sign-in/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { Logo } from "@/components/Logo";

export default function SignInPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn.email({ email, password });
      if (res.error) throw new Error(res.error.message);
      toast.success("Welcome back, Scholar.");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col selection:bg-accent/10">
      {/* Atmospheric ornamentation */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-accent/5 to-transparent blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 w-[30%] h-full bg-gradient-to-r from-bg-surface to-transparent blur-2xl opacity-40" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-nav h-[64px] flex items-center justify-between px-8">
        <Link href="/" className="hover:opacity-80 transition-editorial">
          <Logo />
        </Link>
        <Link
          href="/sign-up"
          className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted hover:text-text-primary transition-colors"
        >
          Sign Up
        </Link>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center px-6 py-20 relative z-10">
        <div className="w-full max-w-md">

          {/* Editorial eyebrow */}
          <div className="mb-12 space-y-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.5em] text-accent">
              Scholar Authentication
            </div>
            <h1 className="text-5xl font-serif tracking-tight text-text-primary leading-none">
              Access your <span className="italic font-normal">Archive.</span>
            </h1>
            <p className="text-sm font-medium text-text-muted leading-relaxed">
              Enter your credentials to resume your productivity protocol.
            </p>
          </div>

          {/* Card */}
          <div className="glass-apple rounded-3xl shadow-float p-10 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border-fine bg-bg-base px-5 py-4 text-sm font-medium text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-editorial"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border-fine bg-bg-base px-5 py-4 text-sm font-medium text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-editorial"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-tactile w-full flex items-center justify-center gap-3 rounded-xl bg-text-primary py-4 text-[11px] font-bold uppercase tracking-widest text-white shadow-float hover:brightness-110 disabled:opacity-50 transition-editorial"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-[0.8px] bg-border-fine" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">or</span>
              <div className="flex-1 h-[0.8px] bg-border-fine" />
            </div>

            <p className="text-center text-[12px] text-text-muted">
              New scholar?{" "}
              <Link
                href="/sign-up"
                className="font-bold text-accent hover:text-accent/80 transition-colors underline-offset-4 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>

          {/* Footer note */}
          <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-text-muted opacity-40">
            Panaversity OpenTask · Secure Protocol
          </p>
        </div>
      </main>
    </div>
  );
}
