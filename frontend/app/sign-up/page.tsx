// e:/panaversity/hackathon-2-todo/hackathon-2/frontend/app/sign-up/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { Logo } from "@/components/Logo";

const PRIVILEGES = [
  "AI-powered task intelligence via Groq LPU",
  "Persistent cross-session memory archive",
  "Editorial dashboard with keyboard commands",
];

export default function SignUpPage() {
  const router = useRouter();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await signUp.email({ name, email, password });
      if (res.error) throw new Error(res.error.message);
      toast.success("Protocol initialized. Welcome, Scholar.");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Initialization failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col selection:bg-accent/10">
      {/* Atmospheric ornamentation */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[50%] h-full bg-gradient-to-r from-accent/5 to-transparent blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-0 w-[30%] h-full bg-gradient-to-l from-bg-surface to-transparent blur-2xl opacity-40" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-nav h-[64px] flex items-center justify-between px-8">
        <Link href="/" className="hover:opacity-80 transition-editorial">
          <Logo />
        </Link>
        <Link
          href="/sign-in"
          className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted hover:text-text-primary transition-colors"
        >
          Sign In
        </Link>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center px-6 py-20 relative z-10">
        <div className="w-full max-w-md">

          {/* Editorial eyebrow */}
          <div className="mb-12 space-y-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.5em] text-accent">
              Scholar Initialization
            </div>
            <h1 className="text-5xl font-serif tracking-tight text-text-primary leading-none">
              Begin your <span className="italic font-normal">Protocol.</span>
            </h1>
            <p className="text-sm font-medium text-text-muted leading-relaxed">
              Free forever. No credit card required. Start producing immediately.
            </p>
          </div>

          {/* Privileges */}
          <div className="mb-8 space-y-3">
            {PRIVILEGES.map((p) => (
              <div key={p} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#579D84] shrink-0" />
                <span className="text-[12px] font-medium text-text-secondary">{p}</span>
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="glass-apple rounded-3xl shadow-float p-10 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border-fine bg-bg-base px-5 py-4 text-sm font-medium text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-editorial"
                  placeholder="Your Name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted">
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
                <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted">
                  Password{" "}
                  <span className="text-text-muted/50 normal-case tracking-normal font-normal">(min. 8 characters)</span>
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border-fine bg-bg-base px-5 py-4 text-sm font-medium text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-editorial"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-tactile w-full flex items-center justify-center gap-3 rounded-xl bg-accent py-4 text-[11px] font-bold uppercase tracking-widest text-white shadow-float hover:brightness-110 disabled:opacity-50 transition-editorial"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Sign Up <ArrowRight className="h-4 w-4" />
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
              Already a scholar?{" "}
              <Link
                href="/sign-in"
                className="font-bold text-accent hover:text-accent/80 transition-colors underline-offset-4 hover:underline"
              >
                Sign In
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
