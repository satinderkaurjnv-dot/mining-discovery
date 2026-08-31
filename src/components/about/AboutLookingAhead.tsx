"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

const REGIONS = [
  { name: "Africa", x: "52%", y: "58%" },
  { name: "Latin America", x: "30%", y: "65%" },
  { name: "Asia", x: "72%", y: "45%" },
];

const BUILDING = [
  "Advanced data tools",
  "Improved video storytelling",
  "An engaged mining community",
];

export const AboutLookingAhead: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0B1F3A] text-white py-28 md:py-40"
    >
      {/* Background Subtle Dot Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#FFF_1px,transparent_1px)] opacity-[0.03] [background-size:20px_20px]" />

      <div className="container-editorial relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-0.5 w-12 bg-[#D4AF37]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
              Looking Ahead
            </span>
          </div>

          <h2 className="font-serif text-[clamp(2.5rem,5.5vw,4.5rem)] font-normal leading-[1.05] tracking-[-0.025em] text-white">
            A trusted global voice in mining.
          </h2>
        </div>

        {/* Global Expansion Map Area */}
        <div className="mt-20 border-t border-white/10 pt-16">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white/50 block mb-8">
            Expanding coverage into
          </span>

          {/* Abstract World Contour Map Graphic */}
          <div className="relative w-full aspect-[21/9] max-h-[360px] rounded-2xl border border-white/10 bg-white/[0.02] p-8 flex items-center justify-center overflow-hidden mb-16">
            {/* World Continents Abstract Outlines */}
            <svg
              viewBox="0 0 1000 450"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full opacity-30 object-contain"
            >
              {/* Americas */}
              <path
                d="M200,80 Q260,110 240,180 Q210,220 280,270 Q320,330 290,400 Q260,370 250,300 Q190,200 180,110 Z"
                stroke="#D4AF37"
                strokeWidth="1"
                strokeDasharray="2 4"
              />
              {/* EMEA */}
              <path
                d="M480,90 Q560,70 580,140 Q550,220 540,320 Q480,360 460,260 Q440,160 480,90 Z"
                stroke="#D4AF37"
                strokeWidth="1"
                strokeDasharray="2 4"
              />
              {/* Asia / APAC */}
              <path
                d="M620,80 Q780,70 860,150 Q800,240 760,310 Q700,260 660,180 Q600,130 620,80 Z"
                stroke="#D4AF37"
                strokeWidth="1"
                strokeDasharray="2 4"
              />
            </svg>

            {/* Glowing Region Beacons: Africa, Latin America, Asia */}
            {REGIONS.map((region, idx) => (
              <motion.div
                key={region.name}
                initial={reduceMotion ? {} : { scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 * idx, ease: "easeOut" }}
                style={{ left: region.x, top: region.y }}
                className="absolute flex items-center gap-2.5 -translate-x-1/2 -translate-y-1/2 cursor-default group"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-60" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4AF37]" />
                </span>
                <span className="font-serif text-lg sm:text-xl font-normal text-white drop-shadow-md group-hover:text-[#D4AF37] transition-colors">
                  {region.name}
                </span>
              </motion.div>
            ))}
          </div>

          {/* 3 Future Initiatives with Expanding Lines */}
          <div className="mt-14 border-t border-white/10 pt-14">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white/50 block mb-8">
              Building for what the industry needs next
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {BUILDING.map((item, idx) => (
                <div key={item} className="flex flex-col gap-4">
                  {/* Expanding Line */}
                  <div className="h-0.5 w-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={reduceMotion ? {} : { width: "0%" }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 * idx, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-white/60"
                    />
                  </div>

                  <span className="font-serif text-xl sm:text-2xl font-normal text-white">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cinematic Closing Statement: Truth over noise */}
          <div className="mt-28 md:mt-36 border-t border-white/10 pt-20 text-center">
            <motion.p
              initial={reduceMotion ? {} : { opacity: 0, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-[clamp(2.5rem,6vw,5.5rem)] font-normal leading-[1.05] tracking-[-0.03em] text-[#D4AF37]"
            >
              Truth over noise.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutLookingAhead;
