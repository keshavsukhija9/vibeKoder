"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = [
  { num: 1, title: "Install & Open", desc: "Open VibeCoder in your browser. No install, no config.", code: "npm create vibecoder@latest" },
  { num: 2, title: "Index Your Codebase", desc: "LanceDB indexes your repo. Sub-100ms retrieval for 10k+ files.", stat: "10,247" },
  { num: 3, title: "AI Understands Context", desc: "RAG injects relevant code into every completion. No hallucinations.", label: "Code → Vectors → LLM" },
  { num: 4, title: "Code at the Speed of Thought", desc: "Streaming completions in Monaco. Tab to accept.", label: "Real-time diff" },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;
    const gsap = require("gsap").default;
    const ScrollTrigger = require("gsap/ScrollTrigger").default;
    gsap.registerPlugin(ScrollTrigger);

    const steps = STEPS.length;
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: `${steps * 100}% top`,
      pin: true,
      scrub: 1,
      onUpdate: (self: { progress: number }) => {
        const i = Math.min(Math.floor(self.progress * steps), steps - 1);
        setStep(i);
      },
    });
    return () => ScrollTrigger.getAll().forEach((t: { kill: () => void }) => t.kill());
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative flex min-h-screen w-full items-stretch bg-[var(--vibe-bg)]"
    >
      <div className="flex w-full max-w-[1280px] mx-auto">
        <div className="flex w-64 shrink-0 flex-col justify-center border-r border-[var(--vibe-border)] py-20 pl-12 pr-8">
          {STEPS.map((s, i) => (
            <div key={s.num} className="relative flex items-center gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  i <= step ? "bg-[var(--vibe-primary)] text-white" : "bg-[var(--vibe-border)] text-[var(--vibe-text-muted)]"
                }`}
              >
                {s.num}
              </div>
              {i < STEPS.length - 1 && (
                <div className="absolute left-5 top-12 h-8 w-0.5 bg-[var(--vibe-border)]">
                  <div
                    className="w-full bg-[var(--vibe-primary)] transition-all duration-500"
                    style={{ height: i < step ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div ref={contentRef} className="flex flex-1 items-center justify-center px-16 py-20">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--vibe-border)] bg-white p-8 shadow-[var(--vibe-shadow)]">
            <h3 className="text-2xl font-bold text-[var(--vibe-text)]">{STEPS[step].title}</h3>
            <p className="mt-3 text-[var(--vibe-text-muted)]">{STEPS[step].desc}</p>
            {STEPS[step].code && (
              <pre className="mt-4 rounded-lg bg-[var(--vibe-text)] p-4 font-mono text-sm text-[var(--vibe-code)]">
                {STEPS[step].code}
              </pre>
            )}
            {STEPS[step].stat && (
              <div className="mt-4 text-3xl font-bold text-[var(--vibe-primary)]">{STEPS[step].stat} files</div>
            )}
            {STEPS[step].label && (
              <div className="mt-4 text-sm font-medium text-[var(--vibe-secondary)]">{STEPS[step].label}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
