import type { Metadata } from "next";
import { ContactInformation, ContactNewsletter } from "@/components/contact";
import { AboutTrustedBrands } from "@/components/about";

export const metadata: Metadata = {
  title: "Contact Us | Mining Discovery",
  description: "Get in touch with Mining Discovery.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-[#1A1D21]">
      {/* 01 — Main Contact Form & Details Grid */}
      <ContactInformation />

      {/* 02 — Our Trusted Brands */}
      <AboutTrustedBrands />

      {/* 03 — Subscribe to Our Latest News & Updates */}
      <ContactNewsletter />
    </div>
  );
}
