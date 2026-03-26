"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { MotionDiv, fadeUp, stagger } from "@/components/motion";
import { Navbar } from "@/components/Navbar";

const features = [
  {
    icon: CheckCircle2,
    title: "Smart Task Management",
    desc: "Add, edit, prioritise, and track tasks with a clean, distraction-free UI.",
  },
  {
    icon: Sparkles,
    title: "AI Chat Assistant",
    desc: "Talk to your task list. Ask Groq-powered AI to add, complete, or summarise tasks.",
  },
  {
    icon: Zap,
    title: "Keyboard-First",
    desc: "Press N to add a task, Ctrl+Enter to send a chat message — built for power users.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Default",
    desc: "JWT-based auth, per-user data isolation, and a hardened FastAPI backend.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-base)]">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 overflow-hidden">
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-12">
          {/* Radial Gradients */}
          <div 
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 900px 600px at 50% -100px, rgba(212,165,116,0.08), transparent 70%),
                radial-gradient(ellipse 600px 400px at 80% 80%, rgba(61,214,140,0.04), transparent 60%),
                var(--bg-base)`
            }}
          />

          {/* Noise Texture */}
          <svg className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-[0.035]">
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
              <feColorMatrix type="saturate" values="0"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)"/>
          </svg>

          <MotionDiv 
            variants={fadeUp}
            initial="initial"
            animate="animate"
            className="relative z-10 container mx-auto px-4 text-center max-w-4xl"
          >
            <div className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--text-muted)] mb-6">
              Panaversity Hackathon II
            </div>
            
            <h1 className="text-[52px] font-semibold tracking-[-0.03em] leading-[1.1] text-[var(--text-primary)] mb-8">
              Tasks done right.
              <br />
              <span style={{ color: "var(--accent)" }}>Every single time.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-[17px] text-[var(--text-secondary)] font-medium leading-relaxed mb-10">
              A world-class task manager with JWT auth, priority badges, AI chat, and cloud sync — built on Next.js 15, FastAPI, and Groq.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/sign-up"
                className="bg-[var(--accent)] text-[#0A0A0A] font-medium text-[13px] px-6 py-2.5 rounded-[var(--radius-sm)] hover:brightness-110 active:scale-[0.97] transition-all duration-150 flex items-center gap-2 shadow-sm"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sign-in"
                className="bg-transparent border border-[var(--border-muted)] text-[var(--text-primary)] text-[13px] font-medium px-6 py-2.5 rounded-[var(--radius-sm)] hover:border-[var(--border-active)] hover:bg-[var(--bg-elevated)] transition-all duration-150"
              >
                Sign in
              </Link>
            </div>
          </MotionDiv>
        </section>

        {/* Features Grids */}
        <section className="relative z-10 py-24 bg-[var(--bg-base)]">
          <div className="container mx-auto px-4">
            <MotionDiv 
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {features.map(({ icon: Icon, title, desc }, i) => (
                <MotionDiv
                  key={title}
                  variants={fadeUp}
                  className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)] hover:border-[var(--border-muted)] hover:-translate-y-[1px] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-dim)]">
                    <Icon className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <h3 className="mb-2 font-semibold text-[15px] text-[var(--text-primary)]">{title}</h3>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{desc}</p>
                </MotionDiv>
              ))}
            </MotionDiv>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-12 bg-[var(--bg-base)] text-center">
        <div className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--text-muted)]">
          Built for Panaversity · Next.js 15 · FastAPI · Groq
        </div>
      </footer>
    </div>
  );
}
