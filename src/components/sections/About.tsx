"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Panel {
  /** Uppercase label shown above the panel heading and read by the progress dots. */
  label: string;
  heading: string;
  body: string;
  /** Optional index list; rendered as numbered rules down the right of the panel. */
  items?: string[];
  /** Optional call to action, rendered under the body copy. Panel 4 carries the only one. */
  cta?: { label: string; href: string };
  /** Supporting photograph for the panel's right column. */
  image: { src: string; alt: string };
}

const PANELS: Panel[] = [
  {
    label: "Who We Are",
    heading: "Clarity in an industry crowded with noise.",
    body: "Mining Discovery started from a single conviction — that a sector this consequential deserves reporting that cuts through the noise and the half-truths. Mining was never only rocks and machinery. It is people, communities, economies, and a meaningful share of the planet's future, and we cover it that way.",
    image: {
      src: "/services/03-assay.jpg",
      alt: "Geologist logging drill core against hole and depth records in a core shed",
    },
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
    image: {
      src: "/services/01-survey.jpg",
      alt: "Exploration drill rig working a survey line across open highland terrain",
    },
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
    image: {
      src: "/about/open-pit-golden-hour.png",
      alt: "Haul trucks working the benches of an open-pit mine at sunset",
    },
  },
  {
    label: "Our Approach",
    heading: "We don't just report the ground. We understand what's beneath it.",
    body: "Our founder leads on a conviction that the global mining industry deserves better communication than it has had, with particular attention to U.S. markets. Our co-founder brings deep digital expertise across SEO, paid media and content strategy — building visibility that reaches the audiences who actually move markets.",
    cta: { label: "Learn More About Us", href: "/about" },
    image: {
      src: "/services/02-drill.jpg",
      alt: "Drill crew working a rig platform together at first light",
    },
  },
];

const PANEL_COUNT = PANELS.length;

export const About: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  const scrollToPanel = (index: number) => {
    const el = document.getElementById(`about-panel-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section
      id="about-journey"
      className="relative w-full border-b border-[#E5E5E3] bg-[#F8F8F6] font-sans text-[#15181C] py-20 lg:py-32"
    >
      <div className="container-editorial">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: STICKY EDITORIAL OVERVIEW & CHAPTER NAVIGATOR                */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[#B8860B]" />
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#9E7208]">
                  About Mining Discovery
                </span>
              </div>
              <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.1] tracking-[-0.02em] text-[#0B1F3A]">
                The beats that define modern mining.
              </h2>
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#57595E]">
                From exploratory drill cores to international capital markets, our newsroom articulates the stories that carry real institutional weight.
              </p>
            </div>

            {/* Active Stage Progress Indicator */}
            <div className="rounded-2xl border border-[#E5E5E3] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-mono font-semibold text-[#9E7208] mb-3">
                <span className="uppercase tracking-wider">Foundation Stage</span>
                <span>0{activeIdx + 1} / 0{PANEL_COUNT}</span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full rounded-full bg-[#E5E5E3] overflow-hidden mb-5">
                <div
                  className="h-full bg-[#B8860B] transition-all duration-500 ease-out"
                  style={{ width: `${((activeIdx + 1) / PANEL_COUNT) * 100}%` }}
                />
              </div>

              {/* Chapter Navigation Items */}
              <div className="flex flex-col gap-2">
                {PANELS.map((p, idx) => {
                  const isActive = idx === activeIdx;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => scrollToPanel(idx)}
                      className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-medium transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "bg-[#FAF5E8] text-[#0B1F3A] font-bold border border-[#D4AF37]/40 shadow-xs"
                          : "text-[#57595E] hover:bg-[#F2F2F0] hover:text-[#0B1F3A]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] text-[#9E7208]">
                          0{idx + 1}
                        </span>
                        <span className="tracking-tight">{p.label}</span>
                      </div>
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#B8860B]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: CINEMATIC VERTICAL EDITORIAL STREAM                         */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col gap-20 lg:gap-32">
            {PANELS.map((panel, index) => (
              <motion.div
                key={panel.label}
                id={`about-panel-${index}`}
                initial={{ opacity: 0.8, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "-30% 0px -30% 0px" }}
                onViewportEnter={() => setActiveIdx(index)}
                transition={{ duration: 0.5 }}
                className="rounded-3xl border border-[#E5E5E3] bg-white p-6 sm:p-10 lg:p-12 shadow-[0_10px_40px_rgba(11,31,58,0.06)] hover:border-[#D4AF37]/30 transition-all duration-300"
              >
                {/* Large Editorial Photograph */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.2)] shadow-md mb-8">
                  <Image
                    src={panel.image.src}
                    alt={panel.image.alt}
                    fill
                    sizes="(max-width: 1023px) 100vw, 55vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#9E7208] border border-[#B8860B]/20">
                    Stage 0{index + 1} // {panel.label}
                  </div>
                </div>

                {/* Editorial Content */}
                <div>
                  <h3 className="font-geist text-2xl sm:text-3xl lg:text-4xl font-semibold leading-[1.12] tracking-[-0.03em] text-[#0B1F3A]">
                    {panel.heading}
                  </h3>

                  <p className="mt-5 text-base sm:text-lg font-normal leading-relaxed text-[#57595E]">
                    {panel.body}
                  </p>

                  {/* Index List Items */}
                  {panel.items && (
                    <ul className="mt-7 grid grid-cols-1 border-l-2 border-[#B8860B]/30 sm:grid-cols-2 sm:gap-x-6">
                      {panel.items.map((item, itemIndex) => (
                        <li
                          key={item}
                          className="flex items-baseline gap-3 border-b border-[#15181C]/[0.08] py-2.5 pl-4"
                        >
                          <span className="font-mono text-[11px] tabular-nums text-[#9E7208]/80">
                            {String(itemIndex + 1).padStart(2, "0")}
                          </span>
                          <span className="font-serif text-base font-normal tracking-[-0.01em] text-[#15181C]">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CTA Button */}
                  {panel.cta && (
                    <Link
                      href={panel.cta.href}
                      className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-[#B8860B] px-6 py-3 font-sans text-sm font-semibold tracking-wide text-[#0B1F3A] shadow-[0_0_20px_rgba(184,134,11,0.35)] transition-all duration-300 hover:bg-[#D4AF37] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] focus-visible:ring-offset-2"
                    >
                      {panel.cta.label}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
