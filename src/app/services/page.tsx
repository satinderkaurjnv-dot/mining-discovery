import type { Metadata } from "next";
import {
  ServicesCapabilities,
  ServicesHero,
  ServicesMiningStory,
  ServicesShowcase,
} from "@/components/services";

export const metadata: Metadata = {
  title: "Services | Mining Discovery",
  description:
    "Strategic marketing, media and digital solutions built specifically for the mining industry.",
};

/*
 * The dedicated /services route, reached from the header's SERVICES link.
 *
 * Distinct from the homepage's ServicesScrollStory, which stays exactly where it is and
 * keeps its own #services anchor. Nothing on this route imports it, so nothing here can
 * change how the homepage behaves.
 *
 * A server component, like /about: it owns the metadata and the section order, and the hero
 * carries its own "use client" boundary because it drives a GSAP timeline.
 *
 * Built section by section. Hero, OUR CAPABILITIES, THE MINING STORY and the OUR EXPERTISE
 * showcase are in; trusted brands, FAQ and the closing CTA come in later steps.
 *
 * ServicesEcosystem and ServicesProcess are deliberately NOT rendered. THE MINING STORY
 * replaced the ecosystem/diagram/process concepts, and running both would put two marketing-
 * system diagrams on one page. Their files are left in src/components/services/ rather than
 * deleted, so restoring either is a one-line change here.
 *
 * #capabilities moved from the placeholder onto the real section rather than being
 * re-declared — the hero's CTA targets that id, and it keeps working because the id went
 * with the content.
 */
export default function ServicesPage() {
  return (
    <div className="w-full bg-[#F7F5EF] font-sans text-[#1A1D21]">
      {/*
        The hero hides its content in CSS before revealing it, so the server-rendered HTML
        never flashes the finished layout before hydration. With no JS there is no reveal —
        so the hidden state must not be what a reader is left looking at. Same override
        /about carries, and inert for everyone else: a <noscript> block's contents are never
        parsed as markup when scripting is enabled.
      */}
      <noscript>
        <style>{`[data-about-reveal],[data-about-rule-x],[data-about-rule-y],.about-mask__word{transform:none!important;opacity:1!important}`}</style>
      </noscript>

      <ServicesHero />
      <ServicesCapabilities />
      <ServicesMiningStory />
      <ServicesShowcase />
    </div>
  );
}
