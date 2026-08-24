"use client";

import React, { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  HIDDEN_RISE,
  HIDDEN_RULE_X,
  MaskedWords,
  revealBlocks,
  useAboutMotion,
} from "@/components/about/reveal";

/*
 * Section 02 — contact information.
 *
 * Two columns: the details on the left, the space the form will occupy on the right. No
 * boxed cards — the details are set as an editorial list separated by gold hairlines, so the
 * email reads as a piece of type rather than as a field in a widget.
 *
 * THE DETAILS BELOW ARE THE COMPANY'S OWN, from miningdiscovery.com/contact. Nothing here is
 * invented: the project itself carried no email and no address anywhere (the header, footer
 * and Services CTA all point at a "/#contact" anchor that does not exist), so both values
 * were taken from the official contact page, where the email matches the one specified for
 * this task exactly.
 *
 * They live in one object so replacing either is a single edit.
 */
const CONTACT = {
  email: "info@miningdiscovery.com",
  /*
   * Reproduced as the source publishes it, including "Layfatte" — that looks like it should
   * read "Lafayette", but correcting a street name is inventing an address, so it is left
   * exactly as found and flagged for a human to confirm. Split across two lines for setting
   * only; no word is changed.
   */
  address: ["180 Layfatte street", "Passaic, New Jersey 07055"],
} as const;

export const ContactInformation: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);

  useAboutMotion(sectionRef, () => {
    // Two triggers rather than one: on a phone the placeholder sits a long way below the
    // details, and revealing it off the details' arrival would play it to an empty screen.
    if (leftRef.current) revealBlocks(leftRef.current, { stagger: 0.07 });
    if (rightRef.current) revealBlocks(rightRef.current, { start: "top 85%" });
  });

  return (
    <section ref={sectionRef} className="border-b border-[#E5E4DE] bg-white">
      <div className="container-editorial py-20 md:py-28">
        <div className="grid grid-cols-1 gap-x-16 gap-y-16 lg:grid-cols-12">
          {/* --- Details ------------------------------------------------------ */}
          <div ref={leftRef} className="lg:col-span-7">
            <div data-about-rule-x className={`h-0.5 w-12 bg-[#B8860B] ${HIDDEN_RULE_X}`} />

            <span
              data-about-reveal
              className={`mt-6 block text-xs font-semibold uppercase tracking-[0.15em] text-[#B8860B] ${HIDDEN_RISE}`}
            >
              Get in Touch
            </span>

            <h2 className="mt-8 font-geist text-[clamp(1.875rem,4.2vw,3.25rem)] font-bold uppercase leading-[1.02] tracking-[-0.03em] text-[#0B1F3A]">
              <MaskedWords text="Let's talk." />
            </h2>

            <p
              data-about-reveal
              className={`mt-8 max-w-[44ch] text-lg font-normal leading-relaxed text-[#3A3D42] sm:text-xl ${HIDDEN_RISE}`}
            >
              Whether you have a question, a project, or an opportunity to discuss, we&apos;d
              like to hear from you.
            </p>

            {/* --- Email ------------------------------------------------------ */}
            <div
              data-about-reveal
              className={`mt-14 border-t border-[#E5E4DE] pt-8 ${HIDDEN_RISE}`}
            >
              <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#57595E]">
                Email
              </span>

              {/*
                A line of type that happens to be a link, not a button. group/email rather
                than a bare group so the underline and the arrow can respond together without
                competing with anything else on the row.
              */}
              <a
                href={`mailto:${CONTACT.email}`}
                className="group/email mt-4 inline-flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] focus-visible:ring-offset-4"
              >
                <span className="relative">
                  <span className="font-geist text-[clamp(1.25rem,2.8vw,2rem)] font-semibold tracking-[-0.02em] text-[#0B1F3A] transition-colors duration-300 group-hover/email:text-[#B8860B]">
                    {CONTACT.email}
                  </span>
                  {/*
                    The underline draws from the left on hover. Tailwind v4 compiles `scale-*`
                    to the standalone `scale` property, so this cannot collide with any
                    transform GSAP writes on an ancestor during the reveal.
                  */}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 block h-px w-full origin-left scale-x-0 bg-[#B8860B] transition-transform duration-500 ease-out group-hover/email:scale-x-100"
                  />
                </span>

                <ArrowUpRight
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-[#B8860B] opacity-0 transition-all duration-300 group-hover/email:translate-x-0.5 group-hover/email:opacity-100"
                />
              </a>
            </div>

            {/* --- Location --------------------------------------------------- */}
            <div
              data-about-reveal
              className={`mt-10 border-t border-[#E5E4DE] pt-8 ${HIDDEN_RISE}`}
            >
              <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#57595E]">
                Location
              </span>

              <address className="mt-4 not-italic">
                {CONTACT.address.map((line) => (
                  <span
                    key={line}
                    className="block text-lg font-normal leading-relaxed text-[#0B1F3A] sm:text-xl"
                  >
                    {line}
                  </span>
                ))}
              </address>
            </div>
          </div>

          {/* --- Where the form goes ------------------------------------------ */}
          {/*
            TEMPORARY — STEP 2 REPLACES THIS ENTIRE BLOCK with the Full Name / Email /
            Message / Send Message form. It is deliberately not a mock-up: no inputs, no
            labels, no disabled button, nothing that could be mistaken for a form that is
            broken. Just the heading the form will keep and a note saying what belongs here.
          */}
          <div ref={rightRef} className="lg:col-span-5">
            <div
              data-about-reveal
              className={`flex min-h-[22rem] flex-col justify-between border border-[#E5E4DE] bg-[#F7F5EF] p-8 sm:p-10 ${HIDDEN_RISE}`}
            >
              <div>
                <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#B8860B]">
                  Send Us a Message
                </span>
                <p className="mt-6 max-w-[26ch] font-serif text-2xl font-normal leading-[1.2] tracking-[-0.015em] text-[#0B1F3A] sm:text-[1.75rem]">
                  The contact form arrives in the next step.
                </p>
              </div>

              <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.14em] text-[#57595E]">
                Step 2 — Full Name · Email · Message
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactInformation;
