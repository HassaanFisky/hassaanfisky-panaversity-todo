"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession, authClient } from "@/lib/auth-client";
import { MessageSquare, LayoutDashboard, LogOut, Globe } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat",      label: "AI Assistant", icon: MessageSquare },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/sign-in");
  }

  return (
    <nav className="sticky top-0 z-50 h-[64px] glass-nav">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <Logo />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={cn(
                  "flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 relative group py-1",
                  pathname.startsWith(link.href)
                    ? "text-accent" 
                    : "text-text-muted hover:text-text-primary"
                )}
              >
                <link.icon className="h-3.5 w-3.5 opacity-60" />
                {link.label}
                <span className={cn(
                  "absolute bottom-0 left-0 w-full h-[1.5px] bg-accent transition-transform duration-500 scale-x-0 group-hover:scale-x-100 origin-left",
                  pathname.startsWith(link.href) && "scale-x-100"
                )} />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="https://panaversity-h0-portfolio.vercel.app"
            className="navbar-cta-primary hidden md:flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-full font-bold text-[10px] uppercase tracking-widest ring-1 ring-white/20 hover:brightness-110 hover:ring-white/40 active:scale-95 transition-all duration-300"
          >
            <Globe size={14} className="animate-globe-spin shrink-0" />
            Portfolio Hub
          </Link>
          
          {session?.user && (
            <div className="hidden md:flex items-center gap-3 ml-2">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-bold text-text-primary leading-none">{session.user.name}</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted mt-0.5">{session.user.email}</span>
              </div>
            </div>
          )}
          {session ? (
            <button
              onClick={handleSignOut}
              className="btn-tactile flex items-center gap-2 border border-border-fine bg-bg-surface text-text-muted font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl hover:border-red-300 hover:text-red-500 transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          ) : (
            <Link 
              href="/sign-in"
              className="btn-tactile bg-text-primary text-bg-base font-bold text-[11px] uppercase tracking-widest px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-editorial"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

