"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import {
  HIDDEN_RISE,
  HIDDEN_RULE_X,
  MaskedWords,
  revealBlocks,
  useAboutMotion,
} from "./reveal";

interface PurposeStage {
  number: string;
  line1: string;
  line2: string;
  description: string;
  tags: string[];
}

const PURPOSES: PurposeStage[] = [
  {
    number: "01",
    line1: "Illuminate",
    line2: "the Industry",
    description:
      "Clear reporting across the areas that decide how the sector moves — from the drill bit to the disclosure.",
    tags: ["Exploration", "Production", "Regulation", "Investment", "ESG"],
  },
  {
    number: "02",
    line1: "Insight",
    line2: "into Action",
    description:
      "Interpreting mining news and information so that leaders and investors can make informed decisions.",
    tags: ["Executive Briefings", "Market Analysis", "Strategic Data"],
  },
  {
    number: "03",
    line1: "Foster",
    line2: "Transparency",
    description:
      "A clear view of company operations, risks, and community impact across all operational jurisdictions.",
    tags: ["ESG Disclosures", "Community Impact", "Operational Governance"],
  },
  {
    number: "04",
    line1: "Build",
    line2: "Bridges",
    description:
      "Connecting the sector's constituencies to one another through rigorous journalism and verified data.",
    tags: ["Mining Companies", "Investors", "Regulators", "Communities"],
  },
];

export const AboutPurpose: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState<number>(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest >= 0.75) setActiveStage(3);
    else if (latest >= 0.50) setActiveStage(2);
    else if (latest >= 0.25) setActiveStage(1);
    else setActiveStage(0);
  });

  useAboutMotion(containerRef, () => {
    if (headerRef.current) revealBlocks(headerRef.current);
  });

  const current = PURPOSES[activeStage];

  return (
    <section
      ref={containerRef}
      className="relative h-[380vh] border-b border-[#E5E4DE] bg-white"
    >
      {/* Sticky Viewport Stage */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between py-12 lg:py-16 overflow-hidden">
        {/* Top Header & Stage Progress Rail */}
        <div className="container-editorial">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#E5E4DE] pb-6">
            <div ref={headerRef}>
              <div data-about-rule-x className={`h-0.5 w-12 bg-[#B8860B] ${HIDDEN_RULE_X}`} />
              <span
                data-about-reveal
                className={`mt-4 block text-xs font-semibold uppercase tracking-[0.15em] text-[#B8860B] ${HIDDEN_RISE}`}
              >
                Our Purpose
              </span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-normal text-[#0B1F3A]">
                <MaskedWords text="What the platform is for." />
              </h2>
            </div>

            {/* Stage Progress Indicators */}
            <div className="flex items-center gap-4">
              {PURPOSES.map((item, idx) => {
                const isActive = idx === activeStage;
                return (
                  <div key={item.number} className="flex items-center gap-2">
                    <span
                      className={`font-mono text-xs font-bold transition-colors duration-300 ${
                        isActive ? "text-[#B8860B]" : "text-[#57595E]/40"
                      }`}
                    >
                      {item.number}
                    </span>
                    <span
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        isActive ? "w-8 bg-[#B8860B]" : "w-2 bg-[#E5E4DE]"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Word Transformation Stage */}
        <div className="container-editorial flex-1 flex items-center justify-center my-6">
          <div className="w-full max-w-5xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.number}
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -35 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center"
              >
                {/* Left: Huge Number & Transforming Headline */}
                <div className="lg:col-span-7">
                  <span className="font-mono text-sm font-bold text-[#B8860B] tracking-widest block mb-2">
                    {current.number}
                  </span>

                  <h3 className="font-serif text-[clamp(2.5rem,6vw,4.75rem)] font-normal leading-[1.04] tracking-[-0.025em] text-[#0B1F3A]">
                    <span className="block">{current.line1}</span>
                    <span className="block text-[#0B1F3A]/90">{current.line2}</span>
                  </h3>
                </div>

                {/* Right: Narrative Description & Tags */}
                <div className="lg:col-span-5 lg:border-l lg:border-[#E5E4DE] lg:pl-10">
                  <p className="font-serif text-lg sm:text-xl font-normal leading-relaxed text-[#3A3D42]">
                    {current.description}
                  </p>

                  {current.tags.length > 0 && (
                    <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2.5">
                      {current.tags.map((tag) => (
                        <li
                          key={tag}
                          className="flex items-center gap-2.5 text-sm font-medium text-[#57595E]"
                        >
                          <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#B8860B]"
                          />
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Progress Label */}
        <div className="container-editorial flex items-center justify-between text-xs font-mono text-[#57595E]/60 pt-4 border-t border-[#E5E4DE]/60">
          <span>SCROLL TO TRANSFORM PURPOSE</span>
          <span className="text-[#B8860B] font-semibold">STAGE 0{activeStage + 1} / 04</span>
        </div>
      </div>
    </section>
  );
};

export default AboutPurpose;
