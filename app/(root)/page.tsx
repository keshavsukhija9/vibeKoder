"use client";

import {
  DemoPreview,
  FAQAndCTA,
  FeaturesBento,
  Hero,
  HowItWorks,
  Metrics,
  Pricing,
  SignupCTA,
} from "@/modules/landing";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeaturesBento />
      <Metrics />
      <Pricing />
      <DemoPreview />
      <FAQAndCTA />
      <SignupCTA />
    </>
  );
}
