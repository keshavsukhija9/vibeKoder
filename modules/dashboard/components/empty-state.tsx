"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Code2, FolderPlus } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 w-full">
      <div className="rounded-[var(--vibe-radius)] border border-[var(--vibe-border)] bg-[var(--vibe-surface)] p-8 max-w-md text-center shadow-[var(--vibe-shadow)]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--vibe-primary)]/10">
          <FolderPlus className="h-8 w-8 text-[var(--vibe-primary)]" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--vibe-text)] mb-1" style={{ fontFamily: "var(--font-display)" }}>
          No projects yet
        </h2>
        <p className="text-[var(--vibe-text-muted)] text-sm mb-6">
          Create a new playground or try the editor without signing in.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="gap-2 rounded-full bg-gradient-to-r from-[var(--vibe-primary)] to-[var(--vibe-secondary)] text-white shadow-lg hover:opacity-95">
            <Link href="/playground/demo">
              <Code2 className="h-4 w-4" />
              Try the editor
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 border-[var(--vibe-border)] text-[var(--vibe-text-muted)] hover:bg-[var(--vibe-border)]/50">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
