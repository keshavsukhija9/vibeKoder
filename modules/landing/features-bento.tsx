"use client";

import { useEffect, useRef } from "react";

const CARDS = [
  { span: "col-span-7", title: "WebContainer Runtime", desc: "Node.js in the browser. npm install, dev servers, zero round-trip.", highlight: "terminal" },
  { span: "col-span-5", title: "LanceDB Vector Search", desc: "Sub-100ms retrieval. 10,000+ files indexed locally.", highlight: "chart" },
  { span: "col-span-5", title: "Local LLM (Ollama)", desc: "Code completion and chat. Your data never leaves the machine.", highlight: "pulse" },
  { span: "col-span-4", title: "100% Offline", desc: "Full IDE and AI after first load. No cloud dependency.", highlight: "wifi" },
  { span: "col-span-8", title: "Monaco Editor", desc: "VS Code-grade editing. Inline AI completions, multi-tab, split-pane.", highlight: "editor" },
  { span: "col-span-4", title: "AST Graph Analysis", desc: "Dependency graph and circular dependency detection.", highlight: "graph" },
];

export function FeaturesBento() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const anime = require("animejs").default;
    const cards = gridRef.current.querySelectorAll("[data-bento-card]");
    anime({
      targets: cards,
      translateY: [40, 0],
      opacity: [0, 1],
      delay: anime.stagger(80),
      duration: 600,
      easing: "cubicBezier(0.34, 1.56, 0.64, 1)",
    });
  }, []);

  return (
    <section id="features" className="bg-[var(--vibe-bg)] px-4 py-24">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="text-center text-[clamp(2rem,4vw,3rem)] font-bold text-[var(--vibe-text)] mb-4">
          Built for local-first development
        </h2>
        <p className="text-center text-[var(--vibe-text-muted)] max-w-2xl mx-auto mb-16">
          Every feature runs in your browser or on your machine. No APIs, no data egress.
        </p>

        <div
          ref={gridRef}
          className="grid grid-cols-12 gap-4"
        >
          {CARDS.map((card, i) => (
            <div
              key={i}
              data-bento-card
              className={`${card.span} rounded-2xl border border-[var(--vibe-border)] bg-white p-6 shadow-[var(--vibe-shadow)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--vibe-shadow-hover)] hover:border-[var(--vibe-glow)]/30`}
            >
              <h3 className="text-lg font-semibold text-[var(--vibe-text)]">{card.title}</h3>
              <p className="mt-2 text-sm text-[var(--vibe-text-muted)]">{card.desc}</p>
              {card.highlight === "chart" && (
                <div className="mt-4 flex items-end gap-1 h-12">
                  {[40, 65, 45, 90, 60, 89].map((h, j) => (
                    <div
                      key={j}
                      className="w-6 rounded-t bg-[var(--vibe-primary)] opacity-80"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
