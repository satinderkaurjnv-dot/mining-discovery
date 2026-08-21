"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";

interface Panel {
  /** Uppercase label shown above the panel heading and read by the progress dots. */
  label: string;
  heading: string;
  body: string;
  /** Optional index list; rendered as numbered rules down the right of the panel. */
  items?: string[];
}

const PANELS: Panel[] = [
  {
    label: "Who We Are",
    heading: "Clarity in an industry crowded with noise.",
    body: "Mining Discovery started from a single conviction — that a sector this consequential deserves reporting that cuts through the noise and the half-truths. Mining was never only rocks and machinery. It is people, communities, economies, and a meaningful share of the planet's future, and we cover it that way.",
  },
  {
    label: "What We Do",
    heading: "Four ways the story reaches you.",
    body: "One newsroom, four cadences — from the day's filings to the long read that finally has room to breathe.",
    items: [
      "Daily Mining News",
      "Weekly Newsletter",
      "Monthly Magazine",
      "Interactive Platform",
    ],
  },
  {
    label: "Our Expertise",
    heading: "The beats that actually move markets.",
    body: "The industry had no dedicated, trustworthy voice for the stories that carry weight. These are the ones we committed to covering properly.",
    items: [
      "Corporate actions",
      "Sustainability",
      "Exploration",
      "Regulation",
      "Investor relations",
      "Innovation",
    ],
  },
  {
    label: "Our Approach",
    heading: "We don't just report the ground. We understand what's beneath it.",
    body: "Our founder leads on a conviction that the global mining industry deserves better communication than it has had, with particular attention to U.S. markets. Our co-founder brings deep digital expertise across SEO, paid media and content strategy — building visibility that reaches the audiences who actually move markets.",
  },
];

const PANEL_COUNT = PANELS.length;

export const About: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobileOrReduced, setIsMobileOrReduced] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  /*
   * Same guard ServicesScrollStory uses, and for the same two reasons. A horizontal pin
   * hijacks the scroll direction, which is the exact motion prefers-reduced-motion is
   * asking us not to run; and on a phone the panels have no width to travel across, so
   * the pin costs four viewports of scroll to deliver what a stack delivers for free.
   * Both cases fall through to the plain vertical version below.
   */
  useEffect(() => {
    const check = () => {
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isNarrow = window.innerWidth < 1024;
      setIsMobileOrReduced(isReduced || isNarrow);
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /*
   * The track is PANEL_COUNT viewports wide, and the last panel has to finish flush with
   * the right edge rather than scrolling past it — so the travel is (n-1)/n of the track,
   * not the whole of it. At four panels that is -75%, which lands panel 4 exactly filling
   * the viewport at progress 1.
   */
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `-${(100 * (PANEL_COUNT - 1)) / PANEL_COUNT}%`]
  );

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Rounded rather than floored: the dot should flip at the midpoint of a transition,
    // when the incoming panel is already the one being read, not when it finally lands.
    const next = Math.min(
      PANEL_COUNT - 1,
      Math.max(0, Math.round(latest * (PANEL_COUNT - 1)))
    );
    setActiveIndex((current) => (current === next ? current : next));
  });

  return (
    /*
     * #FFFFFF — the hero card's own surface, and the brightest ground on the page. Stats
     * (#FBFBFA) sits above and TrustedBy (#F4F4F2) below, so pure white is a full step up
     * from both rather than a fourth shade of off-white: the section still separates from
     * its neighbours, but by being lighter than them instead of by inverting.
     *
     * Height is PANEL_COUNT viewports. With offset ["start start", "end end"] the sticky
     * child stays parked for height - 100vh, which is the (n-1) viewports of travel the
     * transform above consumes — so the two cannot drift apart when a panel is added.
     */
    <section
      id="about"
      ref={containerRef}
      className={`relative w-full border-b border-[#E5E5E3] bg-white font-sans text-[#15181C] ${
        isMobileOrReduced ? "" : "h-[var(--about-track-height)]"
      }`}
      style={
        { "--about-track-height": `${PANEL_COUNT * 100}vh` } as React.CSSProperties
      }
    >
      {isMobileOrReduced ? (
        /* --- Static fallback: the same four panels, stacked ---------------------- */
        <div className="container-editorial flex flex-col gap-16 py-20 md:gap-20 md:py-28">
          {PANELS.map((panel, index) => (
            <PanelBody key={panel.label} panel={panel} index={index} />
          ))}
        </div>
      ) : (
        <div className="sticky top-0 h-screen overflow-hidden">
          {/*
            The width is explicit and in viewport units. A flex row left at width:auto is
            block-level and sizes to its 100vw parent, so the percentage x below would
            resolve against ONE viewport rather than four and the track would travel a
            quarter of the distance it needs to.
          */}
          <motion.div style={{ x, width: `${PANEL_COUNT * 100}vw` }} className="flex h-full">
            {PANELS.map((panel, index) => (
              <div
                key={panel.label}
                className="flex h-full w-screen shrink-0 items-center"
              >
                <div className="container-editorial w-full">
                  <PanelBody panel={panel} index={index} />
                </div>
              </div>
            ))}
          </motion.div>

          {/* --- Progress dots --------------------------------------------------- */}
          <div className="pointer-events-none absolute bottom-12 left-1/2 flex -translate-x-1/2 items-center gap-3">
            {PANELS.map((panel, index) => {
              const isActive = index === activeIndex;
              return (
                <span
                  key={panel.label}
                  aria-hidden="true"
                  className={`block h-1.5 rounded-full transition-all duration-500 ease-out ${
                    isActive ? "w-8 bg-[#B8860B]" : "w-1.5 bg-[#15181C]/20"
                  }`}
                />
              );
            })}
            <span className="sr-only">
              Panel {activeIndex + 1} of {PANEL_COUNT}: {PANELS[activeIndex].label}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

/**
 * One panel's contents, shared by the pinned track and the stacked fallback so the two
 * can never drift into being different sections.
 */
const PanelBody: React.FC<{ panel: Panel; index: number }> = ({ panel, index }) => (
  <div className="grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-12">
    <div className={panel.items ? "lg:col-span-7" : "lg:col-span-9"}>
      <div className="flex items-center gap-4">
        <span className="font-mono text-[11px] tabular-nums text-[#9E7208]/80">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="h-px w-10 bg-[#B8860B]/40" />
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9E7208]">
          {panel.label}
        </p>
      </div>

      {/* Hero type, one section down: font-geist semibold at the same tracking. */}
      <h2 className="mt-7 max-w-[18ch] font-geist text-[clamp(2rem,3.8vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-[#15181C]">
        {panel.heading}
      </h2>

      <p className="mt-7 max-w-xl text-lg font-normal leading-relaxed text-[#57595E] sm:text-xl">
        {panel.body}
      </p>
    </div>

    {panel.items && (
      <ul className="border-l border-[#B8860B]/30 lg:col-span-5">
        {panel.items.map((item, itemIndex) => (
          <li
            key={item}
            className="flex items-baseline gap-5 border-b border-[#15181C]/[0.09] py-4 pl-6 last:border-b-0"
          >
            <span className="font-mono text-[11px] tabular-nums text-[#9E7208]/80">
              {String(itemIndex + 1).padStart(2, "0")}
            </span>
            <span className="font-serif text-xl font-normal tracking-[-0.01em] text-[#15181C] sm:text-2xl">
              {item}
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default About;
