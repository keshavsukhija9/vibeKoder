"use client";

import Link from "next/link";

/**
 * App navbar — matches landing navbar (frosted glass, VibeCoder logo, same CTAs).
 * Used on dashboard and any in-app page for a uniform look.
 */
export function AppNavbar() {
  return (
    <nav
      className="sticky top-0 z-40 flex h-16 items-center border-b border-[var(--vibe-border)] bg-white/80 px-4 backdrop-blur-[20px]"
      style={{ boxShadow: "0 1px 0 rgba(229,231,235,0.5)" }}
    >
      <div className="flex w-full max-w-[1280px] mx-auto items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-[var(--vibe-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="text-xl">VibeCoder</span>
          <span className="inline-block h-6 w-6 rounded bg-gradient-to-br from-[var(--vibe-primary)] to-[var(--vibe-secondary)] opacity-90" />
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-[var(--vibe-text-muted)] transition-colors hover:text-[var(--vibe-text)]"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-[var(--vibe-text-muted)] transition-colors hover:text-[var(--vibe-text)]"
          >
            Dashboard
          </Link>
          <Link
            href="/playground/demo"
            className="rounded-full bg-gradient-to-r from-[var(--vibe-primary)] to-[var(--vibe-secondary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(30,95,168,0.35)]"
          >
            Try editor
          </Link>
        </div>
      </div>
    </nav>
  );
}
