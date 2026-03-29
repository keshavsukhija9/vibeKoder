"use client";

import dynamic from "next/dynamic";

const PlaygroundClient = dynamic(() => import("./playground-client"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-[var(--muted-foreground)]">
      Loading editor…
    </div>
  ),
});

export function PlaygroundShell({ id }: { id: string }) {
  return <PlaygroundClient id={id} />;
}
