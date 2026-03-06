"use client";

import { useRef, useEffect } from "react";

export function InkText({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming: boolean;
}) {
  const prevLenRef = useRef(0);
  const prevLen = prevLenRef.current;

  useEffect(() => {
    if (!isStreaming) prevLenRef.current = 0;
    else prevLenRef.current = text.length;
  }, [text, isStreaming]);

  if (!isStreaming) {
    return <span>{text}</span>;
  }

  return (
    <span>
      <span>{text.slice(0, prevLen)}</span>
      {text.slice(prevLen).split("").map((char, i) => (
        <span
          key={prevLen + i}
          className="token-ink"
          style={{ animationDelay: `${i * 8}ms` }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
