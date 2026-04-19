import * as React from "react";
import { cn } from "@/lib/utils";

export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-7 h-7", className)}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer ring */}
      <circle cx="14" cy="14" r="13" stroke="var(--accent)" strokeWidth="1.2" strokeDasharray="3 2" />
      {/* Check body */}
      <rect x="7" y="9" width="14" height="3" rx="1.5" fill="var(--accent)" opacity="0.9" />
      <rect x="7" y="14" width="10" height="3" rx="1.5" fill="var(--accent)" opacity="0.6" />
      <rect x="7" y="19" width="6" height="3" rx="1.5" fill="var(--accent)" opacity="0.3" />
      {/* Accent dot */}
      <circle cx="22" cy="9" r="2.5" fill="var(--accent)" />
    </svg>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoIcon />
      <div className="flex flex-col leading-tight">
        <span className="font-sans font-bold text-[13px] tracking-[-0.01em] text-[var(--text-primary)]">
          Evolution of
        </span>
        <span className="font-serif italic text-[12px] text-[var(--accent)]">
          To-Do
        </span>
      </div>
    </div>
  );
}
