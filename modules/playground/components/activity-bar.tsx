"use client";

import { FileCode } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** VS Code-style activity bar (left icon strip). */
export function ActivityBar({
  explorerActive,
  onToggleExplorer,
}: {
  explorerActive: boolean;
  onToggleExplorer: () => void;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "w-[48px] shrink-0 flex flex-col items-center py-1",
          "bg-[hsl(var(--sidebar))] dark:bg-[hsl(var(--sidebar))]",
          "border-r border-border"
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onToggleExplorer}
              className={cn(
                "w-full h-12 flex items-center justify-center border-l-2 -ml-px transition-colors",
                explorerActive
                  ? "border-primary text-primary bg-sidebar-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <FileCode className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Explorer (Ctrl+B)
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
