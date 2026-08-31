"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const BEATS = [
  { num: "01", title: "Corporate actions", angle: 300 },
  { num: "02", title: "Sustainability", angle: 0 },
  { num: "03", title: "Exploration", angle: 60 },
  { num: "04", title: "Regulation", angle: 120 },
  { num: "05", title: "Investor relations", angle: 180 },
  { num: "06", title: "Innovation", angle: 240 },
];

export const AboutCoverage: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden border-b border-[#E5E4DE] bg-[#F7F5EF] py-16 md:py-24">
      {/* Background Subtle Technical Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(11,31,58,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,31,58,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60" />

      <div className="container-editorial relative z-10">
        {/* Section Heading */}
        <div className="max-w-2xl mx-auto text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-0.5 w-8 bg-[#B8860B]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#9E7208]">
              What We Cover
            </span>
            <span className="h-0.5 w-8 bg-[#B8860B]" />
          </div>

          <h2 className="font-serif text-[clamp(2.25rem,4.5vw,3.5rem)] font-normal leading-[1.1] tracking-[-0.02em] text-[#0B1F3A]">
            The Mining Ecosystem
          </h2>

          <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#57595E]">
            Mining isn&apos;t just rocks and machines. It is people, communities,
            economies, and a meaningful share of the planet&apos;s future — and we set out
            to build a platform that honours all of that.
          </p>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* DESKTOP RADIAL ECOSYSTEM (lg:block)                                */}
        {/* ------------------------------------------------------------------ */}
        <div className="hidden lg:flex relative w-full max-w-4xl mx-auto h-[480px] items-center justify-center">
          {/* Subtle Outer Orbital Rings */}
          <div className="absolute w-[440px] h-[440px] rounded-full border border-[#E5E4DE] pointer-events-none" />
          <div className="absolute w-[320px] h-[320px] rounded-full border border-[#B8860B]/15 border-dashed pointer-events-none" />

          {/* Center Hub */}
          <motion.div
            initial={reduceMotion ? {} : { scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="z-20 flex flex-col items-center justify-center w-48 h-48 rounded-full bg-white border border-[#B8860B]/30 shadow-md text-center p-4"
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#9E7208] mb-1">
              Platform Core
            </span>
            <p className="font-serif text-lg font-normal text-[#0B1F3A] leading-tight">
              What We Cover
            </p>
            <span className="mt-2 text-[11px] font-mono text-[#57595E]">
              6 Key Sectors
            </span>
          </motion.div>

          {/* Radial Categories placed at 6 equidistant positions around circle */}
          {BEATS.map((beat, idx) => {
            // Radians: angle in degrees
            const rad = (beat.angle * Math.PI) / 180;
            // Radius ~230px
            const x = Math.round(230 * Math.cos(rad));
            const y = Math.round(180 * Math.sin(rad));
            const isHovered = hoveredIdx === idx;

            return (
              <motion.div
                key={beat.num}
                initial={reduceMotion ? {} : { opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * idx, ease: "easeOut" }}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="absolute z-30 cursor-pointer"
              >
                {/* Thin SVG connection line to center */}
                <svg
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10 overflow-visible"
                  width="1"
                  height="1"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2={-x}
                    y2={-y}
                    stroke={isHovered ? "#B8860B" : "#E5E4DE"}
                    strokeWidth={isHovered ? "1.5" : "1"}
                    strokeDasharray={isHovered ? "none" : "3 4"}
                    className="transition-colors duration-300"
                  />
                </svg>

                {/* Category Card/Pill */}
                <div
                  className={`flex items-center gap-3 px-5 py-3 rounded-xl border bg-white shadow-2xs transition-all duration-300 ${
                    isHovered
                      ? "border-[#B8860B] shadow-md scale-105 bg-[#FAF5E8]"
                      : "border-[#E5E4DE] hover:border-[#B8860B]/50"
                  }`}
                >
                  <span
                    className={`font-mono text-xs font-bold transition-colors ${
                      isHovered ? "text-[#B8860B]" : "text-[#9E7208]"
                    }`}
                  >
                    {beat.num}
                  </span>
                  <span
                    className={`font-serif text-base font-normal whitespace-nowrap transition-colors ${
                      isHovered ? "text-[#0B1F3A] font-medium" : "text-[#1A1D21]"
                    }`}
                  >
                    {beat.title}
                  </span>
                  {isHovered && (
                    <motion.span
                      layoutId="gold-indicator"
                      className="w-1.5 h-1.5 rounded-full bg-[#B8860B]"
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* MOBILE & TABLET: CLEAN VERTICAL LIST (< 1024px)                    */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:hidden relative max-w-xl mx-auto pl-6">
          {/* Subtle Left Connection Spine Line */}
          <div className="absolute top-2 bottom-2 left-2 w-px bg-[#E5E4DE]" />

          <div className="flex flex-col gap-4">
            {BEATS.map((beat, idx) => (
              <motion.div
                key={beat.num}
                initial={reduceMotion ? {} : { opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
                className="relative flex items-center gap-4 rounded-xl border border-[#E5E4DE] bg-white p-4 shadow-2xs"
              >
                {/* Node on spine */}
                <div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white bg-[#B8860B]" />
                <span className="font-mono text-xs font-bold text-[#9E7208]">
                  {beat.num}
                </span>
                <span className="font-serif text-lg font-normal text-[#0B1F3A]">
                  {beat.title}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCoverage;
