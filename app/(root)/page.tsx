"use client";

import Link from "next/link";

const FEATURES = [
  { title: "Monaco editor", desc: "VS Code–grade editing with inline AI completions." },
  { title: "Local AI", desc: "Ollama on your machine. Code never leaves your device." },
  { title: "WebContainers", desc: "Node in the browser. Run and preview in real time." },
  { title: "RAG search", desc: "Index your codebase. Sub-100ms retrieval, locally." },
];

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24">
      {/* Hero — Notion-style: one clear headline, one subline, one CTA */}
      <section className="landing-hero py-20 md:py-28">
        <p className="mb-4 text-sm font-medium text-[var(--muted-foreground)]">
          Privacy-first IDE
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-5xl">
          Code faster.
          <br />
          <span className="text-[var(--muted-foreground)]">Think locally.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-[var(--muted-foreground)]">
          Browser-native IDE with local LLMs, LanceDB RAG, and WebContainers. No code leaves your machine.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/playground/demo"
            className="inline-flex items-center rounded-lg bg-[var(--foreground)] px-5 py-2.5 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
          >
            Try the editor
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-lg border border-[var(--border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]"
          >
            Dashboard →
          </Link>
        </div>
      </section>

      {/* Features — simple list, subtle borders */}
      <section className="border-t border-[var(--border)] py-16">
        <h2 className="text-sm font-medium text-[var(--muted-foreground)]">Features</h2>
        <ul className="mt-6 space-y-1">
          {FEATURES.map((f) => (
            <li
              key={f.title}
              className="group flex items-start gap-4 rounded-lg border border-transparent py-4 transition-colors hover:border-[var(--border)] hover:bg-[var(--accent)]/50"
            >
              <span className="mt-0.5 text-sm font-medium text-[var(--foreground)]">{f.title}</span>
              <span className="text-sm text-[var(--muted-foreground)]">{f.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--border)] py-16">
        <p className="text-sm text-[var(--muted-foreground)]">
          No install. No config. Open the editor and start coding.
        </p>
        <Link
          href="/playground/demo"
          className="mt-4 inline-flex rounded-lg bg-[var(--foreground)] px-5 py-2.5 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
        >
          Open editor
        </Link>
      </section>
    </div>
  );
}
