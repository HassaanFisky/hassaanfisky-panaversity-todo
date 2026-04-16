"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { MotionDiv, fadeUp, stagger } from "@/components/motion";
import { Navbar } from "@/components/Navbar";

const features = [
  {
    icon: CheckCircle2,
    title: "Editorial Tasking",
    desc: "Manage your professional obligations with a refined, distraction-free interface.",
  },
  {
    icon: Sparkles,
    title: "AI Synthesis",
    desc: "Communicate with your productivity stack via advanced Groq-powered intelligence.",
  },
  {
    icon: Zap,
    title: "Scholar Rhythm",
    desc: "Optimized for deep work with keyboard-first navigation and rapid command entry.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Archive",
    desc: "Production-grade encryption with hardened FastAPI backend and JWT isolation.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-base relative">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 px-6">
          <MotionDiv 
            variants={fadeUp}
            initial="initial"
            animate="animate"
            className="relative z-10 w-full max-w-5xl mx-auto text-center"
          >
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="h-[1px] w-8 bg-accent/30 rounded-full" />
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em]">Evolution of To-Do v2.0</span>
              <div className="h-[1px] w-8 bg-accent/30 rounded-full" />
            </div>
            
            <h1 className="text-5xl md:text-[88px] font-serif font-medium tracking-tight leading-[1.02] text-text-primary mb-12">
              Deep Work. 
              <br />
              <span className="text-accent italic">Perfected.</span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl md:text-2xl text-text-muted font-medium leading-[1.6] mb-16">
              A high-fidelity task management system designed for technical scholars. Built with Next.js 15, FastAPI, and accelerated by Aira intelligence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/sign-up"
                className="btn-tactile btn-accent px-10 py-4 font-bold text-[12px] uppercase tracking-widest flex items-center gap-3 rounded-lg shadow-sm"
              >
                Launch Protocol <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sign-in"
                className="btn-tactile border border-border-fine bg-bg-surface text-text-primary px-10 py-4 font-bold text-[12px] uppercase tracking-widest rounded-lg hover:border-accent/40"
              >
                Access Archive
              </Link>
            </div>
          </MotionDiv>
        </section>

        {/* Features Grids */}
        <section className="relative z-10 py-32 border-t border-border-fine bg-bg-surface/30 backdrop-blur-md">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-6 mb-20">
              <h2 className="text-[11px] font-bold text-text-muted uppercase tracking-[0.3em] whitespace-nowrap">Core Capabilities</h2>
              <div className="h-[0.8px] flex-1 bg-border-fine" />
            </div>

            <MotionDiv 
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4"
            >
              {features.map(({ icon: Icon, title, desc }) => (
                <MotionDiv
                  key={title}
                  variants={fadeUp}
                  className="card-humanist p-10 group"
                >
                  <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-bg-base text-accent border border-fine group-hover:bg-accent/10 transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-4 font-serif text-2xl font-medium text-text-primary group-hover:text-accent transition-colors">{title}</h3>
                  <p className="text-[14px] text-text-muted leading-relaxed font-medium">{desc}</p>
                </MotionDiv>
              ))}
            </MotionDiv>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-fine py-16 bg-bg-base text-center overflow-hidden">
        <div className="container mx-auto px-6 flex flex-col items-center gap-8">
          <div className="text-[10px] font-bold tracking-[0.4em] uppercase text-text-muted">
            Panaversity Hackathon II · Digital Publication
          </div>
          <div className="h-[1px] w-24 bg-border-fine" />
          <p className="text-[12px] font-serif italic text-text-muted max-w-md">
            "The secret of getting ahead is getting started."
          </p>
        </div>
      </footer>
    </div>
  );
}

