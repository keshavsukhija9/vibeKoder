import SignInFormClient from "@/modules/auth/components/sign-in-form-client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <Link href="/" className="flex items-center gap-2 font-bold text-[var(--vibe-text)]" style={{ fontFamily: "var(--font-display)" }}>
        <span className="text-xl">VibeCoder</span>
        <span className="inline-block h-6 w-6 rounded bg-gradient-to-br from-[var(--vibe-primary)] to-[var(--vibe-secondary)] opacity-90" />
      </Link>
      <Image
        src="/login.svg"
        alt=""
        height={200}
        width={200}
        className="object-contain"
        priority
      />
      <div className="w-full rounded-2xl border border-[var(--vibe-border)] bg-[var(--vibe-surface)] p-6 shadow-[var(--vibe-shadow)] transition-shadow hover:shadow-[var(--vibe-shadow-hover)]">
        <SignInFormClient />
      </div>
      <p className="text-xs text-center text-[var(--vibe-text-muted)]">
        No account? Create one with your email above, or{" "}
        <Link href="/playground/demo" className="font-medium text-[var(--vibe-primary)] underline hover:opacity-90">
          try the editor without signing in
        </Link>
        .
      </p>
    </div>
  );
}
