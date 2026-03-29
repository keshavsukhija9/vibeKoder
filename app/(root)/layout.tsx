import { Metadata } from "next";
import { LandingProviders } from "@/modules/landing/layout-client";

export const metadata: Metadata = {
  title: { template: "VibeCoder — %s", default: "VibeCoder — Local-AI IDE" },
  description:
    "Browser-native IDE with local LLMs, LanceDB RAG, and WebContainers. Code faster. Think locally. Ship smarter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LandingProviders>
      <main className="relative min-h-screen bg-[var(--background)] pt-14">{children}</main>
    </LandingProviders>
  );
}
