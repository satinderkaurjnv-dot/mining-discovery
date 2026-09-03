"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

export interface StatItem {
  numericValue: number;
  valueDisplay: string;
  label: string;
  description: string;
  image: string;
  imageAlt: string;
}

const STATS_DATA: StatItem[] = [
  {
    numericValue: 150000,
    valueDisplay: "150,000+",
    label: "Active Monthly Audience",
    description:
      "Institutional investors, mining executives, and industry analysts reading market updates.",
    image: "/stats/audience-analysts.jpg",
    imageAlt: "Analysts and investors monitoring live mining market data screens",
  },
  {
    numericValue: 40000,
    valueDisplay: "40,000+",
    label: "Newsletter Subscribers",
    description:
      "Weekly executive briefing delivered directly to decision-maker inboxes worldwide.",
    image: "/stats/newsletter-briefing.jpg",
    imageAlt: "Mining executive reviewing a printed industry briefing report",
  },
  {
    numericValue: 450,
    valueDisplay: "450+",
    label: "Mining Companies Featured",
    description:
      "From junior exploration companies to Tier-1 global mining producers.",
    image: "/stats/open-pit-mine.jpg",
    imageAlt: "Aerial wide shot of a large open-pit mining operation",
  },
  {
    numericValue: 8,
    valueDisplay: "8+",
    label: "Years Industry Coverage",
    description:
      "Established track record of independent editorial authority and market intelligence.",
    image: "/stats/drill-core-geologist.jpg",
    imageAlt: "Geologist examining drill core samples on a core-logging bench",
  },
  {
    numericValue: 30,
    valueDisplay: "30+",
    label: "Mining Jurisdictions",
    description:
      "Extensive reach across key financial capitals and global mining jurisdictions.",
    image: "/stats/mining-jurisdictions-map.jpg",
    imageAlt: "World map marked with active mining sites across global jurisdictions",
  },
];

/**
 * Lightweight, smooth counting hook using easeOutCubic.
 * Triggers only when section is in viewport.
 */
function useSmoothCounter(
  target: number,
  isInView: boolean,
  duration: number = 1200,
  delay: number = 0
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let startTimestamp: number | null = null;
    let frameId: number;

    const timeout = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(ease * target));

        if (progress < 1) {
          frameId = requestAnimationFrame(step);
        } else {
          setCount(target);
        }
      };
      frameId = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frameId);
    };
  }, [isInView, target, duration, delay]);

  return count;
}

