"use client";

import { useEffect, useRef, useState } from "react";

export function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let x = 0,
      y = 0;
    let ringX = 0,
      ringY = 0;

    let ticking = false;
    const animate = () => {
      ringX += (x - ringX) * 0.12;
      ringY += (y - ringY) * 0.12;
      dot.style.transform = `translate(${x}px, ${y}px)`;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      ticking = false;
    };
    const requestTick = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(animate);
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      setVisible(true);
      x = e.clientX;
      y = e.clientY;
      requestTick();
    };
    const handleMouseLeave = () => setVisible(false);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    const interval = setInterval(requestTick, 32);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      clearInterval(interval);
    };
  }, []);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--vibe-text)] mix-blend-difference opacity-80"
        style={{ visibility: visible ? "visible" : "hidden" }}
        aria-hidden
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-[40px] w-[40px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--vibe-primary)] opacity-60 transition-opacity duration-200"
        style={{ visibility: visible ? "visible" : "hidden" }}
        aria-hidden
      />
    </>
  );
}
