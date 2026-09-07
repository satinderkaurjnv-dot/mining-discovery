import type { Metadata } from "next";
import { ContactHero, ContactInformation, ContactNewsletter } from "@/components/contact";
import { AboutTrustedBrands } from "@/components/about";

export const metadata: Metadata = {
  title: "Contact Us | Mining Discovery",
  description:
    "Get in touch with Mining Discovery — questions, projects, advertising, and opportunities across the global mining industry.",
};

export default function ContactPage() {
  return (
    <div className="w-full bg-white font-sans text-[#1A1D21]">
      {/* 01 — Hero */}
      <ContactHero />

      {/* 02 — Main Contact Card & Form */}
      <ContactInformation />

      {/* 03 — Our Trusted Brands */}
      <AboutTrustedBrands />

      {/* 04 — Subscribe to Latest News & Updates */}
      <ContactNewsletter />
    </div>
  );
}
