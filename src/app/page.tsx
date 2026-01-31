"use client";

import AetherHero from "@/components/aether-hero";

export default function Home() {
  return (
    <AetherHero
      title="Reversible AI Automation for a Safer Web"
      subtitle="Every AI action comes with an AI-generated undo plan. Decisions are stored immutably on 0G blockchain for complete auditability. Safety first, always."
      ctaLabel="Explore"
      ctaHref="/app"
      secondaryCtaLabel="GitHub"
      secondaryCtaHref="https://github.com/mrkrisshu/AutoUndo"
      align="center"
      overlayGradient="linear-gradient(180deg, #000000cc 0%, #00000066 40%, transparent)"
    />
  );
}
