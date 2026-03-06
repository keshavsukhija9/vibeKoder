import React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[var(--vibe-bg)] p-4"
      style={{ fontFamily: "var(--font-body)" }}
      role="main"
    >
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        {children}
      </div>
      <Link
        href="/"
        className="text-sm transition-colors text-[var(--vibe-text-muted)] hover:text-[var(--vibe-text)]"
      >
        ← Back to home
      </Link>
    </main>
  );
}