"use client";


interface AIWaveformProps {
  active: boolean;
  color?: string;
}

export function AIWaveform({ active, color = "#6366F1" }: AIWaveformProps) {
  const bars = [0.4, 0.7, 1, 0.7, 0.4];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        height: "12px",
      }}
      aria-label={active ? "AI processing" : "AI idle"}
    >
      {bars.map((baseHeight, i) => (
        <span
          key={i}
          style={{
            display: "block",
            width: "2px",
            borderRadius: "1px",
            background: color,
            height: active ? `${baseHeight * 12}px` : "3px",
            opacity: active ? 1 : 0.3,
            transition: "height 120ms ease, opacity 120ms ease",
            animation: active
              ? `waveBar 600ms ease-in-out ${i * 80}ms infinite alternate`
              : "none",
          }}
        />
      ))}
      <style>{`
        @keyframes waveBar {
          from { height: 3px; opacity: 0.5; }
          to   { height: 12px; opacity: 1; }
        }
      `}</style>
    </span>
  );
}
