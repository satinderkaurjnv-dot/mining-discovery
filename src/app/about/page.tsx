import type { Metadata } from "next";
import {
  AboutHero,
  AboutOrigin,
  AboutManagement,
  AboutAdvisor,
  AboutPurpose,
  AboutPrinciples,
  AboutUnique,
  AboutLookingAhead,
  AboutTrustedBrands,
} from "@/components/about";

export const metadata: Metadata = {
  title: "About Us | Mining Discovery",
  description:
    "Learn about Mining Discovery — the trusted global voice in mining, founded to bring clarity, depth, and transparency to the mining industry.",
};

export default function AboutPage() {
  return (
    <div className="w-full bg-white font-sans text-[#1A1D21]">
      {/* 01 — Hero */}
      <AboutHero />

      {/* 02 — Origin */}
      <AboutOrigin />

      {/* 03 — Management Team */}
      <AboutManagement />

      {/* 04 — Advisors */}
      <AboutAdvisor />

      {/* 05 — Our Purpose */}
      <AboutPurpose />

      {/* 06 — Our Principles */}
      <AboutPrinciples />

      {/* 07 — What Makes Us Unique */}
      <AboutUnique />

      {/* 08 — Looking Ahead */}
      <AboutLookingAhead />

      {/* 09 — Our Trusted Brands */}
      <AboutTrustedBrands />
    </div>
  );
}