"use client";

import { useEffect, useRef, useState } from "react";

const METRICS = [
  { value: 100, suffix: "ms", label: "Context retrieval" },
  { value: 10000, suffix: "+", label: "Files indexed" },
  { value: 0, suffix: " bytes", label: "Data sent to cloud" },
  { value: 100, suffix: "%", label: "Offline capable" },
];

const LOGOS = ["Next.js", "Monaco", "LanceDB", "Ollama", "WebContainers", "TypeScript", "Tailwind"];

export function Metrics() {
  const sectionRef = useRef<HTMLElement>(null);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const anime = require("animejs").default;
    const targets = METRICS.map((m) => ({ v: 0, max: m.value }));
    const anims = METRICS.map((_, i) =>
      anime({
        targets: targets[i],
        v: targets[i].max,
        round: 1,
        duration: 1800,
        delay: i * 120,
        easing: "easeOutExpo",
        update: () => setCounts(targets.map((t) => t.v)),
      })
    );
    return () => anims.forEach((a) => a.pause());
  }, [visible]);

  return (
    <section ref={sectionRef} className="bg-[#0D1117] py-24 text-white">
      <div className="mx-auto max-w-[1280px] px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {METRICS.map((m, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-bold md:text-5xl">
                {m.value === 100 && m.suffix === "ms" && "< "}
                {counts[i] ?? 0}
                {m.suffix}
              </div>
              <div className="mt-1 text-sm text-gray-400">{m.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 overflow-hidden">
          {LOGOS.map((name, i) => (
            <span
              key={i}
              className="text-sm font-medium text-gray-500 transition-colors hover:text-[var(--vibe-glow)]"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
