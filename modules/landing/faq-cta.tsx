"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = [
  { q: "Does my code ever leave my machine?", a: "No. Execution runs in WebContainers in the browser. LLM inference uses your local Ollama. RAG indexing is stored in LanceDB on your disk." },
  { q: "What browsers are supported?", a: "Chromium-based browsers (Chrome 100+, Edge 100+) for WebContainers. Other browsers can use the editor and AI if Ollama is reachable." },
  { q: "How do I index my codebase for RAG?", a: "In the playground, open Settings → Index codebase for AI. You need Ollama with nomic-embed-text installed." },
  { q: "Is there a team or enterprise plan?", a: "Team plans include SSO, audit logs, and shared projects. Contact us for enterprise pricing." },
];

export function FAQAndCTA() {
  return (
    <section className="bg-[var(--vibe-bg)] px-4 py-24">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="text-center text-[clamp(2rem,4vw,3rem)] font-bold text-[var(--vibe-text)] mb-16">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="max-w-2xl mx-auto">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-[var(--vibe-border)]">
              <AccordionTrigger className="text-left font-medium text-[var(--vibe-text)] hover:text-[var(--vibe-primary)]">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[var(--vibe-text-muted)]">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
