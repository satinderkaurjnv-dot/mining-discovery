"use client";

import React, { useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { MiningTruckScene } from "./MiningTruckScene";
import { TelemetryState, STRATA_DATA } from "./truckTypes";
import { Activity, ArrowRight, Compass, Database, Layers, Radio, Sparkles, Zap } from "lucide-react";

export const MiningTruckStory: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [telemetry, setTelemetry] = useState<TelemetryState>({
    progress: 0,
    speedKmh: 0,
    gear: "N",
    payloadTons: 320,
    heading: "NORTH-WEST 314°",
    coordinates: {
      lat: "52° 21' 44\" N",
      lng: "121° 54' 18\" W",
      elevation: "1420m EL",
    },
    scanningActive: false,
    discoveryActive: false,
    scanDepthMeters: 0,
  });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 34,
    restDelta: 0.001,
  });

  const [scrollVal, setScrollVal] = useState(0);

  smoothProgress.on("change", (latest) => {
    setScrollVal(latest);
  });

  const handleTelemetry = useCallback((state: TelemetryState) => {
    setTelemetry(state);
  }, []);

  // Keep scene and loader fully visible throughout the vertical road animation
  const sceneOpacity = useTransform(smoothProgress, [0.99, 1.0], [1, 1]);

  // Stage narrative badges & copy — Phase 01 is firmly locked on the establishing view
  const sp = scrollVal;

  // Sequential centered watermark words during horizontal road phase (sp in [0.58, 0.78))
  const watermarkText =
    sp < 0.635
      ? "ABOUT"
      : sp < 0.690
      ? "MINING"
      : sp < 0.745
      ? "DISCOVERY"
      : "ABOUT MINING DISCOVERY";
  const stage =
    sp < 0.14
      ? {
          badge: "PHASE 01 // MOUNTAIN & PORTAL ESTABLISHING",
          title: "Wide Open-Pit Portal Establishing View",
          desc: "Cinematic wide-angle view of the reinforced underground mine portal as natural daylight illuminates the steep mountain bench.",
        }
      : sp < 0.24
      ? {
          badge: "PHASE 02 // TRUCK APPROACHING PORTAL",
          title: "Heavy CAT 797F Portal Entrance Approach",
          desc: "Camera tracks alongside the Caterpillar 797F heavy mining haul truck as dust clouds roll off its 4-meter tires.",
        }
      : sp < 0.30
      ? {
          badge: "PHASE 03 // SUBTERRANEAN DRIFT TRAMMING",
          title: "Deep Cave Transit & Headlight Illumination",
          desc: "Illuminated by high-intensity headlights, the truck trams through the blasted hard-rock drift vault supported by steel arches and ventilation ducts.",
        }
      : sp < 0.42
      ? {
          badge: "PHASE 04 // UNDERGROUND CAVE JOURNEY",
          title: "Deep Rock Drift & Mineralized Reef",
          desc: "Navigating deep underground caverns where exposed native gold-quartz stringers streak across the structural granite face.",
        }
      : sp < 0.55
      ? {
          badge: "PHASE 05 // ORE LOADING & REEF EXTRACTION",
          title: "Deep Reef Ore Loading Sequence",
          desc: "Underground loader scoops raw gold-bearing quartz boulders from the reef face, dumping high-grade mineralized ore into the haul truck bed.",
        }
      : sp < 0.70
      ? {
          badge: "PHASE 06 // CAVERN TRANSIT & DAYLIGHT EMERGENCE",
          title: "Subterranean Tunnel to Daylight Emergence",
          desc: "The haul machine journeys through the illuminated vault and transitions smoothly into the open daylight portal.",
        }
      : sp < 0.85
      ? {
          badge: "PHASE 07 // WHEEL LOADER OPEN HAUL ROAD",
          title: "Heavy Wheel Loader Long-Distance Tramming",
          desc: "The heavy industrial wheel loader carries full payloads of raw gold ore, tramming continuously along the expansive open-pit haul road.",
        }
      : {
          badge: "PHASE 08 // EXPANSIVE HIGH-SPEED ORE HAULAGE",
          title: "Continuous Long-Haul Mining Road Journey",
          desc: "Extended long-distance transit across the open haul road with glowing gold ore particles streaming from the front extraction scoop.",
        };

  return (
    <section
      ref={containerRef}
      className="relative h-[800vh] w-full bg-[#FAF9F6]"
      aria-label="Interactive 3D Mining Truck and Subsurface Discovery Animation"
    >
      {/* Pinned 100vh Sticky Canvas Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#FAF9F6]">
        {/* Soft atmospheric radial gradient blending truck into the website */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_35%,rgba(245,243,238,0.6),rgba(250,249,246,1)_85%)] z-0" />

        {/* Architectural Watermark in white space above CAT 797F haul truck (sp < 0.20) */}
        <AnimatePresence mode="wait">
          {sp < 0.20 && (
            <motion.div
              key="truck-watermark"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="pointer-events-none absolute left-0 right-[34%] sm:right-[38%] top-[19%] sm:top-[20%] -translate-y-1/2 z-[1] flex items-center justify-center select-none overflow-hidden px-4"
            >
              <span className="font-serif text-[clamp(1.35rem,3.1vw,3.3rem)] font-bold uppercase tracking-[0.18em] text-[#0B1F3A]/[0.16] whitespace-nowrap text-center">
                MINING DISCOVERY
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Architectural Watermark behind loader (visible during horizontal road phase, revealing word by word in center) */}
        <AnimatePresence mode="wait">
          {sp >= 0.58 && sp < 0.78 && (
            <motion.div
              key="loader-watermark-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="pointer-events-none absolute inset-x-0 top-[40%] sm:top-[42%] -translate-y-1/2 z-[1] flex items-center justify-center select-none overflow-hidden px-4"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={watermarkText}
                  initial={{ opacity: 0, x: 50, scale: 0.94 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.94 }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                  className={`font-serif font-bold uppercase text-[#0B1F3A]/[0.18] text-center whitespace-nowrap ${
                    watermarkText === "ABOUT MINING DISCOVERY"
                      ? "text-[clamp(2.4rem,6.8vw,7.2rem)] tracking-[0.08em]"
                      : "text-[clamp(3.8rem,11.5vw,11rem)] tracking-[0.14em]"
                  }`}
                >
                  {watermarkText}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Seamless top blend fade transitioning from Stats section */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#FAF9F6] to-transparent z-10" />

        {/* Seamless bottom blend fade transitioning to About section */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#FAF9F6] to-transparent z-10" />

        {/* 3D WebGL Canvas Layer */}
        <motion.div style={{ opacity: sceneOpacity }} className="absolute inset-0 h-full w-full z-[2]">
          <MiningTruckScene
            scrollProgress={scrollVal}
            onTelemetry={handleTelemetry}
            className="h-full w-full"
          />
        </motion.div>

        {/* --- Initial Establishing & Approach Phase (sp < 0.20): White space editorial narrative --- */}
        <AnimatePresence mode="wait">
          {sp < 0.20 && (
            <motion.div
              key="approach-intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="pointer-events-none absolute bottom-6 sm:bottom-8 lg:bottom-12 inset-x-0 z-20 flex justify-center px-6 sm:px-10 lg:px-14"
            >
              <div className="w-full max-w-4xl flex flex-col items-center text-center pointer-events-auto">
                {/* Eyebrow with gold hairline */}
                <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
                  <div className="w-8 h-0.5 bg-[#B8860B]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] animate-pulse" />
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E7208]">
                    THE EXPEDITION // SURFACE TO SUBTERRANEAN
                  </span>
                  <div className="w-8 h-0.5 bg-[#B8860B]" />
                </div>

                {/* Editorial Headline */}
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-normal leading-[1.16] tracking-[-0.015em] text-[#0B1F3A]">
                  From deep extraction to global market intelligence.
                </h3>

                {/* Subtitle */}
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm lg:text-[15px] font-normal leading-relaxed text-[#57595E] max-w-2xl mx-auto">
                  Every tier of the mining story in motion — tracing the journey from heavy surface haulage into the subterranean vaults of verified discovery.
                </p>

                {/* 3 Metric Pills / Features */}
                <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-4 sm:gap-8 border-t border-[#E5E4DE]/60 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#9E7208]">01</span>
                    <span className="font-sans text-xs sm:text-sm font-semibold text-[#0B1F3A]">
                      Heavy Surface Haulage
                    </span>
                  </div>
                  <span className="text-[#E5E4DE] hidden sm:inline">•</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#9E7208]">02</span>
                    <span className="font-sans text-xs sm:text-sm font-semibold text-[#0B1F3A]">
                      Subsurface Drift Transit
                    </span>
                  </div>
                  <span className="text-[#E5E4DE] hidden sm:inline">•</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#9E7208]">03</span>
                    <span className="font-sans text-xs sm:text-sm font-semibold text-[#0B1F3A]">
                      Institutional Market Reach
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Horizontal Road Phase (sp in [0.58, 0.78)): Four ways the story reaches you --- */}
        <AnimatePresence mode="wait">
          {sp >= 0.58 && sp < 0.78 && (
            <motion.div
              key="horizontal-four-ways"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="pointer-events-none absolute bottom-6 sm:bottom-8 lg:bottom-12 inset-x-0 z-20 flex justify-center px-6 sm:px-10 lg:px-14"
            >
              <div className="w-full max-w-4xl flex flex-col items-center text-center pointer-events-auto">
                {/* Editorial Heading & Subtitle */}
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-normal leading-[1.16] tracking-[-0.015em] text-[#0B1F3A] text-center">
                  Four ways the story reaches you.
                </h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm lg:text-[15px] font-normal leading-relaxed text-[#57595E] max-w-2xl text-center mx-auto">
                  One newsroom, four cadences — from the day&apos;s filings to the long read that finally has room to breathe.
                </p>

                {/* 2x2 Grid of Channels with Left Gold Border Accent */}
                <div className="mt-4 sm:mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-10 lg:gap-x-16 max-w-2xl w-full text-left">
                  {/* Column 1: 01 Daily Mining News & 03 Monthly Magazine */}
                  <div className="border-l-2 border-[#B8860B]/60 pl-3.5 flex flex-col">
                    <div className="flex items-baseline gap-3 border-b border-[#E5E4DE] py-2">
                      <span className="font-mono text-[11px] font-bold text-[#9E7208]">01</span>
                      <span className="font-sans text-xs sm:text-sm font-semibold tracking-tight text-[#0B1F3A]">
                        Daily Mining News
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3 border-b border-[#E5E4DE] py-2">
                      <span className="font-mono text-[11px] font-bold text-[#9E7208]">03</span>
                      <span className="font-sans text-xs sm:text-sm font-semibold tracking-tight text-[#0B1F3A]">
                        Monthly Magazine
                      </span>
                    </div>
                  </div>

                  {/* Column 2: 02 Weekly Newsletter & 04 Interactive Platform */}
                  <div className="flex flex-col pl-3.5 sm:pl-0">
                    <div className="flex items-baseline gap-3 border-b border-[#E5E4DE] py-2">
                      <span className="font-mono text-[11px] font-bold text-[#9E7208]">02</span>
                      <span className="font-sans text-xs sm:text-sm font-semibold tracking-tight text-[#0B1F3A]">
                        Weekly Newsletter
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3 border-b border-[#E5E4DE] py-2">
                      <span className="font-mono text-[11px] font-bold text-[#9E7208]">04</span>
                      <span className="font-sans text-xs sm:text-sm font-semibold tracking-tight text-[#0B1F3A]">
                        Interactive Platform
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Phase A (sp in [0.84, 0.92)): Who We Are (Left) & Our Expertise (Right) --- */}
        <AnimatePresence mode="wait">
          {sp >= 0.84 && sp < 0.92 && (
            <>
              {/* Left Column: About Mining Discovery & Who We Are */}
              <motion.div
                key="vertical-who-we-are"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="pointer-events-none absolute left-6 top-10 bottom-10 z-20 w-[420px] xl:w-[460px] 2xl:w-[480px] sm:left-10 lg:left-14 flex flex-col justify-center gap-5"
              >
                {/* Eyebrow with gold hairline */}
                <div className="flex flex-col items-start gap-2">
                  <div className="w-10 h-0.5 bg-[#B8860B]" />
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] animate-pulse" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E7208]">
                      STAGE 01 // WHO WE ARE
                    </span>
                  </div>
                </div>

                {/* WHO WE ARE Editorial Block */}
                <div className="w-full flex flex-col pt-1">
                  <h3 className="font-serif text-xl sm:text-2xl lg:text-[26px] font-normal leading-[1.18] tracking-[-0.015em] text-[#0B1F3A]">
                    Clarity in an industry crowded with noise.
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm font-normal leading-relaxed text-[#57595E]">
                    Mining Discovery started from a single conviction — that a sector this consequential deserves reporting that cuts through the noise and the half-truths. Mining was never only rocks and machinery. It is people, communities, economies, and a meaningful share of the planet&apos;s future, and we cover it that way.
                  </p>
                </div>
              </motion.div>

              {/* Right Column: Our Expertise */}
              <motion.div
                key="vertical-our-expertise"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="pointer-events-none absolute right-6 top-10 bottom-10 z-20 w-[420px] xl:w-[460px] 2xl:w-[500px] sm:right-10 lg:right-14 flex flex-col justify-center gap-5"
              >
                {/* Eyebrow / Stage tag */}
                <div className="flex flex-col items-start gap-2">
                  <div className="w-10 h-0.5 bg-[#B8860B]" />
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] animate-pulse" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E7208]">
                      STAGE 02 // OUR EXPERTISE
                    </span>
                  </div>
                </div>

                {/* Headline & Body */}
                <div className="w-full flex flex-col">
                  <h3 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-normal leading-[1.16] tracking-[-0.015em] text-[#0B1F3A]">
                    The beats that actually move markets.
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm font-normal leading-relaxed text-[#57595E]">
                    The industry had no dedicated, trustworthy voice for the stories that carry weight. These are the ones we committed to covering properly.
                  </p>

                  {/* 6 Key Areas (Grid of 2 columns) */}
                  <ul className="mt-5 grid grid-cols-1 border-l-2 border-[#B8860B]/40 sm:grid-cols-2 sm:gap-x-4">
                    {[
                      "Corporate actions",
                      "Sustainability",
                      "Exploration",
                      "Regulation",
                      "Investor relations",
                      "Innovation",
                    ].map((item, itemIndex) => (
                      <li
                        key={item}
                        className="flex items-baseline gap-2.5 border-b border-[#E5E4DE] py-2 pl-3"
                      >
                        <span className="font-mono text-[11px] tabular-nums font-bold text-[#9E7208]">
                          {String(itemIndex + 1).padStart(2, "0")}
                        </span>
                        <span className="font-sans text-xs sm:text-sm font-medium tracking-tight text-[#0B1F3A]">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- Phase B (sp >= 0.92): Our Approach (Heading on Left, Text & CTA on Right) --- */}
        <AnimatePresence mode="wait">
          {sp >= 0.92 && (
            <>
              {/* Left Column: Heading of Our Approach */}
              <motion.div
                key="vertical-approach-left"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="pointer-events-none absolute left-6 top-10 bottom-10 z-20 w-[420px] xl:w-[460px] 2xl:w-[480px] sm:left-10 lg:left-14 flex flex-col justify-center gap-5"
              >
                {/* Eyebrow / Stage tag */}
                <div className="flex flex-col items-start gap-2">
                  <div className="w-10 h-0.5 bg-[#B8860B]" />
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] animate-pulse" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E7208]">
                      STAGE 03 // OUR APPROACH
                    </span>
                  </div>
                </div>

                {/* Large Distinct Heading */}
                <div className="w-full flex flex-col">
                  <h3 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-normal leading-[1.14] tracking-[-0.018em] text-[#0B1F3A]">
                    We don&apos;t just report the ground. We understand what&apos;s beneath it.
                  </h3>
                </div>
              </motion.div>

              {/* Right Column: Narrative Body & CTA Button */}
              <motion.div
                key="vertical-approach-right"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="pointer-events-none absolute right-6 top-10 bottom-10 z-20 w-[420px] xl:w-[460px] 2xl:w-[500px] sm:right-10 lg:right-14 flex flex-col justify-center gap-6"
              >
                <div className="w-full flex flex-col">
                  <p className="text-sm sm:text-base lg:text-[17px] font-normal leading-relaxed text-[#57595E]">
                    Our founder leads on a conviction that the global mining industry deserves better communication than it has had, with particular attention to U.S. markets. Our co-founder brings deep digital expertise across SEO, paid media and content strategy — building visibility that reaches the audiences who actually move markets.
                  </p>

                  {/* Call to Action Button */}
                  <div className="mt-7 pointer-events-auto">
                    <Link
                      href="/about"
                      className="group inline-flex items-center gap-2.5 rounded-lg bg-[#B8860B] px-6 py-3 font-sans text-xs font-semibold uppercase tracking-wider text-[#0B1F3A] shadow-sm transition-all duration-300 hover:bg-[#D4AF37] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]"
                    >
                      <span>Learn More About Us</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
