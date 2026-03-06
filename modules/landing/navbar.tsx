"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
];

export function LandingNavbar() {
  const navRef = useRef<HTMLElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const anime = require("animejs").default;
    if (!navRef.current) return;
    anime({
      targets: linksRef.current.filter(Boolean),
      translateY: [-20, 0],
      opacity: [0, 1],
      delay: anime.stagger(60),
      duration: 400,
      easing: "easeOutExpo",
    });
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-center border-b border-[var(--vibe-border)] bg-white/80 px-4 backdrop-blur-[20px]"
      style={{ boxShadow: "0 1px 0 rgba(229,231,235,0.5)" }}
    >
      <div className="flex w-full max-w-[1280px] items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-[var(--vibe-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="text-xl">VibeCoder</span>
          <span className="inline-block h-6 w-6 rounded bg-gradient-to-br from-[var(--vibe-primary)] to-[var(--vibe-secondary)] opacity-90" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              ref={(el) => { linksRef.current[i] = el; }}
              href={link.href}
              className="text-sm font-medium text-[var(--vibe-text-muted)] transition-colors hover:text-[var(--vibe-text)]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="rounded-full bg-gradient-to-r from-[var(--vibe-primary)] to-[var(--vibe-secondary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(30,95,168,0.35)]"
        >
          Start Free
        </Link>
      </div>
    </nav>
  );
}
