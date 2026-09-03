"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MaskedWords } from "./reveal";

const HEADING = "About Mining Discovery";
const QUOTE = "“One platform. Every major mining audience.”";

export const AboutHero: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reduceMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized offset from center (-1 to 1)
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [reduceMotion]);

  // Subtle parallax translation (5-15px maximum)
  const layer1X = mousePos.x * 12;
  const layer1Y = mousePos.y * 10;
  const layer2X = mousePos.x * -8;
  const layer2Y = mousePos.y * -6;

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden border-b border-[#E5E4DE] bg-[#F7F5EF] min-h-[85vh] flex items-center"
    >
      {/* -------------------------------------------------------------------- */}
      {/* GEOLOGICAL BACKGROUND STRATA WITH PARALLAX DRIFT                     */}
      {/* -------------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Subtle technical dot grain */}
        <div className="absolute inset-0 bg-[radial-gradient(#0B1F3A_1px,transparent_1px)] opacity-[0.025] [background-size:20px_20px]" />

        {/* Geological Strata Layer 1 (Slow Parallax) */}
        <motion.div
          animate={reduceMotion ? {} : { x: layer1X, y: layer1Y }}
          transition={{ type: "spring", damping: 40, stiffness: 80 }}
          className="absolute right-0 top-0 w-full lg:w-[65%] h-full opacity-35 mix-blend-multiply pointer-events-none"
        >
          <svg
            viewBox="0 0 900 700"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-cover"
          >
            <path
              d="M100,80 C320,120 540,40 760,90 C840,110 880,140 900,160 L900,700 L0,700 L0,240 C40,160 60,70 100,80 Z"
              fill="rgba(184, 134, 11, 0.035)"
            />
            <path
              d="M50,180 C280,240 500,160 740,220 C820,240 880,280 900,310"
              stroke="rgba(184, 134, 11, 0.22)"
              strokeWidth="1.2"
              strokeDasharray="4 8"
            />
            <path
              d="M0,320 C240,380 480,290 700,360 C800,390 870,430 900,470"
              stroke="rgba(11, 31, 58, 0.08)"
              strokeWidth="1"
            />
            <path
              d="M20,460 C260,510 520,440 760,500 C830,520 870,550 900,580"
              stroke="rgba(184, 134, 11, 0.15)"
              strokeWidth="1"
            />
          </svg>
        </motion.div>

        {/* Geological Strata Layer 2 (Opposing Depth Parallax) */}
        <motion.div
          animate={reduceMotion ? {} : { x: layer2X, y: layer2Y }}
          transition={{ type: "spring", damping: 40, stiffness: 80 }}
          className="absolute -right-20 -bottom-10 w-full lg:w-[50%] h-[80%] opacity-25 pointer-events-none"
        >
          <svg
            viewBox="0 0 600 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <circle
              cx="450"
              cy="350"
              r="280"
              stroke="rgba(184, 134, 11, 0.12)"
              strokeWidth="1"
              strokeDasharray="2 6"
            />
            <circle
              cx="450"
              cy="350"
              r="200"
              stroke="rgba(11, 31, 58, 0.06)"
              strokeWidth="1"
            />
            <circle
              cx="450"
              cy="350"
              r="120"
              stroke="rgba(184, 134, 11, 0.18)"
              strokeWidth="1.2"
            />
          </svg>
        </motion.div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* HERO CONTENT: EDITORIAL OPENING                                      */}
      {/* -------------------------------------------------------------------- */}
      <div className="container-editorial relative z-10 pt-36 pb-24 md:pt-44 md:pb-32 w-full">
        <div className="max-w-4xl">
          {/* Eyebrow Accent Rule & Label */}
          <div className="flex items-center gap-3">
            <motion.div
              initial={reduceMotion ? {} : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-0.5 w-12 bg-[#B8860B] origin-left"
            />
            <motion.span
              initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#9E7208]"
            >
              About Us
            </motion.span>
          </div>

          {/* Main Heading: About Mining Discovery */}
          <motion.h1
            initial={reduceMotion ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 font-serif text-[clamp(2.75rem,6.5vw,5.5rem)] font-normal leading-[1.04] tracking-[-0.03em] text-[#0B1F3A]"
          >
            {HEADING}
          </motion.h1>

          {/* Defining Quote */}
          <motion.p
            initial={reduceMotion ? {} : { opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 font-serif text-[clamp(1.5rem,3.2vw,2.75rem)] font-normal leading-[1.2] tracking-[-0.02em] text-[#57595E] max-w-3xl"
          >
            {QUOTE}
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
