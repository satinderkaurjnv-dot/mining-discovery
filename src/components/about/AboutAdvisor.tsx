"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const EXPERTISE = [
  "Exploration",
  "Project Development",
  "Strategic Advisory",
  "Mineral & Market Expertise",
];

export const AboutAdvisor: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative border-b border-[#E5E4DE] bg-[#F7F5EF] py-16 md:py-20 overflow-hidden">
      {/* Background Subtle Technical Texture */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#0B1F3A_1px,transparent_1px)] opacity-[0.03] [background-size:24px_24px]" />

      <div className="container-editorial relative z-10">
        {/* Unified 2-Column Balanced Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* LEFT COLUMN: Advisor Identity + 50+ Monumental Experience */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            {/* Header: Label, Name & Role */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="h-0.5 w-10 bg-[#B8860B]" />
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#9E7208]">
                  Advisor
                </span>
              </div>

              <h2 className="font-serif text-[clamp(2.5rem,5vw,4.25rem)] font-normal leading-[1.05] tracking-[-0.025em] text-[#0B1F3A]">
                Laura Stein
              </h2>

              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#57595E]">
                Advisor, Mining Discovery
              </p>
            </div>

            {/* 50+ Experience Block directly under name */}
            <div className="relative mt-10 pt-8 border-t border-[#E5E4DE]">
              {/* Subtle Radial Glow */}
              <div className="absolute top-4 left-0 w-48 h-48 rounded-full bg-[#B8860B]/10 blur-3xl pointer-events-none" />

              <motion.p
                initial={reduceMotion ? {} : { opacity: 0, scale: 0.88 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="font-geist text-[clamp(4.5rem,10vw,8rem)] font-bold leading-[0.85] tracking-[-0.06em] tabular-nums text-[#B8860B] select-none relative z-10"
              >
                50+
              </motion.p>

              <motion.p
                initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                className="mt-4 max-w-[20ch] font-serif text-xl sm:text-2xl font-normal leading-[1.2] tracking-[-0.015em] text-[#0B1F3A]"
              >
                years of global mining industry experience
              </motion.p>
            </div>
          </div>

          {/* RIGHT COLUMN: Bio Narrative + Core Expertise Domains */}
          <div className="lg:col-span-7 lg:border-l lg:border-[#E5E4DE] lg:pl-12 flex flex-col gap-6">
            <motion.p
              initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg sm:text-xl font-normal leading-relaxed text-[#3A3D42]"
            >
              Laura Stein brings 50-plus years of exceptional global mining industry
              experience to Mining Discovery. Her distinguished career spans roles with
              governments, tier-one operators, and exploration companies across the world&apos;s
              most active mineral districts.
            </motion.p>

            <motion.p
              initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg leading-relaxed text-[#57595E]"
            >
              She serves as a trusted advisor to the platform, guiding content depth,
              industry relationships, and strategic orientation so our reporting reflects
              the real realities of mineral development and investment.
            </motion.p>

            {/* Expertise Domains */}
            <div className="pt-6 border-t border-[#E5E4DE]">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0B1F3A] block mb-4">
                Core Domains of Advisory Expertise:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXPERTISE.map((domain, idx) => (
                  <motion.div
                    key={domain}
                    initial={reduceMotion ? {} : { opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.06 * idx }}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-[#E5E4DE] bg-white shadow-2xs hover:border-[#B8860B]/40 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B]" />
                    <span className="text-sm font-medium text-[#1A1D21]">
                      {domain}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutAdvisor;
