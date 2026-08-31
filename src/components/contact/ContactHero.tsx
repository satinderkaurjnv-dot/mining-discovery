"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import {
  ABOUT_EASE,
  HIDDEN_RISE,
  HIDDEN_RULE_X,
  MaskedWords,
  groupWordsByLine,
  maskedFrom,
  maskedTo,
  useAboutMotion,
} from "@/components/about/reveal";

/*
 * Section 01 — the contact hero.
 *
 * The quietest opener on the site, and deliberately so: /services opens at full viewport in
 * Geist Black because it is selling, and this page is not. Same family — centred, uppercase,
 * gold hairline, masked line reveal — at Bold rather than Black, at roughly two-thirds the
 * size, and sized by its own padding instead of filling the screen. The page's job here is
 * to get out of the way of an email address.
 *
 * Reveals on load rather than on scroll, like the other heroes: it is already on screen when
 * the page arrives, so a scroll trigger would either fire instantly or wait for a scroll that
 * never comes.
 */

const HEADING_LINES = ["Let's start", "a conversation."];

export const ContactHero: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useAboutMotion(sectionRef, (scope) => {
    const rule = scope.querySelector<HTMLElement>("[data-about-rule-x]");
    const eyebrow = scope.querySelector<HTMLElement>("[data-hero-eyebrow]");
    const body = scope.querySelector<HTMLElement>("[data-hero-body]");
    const lines = groupWordsByLine(headingRef.current);

    const tl = gsap.timeline({ defaults: { ease: ABOUT_EASE } });

    if (rule) tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.9 }, 0);
    if (eyebrow) {
      tl.fromTo(eyebrow, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.28);
    }

    // Line by line on the lines the browser actually rendered, not the two we authored — on
    // a narrow screen "a conversation." wraps, and each rendered line gets its own beat.
    lines.forEach((line, index) => {
      tl.fromTo(line, maskedFrom, { ...maskedTo }, 0.46 + index * 0.13);
    });

    if (body) {
      tl.fromTo(
        body,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        0.46 + lines.length * 0.13
      );
    }
  });

  return (
    <section ref={sectionRef} className="relative border-b border-[#E5E4DE]">
      {/* The same 16px dot grain the other heroes carry, at the same 2% opacity. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] opacity-[0.02] [background-size:16px_16px]" />

      <div className="container-editorial relative pt-32 pb-20 text-center md:pt-40 md:pb-28">
        <div
          data-about-rule-x
          className={`mx-auto h-0.5 w-12 bg-[#B8860B] ${HIDDEN_RULE_X}`}
        />

        <span
          data-hero-eyebrow
          data-about-reveal
          className={`mt-6 block text-xs font-semibold uppercase tracking-[0.15em] text-[#B8860B] ${HIDDEN_RISE}`}
        >
          Contact Us
        </span>

        {/*
          Sentence case in the markup with `uppercase` in CSS: the caps are a typographic
          treatment, and some screen readers spell out an all-caps word letter by letter when
          the caps are in the DOM.
        */}
        <h1
          ref={headingRef}
          className="mx-auto mt-8 max-w-[16ch] text-balance font-geist text-[clamp(2rem,5vw,4rem)] font-bold uppercase leading-[1.02] tracking-[-0.03em] text-[#0B1F3A]"
        >
          {HEADING_LINES.map((line) => (
            <span key={line} className="block">
              <MaskedWords text={line} />
            </span>
          ))}
        </h1>

        <p
          data-hero-body
          data-about-reveal
          className={`mx-auto mt-8 max-w-[36ch] text-lg font-normal leading-relaxed text-[#3A3D42] sm:text-xl ${HIDDEN_RISE}`}
        >
          Say something to start a conversation.
        </p>
      </div>
    </section>
  );
};

export default ContactHero;
