"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import {
  Compass,
  Palette,
  Share2,
  Target,
  Building2,
  Megaphone,
  Video,
  Globe,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

export interface ServiceCardData {
  id: string;
  title: string;
  category: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

export interface StageData {
  id: string;
  num: string;
  stageCode: string;
  tabLabel: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  deliverables: string[];
  imageSrc: string;
  imageAlt: string;
  cards: ServiceCardData[];
}

export const STAGES: StageData[] = [
  {
    id: "stage-01",
    num: "01",
    stageCode: "STAGE 01 // STAKE THE CLAIM",
    tabLabel: "Exploration & Branding",
    badge: "Stage 01 // Geological Survey & Identity",
    title: "Stake the Claim",
    subtitle: "High-conviction branding and exploration market narrative.",
    description:
      "Before a drill bit touches the earth, mining companies require institutional credibility. We translate geophysical surveys, concession boundaries, and technical potential into a commanding brand that commands market attention.",
    deliverables: [
      "Vector geological brand identity & typography",
      "Institutional pitch decks & technical report templates",
      "Executive corporate positioning for junior explorers",
      "Pre-drilling digital market introduction campaigns",
    ],
    imageSrc: "/services/01-survey.jpg",
    imageAlt: "Geological exploration survey team in open highland terrain",
    cards: [
      {
        id: "digital-branding",
        title: "Digital Branding",
        category: "Exploration & Identity",
        description:
          "Establish a high-conviction market narrative and corporate identity tailored specifically for junior explorers and mid-tier mining companies.",
        href: "/services#branding",
        icon: Compass,
      },
      {
        id: "logo-design",
        title: "Logo & Visual Design",
        category: "Brand Assets",
        description:
          "Vector geological typography, technical report templates, NI 43-101 design systems, and institutional investor pitch decks.",
        href: "/services#logo-design",
        icon: Palette,
      },
    ],
  },
  {
    id: "stage-02",
    num: "02",
    stageCode: "STAGE 02 // DRILL & REACH",
    tabLabel: "Drilling & Market Reach",
    badge: "Stage 02 // Exploration Drilling & Reach",
    title: "Drill & Reach",
    subtitle: "Precision media distribution reaching high-intent capital.",
    description:
      "Active diamond drill programs generate pivotal market catalysts. We deploy targeted multi-channel digital campaigns across global financial hubs to ensure discovery milestones reach accredited mining funds and retail investors.",
    deliverables: [
      "Geotargeted placement in Toronto, Perth, Vancouver, London & New York",
      "Real-time drill result broadcast across YouTube, X & Stockhouse",
      "High-intent Google Ads targeting active commodity and mining funds",
      "Executive LinkedIn thought-leadership campaigns for management",
    ],
    imageSrc: "/services/02-drill.jpg",
    imageAlt: "Active diamond drill rig operating during exploration program",
    cards: [
      {
        id: "social-media",
        title: "Social Media Marketing",
        category: "Discovery Campaign",
        description:
          "Targeted broadcast of drill core discoveries, visual drill logs, and mineral assay highlights across X, YouTube, and mining forums.",
        href: "/services#social-media",
        icon: Share2,
      },
      {
        id: "google-ads",
        title: "Google Ads & Paid Search",
        category: "Investor Reach",
        description:
          "High-intent search campaigns targeting institutional mining funds, retail investors, and sector analysts searching specific commodities.",
        href: "/services#google-ads",
        icon: Target,
      },
      {
        id: "paid-social",
        title: "LinkedIn & Meta Ads",
        category: "Executive Audience",
        description:
          "Geotargeted executive placement in primary capital markets, engaging fund managers, private equity directors, and mining executives.",
        href: "/services#paid-social",
        icon: Building2,
      },
    ],
  },
  {
    id: "stage-03",
    num: "03",
    stageCode: "STAGE 03 // ASSAY & PROVE",
    tabLabel: "Technical PR & Assays",
    badge: "Stage 03 // Assay Verification & PR",
    title: "Deliver Core Data",
    subtitle: "Authoritative technical PR, townhalls, and news wire distribution.",
    description:
      "High-grade intercepts mean nothing if they remain unread. We structure, format, and broadcast NI 43-101 compliant technical filings, CEO video interviews, and institutional webinars that clearly articulate mineral grade and strike length.",
    deliverables: [
      "Global newswire distribution across Bloomberg, PR Newswire & SEDAR",
      "Live CEO townhalls, technical Q&As, and virtual site visits",
      "Interviews and feature placement in leading financial mining publications",
      "Crisis communications and regulatory disclosure management",
    ],
    imageSrc: "/services/03-assay.jpg",
    imageAlt: "Geologist logging core samples in certified assay shed",
    cards: [
      {
        id: "public-relations",
        title: "Public Relations & Wire Distribution",
        category: "Assay & Editorial",
        description:
          "Direct global wire distribution of drill intercepts, resource updates, NI 43-101 technical reports, and quarterly filings.",
        href: "/services#pr",
        icon: Megaphone,
      },
      {
        id: "webinars-events",
        title: "Webinars & Executive Events",
        category: "Executive Q&A",
        description:
          "Live CEO townhalls, virtual site visits, and 1-on-1 institutional investor conference hosting with verified attendance analytics.",
        href: "/services#events",
        icon: Video,
      },
    ],
  },
  {
    id: "stage-04",
    num: "04",
    stageCode: "STAGE 04 // SMELT & SHIP",
    tabLabel: "Enterprise Web & Scale",
    badge: "Stage 04 // Commercial Production & Hub",
    title: "Liquidity & Scale",
    subtitle: "Enterprise corporate portals and continuous investor mobile engagement.",
    description:
      "As a project advances into feasibility and commercial production, institutional transparency is mandatory. We build custom Next.js investor portals and native mobile apps with live commodity pricing, interactive maps, and SEC/SEDAR integration.",
    deliverables: [
      "Custom Next.js corporate portals with sub-second page loads",
      "Interactive 3D drill hole visualizers and GIS concession maps",
      "Native iOS/Android investor relation apps with push notification alerts",
      "Automated SEC / SEDAR regulatory filing sync and interactive stock charts",
    ],
    imageSrc: "/services/04-pit.jpg",
    imageAlt: "Commercial open-pit mining operation with haul trucks",
    cards: [
      {
        id: "website-dev",
        title: "Enterprise Website Development",
        category: "Corporate Web Portal",
        description:
          "Custom Next.js corporate portals with live commodity tickers, interactive property maps, and automated regulatory filing feeds.",
        href: "/services#web-dev",
        icon: Globe,
      },
      {
        id: "app-dev",
        title: "Investor Relations Mobile Apps",
        category: "Mobile Application",
        description:
          "Native iOS/Android investor relation apps for real-time press releases, drill results, stock tracking, and push alerts.",
        href: "/services#app-dev",
        icon: Smartphone,
      },
    ],
  },
];

export const ServicesScrollStory: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeStage, setActiveStage] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = reverse
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll Progress across the 4 stages pinned container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!isDesktop) return;

    let targetIdx = 0;
    if (latest < 0.25) targetIdx = 0;
    else if (latest < 0.50) targetIdx = 1;
    else if (latest < 0.75) targetIdx = 2;
    else targetIdx = 3;

    if (targetIdx !== activeStage) {
      setDirection(targetIdx > activeStage ? 1 : -1);
      setActiveStage(targetIdx);
    }
  });

  const scrollToStage = (index: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const containerTop = rect.top + scrollTop;
    const scrollableDistance = containerRef.current.offsetHeight - window.innerHeight;
    const progressTargets = [0.10, 0.36, 0.62, 0.88];
    const targetScroll = containerTop + progressTargets[index] * scrollableDistance;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  const currentStage = STAGES[activeStage];

  // Alternating directional transitions for rhythm
  // Stage 01 -> 02: Image exits Left, Text enters Left
  // Stage 02 -> 03: Image exits Right, Text enters Right
  // Stage 03 -> 04: Image exits Left, Text enters Left
  const isAltDirection = activeStage % 2 === 1;
  const effectiveDirection = isAltDirection ? -direction : direction;

  return (
    <section
      id="services"
      className="relative w-full border-b border-[#E5E5E3] bg-[#F8F8F6] font-sans text-[#15181C] overflow-x-clip"
    >
      {/* -------------------------------------------------------------------- */}
      {/* BACKGROUND GEOLOGICAL CONTOUR & SUBTLE GRID                          */}
      {/* -------------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,31,58,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,31,58,0.02)_1px,transparent_1px)] bg-[size:5rem_5rem]" />
        <svg
          viewBox="0 0 1440 1600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -top-10 left-0 w-full h-[120%] opacity-20 mix-blend-multiply"
        >
          <path
            d="M-40,200 C300,140 600,320 960,220 C1300,120 1500,280 1800,200"
            stroke="rgba(184, 134, 11, 0.2)"
            strokeWidth="1.2"
            strokeDasharray="6 10"
          />
          <path
            d="M-60,700 C280,620 620,800 1020,690 C1360,600 1560,740 1860,670"
            stroke="rgba(11, 31, 58, 0.08)"
            strokeWidth="1"
          />
          <path
            d="M-40,1200 C320,1120 660,1300 1060,1190 C1400,1100 1600,1240 1900,1170"
            stroke="rgba(184, 134, 11, 0.15)"
            strokeWidth="1.2"
            strokeDasharray="4 8"
          />
        </svg>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* SECTION HEADER (EDITORIAL INTRODUCTION)                              */}
      {/* -------------------------------------------------------------------- */}
      <div className="container-editorial relative z-10 pt-20 lg:pt-28 pb-10 lg:pb-14">
        <div className="max-w-3xl">
          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <span className="h-px w-8 bg-[#B8860B]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#9E7208]">
              Integrated Mining Capabilities
            </span>
          </motion.div>

          <motion.h2
            initial={reduceMotion ? {} : { opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.1] text-[#0B1F3A]"
          >
            From initial ground discovery to global capital markets.
          </motion.h2>

          <motion.p
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-base sm:text-lg leading-relaxed text-[#57595E]"
          >
            We provide full-lifecycle media, branding, public relations, and enterprise digital solutions designed specifically for junior explorers, developers, and global mining producers.
          </motion.p>
        </div>
      </div>

      {/* =================================================================== */}
      {/* DESKTOP: STICKY CINEMATIC MINING STORY CANVAS (700vh scroll space)  */}
      {/* =================================================================== */}
      <div
        ref={containerRef}
        className="hidden lg:block relative h-[700vh]"
      >
        <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden z-20 pt-16 lg:pt-20">
          <div className="container-editorial w-full relative">
            {/* Interactive Vertical Stage Indicator & Prev/Next Controls */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-end gap-5 z-40 bg-white/70 backdrop-blur-xs p-2 rounded-xl border border-[#E5E5E3] shadow-xs">
              <div className="flex flex-col gap-3.5">
                {STAGES.map((s, idx) => {
                  const isActive = idx === activeStage;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => scrollToStage(idx)}
                      className="flex items-center justify-end gap-2.5 group cursor-pointer focus:outline-none"
                      aria-label={`Jump to Stage ${s.num}`}
                    >
                      <span
                        className={`font-mono text-[11px] transition-colors duration-300 ${
                          isActive ? "text-[#0B1F3A] font-bold" : "text-[#888A8E] group-hover:text-[#0B1F3A]"
                        }`}
                      >
                        {s.num}
                      </span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          isActive
                            ? "bg-[#B8860B] scale-125 shadow-[0_0_8px_rgba(184,134,11,0.5)]"
                            : "bg-[#D1D1CE] group-hover:bg-[#B8860B]/60"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next chapter controls */}
              <div className="flex items-center gap-1 pt-2 border-t border-[#E5E5E3]">
                <button
                  type="button"
                  disabled={activeStage === 0}
                  onClick={() => scrollToStage(Math.max(0, activeStage - 1))}
                  className="p-1 text-[#888A8E] hover:text-[#0B1F3A] disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  aria-label="Previous Chapter"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={activeStage === STAGES.length - 1}
                  onClick={() => scrollToStage(Math.min(STAGES.length - 1, activeStage + 1))}
                  className="p-1 text-[#888A8E] hover:text-[#0B1F3A] disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  aria-label="Next Chapter"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split-Screen Canvas (58% Image & Deliverables / 42% Story & Cards) */}
            <div className="grid grid-cols-12 gap-10 lg:gap-14 items-center pr-14">
              {/* LEFT: 58% LARGE CINEMATIC IMAGE + CORE STAGE DELIVERABLES */}
              <div className="col-span-7 flex flex-col gap-4 relative">
                <div className="relative aspect-[16/9.5] w-full rounded-2xl overflow-hidden border border-[#E5E5E3] shadow-md bg-white">
                  <AnimatePresence initial={false} custom={effectiveDirection} mode="popLayout">
                    <motion.div
                      key={currentStage.id}
                      custom={effectiveDirection}
                      variants={{
                        enter: (dir: number) => ({
                          x: dir > 0 ? "100%" : "-100%",
                          clipPath: dir > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)",
                          opacity: 0,
                        }),
                        center: {
                          x: "0%",
                          clipPath: "inset(0 0% 0 0)",
                          opacity: 1,
                          transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                        },
                        exit: (dir: number) => ({
                          x: dir > 0 ? "-100%" : "100%",
                          opacity: 0,
                          transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
                        }),
                      }}
                      initial={reduceMotion ? false : "enter"}
                      animate="center"
                      exit={reduceMotion ? undefined : "exit"}
                      className="absolute inset-0 w-full h-full"
                    >
                      <Image
                        src={currentStage.imageSrc}
                        alt={currentStage.imageAlt}
                        fill
                        priority
                        className="object-cover transition-all duration-700 hover:scale-[1.025]"
                        sizes="58vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/70 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between font-mono text-[11px] text-white uppercase tracking-wider font-medium">
                        <span>{currentStage.imageAlt}</span>
                        <span className="text-[#D4AF37]">CHAPTER #{currentStage.num}</span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Core Stage Deliverables (Moved to Left Side to Balance Content) */}
                <AnimatePresence initial={false} custom={effectiveDirection} mode="wait">
                  <motion.div
                    key={`deliv-${currentStage.id}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="rounded-xl border border-[#E5E5E3] bg-white p-4 shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#E5E5E3]">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B]" />
                        <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0B1F3A]">
                          Stage {currentStage.num} Core Deliverables:
                        </h4>
                      </div>
                      <span className="font-mono text-[9.5px] text-[#9E7208] font-bold uppercase tracking-wider">
                        Verified Milestones ({currentStage.deliverables.length})
                      </span>
                    </div>

                    <ul className="grid grid-cols-2 gap-2.5">
                      {currentStage.deliverables.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-xs text-[#3A3D42] leading-snug"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* RIGHT: 42% EDITORIAL STORY & SERVICE LINKS */}
              <div className="col-span-5 relative">
                <AnimatePresence initial={false} custom={effectiveDirection} mode="wait">
                  <motion.div
                    key={currentStage.id}
                    custom={effectiveDirection}
                    variants={{
                      enter: (dir: number) => ({
                        x: dir > 0 ? -35 : 35,
                        opacity: 0,
                      }),
                      center: {
                        x: 0,
                        opacity: 1,
                        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                      },
                      exit: (dir: number) => ({
                        x: dir > 0 ? 30 : -30,
                        opacity: 0,
                        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                      }),
                    }}
                    initial={reduceMotion ? false : "enter"}
                    animate="center"
                    exit={reduceMotion ? undefined : "exit"}
                    className="flex flex-col gap-4"
                  >
                    {/* Animated Stage Number & Badge */}
                    <div className="flex items-center gap-3">
                      <div className="relative overflow-hidden h-9 flex items-center">
                        <motion.span
                          key={`num-${currentStage.num}`}
                          initial={{ y: 25, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -25, opacity: 0 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="font-geist text-3xl font-black text-[#0B1F3A] leading-none"
                        >
                          {currentStage.num}
                        </motion.span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B]" />
                      <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#9E7208]">
                        {currentStage.stageCode}
                      </span>
                    </div>

                    <div>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#57595E] block mb-1">
                        {currentStage.badge}
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#0B1F3A] leading-tight">
                        {currentStage.title}
                      </h3>
                      <p className="mt-1.5 text-sm font-medium text-[#9E7208]">
                        {currentStage.subtitle}
                      </p>
                      <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#57595E]">
                        {currentStage.description}
                      </p>
                    </div>

                    {/* Specialized Capabilities Service Cards */}
                    <div className="flex flex-col gap-2.5 pt-1">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#9E7208]">
                        Specialized Capabilities ({currentStage.cards.length})
                      </span>

                      <div className="grid grid-cols-1 gap-2.5">
                        {currentStage.cards.map((card) => {
                          const IconComponent = card.icon;
                          return (
                            <div
                              key={card.id}
                              className="group relative rounded-xl border border-[#E5E5E3] bg-white p-3.5 shadow-2xs transition-all duration-300 hover:border-[#D4AF37]/60 hover:shadow-xs"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FAF5E8] text-[#9E7208] border border-[#B8860B]/25 transition-colors group-hover:bg-[#B8860B] group-hover:text-white">
                                  <IconComponent className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-serif text-sm font-normal text-[#0B1F3A] group-hover:text-[#B8860B] transition-colors truncate">
                                      {card.title}
                                    </h4>
                                    <Link
                                      href={card.href}
                                      className="inline-flex items-center gap-1 text-[10.5px] font-mono font-semibold uppercase tracking-wider text-[#9E7208] hover:text-[#0B1F3A] transition-colors shrink-0 ml-2"
                                    >
                                      <span>Explore</span>
                                      <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                  </div>
                                  <p className="text-[11px] leading-snug text-[#57595E] line-clamp-2 mt-1">
                                    {card.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MOBILE: CLEAN VERTICAL CHAPTERS (< 1024px)                          */}
      {/* =================================================================== */}
      <div className="lg:hidden container-editorial pb-20 flex flex-col gap-16">
        {STAGES.map((stage) => (
          <div key={stage.id} className="flex flex-col gap-5">
            {/* Stage Number & Badge */}
            <div className="flex items-center gap-2">
              <span className="font-geist text-2xl font-black text-[#0B1F3A]">
                {stage.num}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B]" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#9E7208]">
                {stage.stageCode}
              </span>
            </div>

            {/* Cinematic Image */}
            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-[#E5E5E3] shadow-sm bg-white">
              <Image
                src={stage.imageSrc}
                alt={stage.imageAlt}
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between font-mono text-[10px] text-white uppercase font-medium">
                <span>{stage.imageAlt}</span>
                <span className="text-[#D4AF37]">CHAPTER #{stage.num}</span>
              </div>
            </div>

            {/* Narrative */}
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#57595E] block mb-1">
                {stage.badge}
              </span>
              <h3 className="font-serif text-2xl font-normal text-[#0B1F3A]">
                {stage.title}
              </h3>
              <p className="mt-1.5 text-sm font-medium text-[#9E7208]">
                {stage.subtitle}
              </p>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#57595E]">
                {stage.description}
              </p>
            </div>

            {/* Specialized Capabilities */}
            <div className="flex flex-col gap-3">
              {stage.cards.map((card) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={card.id}
                    className="rounded-xl border border-[#E5E5E3] bg-white p-4 shadow-2xs"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FAF5E8] text-[#9E7208] border border-[#B8860B]/25">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-[#9E7208]">
                          {card.category}
                        </span>
                        <h4 className="font-serif text-base font-normal text-[#0B1F3A]">
                          {card.title}
                        </h4>
                      </div>
                    </div>
                    <p className="text-xs text-[#57595E] leading-relaxed mb-3">
                      {card.description}
                    </p>
                    <Link
                      href={card.href}
                      className="inline-flex items-center gap-1 text-xs font-mono font-semibold uppercase tracking-wider text-[#9E7208]"
                    >
                      <span>Explore Service Details</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Core Deliverables */}
            <div className="rounded-xl border border-[#E5E5E3] bg-white p-4 shadow-2xs">
              <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0B1F3A] mb-2.5">
                Stage {stage.num} Deliverables:
              </h4>
              <ul className="space-y-2">
                {stage.deliverables.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs text-[#3A3D42] leading-tight"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Multi-stage integrated campaign execution banner */}
      <div className="container-editorial relative z-20 pb-20 lg:pb-28">
        <div className="rounded-2xl border border-[#E5E5E3] bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#9E7208] block mb-1">
              Full-Lifecycle Execution
            </span>
            <p className="text-sm sm:text-base text-[#15181C] font-medium">
              Looking for multi-stage integrated campaign execution tailored to your mineral asset?
            </p>
          </div>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 rounded-xl bg-[#0B1F3A] px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider text-white transition-all hover:bg-[#B8860B] shrink-0"
          >
            <span>Request Consultation</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesScrollStory;
