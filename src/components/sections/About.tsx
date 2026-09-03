"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Panel {
  label: string;
  heading: string;
  body: string;
  items?: string[];
  cta?: { label: string; href: string };
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
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setStageRef = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      stageRefs.current[index] = node;
    },
    []
  );

  // Synchronize active stage indicator with vertical scroll position
  useEffect(() => {
    const nodes = stageRefs.current.filter((node): node is HTMLDivElement => node !== null);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = stageRefs.current.indexOf(entry.target as HTMLDivElement);
          if (index !== -1) setActiveIdx(index);
        }
      },
      { root: null, rootMargin: "-35% 0px -35% 0px", threshold: 0 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const scrollToStage = (index: number) => {
    const el = document.getElementById(`about-stage-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section
      id="about-journey"
      className="relative bg-[#FAF9F6] text-[#0B1F3A] border-b border-[#E5E4DE] font-sans py-20 sm:py-24 lg:py-28 overflow-x-clip"
    >
      {/* Subtle Geological Background Strata */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_45%_20%,rgba(240,236,226,0.65),rgba(250,249,246,1)_82%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,31,58,0.018)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,31,58,0.018)_1px,transparent_1px)] bg-[size:5.5rem_5.5rem] opacity-50" />
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-start">

          {/* ================================================================ */}
          {/* LEFT COLUMN: STICKY EDITORIAL OVERVIEW & LIQUID GOLD INDICATOR   */}
          {/* ================================================================ */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 flex flex-col items-start gap-6 sm:gap-7">
            {/* Eyebrow with gold hairline */}
            <div className="flex flex-col items-start gap-3">
              <div className="w-10 h-0.5 bg-[#B8860B]" />
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] animate-pulse" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E7208]">
                  About Mining Discovery
                </span>
              </div>
            </div>

            {/* Section Headline & Intro Subtitle */}
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-normal leading-[1.12] tracking-[-0.018em] text-[#0B1F3A]">
                The beats that define modern mining.
              </h2>
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#57595E] max-w-lg">
                From exploratory drill cores to international capital markets, our newsroom articulates the stories that carry real institutional weight.
              </p>
            </div>

            {/* Foundation Stage Card with Gliding Liquid Gold Pill */}
            <div className="w-full rounded-2xl border border-[#E5E4DE] bg-white/85 backdrop-blur-xs p-5 sm:p-6 shadow-xs">
              {/* Stage Counter */}
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#9E7208] mb-3">
                <span className="uppercase tracking-[0.16em]">Foundation Stage</span>
                <span className="tabular-nums">0{activeIdx + 1} / 0{PANEL_COUNT}</span>
              </div>

              {/* Segmented Gold Progress Bar */}
              <div className="h-1.5 w-full rounded-full bg-[#E5E4DE] overflow-hidden mb-5">
                <div
                  className="h-full bg-[#B8860B] transition-all duration-500 ease-out"
                  style={{ width: `${((activeIdx + 1) / PANEL_COUNT) * 100}%` }}
                />
              </div>

              {/* Chapter Selection Buttons with Liquid Gold Gliding Indicator */}
              <div className="flex flex-col gap-1.5 relative">
                {PANELS.map((p, idx) => {
                  const isActive = idx === activeIdx;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => scrollToStage(idx)}
                      className="relative flex items-center justify-between rounded-xl px-4 py-2.5 text-left text-xs font-medium transition-colors duration-200 cursor-pointer group"
                    >
                      {/* Animated Liquid Gold Background Pill */}
                      {isActive && (
                        <motion.span
                          layoutId="active-stage-pill"
                          className="absolute inset-0 rounded-xl bg-[#FAF5E8] border border-[#D4AF37]/50 shadow-2xs z-0"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                          }}
                        />
                      )}

                      {/* Text Content */}
                      <div className="relative z-10 flex items-center gap-3">
                        <span
                          className={`font-mono text-[11px] font-bold ${
                            isActive ? "text-[#9E7208]" : "text-[#8C9099] group-hover:text-[#9E7208]"
                          }`}
                        >
                          0{idx + 1}
                        </span>
                        <span
                          className={`tracking-tight ${
                            isActive
                              ? "text-[#0B1F3A] font-bold"
                              : "text-[#57595E] group-hover:text-[#0B1F3A]"
                          }`}
                        >
                          {p.label}
                        </span>
                      </div>

                      {isActive && (
                        <span className="relative z-10 h-1.5 w-1.5 rounded-full bg-[#B8860B]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* RIGHT COLUMN: ARCHITECTURAL CURTAIN REVEAL STREAM                */}
          {/* ================================================================ */}
          <div className="lg:col-span-7 flex flex-col gap-20 lg:gap-28">
            {PANELS.map((panel, index) => (
              <div
                key={panel.label}
                id={`about-stage-${index}`}
                ref={setStageRef(index)}
                className="flex flex-col"
              >
                {/* 1. ARCHITECTURAL CURTAIN / MASKED PHOTOGRAPH REVEAL */}
                <motion.div
                  initial={{ clipPath: "inset(100% 0% 0% 0%)", opacity: 0.6 }}
                  whileInView={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
                  viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                  className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-[#E5E4DE] shadow-sm bg-[#EFECE6] group"
                >
                  {/* Fine Gold Corner Registration Ticks */}
                  <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t border-l border-[#B8860B]/50 z-20 pointer-events-none" />
                  <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t border-r border-[#B8860B]/50 z-20 pointer-events-none" />
                  <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b border-l border-[#B8860B]/50 z-20 pointer-events-none" />
                  <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b border-r border-[#B8860B]/50 z-20 pointer-events-none" />

                  {/* Photograph with smooth desktop hover */}
                  <motion.div
                    whileHover={{ scale: 1.025 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full h-full relative"
                  >
                    <Image
                      src={panel.image.src}
                      alt={panel.image.alt}
                      fill
                      sizes="(max-width: 1023px) 100vw, 55vw"
                      priority={index === 0}
                      className="object-cover transition-all duration-500 group-hover:contrast-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/30 via-transparent to-transparent opacity-40 pointer-events-none" />
                  </motion.div>

                  {/* Stage Telemetry Badge */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 z-20 flex items-center justify-between font-mono text-[9.5px] text-white/95 bg-[#0B1F3A]/80 backdrop-blur-xs px-3 py-1.5 rounded-sm">
                    <span className="uppercase tracking-wider font-bold">
                      STAGE 0{index + 1} // {panel.label}
                    </span>
                    <span className="text-[#F5C542]">VERIFIED RECORD</span>
                  </div>
                </motion.div>

                {/* 2. WEIGHTED EDITORIAL TYPOGRAPHY */}
                <motion.div
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="pt-6 sm:pt-8"
                >
                  <h3 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-normal leading-[1.16] tracking-[-0.015em] text-[#0B1F3A]">
                    {panel.heading}
                  </h3>

                  <p className="mt-4 text-base sm:text-lg font-normal leading-relaxed text-[#57595E] max-w-2xl">
                    {panel.body}
                  </p>

                  {/* Index List Items (What We Do & Our Expertise) */}
                  {panel.items && (
                    <ul className="mt-6 grid grid-cols-1 border-l-2 border-[#B8860B]/40 sm:grid-cols-2 sm:gap-x-6">
                      {panel.items.map((item, itemIndex) => (
                        <li
                          key={item}
                          className="flex items-baseline gap-3 border-b border-[#E5E4DE] py-2.5 pl-4"
                        >
                          <span className="font-mono text-[11px] tabular-nums font-bold text-[#9E7208]">
                            {String(itemIndex + 1).padStart(2, "0")}
                          </span>
                          <span className="font-sans text-sm font-medium tracking-tight text-[#0B1F3A]">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Call to Action Button (Our Approach) */}
                  {panel.cta && (
                    <div className="mt-7">
                      <Link
                        href={panel.cta.href}
                        className="group inline-flex items-center gap-2 rounded-lg bg-[#B8860B] px-6 py-3 font-sans text-xs font-semibold uppercase tracking-wider text-[#0B1F3A] shadow-sm transition-all duration-300 hover:bg-[#D4AF37] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]"
                      >
                        {panel.cta.label}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  )}
                </motion.div>

                {/* Subtle Technical Stage Divider (except last) */}
                {index < PANEL_COUNT - 1 && (
                  <div className="w-full flex items-center justify-between pt-16 lg:pt-20">
                    <div className="w-full h-px bg-[#E5E4DE]" />
                    <span className="font-mono text-[8.5px] text-[#B8860B]/60 tracking-widest px-3">
                      STAGE 0{index + 1} // 0{index + 2}
                    </span>
                    <div className="w-12 h-px bg-[#B8860B]/40" />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
