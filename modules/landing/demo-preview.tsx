"use client";

import { useRef } from "react";

export function DemoPreview() {
  const wrapRef = useRef<HTMLDivElement>(null);

  return (
    <section id="demo" className="bg-[var(--vibe-bg)] px-4 py-24">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="text-center text-[clamp(2rem,4vw,3rem)] font-bold text-[var(--vibe-text)] mb-4">
          The IDE that runs in your browser
        </h2>
        <p className="text-center text-[var(--vibe-text-muted)] mb-16 max-w-2xl mx-auto">
          Full Monaco editor, file tree, terminal, and AI panel. No install.
        </p>

        <div
          ref={wrapRef}
          className="overflow-hidden rounded-xl border-2 border-[var(--vibe-border)] bg-[#0D1117] shadow-2xl"
          style={{ transform: "perspective(1200px) rotateX(4deg)" }}
        >
          <div className="flex items-center gap-2 border-b border-[var(--vibe-border)] bg-[#161B22] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            <span className="ml-4 text-sm text-gray-500">VibeCoder — app/page.tsx</span>
          </div>
          <div className="flex min-h-[400px]">
            <div className="w-48 border-r border-[var(--vibe-border)] bg-[#0D1117] p-2 text-sm text-gray-400">
              <div className="py-1 font-medium text-gray-300">explorer</div>
              <div className="pl-2">📁 src</div>
              <div className="pl-4">📄 page.tsx</div>
              <div className="pl-4">📄 layout.tsx</div>
            </div>
            <div className="flex-1 p-4 font-mono text-sm text-gray-300">
              <div><span className="text-purple-400">import</span> {"{ useState }"} <span className="text-purple-400">from</span> <span className="text-green-400">"react"</span>;</div>
              <div className="mt-2"><span className="text-purple-400">export default function</span> <span className="text-blue-300">Page</span>() {"{"}</div>
              <div className="pl-4"><span className="text-purple-400">const</span> [count, setCount] = <span className="text-yellow-200">useState</span>(<span className="text-orange-400">0</span>);</div>
              <div className="pl-4"><span className="text-purple-400">return</span> (</div>
              <div className="pl-8">&lt;<span className="text-orange-300">button</span> onClick={"{"}() =&gt; setCount(c =&gt; c + <span className="text-orange-400">1</span>){"}"}&gt;</div>
              <div className="pl-12 bg-[var(--vibe-secondary)]/20 border-l-2 border-[var(--vibe-glow)] pl-10">
                Count: {"{"}count{"}"} <span className="text-[var(--vibe-glow)]">← AI suggested</span>
              </div>
              <div className="pl-8">&lt;/<span className="text-orange-300">button</span>&gt;</div>
              <div className="pl-4">);</div>
              <div>{"}"}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 border-t border-[var(--vibe-border)] bg-[#161B22] px-4 py-2 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Connected to Ollama</span>
          </div>
        </div>
      </div>
    </section>
  );
}
