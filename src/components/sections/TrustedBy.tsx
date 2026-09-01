"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

interface Company {
  name: string;
  logo: string;
}

const companies: Company[] = [
  { name: "Arras Minerals", logo: "https://www.miningdiscovery.com/trustedbrands/ARRAS Minerals LOGO.png" },
  { name: "Afrikor", logo: "https://www.miningdiscovery.com/trustedbrands/Afrikor LOGO.png" },
  { name: "Arizona Gold & Silver", logo: "https://www.miningdiscovery.com/trustedbrands/Arizona Gold & Silver LOGO.png" },
  { name: "Astra Exploration", logo: "https://www.miningdiscovery.com/trustedbrands/Astra Exploration LOGO.png" },
  { name: "Aurion Resources", logo: "https://www.miningdiscovery.com/trustedbrands/Aurion Resources LOGO.png" },
  { name: "Bluenergies", logo: "https://www.miningdiscovery.com/trustedbrands/BBluenergies LOGO.png" },
  { name: "Bactech", logo: "https://www.miningdiscovery.com/trustedbrands/Bactech LOGO.png" },
  { name: "Digipower X", logo: "https://www.miningdiscovery.com/trustedbrands/DIGIPOWER X LOGO.png" },
  { name: "Gold Hunter Resources", logo: "https://www.miningdiscovery.com/trustedbrands/Gold Hunter Resources LOGO.png" },
  { name: "Golkor", logo: "https://www.miningdiscovery.com/trustedbrands/Golkor LOGO.png" },
  { name: "Guanajuato", logo: "https://www.miningdiscovery.com/trustedbrands/Guanajuato LOGO.png" },
  { name: "Harfang", logo: "https://www.miningdiscovery.com/trustedbrands/Harfang LOGO.png" },
  { name: "He Capital", logo: "https://www.miningdiscovery.com/trustedbrands/He Capital LOGO.png" },
  { name: "Kodiak Copper", logo: "https://www.miningdiscovery.com/trustedbrands/Kodiak Copper LOGO.png" },
  { name: "Leviathan", logo: "https://www.miningdiscovery.com/trustedbrands/Leviathan LOGO.png" },
  { name: "Loyalist", logo: "https://www.miningdiscovery.com/trustedbrands/Loyalist LOGO.png" },
  { name: "Mining Investment Event", logo: "https://www.miningdiscovery.com/trustedbrands/Mining Investment Event LOGO.png" },
  { name: "Noble Plains", logo: "https://www.miningdiscovery.com/trustedbrands/Noble Plains LOGO.png" },
  { name: "Pan Global", logo: "https://www.miningdiscovery.com/trustedbrands/Pan Global LOGO.png" },
  { name: "Phenom Resources", logo: "https://www.miningdiscovery.com/trustedbrands/Phenom Resources LOGO.png" },
  { name: "Power Metallic", logo: "https://www.miningdiscovery.com/trustedbrands/Power Metallic LOGO.png" },
  { name: "SilverWolf", logo: "https://www.miningdiscovery.com/trustedbrands/SilverWolf LOGO.png" },
  { name: "Spacekor", logo: "https://www.miningdiscovery.com/trustedbrands/Spacekor LOGO.png" },
  { name: "US Gold", logo: "https://www.miningdiscovery.com/trustedbrands/US GOLD LOGO.png" },
  { name: "USDC", logo: "https://www.miningdiscovery.com/trustedbrands/USDC LOGO.png" },
  { name: "Vivio Power", logo: "https://www.miningdiscovery.com/trustedbrands/Vivio Power LOGO.png" },
  { name: "West Red Lake", logo: "https://www.miningdiscovery.com/trustedbrands/West Red Lake LOGO.png" },
];

// 3 balanced streams (9 companies each)
const ROW_1 = companies.slice(0, 9);
const ROW_2 = companies.slice(9, 18);
const ROW_3 = companies.slice(18, 27);

const CompanyLogo: React.FC<{ company: Company; nodeIndex: number }> = ({ company, nodeIndex }) => {
  const [logoAvailable, setLogoAvailable] = useState(true);

  if (!logoAvailable) {
    return (
      <span className="text-center font-sans text-xs sm:text-sm font-bold tracking-tight text-[#0B1F3A] uppercase px-3">
        {company.name}
      </span>
    );
  }

  // Subtle breathing float with non-synchronized organic timing
  const driftDur = 5.6 + ((nodeIndex * 1.2) % 2.8);
  const driftDelay = (nodeIndex * 0.6) % 2.2;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={company.logo}
      alt={`${company.name} logo`}
      style={{
        animation: `logo-breathing ${driftDur}s ease-in-out infinite alternate ${driftDelay}s`,
      }}
      className="h-auto w-full max-w-[165px] sm:max-w-[185px] lg:max-w-[205px] max-h-[62px] sm:max-h-[70px] lg:max-h-[76px] object-contain transition-all duration-350 pointer-events-none opacity-88 contrast-[1.02] group-hover:scale-[1.055] group-hover:contrast-105 group-hover:!opacity-100"
      referrerPolicy="no-referrer"
      onError={() => setLogoAvailable(false)}
    />
  );
};

