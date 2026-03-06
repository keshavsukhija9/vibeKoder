"use client";

import { CursorFollower } from "./cursor-follower";
import { LandingFooter } from "./footer";
import { LandingNavbar } from "./navbar";
import { SmoothScrollProvider } from "./smooth-scroll-provider";

export function LandingProviders({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <CursorFollower />
      <LandingNavbar />
      {children}
      <LandingFooter />
    </SmoothScrollProvider>
  );
}
