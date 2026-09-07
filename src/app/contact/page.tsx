import type { Metadata } from "next";
import { ContactHero, ContactInformation } from "@/components/contact";

export const metadata: Metadata = {
  title: "Contact Us | Mining Discovery",
  description: "Get in touch with Mining Discovery.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-[#1A1D21]">
      {/* 01 — Hero */}
      <ContactHero />

      {/* 02 — Main Contact Form & Details Grid */}
      <ContactInformation />
    </div>
  );
}
