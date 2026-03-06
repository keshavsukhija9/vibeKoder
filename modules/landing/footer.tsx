"use client";

import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--vibe-border)] bg-white py-12">
      <div className="mx-auto max-w-[1280px] px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <span className="font-semibold text-[var(--vibe-text)]">VibeCoder</span>
          <div className="flex gap-8 text-sm text-[var(--vibe-text-muted)]">
            <Link href="#how-it-works" className="hover:text-[var(--vibe-text)]">How it works</Link>
            <Link href="#features" className="hover:text-[var(--vibe-text)]">Features</Link>
            <Link href="#pricing" className="hover:text-[var(--vibe-text)]">Pricing</Link>
            <Link href="/dashboard" className="hover:text-[var(--vibe-text)]">Dashboard</Link>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-[var(--vibe-text-muted)]">
          © {new Date().getFullYear()} VibeCoder. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
