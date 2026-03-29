"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/playground/demo", label: "Try editor" },
];

export function AppNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-[var(--foreground)] transition-opacity hover:opacity-80"
        >
          <span className="text-lg tracking-tight">VibeCoder</span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)] ${
                  isActive ? "bg-[var(--accent)] text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/auth/sign-in"
            className="ml-2 rounded-md bg-[var(--foreground)] px-3 py-2 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