export const Stats: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10% 0px -10% 0px" });

  // Right-column stat card refs for scroll-driven image synchronization
  const statRefs = useRef<(HTMLDivElement | null)[]>([]);
  const setStatRef = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      statRefs.current[index] = node;
    },
    []
  );

  // Synchronize active photo with whichever stat card crosses viewport center
  useEffect(() => {
    const nodes = statRefs.current.filter((node): node is HTMLDivElement => node !== null);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = statRefs.current.indexOf(entry.target as HTMLDivElement);
          if (index !== -1) setActiveIndex(index);
        }
      },
      { root: null, rootMargin: "-30% 0px -30% 0px", threshold: 0 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  // Subtle scroll-driven animations inside the sticky left column & background
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const bgStrataY = useTransform(scrollYProgress, [0, 1], [-4, 4]); // 3–5px background
  const quoteScrollY = useTransform(scrollYProgress, [0, 1], [0, 5]); // ~5px quote movement
  const imageScrollY = useTransform(scrollYProgress, [0, 1], [0, 8]); // ~5–10px image movement
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.0, 1.02]); // 1.00 to 1.02 max
  const goldLineWidth = useTransform(scrollYProgress, [0, 1], ["44px", "68px"]); // Subtle line progression

  // Subtle scroll parallax on right side metrics
  const primaryScrollY = useTransform(scrollYProgress, [0, 1], [3, -3]); // 2–3px range
  const secondaryScrollY = useTransform(scrollYProgress, [0, 1], [1.5, -1.5]); // 1–2px range

  const primaryStat = STATS_DATA[0];
  const secondaryStats = STATS_DATA.slice(1);

  return (
    <section
      ref={sectionRef}
      id="stats-section"
      className="relative bg-[#FAF9F6] text-[#0B1F3A] border-b border-[#E5E4DE] font-sans py-16 sm:py-20 lg:py-24 overflow-x-clip"
    >
      {/* -------------------------------------------------------------------- */}
      {/* 01. TECHNICAL GEOLOGICAL BACKGROUND (EXTREMELY SLOW HORIZONTAL DRIFT) */}
      {/* -------------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Subtle radial wash */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_15%,rgba(242,238,228,0.7),rgba(250,249,246,1)_82%)]" />

        {/* Faint technical grid lattice */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,31,58,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,31,58,0.02)_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-60" />

        {/* Slow-moving geological contour lines */}
        <motion.svg
          style={{ y: bgStrataY }}
          animate={{ x: [-10, 10, -10] }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
          viewBox="0 0 1440 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -top-10 left-0 w-[105%] h-[120%] opacity-35 mix-blend-multiply"
        >
          <path
            d="M-80,180 C240,110 520,260 860,170 C1180,90 1340,230 1620,160"
            stroke="rgba(184, 134, 11, 0.16)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
          <path
            d="M-60,380 C280,320 560,450 920,360 C1220,290 1400,410 1640,340"
            stroke="rgba(11, 31, 58, 0.07)"
            strokeWidth="0.8"
          />
          <path
            d="M-100,580 C220,510 500,640 840,560 C1160,490 1360,610 1660,540"
            stroke="rgba(184, 134, 11, 0.13)"
            strokeWidth="1"
          />

          {/* Technical elevation markers and coordinate notations */}
          <g className="font-mono text-[8px] fill-[#B8860B]/35 uppercase tracking-[0.22em]">
            <text x="120" y="195">+ 820M ELEVATION // DATA STREAM 01</text>
            <text x="1320" y="375" textAnchor="end">INTELLIGENCE METRICS GRID // REGION GLOBAL</text>
            <text x="120" y="595">SURFACE SAMPLING LAT 41.5°N</text>
          </g>

          {/* Subtle gold survey coordinate nodes */}
          <circle cx="860" cy="170" r="2.2" fill="#B8860B" opacity="0.35" />
          <circle cx="920" cy="360" r="2" fill="#0B1F3A" opacity="0.2" />
          <circle cx="840" cy="560" r="2.2" fill="#B8860B" opacity="0.3" />
        </motion.svg>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 02. MAIN EDITORIAL & DATA CONTAINER (STICKY 2-COLUMN LAYOUT)         */}
      {/* -------------------------------------------------------------------- */}
      <div className="relative w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-18 items-stretch">

          {/* ================================================================ */}
          {/* LEFT COLUMN: STICKY EDITORIAL STORYTELLING TRACK                 */}
          {/* ================================================================ */}
          <div className="lg:col-span-5 relative w-full">
            {/* Sticky Container: Pinned at top-24 beneath navbar during scroll */}
            <div className="lg:sticky lg:top-24 flex flex-col items-start gap-5 sm:gap-6 lg:pr-4">

              {/* Data Activation: Gold accent line with subtle scroll progression */}
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: 44 } : {}}
                style={{ width: goldLineWidth }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="h-0.5 bg-[#B8860B]"
              />

              {/* Data Activation: Technical indicator activates */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] animate-pulse" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#B8860B]">
                  Market Influence & Reach
                </span>
              </motion.div>

              {/* Editorial Quote Headline with subtle ~5px scroll interaction */}
              <motion.h2
                initial={{ opacity: 0, y: 22 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                style={{ y: quoteScrollY }}
                transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-normal text-[#0B1F3A] leading-[1.14] tracking-[-0.015em]"
              >
                &ldquo;One platform. Every major mining audience.&rdquo;
              </motion.h2>

              {/* Editorial Feature Image with subtle 5-10px scroll lift & 1.00-1.02 scale */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                style={{ y: imageScrollY }}
                transition={{ duration: 0.8, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-full mt-1 rounded-xl overflow-hidden border border-[#E5E4DE] shadow-sm relative group aspect-[16/10] max-h-[250px] sm:max-h-[270px] bg-white"
              >
                {/* Frame Corner Ticks */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#B8860B]/40 z-20 pointer-events-none" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#B8860B]/40 z-20 pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#B8860B]/40 z-20 pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#B8860B]/40 z-20 pointer-events-none" />

                {STATS_DATA.map((stat, index) => (
                  <motion.div
                    key={stat.image}
                    style={{ scale: imageScale }}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-out ${
                      index === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                  >
                    <Image
                      src={stat.image}
                      alt={stat.imageAlt}
                      width={600}
                      height={375}
                      priority={index === 0}
                      aria-hidden={index !== activeIndex}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/25 via-transparent to-transparent opacity-40 pointer-events-none z-10" />

                {/* Sub-label displaying active metric status */}
                <div className="absolute bottom-2.5 left-3 right-3 z-20 flex items-center justify-between font-mono text-[9px] text-white/90 bg-[#0B1F3A]/75 backdrop-blur-xs px-2.5 py-1 rounded-sm">
                  <span className="uppercase tracking-wider truncate">
                    {STATS_DATA[activeIndex].label}
                  </span>
                  <span className="text-[#F5C542] ml-2">
                    {STATS_DATA[activeIndex].valueDisplay}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* RIGHT COLUMN: SCROLLING GLOBAL MINING DATA ARCHITECTURE          */}
          {/* ================================================================ */}
          <div className="lg:col-span-7 flex flex-col gap-10 lg:gap-12 lg:pl-8 border-t lg:border-t-0 lg:border-l border-[#E5E4DE] pt-10 lg:pt-0">

            {/* INTRO SENTENCE BLOCK */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="pb-7 border-b border-[#E5E4DE]"
            >
              <p className="text-lg sm:text-xl lg:text-[22px] text-[#3A3D42] leading-[1.65] font-normal font-sans tracking-[-0.01em]">
                Mining Discovery bridges the gap between mining companies and the global investment community through targeted editorial coverage and market intelligence. Connecting global mining companies directly with institutional investors, analysts, and executive decision-makers.
              </p>
            </motion.div>

            {/* -------------------------------------------------------------- */}
            {/* PRIMARY DOMINANT STATISTIC (150,000+)                          */}
            {/* -------------------------------------------------------------- */}
            <motion.div
              ref={setStatRef(0)}
              style={{ y: primaryScrollY }}
              onMouseEnter={() => setActiveIndex(0)}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.25 }}
              className="group relative p-6 sm:p-8 bg-white/85 backdrop-blur-xs border border-[#E5E4DE] rounded-xl shadow-xs transition-all duration-300 hover:shadow-md hover:border-[#B8860B]/40"
            >
              {/* Top Technical Metadata Bar */}
              <div className="flex items-center justify-between pb-3 mb-2 font-mono text-[10px] uppercase tracking-wider text-[#6A6E77] border-b border-[#E5E4DE]/60">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#B8860B] animate-ping" />
                  <span className="font-bold text-[#9E7208]">PRIMARY METRIC // 01</span>
                </div>
                <span className="text-[#B8860B]">VERIFIED AUDIENCE</span>
              </div>

              {/* Large Dominant Editorial Number with Smooth Counting */}
              <PrimaryCounter
                target={primaryStat.numericValue}
                isInView={isInView}
              />

              {/* Animated Gold Line: Starts 0% -> Finishes 100% (500-700ms) */}
              <div className="relative w-full h-[1.5px] bg-[#E5E4DE] my-4 overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={isInView ? { width: "100%" } : {}}
                  transition={{
                    duration: 0.65,
                    delay: 1.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute inset-y-0 left-0 bg-[#B8860B] group-hover:bg-[#9E7208] transition-colors"
                />
              </div>

              {/* Label & Description Reveal After Number Reaches Final Value */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.55,
                  delay: 1.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-6 mt-1"
              >
                <div className="font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-[#B8860B]">
                  {primaryStat.label}
                </div>
                <p className="text-sm text-[#57595E] leading-relaxed font-normal max-w-md">
                  {primaryStat.description}
                </p>
              </motion.div>
            </motion.div>

            {/* -------------------------------------------------------------- */}
            {/* SECONDARY STATISTICS: SEQUENTIAL STAGGERED REVEAL (~150MS)     */}
            {/* -------------------------------------------------------------- */}
            <motion.div
              style={{ y: secondaryScrollY }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
            >
              {secondaryStats.map((stat, idx) => {
                const globalIndex = idx + 1;
                const cardDelay = 0.35 + idx * 0.15;

                return (
                  <SecondaryStatCard
                    key={stat.label}
                    refCallback={setStatRef(globalIndex)}
                    stat={stat}
                    indexNumber={globalIndex}
                    isInView={isInView}
                    delay={cardDelay}
                    isActive={activeIndex === globalIndex}
                    onHover={() => setActiveIndex(globalIndex)}
                  />
                );
              })}
            </motion.div>

            {/* -------------------------------------------------------------- */}
            {/* EDITORIAL CALLOUT BLOCK (Exact Text & Structure)               */}
            {/* -------------------------------------------------------------- */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6 pt-2"
            >
              {/* Paragraph 1 */}
              <p className="font-sans text-xl sm:text-2xl font-medium text-[#1A1D21] leading-snug sm:leading-snug max-w-xl">
                With direct access to institutional investors and industry analysts, your company&apos;s news reaches the decision-makers who matter most in global mining.
              </p>

              {/* Paragraph 2 with Bullet Icon Circle */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full border border-[#D5D4CE] bg-white flex items-center justify-center text-[#1A1D21] text-xs font-bold shadow-xs mt-1">
                  •
                </div>
                <p className="font-sans text-xl sm:text-2xl font-medium text-[#1A1D21] leading-snug sm:leading-snug max-w-xl">
                  That means no fragmented messaging between channels. No news lost in handoffs. Just one dedicated team, accountable for reaching decision-makers worldwide.
                </p>
              </div>

              {/* Pill Outline Button */}
              <div className="pt-2">
                <Link
                  href="#about"
                  className="inline-flex items-center justify-center rounded-full border border-[#1A1D21]/30 hover:border-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white px-7 py-3 text-[11px] font-mono font-semibold tracking-wider uppercase text-[#1A1D21] transition-all duration-300 shadow-xs"
                >
                  LEARN MORE ABOUT US
                </Link>
              </div>

              {/* Bottom Tagline with Horizontal Divider Line */}
              <div className="pt-10">
                <p className="text-sm font-medium text-[#1A1D21] tracking-wide mb-3">
                  From raw discoveries, market clarity emerges
                </p>
                <div className="w-full h-px bg-[#E5E4DE]" />
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
};

/**
 * Animated Primary Counter Component (0 -> 150,000+)
 */
const PrimaryCounter: React.FC<{ target: number; isInView: boolean }> = ({
  target,
  isInView,
}) => {
  const count = useSmoothCounter(target, isInView, 1200, 200);

  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.2 }}
      className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal text-[#0B1F3A] tracking-tight leading-none group-hover:text-[#B8860B] transition-colors duration-300 will-change-transform"
    >
      {count.toLocaleString()}+
    </motion.div>
  );
};

/**
 * Secondary Data Card with sequential entry (translateY 25px -> 0px, opacity 0 -> 1),
 * smooth counting, gold line draw (0% -> 100%), and upward label reveal.
 */
const SecondaryStatCard: React.FC<{
  stat: StatItem;
  refCallback: (node: HTMLDivElement | null) => void;
  indexNumber: number;
  isInView: boolean;
  delay: number;
  isActive: boolean;
  onHover: () => void;
}> = ({ stat, refCallback, indexNumber, isInView, delay, isActive, onHover }) => {
  const count = useSmoothCounter(stat.numericValue, isInView, 1000, delay * 1000);

  return (
    <motion.div
      ref={refCallback}
      initial={{ opacity: 0, y: 25 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={onHover}
      whileHover={{ y: -3 }}
      className={`group relative p-5 sm:p-6 bg-white/85 backdrop-blur-xs border border-[#E5E4DE] rounded-lg transition-all duration-300 hover:shadow-sm hover:border-[#B8860B]/40 ${
        isActive ? "border-[#B8860B]/50 bg-[#FAF5E8]/30" : ""
      }`}
    >
      {/* Technical Index Marker */}
      <div className="flex items-center justify-between font-mono text-[10px] text-[#8C9099] mb-2 uppercase tracking-wider">
        <span className="text-[#9E7208] font-bold">
          // 0{indexNumber + 1}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B]/40 group-hover:bg-[#B8860B] transition-colors" />
      </div>

      {/* Counting Number */}
      <motion.div
        whileHover={{ scale: 1.015 }}
        transition={{ duration: 0.2 }}
        className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#0B1F3A] tracking-tight leading-none group-hover:text-[#B8860B] transition-colors duration-300 will-change-transform"
      >
        {count.toLocaleString()}+
      </motion.div>

      {/* Thin Metallic-Gold Divider Line (width 0% -> 100%, duration 500-700ms) */}
      <div className="relative w-full h-px bg-[#E5E4DE] my-3 overflow-hidden">
        <motion.div
          initial={{ width: "0%" }}
          animate={isInView ? { width: "100%" } : {}}
          transition={{
            duration: 0.6,
            delay: delay + 0.35,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute inset-y-0 left-0 bg-[#B8860B] group-hover:bg-[#9E7208] transition-colors"
        />
      </div>

      {/* Label and Description revealing upward */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{
          duration: 0.5,
          delay: delay + 0.55,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <div className="text-xs font-mono font-bold uppercase tracking-[0.12em] text-[#B8860B] mt-1">
          {stat.label}
        </div>
        <p className="text-xs sm:text-sm text-[#57595E] leading-relaxed font-normal mt-1">
          {stat.description}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Stats;
