"use client";

import { useState } from "react";

export interface RAGChunk {
  filePath: string;
  content: string;
  score?: number;
}

interface RAGContextChipProps {
  chunks: RAGChunk[];
}

export function RAGContextChip({ chunks }: RAGContextChipProps) {
  const [open, setOpen] = useState(false);

  if (!chunks || chunks.length === 0) return null;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          fontSize: "11px",
          fontWeight: 500,
          padding: "2px 8px",
          height: "20px",
          borderRadius: "4px",
          background: open ? "#EEF2FF" : "var(--surface)",
          color: open ? "#6366F1" : "var(--foreground-tertiary)",
          border: `1px solid ${open ? "#C7D2FE" : "var(--border)"}`,
          cursor: "pointer",
          transition: "all 120ms ease",
          fontFamily: "var(--font-sans)",
        }}
      >
        <span style={{ fontSize: 10 }}>⬡</span>
        {chunks.length} chunk{chunks.length !== 1 ? "s" : ""} loaded
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "6px",
            width: "320px",
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            boxShadow: "var(--shadow-menu)",
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              borderBottom: "1px solid var(--border)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--foreground-tertiary)",
            }}
          >
            RAG Context — {chunks.length} chunks
          </div>
          <div style={{ maxHeight: "280px", overflowY: "auto" }}>
            {chunks.map((chunk, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 12px",
                  borderBottom:
                    i < chunks.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "var(--blue)",
                      fontFamily: "var(--font-mono)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "220px",
                    }}
                  >
                    {chunk.filePath}
                  </span>
                  {chunk.score !== undefined && (
                    <span
                      style={{
                        fontSize: "11px",
                        color:
                          chunk.score > 0.8
                            ? "var(--green)"
                            : chunk.score > 0.6
                              ? "var(--yellow)"
                              : "var(--foreground-tertiary)",
                        fontWeight: 500,
                      }}
                    >
                      {(chunk.score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <pre
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--foreground-secondary)",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    padding: "6px 8px",
                    margin: 0,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  } as React.CSSProperties}
                >
                  {chunk.content.slice(0, 150)}
                  {chunk.content.length > 150 ? "..." : ""}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
