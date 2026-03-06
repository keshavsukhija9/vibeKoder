"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ParticleField } from "@/components/landing/particle-field";

const HEADLINE = "Code Faster.\nThink Locally.\nShip Smarter.";

export function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const anime = require("animejs").default;
    const tl = anime.timeline({ easing: "easeOutExpo" });
    tl.add({
      targets: badgeRef.current,
      translateY: [-24, 0],
      opacity: [0, 1],
      duration: 600,
      easing: "easeOutExpo",
    })
      .add(
        {
          targets: headlineRef.current?.querySelectorAll(".char") ?? [],
          opacity: [0, 1],
          translateY: [12, 0],
          delay: anime.stagger(18, { start: 200 }),
          duration: 400,
        },
        "-=200"
      )
      .add(
        {
          targets: subRef.current,
          opacity: [0, 1],
          duration: 400,
        },
        "-=100"
      )
      .add(
        {
          targets: ctaRef.current?.querySelectorAll("a") ?? [],
          translateY: [24, 0],
          opacity: [0, 1],
          delay: anime.stagger(80),
          duration: 500,
          easing: "easeOutExpo",
        },
        "-=100"
      );
  }, [mounted]);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--vibe-bg)] px-4 pt-20">
      <ParticleField />

      <div className="relative z-10 mx-auto max-w-[1280px] text-center">
        <span
          ref={badgeRef}
          className="mb-6 inline-block rounded-full border border-[var(--vibe-border)] bg-white px-4 py-1.5 text-sm font-medium text-[var(--vibe-text-muted)] shadow-[var(--vibe-shadow)]"
        >
          ✦ Privacy-First AI IDE
        </span>

        <h1
          ref={headlineRef}
          className="mx-auto max-w-4xl text-[clamp(2.5rem,6vw,5.5rem)] font-extrabold leading-[1.1] tracking-tight text-[var(--vibe-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {HEADLINE.split("").map((char, i) => (
            <span key={i} className="char inline-block" style={char === "\n" ? { display: "block", height: "0.35em" } : undefined}>
              {char === "\n" ? "" : char}
            </span>
          ))}
        </h1>

        <p
          ref={subRef}
          className="mx-auto mt-6 max-w-xl text-lg text-[var(--vibe-text-muted)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Browser-native IDE with local LLMs, LanceDB RAG, and WebContainers. No code leaves your machine.
        </p>

        <div ref={ctaRef} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/playground/demo"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--vibe-primary)] to-[#2563eb] px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-[0_0 32px_rgba(30,95,168,0.4)]"
          >
            Try the editor
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--vibe-border)] bg-white px-6 py-3.5 text-base font-semibold text-[var(--vibe-text)] transition-all hover:border-[var(--vibe-primary)] hover:text-[var(--vibe-primary)]"
          >
            Dashboard
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-[var(--vibe-text-muted)]">
          <span>Trusted by 12,000+ developers</span>
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-[var(--vibe-primary)] to-[var(--vibe-secondary)]"
                style={{ opacity: 1 - i * 0.08 }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[var(--vibe-text-muted)]">
        <div className="h-10 w-6 rounded-full border-2 border-current flex items-start justify-center p-1.5">
          <span className="h-1.5 w-1 rounded-full bg-current animate-bounce" style={{ animationDuration: "1.5s" }} />
        </div>
        <span className="text-xs">Scroll to explore</span>
      </div>
    </section>
  );
}
