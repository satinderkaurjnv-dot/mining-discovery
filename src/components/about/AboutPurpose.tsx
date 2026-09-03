"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface PurposeItem {
  number: string;
  title: string;
  description: string;
  tags: string[];
}

const PURPOSES: PurposeItem[] = [
  {
    number: "01",
    title: "Illuminate the Industry",
    description:
      "Clear reporting across the areas that decide how the sector moves — from the drill bit to the disclosure.",
    tags: ["Exploration", "Production", "Regulation", "Investment", "ESG"],
  },
  {
    number: "02",
    title: "Insight into Action",
    description:
      "Interpreting mining news and information so that leaders and investors can make informed decisions.",
    tags: ["Executive Briefings", "Market Analysis", "Strategic Data"],
  },
  {
    number: "03",
    title: "Foster Transparency",
    description:
      "A clear view of company operations, risks, and community impact across all operational jurisdictions.",
    tags: ["ESG Disclosures", "Community Impact", "Operational Governance"],
  },
  {
    number: "04",
    title: "Build Bridges",
    description:
      "Connecting the sector's constituencies to one another through rigorous journalism and verified data.",
    tags: ["Mining Companies", "Investors", "Regulators", "Communities"],
  },
];

export const AboutPurpose: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState<number>(0);

  return (
    <section className="relative border-b border-[#E5E4DE] bg-white py-16 md:py-20 overflow-hidden">
      {/* Background Subtle Technical Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#0B1F3A_1px,transparent_1px)] opacity-[0.02] [background-size:24px_24px]" />

      <div className="container-editorial relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 md:mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-0.5 w-10 bg-[#B8860B]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#9E7208]">
              Our Purpose
            </span>
          </div>

          <h2 className="font-serif text-[clamp(2.25rem,4.5vw,3.75rem)] font-normal leading-[1.08] tracking-[-0.025em] text-[#0B1F3A]">
            What the platform is for.
          </h2>
        </div>

        {/* The Four Expanding Horizontal Pillars */}
        <div className="flex flex-col gap-5">
          {PURPOSES.map((purpose, index) => {
            const isActive = activeIdx === index;

            return (
              <motion.div
                key={purpose.number}
                layout
                onMouseEnter={() => setActiveIdx(index)}
                onClick={() => setActiveIdx(index)}
                className={`group relative rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                  isActive
                    ? "bg-[#FAF9F5] border-[#B8860B] shadow-sm opacity-100 scale-100 p-7 sm:p-9"
                    : "bg-white border-[#E5E4DE] hover:border-[#B8860B]/50 hover:bg-[#FAF9F5]/40 shadow-2xs opacity-100 p-6 sm:p-7"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Left: Number & Pillar Title */}
                  <div className="flex items-start gap-4 sm:gap-6 lg:w-[40%]">
                    <span
                      className={`font-geist text-3xl sm:text-4xl font-bold tabular-nums transition-colors ${
                        isActive ? "text-[#B8860B]" : "text-[#9E7208]"
                      }`}
                    >
                      {purpose.number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {isActive && (
                          <motion.span
                            layoutId="purpose-dot"
                            className="w-1.5 h-1.5 rounded-full bg-[#B8860B]"
                          />
                        )}
                        <span className="font-mono text-[10.5px] font-bold uppercase tracking-widest text-[#9E7208]">
                          Pillar {purpose.number}
                        </span>
                      </div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#0B1F3A] leading-tight group-hover:text-[#B8860B] transition-colors">
                        {purpose.title}
                      </h3>
                    </div>
                  </div>

                  {/* Right: Description & Tags */}
                  <div className="lg:w-[58%] flex flex-col gap-4">
                    <p
                      className={`text-base sm:text-lg leading-relaxed transition-colors ${
                        isActive ? "text-[#3A3D42]" : "text-[#57595E]"
                      }`}
                    >
                      {purpose.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {purpose.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                            isActive
                              ? "bg-white border border-[#E5E4DE] text-[#0B1F3A]"
                              : "bg-[#F7F5EF] text-[#888A8E]"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutPurpose;
