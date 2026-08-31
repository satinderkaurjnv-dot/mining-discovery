"use client";

import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The About page's shared motion vocabulary.
 *
 * Every section on /about reveals through the same three primitives declared here — a
 * masked word rise, a fade-and-rise block, and a rule that draws itself — so the page
 * reads as one document rather than as nine separately-authored blocks. The numbers live
 * in this file precisely so that retuning the feel is one edit, not nine.
 *
 * This is the About-page sibling of SectionReveal.tsx, not a replacement for it. That file
 * owns the framer-motion rhythm the homepage sections share; this one owns the GSAP
 * rhythm, which is what /about needs because its sections are scroll-scrubbed rather than
 * simply triggered, and because SmoothScroll.tsx already feeds Lenis into ScrollTrigger.
 */

/** Shared ease. Luxury smooth deceleration with zero overshoot. */
export const ABOUT_EASE = "power3.out";

/** Where a section commits: its top edge 85% of the way down the viewport. */
export const REVEAL_START = "top 85%";

/* ------------------------------------------------------------------------------------ *
 * Initial states.
 * ------------------------------------------------------------------------------------ */

/** A block that fades and gently rises into place with zero blur. */
export const HIDDEN_RISE =
  "opacity-0 [transform:translateY(18px)] motion-reduce:opacity-100 motion-reduce:[transform:none]";

/** A horizontal rule that draws left to right. */
export const HIDDEN_RULE_X =
  "origin-left [transform:scaleX(0)] motion-reduce:[transform:none]";

/** A vertical connector that draws top to bottom. */
export const HIDDEN_RULE_Y =
  "origin-top [transform:scaleY(0)] motion-reduce:[transform:none]";

export const WORD_SELECTOR = ".about-deblur__word";

/**
 * Crystal Clear Word Component (Zero Blur).
 * Each word smoothly rises into place with pure opacity and position transition.
 */
export const MaskedWords: React.FC<{ text: string }> = ({ text }) => {
  const words = text.split(" ");

  return (
    <>
      {words.map((word, index) => (
        <React.Fragment key={`${word}-${index}`}>
          <span
            className="about-deblur__word inline-block opacity-0 [transform:translateY(14px)] motion-reduce:opacity-100 motion-reduce:[transform:none] transition-none will-change-[transform,opacity]"
          >
            {word}
          </span>
          {index < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </>
  );
};

/**
 * Group words by actual rendered line for cohesive reading rhythm.
 */
export function groupWordsByLine(root: HTMLElement | null): HTMLElement[][] {
  if (!root) return [];

  const lines: HTMLElement[][] = [];
  let lineTop = Number.NaN;

  root.querySelectorAll<HTMLElement>(WORD_SELECTOR).forEach((word) => {
    if (!word) return;

    if (!lines.length || Math.abs(word.offsetTop - lineTop) > 6) {
      lines.push([]);
      lineTop = word.offsetTop;
    }

    lines[lines.length - 1].push(word);
  });

  return lines;
}

/** The from/to pair for pure, razor-sharp text animation. */
export const maskedFrom = {
  y: 14,
  opacity: 0,
} as const;

export const maskedTo = {
  y: 0,
  opacity: 1,
  duration: 0.75,
  ease: ABOUT_EASE,
} as const;

/**
 * Reveal marked elements with pure, razor-sharp opacity and smooth rise.
 */
export function revealBlocks(
  scope: HTMLElement,
  options: { trigger?: Element; stagger?: number; start?: string } = {}
) {
  const rules = scope.querySelectorAll<HTMLElement>("[data-about-rule-x]");
  const rulesY = scope.querySelectorAll<HTMLElement>("[data-about-rule-y]");
  const blocks = scope.querySelectorAll<HTMLElement>("[data-about-reveal]");
  const words = scope.querySelectorAll<HTMLElement>(WORD_SELECTOR);

  const tl = gsap.timeline({
    defaults: { ease: ABOUT_EASE },
    scrollTrigger: {
      trigger: options.trigger ?? scope,
      start: options.start ?? REVEAL_START,
      once: true,
    },
  });

  if (rules.length) {
    tl.fromTo(rules, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power2.out" }, 0);
  }
  if (rulesY.length) {
    tl.fromTo(rulesY, { scaleY: 0 }, { scaleY: 1, duration: 0.7, stagger: 0.1, ease: "power2.out" }, 0.15);
  }
  if (words.length) {
    tl.fromTo(words, maskedFrom, { ...maskedTo, stagger: 0.03 }, 0.1);
  }
  if (blocks.length) {
    tl.fromTo(
      blocks,
      { y: 16, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: options.stagger ?? 0.06,
      },
      0.18
    );
  }

  return tl;
}

/** Write the finished state in, inline, where it outranks the CSS initial state. Used for
 *  readers who have asked for reduced motion: skipping the animation must not mean
 *  skipping the content. */
export function settle(scope: HTMLElement) {
  gsap.set(scope.querySelectorAll("[data-about-reveal]"), { y: 0, opacity: 1 });
  gsap.set(scope.querySelectorAll("[data-about-rule-x]"), { scaleX: 1 });
  gsap.set(scope.querySelectorAll("[data-about-rule-y]"), { scaleY: 1 });
  gsap.set(scope.querySelectorAll(WORD_SELECTOR), { yPercent: 0, y: 0, opacity: 1 });
}

/**
 * The boilerplate every About section repeats, in one place: honour reduced motion, wait
 * for webfonts so ScrollTrigger measures a settled layout, scope everything to this
 * section's own element, and revert on unmount.
 *
 * `build` receives the section element and runs inside a gsap.context bound to it, so any
 * selector string used within is resolved against this section alone — nothing declared
 * here can reach another page.
 */
export function useAboutMotion(
  scopeRef: React.RefObject<HTMLElement | null>,
  build: (scope: HTMLElement) => void
) {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      settle(scope);
      return;
    }

    let cancelled = false;
    let ctx: ReturnType<typeof gsap.context> | null = null;

    const start = () => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => build(scope), scope);
    };

    const fonts = document.fonts;
    if (fonts && fonts.status !== "loaded") {
      fonts.ready.then(start);
    } else {
      start();
    }

    return () => {
      cancelled = true;
      ctx?.revert();
    };
    // build is redeclared every render by design; the effect is keyed to the element only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
