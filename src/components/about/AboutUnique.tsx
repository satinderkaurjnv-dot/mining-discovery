"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  HIDDEN_RISE,
  HIDDEN_RULE_X,
  MaskedWords,
  revealBlocks,
  useAboutMotion,
} from "./reveal";

/*
 * Section 07 — What Makes Us Unique.
 *
 * Five differentiators on a rail that fills as you read past them.
 *
 * All five are from miningdiscovery.com/about-us.
 */

const DIFFERENTIATORS: Array<{ title: string; description: string }> = [
  {
    title: "Industry-Focused Journalism",
    description: "Mining-focused coverage with depth, context, and consistency.",
  },
  {
    title: "Integrated Approach",
    description: "Reporting, data, and branding connected as part of one story.",
  },
  {
    title: "Dual Perspective",
    description: "Serving both industry professionals and community stakeholders.",
  },
  {
    title: "Media & Digital Strength",
    description: "Editorial work combined with SEO, visual storytelling, and syndication.",
  },
  {
    title: "Founder-Driven Vision",
    description: "A vision guided by the founders' commitment to purpose-driven growth.",
  },
];

export const AboutUnique: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const entriesRef = useRef<Array<HTMLElement | null>>([]);
  const [reached, setReached] = useState<number | null>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    entriesRef.current.forEach((entry, index) => {
      if (!entry) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              setReached((prev) => Math.max(prev ?? 0, index + 1));
            }
          });
        },
        { rootMargin: "-15% 0px -35% 0px" }
      );
      observer.observe(entry);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  useAboutMotion(sectionRef, () => {
    if (headerRef.current) revealBlocks(headerRef.current);

    entriesRef.current.forEach((entry) => {
      if (!entry) return;
      revealBlocks(entry, { stagger: 0.05, start: "top 88%" });
    });
  });

  return (
    <section ref={sectionRef} className="border-b border-[#E5E4DE]">
      <div className="container-editorial py-20 md:py-28">
        <div ref={headerRef}>
          <div data-about-rule-x className={`h-0.5 w-12 bg-[#B8860B] ${HIDDEN_RULE_X}`} />
          <span
            data-about-reveal
            className={`mt-6 block text-xs font-semibold uppercase tracking-[0.15em] text-[#B8860B] ${HIDDEN_RISE}`}
          >
            What Makes Us Unique
          </span>
          <h2 className="mt-6 max-w-[20ch] font-serif text-[clamp(2rem,4.2vw,3.25rem)] font-normal leading-[1.1] tracking-[-0.02em] text-[#0B1F3A]">
            <MaskedWords text="Five things that set us apart." />
          </h2>
        </div>

        <div ref={listRef} className="relative mt-14 md:mt-20">
          {/*
            The rail lives OUTSIDE the <ol>, and that is not tidiness. An <ol> may only
            contain <li>, and a stray <span> before the first item makes that item stop being
            :first-child — which silently defeats the `first:border-t-0` on it and leaves a
            hairline hanging above the list with nothing above it to separate.

            The rail runs down the gutter the <ol>'s pl-16 opens up, so the list's hairlines
            begin to the right of it rather than crossing it. 3px centres a 1px rail under a
            7px mark; the marks reach back into the same gutter with -left-16, which is the
            same 4rem. Those two numbers have to move together.
          */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-[6px] bottom-2 left-[3px] hidden w-px bg-[#E5E4DE] md:block"
          />
          <span
            aria-hidden="true"
            style={{
              height: reached ? `${Math.min(100, (reached / DIFFERENTIATORS.length) * 100)}%` : "0%",
            }}
            className="pointer-events-none absolute top-[6px] left-[3px] hidden w-px bg-[#B8860B] transition-[height] duration-500 ease-out md:block shadow-[0_0_8px_rgba(184,134,11,0.6)]"
          />

          <ol className="md:pl-16">
            {DIFFERENTIATORS.map((item, index) => {
              const isReached = reached === null || index < reached;

              return (
                <li
                  key={item.title}
                  ref={(el) => {
                    entriesRef.current[index] = el;
                  }}
                  className="group border-t border-[#E5E4DE] py-10 first:border-t-0 first:pt-0 md:py-14 md:first:pt-0 transition-colors duration-300 hover:bg-[#FAF5E8]/30 rounded-xl px-4 -mx-4 cursor-default"
                >
                  <div className="grid grid-cols-1 gap-x-16 gap-y-4 lg:grid-cols-12">
                    <div className="relative lg:col-span-7">
                      <span
                        aria-hidden="true"
                        className={`absolute -left-16 top-[3px] hidden h-[9px] w-[9px] rounded-full border border-[#B8860B] transition-all duration-500 md:block ${
                          isReached ? "bg-[#B8860B] shadow-[0_0_8px_rgba(184,134,11,0.5)]" : "bg-[#F7F5EF]"
                        } group-hover:scale-125 group-hover:border-[#B8860B]`}
                      />
                      <span
                        data-about-reveal
                        className={`font-mono text-[11px] tabular-nums transition-colors duration-500 ${
                          isReached ? "text-[#B8860B] font-semibold" : "text-[#B8860B]/40"
                        } group-hover:text-[#B8860B] ${HIDDEN_RISE}`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <h3 className="mt-4 font-serif text-[clamp(1.6rem,3.2vw,2.5rem)] font-normal leading-[1.12] tracking-[-0.018em] text-[#0B1F3A] transition-all duration-300 group-hover:text-[#B8860B] group-hover:translate-x-1">
                        <MaskedWords text={item.title} />
                      </h3>
                    </div>

                    <p
                      data-about-reveal
                      className={`max-w-[42ch] text-base font-normal leading-relaxed text-[#57595E] transition-colors duration-300 group-hover:text-[#1A1D21] sm:text-lg lg:col-span-5 lg:pt-8 ${HIDDEN_RISE}`}
                    >
                      {item.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default AboutUnique;
