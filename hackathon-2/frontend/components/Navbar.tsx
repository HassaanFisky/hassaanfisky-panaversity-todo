"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 h-[64px] glass-nav">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Logo />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={cn(
                  "text-[12px] font-bold uppercase tracking-[0.2em] transition-all duration-300",
                  pathname === link.href 
                    ? "text-accent" 
                    : "text-text-muted hover:text-text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="hidden sm:block text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted hover:text-text-primary transition-colors">
            Documentation
          </button>
          <Link 
            href="/dashboard"
            className="btn-tactile bg-text-primary text-white font-bold text-[11px] uppercase tracking-widest px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md"
          >
            Launch App
          </Link>
        </div>
      </div>
    </nav>
  );
}

