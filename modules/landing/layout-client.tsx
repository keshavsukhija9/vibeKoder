"use client";

import { LandingFooter } from "./footer";

export function LandingProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <LandingFooter />
    </>
  );
}
