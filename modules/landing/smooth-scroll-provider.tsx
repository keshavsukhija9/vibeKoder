"use client";

import { useEffect, useRef } from "react";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    const init = async () => {
      const { default: Lenis } = await import("lenis");
      lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
      const raf = (time: number) => {
        lenis?.raf(time);
        rafRef.current = requestAnimationFrame(raf);
      };
      rafRef.current = requestAnimationFrame(raf);
    };
    init();
    return () => {
      cancelAnimationFrame(rafRef.current);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
