"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const DIFFERENTIATORS = [
  {
    num: "01",
    title: "Industry-Focused Journalism",
    description: "Mining-focused coverage with depth, context, and consistency.",
  },
  {
    num: "02",
    title: "Integrated Approach",
    description: "Reporting, data, and branding connected as part of one story.",
  },
  {
    num: "03",
    title: "Dual Perspective",
    description: "Serving both industry professionals and community stakeholders.",
  },
  {
    num: "04",
    title: "Media & Digital Strength",
    description: "Editorial work combined with SEO, visual storytelling, and syndication.",
  },
  {
    num: "05",
    title: "Founder-Driven Vision",
    description: "A vision guided by the founders' commitment to purpose-driven growth.",
  },
];

export const AboutUnique: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState<number>(0);

  return (
    <section className="relative border-b border-[#E5E4DE] bg-white py-16 md:py-24 overflow-hidden">
      <div className="container-editorial relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 md:mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-0.5 w-10 bg-[#B8860B]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#9E7208]">
              What Makes Us Unique
            </span>
          </div>

          <h2 className="font-serif text-[clamp(2.25rem,4.5vw,3.75rem)] font-normal leading-[1.08] tracking-[-0.025em] text-[#0B1F3A]">
            Five things that set us apart.
          </h2>
        </div>

        {/* Stacked Magnetic Panels */}
        <div className="flex flex-col gap-4 max-w-4xl mx-auto">
          {DIFFERENTIATORS.map((item, index) => {
            const isActive = activeIdx === index;

            return (
              <motion.div
                key={item.num}
                layout
                onMouseEnter={() => setActiveIdx(index)}
                className={`relative rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden p-6 sm:p-8 ${
                  isActive
                    ? "bg-[#FAF9F5] border-[#B8860B] shadow-md -translate-y-1 z-20 opacity-100"
                    : "bg-white border-[#E5E4DE] hover:border-[#B8860B]/40 hover:-translate-y-0.5 shadow-2xs z-10 opacity-100"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                  <div className="flex items-baseline gap-4">
                    <span
                      className={`font-mono text-sm font-bold transition-colors ${
                        isActive ? "text-[#B8860B]" : "text-[#888A8E]"
                      }`}
                    >
                      {item.num}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#0B1F3A]">
                      {item.title}
                    </h3>
                  </div>

                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#9E7208] shrink-0">
                    Advantage {item.num}
                  </span>
                </div>

                <p className="mt-3 text-base sm:text-lg leading-relaxed text-[#57595E] sm:pl-9">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutUnique;
