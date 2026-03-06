"use client";

import { cn } from "@/lib/utils";
import { AIWaveform } from "@/components/ui/ai-waveform";

/** VS Code-style status bar at the bottom of the editor. */
export function StatusBar({
  line,
  column,
  language,
  isAIGenerating,
  className,
}: {
  line: number;
  column: number;
  language: string;
  isAIGenerating?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-6 shrink-0 flex items-center justify-between px-3 text-xs text-muted-foreground bg-muted/50 border-t border-border",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <span>Ln {line}, Col {column}</span>
        {language && <span>{language}</span>}
      </div>
      <div className="flex items-center gap-4">
        <span className="status-bar-item flex items-center gap-1.5">
          <AIWaveform
            active={!!isAIGenerating}
            color={isAIGenerating ? "#818CF8" : "#4CC38A"}
          />
          <span>{isAIGenerating ? "AI thinking..." : "Ollama ready"}</span>
        </span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
