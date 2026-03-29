"use client";

import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)] py-8">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <span className="font-semibold text-[var(--foreground)]">VibeCoder</span>
          <nav className="flex gap-6 text-sm text-[var(--muted-foreground)]">
            <Link href="/" className="transition-colors hover:text-[var(--foreground)]">Home</Link>
            <Link href="/dashboard" className="transition-colors hover:text-[var(--foreground)]">Dashboard</Link>
            <Link href="/playground/demo" className="transition-colors hover:text-[var(--foreground)]">Try editor</Link>
            <Link href="/auth/sign-in" className="transition-colors hover:text-[var(--foreground)]">Sign in</Link>
          </nav>
        </div>
        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} VibeCoder. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