export const TrustedBy: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10% 0px -10% 0px" });

  // ---------------------------------------------------------------------------
  // INTERACTIVE MOUSE SPOTLIGHT (PERFORMANT CSS VARIABLES, ZERO REACT RE-RENDERS)
  // ---------------------------------------------------------------------------
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 50, damping: 28 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Background subtle parallax shifts (1–2px grid, 2–3px topographic lines)
  const gridShiftX = useTransform(smoothMouseX, [-0.5, 0.5], [-1.5, 1.5]);
  const gridShiftY = useTransform(smoothMouseY, [-0.5, 0.5], [-1.5, 1.5]);

  const topoShiftX = useTransform(smoothMouseX, [-0.5, 0.5], [-2.5, 2.5]);
  const topoShiftY = useTransform(smoothMouseY, [-0.5, 0.5], [-2.5, 2.5]);

  const cardsShiftX = useTransform(smoothMouseX, [-0.5, 0.5], [-0.8, 0.8]);
  const cardsShiftY = useTransform(smoothMouseY, [-0.5, 0.5], [-0.8, 0.8]);

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // High-performance direct CSS variable updates
    sectionRef.current?.style.setProperty("--mouse-x", `${x}px`);
    sectionRef.current?.style.setProperty("--mouse-y", `${y}px`);
    sectionRef.current?.style.setProperty("--spotlight-opacity", isDesktop ? "1" : "0.45");

    if (isDesktop) {
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    }
  };

  const handleMouseLeave = () => {
    sectionRef.current?.style.setProperty("--spotlight-opacity", "0");
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      ref={sectionRef}
      id="trusted-by"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative pt-12 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-22 bg-[#F4F4F2] border-b border-[#E5E5E3] overflow-x-clip font-sans select-none"
    >
      {/* -------------------------------------------------------------------- */}
      {/* CSS KEYFRAMES: 3-ROW CONVEYOR STREAMS & HOVER BEHAVIORS              */}
      {/* -------------------------------------------------------------------- */}
      <style>{`
        /* Organic Breathing Logo Float (1.5px) */
        @keyframes logo-breathing {
          0% { transform: translateY(-1px); opacity: 0.88; }
          100% { transform: translateY(1.5px); opacity: 0.95; }
        }

        /* 3-Row Continuous Marquee Streams */
        @keyframes network-flow-right {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @keyframes network-flow-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }

        /* Row 1: LEFT -> RIGHT (45–55s, linear) */
        .animate-flow-right-1 {
          animation: network-flow-right 50s linear infinite;
        }
        /* Row 2: RIGHT -> LEFT (50–60s, linear) */
        .animate-flow-left-2 {
          animation: network-flow-left 55s linear infinite;
        }
        /* Row 3: LEFT -> RIGHT (55–65s, linear) */
        .animate-flow-right-3 {
          animation: network-flow-right 60s linear infinite;
        }

        /* Hover pauses ONLY that specific row */
        .group\\/row:hover .animate-flow-right-1,
        .group\\/row:hover .animate-flow-left-2,
        .group\\/row:hover .animate-flow-right-3 {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-flow-right-1,
          .animate-flow-left-2,
          .animate-flow-right-3 {
            animation: none !important;
          }
        }
      `}</style>

      {/* -------------------------------------------------------------------- */}
      {/* INTERACTIVE MOUSE SPOTLIGHT (250–350px soft ambient studio spotlight)*/}
      {/* -------------------------------------------------------------------- */}
      <div
        className="pointer-events-none absolute inset-0 z-25 transition-opacity duration-500 ease-out"
        style={{
          opacity: "var(--spotlight-opacity, 0)",
          background: `radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(184, 134, 11, 0.055), transparent 75%)`,
        }}
      />

      {/* -------------------------------------------------------------------- */}
      {/* 01. SECTION BACKGROUND (MINIMAL GRID + VERY FAINT TECHNICAL PATHS)   */}
      {/* -------------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Soft ambient lighting with low white wash so cards remain crisp */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_65%_at_50%_35%,rgba(255,255,255,0.4),rgba(244,244,242,1)_88%)]" />

        {/* Faint coordinate grid lines (1–2px parallax) */}
        <motion.div
          style={{
            x: isDesktop && !reduceMotion ? gridShiftX : 0,
            y: isDesktop && !reduceMotion ? gridShiftY : 0,
            opacity: isInView ? 0.45 : 0.15,
          }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,31,58,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,31,58,0.02)_1px,transparent_1px)] bg-[size:5rem_5rem]"
        />

        {/* Faint gold technical paths (2–3px parallax) */}
        <motion.svg
          style={{
            x: isDesktop && !reduceMotion ? topoShiftX : 0,
            y: isDesktop && !reduceMotion ? topoShiftY : 0,
            opacity: isInView ? 0.25 : 0.08,
          }}
          transition={{ duration: 0.8 }}
          viewBox="0 0 1440 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -top-6 left-0 w-full h-[120%] mix-blend-multiply"
        >
          <path
            d="M-60,160 C260,100 540,240 880,150 C1200,80 1380,220 1660,140"
            stroke="rgba(184, 134, 11, 0.15)"
            strokeWidth="1.2"
            strokeDasharray="4 8"
          />
          <path
            d="M-80,420 C240,360 560,500 920,410 C1220,330 1420,460 1720,390"
            stroke="rgba(11, 31, 58, 0.06)"
            strokeWidth="0.8"
          />
        </motion.svg>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 02. SECTION HEADER WITH STRICT VISUAL HIERARCHY                      */}
      {/* -------------------------------------------------------------------- */}
      <div className="relative w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 mb-7 sm:mb-9 z-20">
        <div className="flex flex-col items-start gap-2.5 sm:gap-3">

          {/* 
            ==================================================================
            1. SMALL LABEL: MARKET ECOSYSTEM // GLOBAL COVERAGE
               (Indicator expands slightly, text fades in + translates up 8px)
            ==================================================================
          */}
          <div className="flex items-center gap-2">
            <motion.span
              initial={reduceMotion ? {} : { scale: 0, opacity: 0 }}
              animate={isInView ? { scale: [0, 1.2, 1], opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              className="w-1.5 h-1.5 rounded-full bg-[#B8860B]"
            />
            <motion.span
              initial={reduceMotion ? {} : { opacity: 0, y: 8 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
              className="font-mono text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#9E7208]"
            >
              Market Ecosystem // Global Coverage
            </motion.span>
          </div>

          {/* 
            ==================================================================
            2. MAIN HEADING: FEATURED COMPANIES ↙
               (Heading: translateY(40px) -> 0 in 800ms smooth ease-out)
               (Arrow: translate(-15px, -15px) -> 0 at 250ms delay)
            ==================================================================
          */}
          <div className="flex items-end justify-start gap-3 sm:gap-4 overflow-hidden py-0.5">
            <motion.h2
              initial={reduceMotion ? {} : { y: 40, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
              className="font-geist text-[clamp(1.85rem,3.8vw,3.25rem)] font-black uppercase leading-[0.94] tracking-[-0.03em] text-[#0B1F3A]"
            >
              <span className="inline-block">Featured</span>
              <span className="inline-block ml-2.5 sm:ml-3 text-[#0B1F3A]">Companies</span>
            </motion.h2>

            {/* Down-left Arrow: translate(-15px, -15px) -> (0,0) */}
            <motion.svg
              initial={reduceMotion ? {} : { opacity: 0, x: -15, y: -15 }}
              animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 48 48"
              fill="none"
              stroke="#0B1F3A"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-1 h-[clamp(1.3rem,2.4vw,2.1rem)] w-auto shrink-0 text-[#0B1F3A]"
            >
              <path d="M40 8 10 38" />
              <path d="M10 14.5V38h23.5" />
            </motion.svg>
          </div>

        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 03. 3-ROW COMPANY NETWORK WAVES (Staggered horizontal reveals)       */}
      {/* -------------------------------------------------------------------- */}
      <motion.div
        style={{
          x: isDesktop && !reduceMotion ? cardsShiftX : 0,
          y: isDesktop && !reduceMotion ? cardsShiftY : 0,
        }}
        className="relative w-full overflow-hidden flex flex-col gap-3 sm:gap-4 z-20"
      >
        {/* Subtle Horizontal Survey Grid Lines Between Rows */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line
              x1="0"
              y1="32%"
              x2="100%"
              y2="32%"
              stroke="rgba(184, 134, 11, 0.12)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
            <line
              x1="0"
              y1="67%"
              x2="100%"
              y2="67%"
              stroke="rgba(184, 134, 11, 0.12)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
          </svg>
        </div>

        {/* Subtle Edge Fades (Narrow so edge logos remain readable) */}
        <div className="absolute top-0 bottom-0 left-0 w-6 sm:w-10 lg:w-14 bg-gradient-to-r from-[#F4F4F2] to-transparent pointer-events-none z-30" />
        <div className="absolute top-0 bottom-0 right-0 w-6 sm:w-10 lg:w-14 bg-gradient-to-l from-[#F4F4F2] to-transparent pointer-events-none z-30" />

        {/* ROW 1: Moves LEFT -> RIGHT (~50s, Wave 1: delay 0.50s) */}
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.50, ease: "easeOut" }}
          className="group/row relative w-full overflow-hidden flex z-20"
        >
          <div className="flex shrink-0 items-center gap-3 sm:gap-4 animate-flow-right-1">
            {[...ROW_1, ...ROW_1].map((company, index) => (
              <CompanyCard
                key={`row1-${company.name}-${index}`}
                company={company}
                nodeIndex={(index % 9) + 1}
              />
            ))}
          </div>
        </motion.div>

        {/* ROW 2: Moves RIGHT -> LEFT (~55s, Wave 2: delay 0.65s) */}
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.65, ease: "easeOut" }}
          className="group/row relative w-full overflow-hidden flex z-20"
        >
          <div className="flex shrink-0 items-center gap-3 sm:gap-4 animate-flow-left-2">
            {[...ROW_2, ...ROW_2].map((company, index) => (
              <CompanyCard
                key={`row2-${company.name}-${index}`}
                company={company}
                nodeIndex={(index % 9) + 10}
              />
            ))}
          </div>
        </motion.div>

        {/* ROW 3: Moves LEFT -> RIGHT (~60s, Wave 3: delay 0.80s) */}
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.80, ease: "easeOut" }}
          className="group/row relative w-full overflow-hidden flex z-20"
        >
          <div className="flex shrink-0 items-center gap-3 sm:gap-4 animate-flow-right-3">
            {[...ROW_3, ...ROW_3].map((company, index) => (
              <CompanyCard
                key={`row3-${company.name}-${index}`}
                company={company}
                nodeIndex={(index % 9) + 19}
              />
            ))}
          </div>
        </motion.div>

      </motion.div>

      {/* -------------------------------------------------------------------- */}
      {/* 04. BOTTOM INFORMATION BAR (Left indicator pulses once on appear)    */}
      {/* -------------------------------------------------------------------- */}
      <div className="relative w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 mt-7 sm:mt-9 z-20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-[#E5E5E3] font-mono text-[10px] uppercase tracking-wider text-[#6A6E77]">
          <div className="flex items-center gap-2">
            {/* Left gold indicator: pulses ONCE on entry without continuous blinking */}
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] } : {}}
              transition={{ duration: 1.2, delay: 0.9, ease: "easeOut" }}
              className="w-1.5 h-1.5 rounded-full bg-[#B8860B]"
            />
            <span>GLOBAL NETWORK COVERAGE // 27 TIER-1 & JUNIOR PRODUCERS</span>
          </div>
          <span className="text-[#9E7208]">CONTINUOUS SURVEILLANCE & MARKET INTELLIGENCE</span>
        </div>
      </div>
    </section>
  );
};

