"use client";

import Link from "next/link";

export function SignupCTA() {
  return (
    <section className="relative overflow-hidden bg-[var(--vibe-bg)] px-4 py-32">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 50%, #E0E7FF, transparent), radial-gradient(ellipse 60% 40% at 80% 20%, #DBEAFE, transparent), radial-gradient(ellipse 50% 30% at 20% 80%, #F0FDF4, transparent)",
          filter: "blur(60px)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-lg rounded-3xl border border-[var(--vibe-border)] bg-white p-12 text-center shadow-[var(--vibe-shadow)]">
        <h2 className="text-2xl font-bold text-[var(--vibe-text)] md:text-3xl">
          Start coding with local AI today
        </h2>
        <p className="mt-4 text-[var(--vibe-text-muted)]">
          No credit card. Open the IDE in your browser and connect Ollama.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-block rounded-full bg-gradient-to-r from-[var(--vibe-primary)] to-[var(--vibe-secondary)] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-[0_0_32px_rgba(30,95,168,0.4)]"
        >
          Get Started Free
        </Link>
      </div>
    </section>
  );
}
