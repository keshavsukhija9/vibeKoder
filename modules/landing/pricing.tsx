"use client";

import Link from "next/link";
import { useState } from "react";

const PLANS = [
  { name: "Starter", price: 0, period: "forever", desc: "Personal use, 3 projects", cta: "Get Started", popular: false },
  { name: "Pro", price: 19, period: "mo", desc: "Unlimited projects, priority support", cta: "Start Free Trial", popular: true },
  { name: "Team", price: 49, period: "mo", desc: "Seats, SSO, audit logs", cta: "Contact Sales", popular: false },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="bg-[var(--vibe-bg)] px-4 py-24">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="text-center text-[clamp(2rem,4vw,3rem)] font-bold text-[var(--vibe-text)] mb-4">
          Simple pricing
        </h2>
        <p className="text-center text-[var(--vibe-text-muted)] mb-12">
          Start free. Upgrade when you need more.
        </p>

        <div className="mb-12 flex items-center justify-center gap-3">
          <span className={!annual ? "font-semibold text-[var(--vibe-text)]" : "text-[var(--vibe-text-muted)]"}>Monthly</span>
          <button
            type="button"
            onClick={() => setAnnual((a) => !a)}
            className="relative h-8 w-14 rounded-full bg-[var(--vibe-border)] transition-colors hover:bg-[var(--vibe-primary)]/20"
          >
            <span
              className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow transition-transform"
              style={{ transform: annual ? "translateX(24px)" : "translateX(0)" }}
            />
          </button>
          <span className={annual ? "font-semibold text-[var(--vibe-text)]" : "text-[var(--vibe-text-muted)]"}>Annual</span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border bg-white p-8 shadow-[var(--vibe-shadow)] transition-all hover:shadow-[var(--vibe-shadow-hover)] ${
                plan.popular
                  ? "scale-[1.03] border-[var(--vibe-primary)] shadow-[0_0_0_1px_var(--vibe-primary),0_8px_32px_rgba(30,95,168,0.12)]"
                  : "border-[var(--vibe-border)]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[var(--vibe-primary)] to-[var(--vibe-secondary)] px-3 py-1 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-[var(--vibe-text)]">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[var(--vibe-text)]">
                  ${annual && plan.price > 0 ? Math.round(plan.price * 0.8) : plan.price}
                </span>
                <span className="text-[var(--vibe-text-muted)]">/{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--vibe-text-muted)]">{plan.desc}</p>
              <Link
                href="/dashboard"
                className={`mt-6 block rounded-full py-3 text-center text-sm font-semibold transition-all hover:scale-[1.02] ${
                  plan.popular
                    ? "bg-gradient-to-r from-[var(--vibe-primary)] to-[var(--vibe-secondary)] text-white"
                    : "border-2 border-[var(--vibe-border)] text-[var(--vibe-text)] hover:border-[var(--vibe-primary)]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