/**
 * Company Card:
 * - Clean white background with subtle neutral border
 * - Top Gold Line: 1.5px gold edge (default ~0.40 opacity, 1.0 on hover)
 * - Corner markers that brighten on hover
 * - Hover: translateY(-4px), scale(1.015), logo scale(1.06), soft radial glow behind logo
 * - Sibling dimming: same row only drops 10–15% (opacity: 0.85)
 */
const CompanyCard: React.FC<{
  company: Company;
  nodeIndex: number;
}> = ({ company, nodeIndex }) => {
  return (
    <div
      className="group relative flex h-[84px] w-[188px] sm:h-[94px] sm:w-[220px] lg:h-[102px] lg:w-[245px] shrink-0 items-center justify-center rounded-xl border border-[#E8E8E6] bg-white px-4 sm:px-5 transition-all duration-350 ease-out cursor-pointer shadow-2xs group-hover/row:opacity-85 hover:!opacity-100 hover:!-translate-y-[3px] hover:!scale-[1.015] hover:z-30 hover:border-[#B8860B]/50 hover:shadow-[0_8px_22px_rgba(184,134,11,0.12)]"
      style={{
        backgroundImage: "radial-gradient(circle at center, rgba(184, 134, 11, 0.025), transparent 75%)",
      }}
    >

      {/* Subtle Gold Corner Markers (Brighten on hover) */}
      <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-[#B8860B]/20 group-hover:border-[#B8860B] transition-colors duration-300 pointer-events-none" />
      <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#B8860B]/20 group-hover:border-[#B8860B] transition-colors duration-300 pointer-events-none" />
      <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-[#B8860B]/20 group-hover:border-[#B8860B] transition-colors duration-300 pointer-events-none" />
      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-[#B8860B]/20 group-hover:border-[#B8860B] transition-colors duration-300 pointer-events-none" />

      {/* Centered Company Logo */}
      <CompanyLogo company={company} nodeIndex={nodeIndex} />
    </div>
  );
};

export default TrustedBy;
