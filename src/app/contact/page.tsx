import type { Metadata } from "next";
import { ContactHero, ContactInformation } from "@/components/contact";

export const metadata: Metadata = {
  title: "Contact | Mining Discovery",
  description:
    "Start a conversation with Mining Discovery — questions, projects and opportunities across the global mining industry.",
};

/*
 * The dedicated /contact route.
 *
 * Built section by section. The hero and the contact details are in; the form replaces the
 * placeholder in ServicesInformation's right-hand column in step 2, and Trusted Brands
 * follows after that.
 *
 * A server component, like /about and /services: it owns the metadata and the section order,
 * and each section carries its own "use client" boundary because each drives a GSAP timeline.
 * No <Header /> or <Footer /> — the root layout already wraps every route in both.
 *
 * NOTE: the header, the footer and the Services CTA all still link "Contact" to "/#contact",
 * an anchor that exists on no page. This route is the real destination, but repointing those
 * links means editing shared components, which this task placed out of bounds.
 */
export default function ContactPage() {
  return (
    <div className="w-full bg-[#F7F5EF] font-sans text-[#1A1D21]">
      {/*
        Both sections hide their content in CSS before revealing it, so the server-rendered
        HTML never flashes the finished layout before hydration. With no JS there is no reveal
        — so the hidden state must not be what a reader is left looking at. Same override
        /about and /services carry, and inert for everyone else: a <noscript> block's contents
        are never parsed as markup when scripting is enabled.
      */}
      <noscript>
        <style>{`[data-about-reveal],[data-about-rule-x],[data-about-rule-y],.about-mask__word{transform:none!important;opacity:1!important}`}</style>
      </noscript>

      <ContactHero />
      <ContactInformation />
    </div>
  );
}
