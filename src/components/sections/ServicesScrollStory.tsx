"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
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
} from "lucide-react";

export interface ServiceCardData {
  id: string;
  title: string;
  category: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

// 9 Service Cards mapped 1:1 across 4 Stages (2 / 3 / 2 / 2)
export const STAGE_1_CARDS: ServiceCardData[] = [
  {
    id: "digital-branding",
    title: "Digital Branding",
    category: "Exploration & Identity",
    description: "Establish a high-conviction market narrative and corporate identity for junior explorers & mining leaders.",
    href: "/services#branding",
    icon: Compass,
  },
  {
    id: "logo-design",
    title: "Logo & Visual Design",
    category: "Brand Assets",
    description: "Vector geological typography, technical report templates, and institutional pitch decks.",
    href: "/services#logo-design",
    icon: Palette,
  },
];

export const STAGE_2_CARDS: ServiceCardData[] = [
  {
    id: "social-media",
    title: "Social Media Marketing",
    category: "Discovery Campaign",
    description: "Targeted broadcast of drill core discoveries and mineral assay highlights across X, YouTube & Stockhouse.",
    href: "/services#social-media",
    icon: Share2,
  },
  {
    id: "google-ads",
    title: "Google Ads & Paid Campaigns",
    category: "Investor Reach",
    description: "High-intent search campaign targeting institutional mining funds, retail investors, and sector analysts.",
    href: "/services#google-ads",
    icon: Target,
  },
  {
    id: "paid-social",
    title: "LinkedIn & Meta Ads",
    category: "Executive Audience",
    description: "Geotargeted executive placement in financial capitals (Toronto, Vancouver, Perth, London, New York).",
    href: "/services#paid-social",
    icon: Building2,
  },
];

export const STAGE_3_CARDS: ServiceCardData[] = [
  {
    id: "public-relations",
    title: "Public Relations",
    category: "Assay & Editorial",
    description: "Direct wire distribution of drill intercepts, NI 43-101 technical reports, and quarterly filings.",
    href: "/services#pr",
    icon: Megaphone,
  },
  {
    id: "webinars-events",
    title: "Webinars & Events",
    category: "Executive Q&A",
    description: "Live CEO townhalls, virtual site visits, and 1-on-1 institutional investor conference hosting.",
    href: "/services#events",
    icon: Video,
  },
];

export const STAGE_4_CARDS: ServiceCardData[] = [
  {
    id: "website-dev",
    title: "Website Development",
    category: "Production & Hub",
    description: "Custom Next.js corporate portals with live commodity tickers, interactive property maps & SEC/SEDAR filings.",
    href: "/services#web-dev",
    icon: Globe,
  },
  {
    id: "app-dev",
    title: "App Development",
    category: "Investor Mobile App",
    description: "Native iOS/Android investor relation apps for real-time news alerts, drill results & stock tracking.",
    href: "/services#app-dev",
    icon: Smartphone,
  },
];

interface StageData {
  stageNum: string;
  badge: string;
  title: string;
  description: string;
  imageSrc: string;
  cards: ServiceCardData[];
}

const STAGES: StageData[] = [
  {
    stageNum: "01",
    badge: "STAGE 01 // STAKE THE CLAIM",
    title: "Geological Survey & Identity",
    description: "Laying the foundation with high-precision exploration surveying, market positioning, and core brand assets.",
    imageSrc: "/services/01-survey.jpg",
    cards: STAGE_1_CARDS,
  },
  {
    stageNum: "02",
    badge: "STAGE 02 // DRILL & REACH",
    title: "Exploration Drilling & Reach",
    description: "Amplifying active drill rig milestones, core discoveries, and paid institutional investor campaigns.",
    imageSrc: "/services/02-drill.jpg",
    cards: STAGE_2_CARDS,
  },
  {
    stageNum: "03",
    badge: "STAGE 03 // ASSAY & PROVE",
    title: "Assay Verification & PR",
    description: "Broadcasting lab results, technical filings, CEO townhalls, and tier-1 financial press coverage.",
    imageSrc: "/services/03-assay.jpg",
    cards: STAGE_3_CARDS,
  },
  {
    stageNum: "04",
    badge: "STAGE 04 // SMELT & SHIP",
    title: "Commercial Production & Hub",
    description: "Deploying enterprise corporate web hubs and mobile apps for continuous capital market engagement.",
    imageSrc: "/services/04-pit.jpg",
    cards: STAGE_4_CARDS,
  },
];

export const ServicesScrollStory: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobileOrReduced, setIsMobileOrReduced] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    const checkMediaQuery = () => {
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isMobile = window.innerWidth < 1024;
      setIsMobileOrReduced(isReduced || isMobile);
    };

    checkMediaQuery();
    window.addEventListener("resize", checkMediaQuery);
    return () => window.removeEventListener("resize", checkMediaQuery);
  }, []);

  // SINGLE USE_SCROLL HOOK SOURCE OF TRUTH (Requirement #1)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setCurrentProgress(latest);
  });

  // --- STAGE OPACITIES (Strict Non-Overlapping Sequential Crossfades) ---
  // Stage 1: 0.00 -> 0.18 hold 1, 0.18 -> 0.25 fade to 0
  const stage1Opacity = useTransform(scrollYProgress, [0.00, 0.18, 0.25], [1, 1, 0]);

  // Stage 2: 0.22 -> 0.27 fade in, 0.27 -> 0.43 hold 1, 0.43 -> 0.50 fade to 0
  const stage2Opacity = useTransform(scrollYProgress, [0.22, 0.27, 0.43, 0.50], [0, 1, 1, 0]);

  // Stage 3: 0.47 -> 0.52 fade in, 0.52 -> 0.68 hold 1, 0.68 -> 0.75 fade to 0
  const stage3Opacity = useTransform(scrollYProgress, [0.47, 0.52, 0.68, 0.75], [0, 1, 1, 0]);

  // Stage 4: 0.72 -> 0.77 fade in, holds at 1 permanently (Requirement #3)
  const stage4Opacity = useTransform(scrollYProgress, [0.72, 0.77], [0, 1]);

  // --- POINTER EVENTS SAFETY NET (Requirement #4) ---
  const stage1Pointer = useTransform(stage1Opacity, (o) => (o < 0.05 ? "none" : "auto"));
  const stage2Pointer = useTransform(stage2Opacity, (o) => (o < 0.05 ? "none" : "auto"));
  const stage3Pointer = useTransform(stage3Opacity, (o) => (o < 0.05 ? "none" : "auto"));
  const stage4Pointer = useTransform(stage4Opacity, (o) => (o < 0.05 ? "none" : "auto"));

  // --- KEN BURNS TRANSFORMS (GPU Composited scale + translate) ---
  // Stage 1: Subtle zoom 1.0 -> 1.15, slow pan left-up
  const stage1Scale = useTransform(scrollYProgress, [0.00, 0.25], [1.0, 1.15]);
  const stage1X = useTransform(scrollYProgress, [0.00, 0.25], ["0%", "-3%"]);
  const stage1Y = useTransform(scrollYProgress, [0.00, 0.25], ["0%", "-2%"]);

  // Stage 2: Subtle zoom 1.0 -> 1.15, slow pan right-up
  const stage2Scale = useTransform(scrollYProgress, [0.22, 0.50], [1.0, 1.15]);
  const stage2X = useTransform(scrollYProgress, [0.22, 0.50], ["0%", "3%"]);
  const stage2Y = useTransform(scrollYProgress, [0.22, 0.50], ["0%", "-2%"]);

  // Stage 3: Subtle zoom 1.05 -> 1.18, slow pan left-down
  const stage3Scale = useTransform(scrollYProgress, [0.47, 0.75], [1.05, 1.18]);
  const stage3X = useTransform(scrollYProgress, [0.47, 0.75], ["0%", "-2%"]);
  const stage3Y = useTransform(scrollYProgress, [0.47, 0.75], ["0%", "2%"]);

  // Stage 4: Subtle zoom 1.0 -> 1.15, slow pan right-down
  const stage4Scale = useTransform(scrollYProgress, [0.72, 1.00], [1.0, 1.15]);
  const stage4X = useTransform(scrollYProgress, [0.72, 1.00], ["0%", "3%"]);
  const stage4Y = useTransform(scrollYProgress, [0.72, 1.00], ["0%", "-2%"]);

  // --- CARD REVEAL TRANSFORMS (Reveals before stage crossfade out) ---
  // Stage 1 Cards (Revealed by 0.14; stage 1 fade starts at 0.18)
  const card1_1_opacity = useTransform(scrollYProgress, [0.00, 0.08], [0, 1]);
  const card1_1_y = useTransform(scrollYProgress, [0.00, 0.08], ["50px", "0px"]);

  const card1_2_opacity = useTransform(scrollYProgress, [0.06, 0.14], [0, 1]);
  const card1_2_y = useTransform(scrollYProgress, [0.06, 0.14], ["50px", "0px"]);

  // Stage 2 Cards (Revealed by 0.39; stage 2 fade starts at 0.43)
  const card2_1_opacity = useTransform(scrollYProgress, [0.27, 0.31], [0, 1]);
  const card2_1_y = useTransform(scrollYProgress, [0.27, 0.31], ["50px", "0px"]);

  const card2_2_opacity = useTransform(scrollYProgress, [0.31, 0.35], [0, 1]);
  const card2_2_y = useTransform(scrollYProgress, [0.31, 0.35], ["50px", "0px"]);

  const card2_3_opacity = useTransform(scrollYProgress, [0.35, 0.39], [0, 1]);
  const card2_3_y = useTransform(scrollYProgress, [0.35, 0.39], ["50px", "0px"]);

  // Stage 3 Cards (Revealed by 0.64; stage 3 fade starts at 0.68)
  const card3_1_opacity = useTransform(scrollYProgress, [0.52, 0.58], [0, 1]);
  const card3_1_y = useTransform(scrollYProgress, [0.52, 0.58], ["50px", "0px"]);

  const card3_2_opacity = useTransform(scrollYProgress, [0.58, 0.64], [0, 1]);
  const card3_2_y = useTransform(scrollYProgress, [0.58, 0.64], ["50px", "0px"]);

  // Stage 4 Cards (Revealed by 0.90; stage 4 holds)
  const card4_1_opacity = useTransform(scrollYProgress, [0.77, 0.83], [0, 1]);
  const card4_1_y = useTransform(scrollYProgress, [0.77, 0.83], ["50px", "0px"]);

  const card4_2_opacity = useTransform(scrollYProgress, [0.83, 0.90], [0, 1]);
  const card4_2_y = useTransform(scrollYProgress, [0.83, 0.90], ["50px", "0px"]);

  // STATIC FALLBACK FOR MOBILE & REDUCED MOTION
  if (isMobileOrReduced) {
    return (
      <section id="services" className="py-16 md:py-24 bg-[#0B1220] text-[#F5F1E8] font-sans border-b border-[#C89216]/20">
        <div className="container-editorial">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="gold" size="md" className="mb-3 uppercase tracking-[0.05em] text-[11px] bg-[#C89216]/20 text-[#E0B544] border border-[#C89216]/40">
              Mining Media Services
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white mb-4">
              End-to-End Mining Communications
            </h2>
            <p className="text-sm sm:text-base text-[#D8D2C7]/85 leading-relaxed">
              From initial exploration surveys to commercial production briefings, our integrated communications platform connects global mining issuers directly with capital markets.
            </p>
          </div>

          {/* 4 Sequential Stage Sections for Mobile */}
          <div className="flex flex-col gap-16">
            {STAGES.map((stage) => (
              <div key={stage.stageNum} className="flex flex-col gap-6">
                <div className="relative h-64 rounded-xl overflow-hidden border border-[#C89216]/30 shadow-lg">
                  <Image
                    src={stage.imageSrc}
                    alt={stage.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-xs font-mono font-semibold text-[#E0B544] uppercase tracking-widest block mb-1">
                      {stage.badge}
                    </span>
                    <h3 className="font-serif text-xl text-white">{stage.title}</h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {stage.cards.map((card) => (
                    <StaticServiceCard key={card.id} card={card} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // DESKTOP SCROLL-JACKED STORY (500vh PINNED TRACK FOR REAL PHOTOGRAPHY KEN BURNS)
  return (
    <section id="services" ref={containerRef} className="relative h-[500vh] bg-[#0B1220] text-[#F5F1E8] font-sans border-b border-[#C89216]/20">
      {/* STICKY VIEWPORT CONTAINER */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">

        {/* =========================================================================
            STAGE 01: STAKE THE CLAIM (Geological Survey Rig Photography)
           ========================================================================= */}
        <motion.div
          className="absolute inset-0 z-0 overflow-hidden"
          style={{ opacity: stage1Opacity, pointerEvents: stage1Pointer }}
        >
          <motion.div
            className="absolute inset-0 w-full h-full"
            style={{
              scale: stage1Scale,
              x: stage1X,
              y: stage1Y,
            }}
          >
            <Image
              src="/services/01-survey.jpg"
              alt="Geological exploration survey rig"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>

          {/* GRADIENT SCRIM FOR TEXT LEGIBILITY */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/95 via-[#0B1220]/50 to-[#0B1220]/20 pointer-events-none" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0B1220]/30 to-[#0B1220]/80 pointer-events-none" />

          {/* STAGE CONTENT OVERLAY */}
          <div className="relative z-20 container-editorial h-full flex flex-col justify-between py-20">
            {/* Header HUD */}
            <div>
              <span className="inline-flex items-center gap-2 font-mono text-xs text-[#E0B544] uppercase tracking-widest bg-[#C89216]/20 border border-[#C89216]/40 px-4 py-1.5 rounded-full backdrop-blur-md mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E0B544] animate-pulse" />
                STAGE 01 // STAKE THE CLAIM
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white max-w-2xl leading-tight">
                Geological Survey & Identity
              </h2>
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <motion.div style={{ opacity: card1_1_opacity, y: card1_1_y }}>
                <AnimatedServiceCard card={STAGE_1_CARDS[0]} />
              </motion.div>
              <motion.div style={{ opacity: card1_2_opacity, y: card1_2_y }}>
                <AnimatedServiceCard card={STAGE_1_CARDS[1]} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            STAGE 02: DRILL & REACH (Exploration Diamond Drill Rig Photography)
           ========================================================================= */}
        <motion.div
          className="absolute inset-0 z-0 overflow-hidden"
          style={{ opacity: stage2Opacity, pointerEvents: stage2Pointer }}
        >
          <motion.div
            className="absolute inset-0 w-full h-full"
            style={{
              scale: stage2Scale,
              x: stage2X,
              y: stage2Y,
            }}
          >
            <Image
              src="/services/02-drill.jpg"
              alt="Active diamond drill rig operation"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>

          {/* GRADIENT SCRIM FOR TEXT LEGIBILITY */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/95 via-[#0B1220]/50 to-[#0B1220]/20 pointer-events-none" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0B1220]/30 to-[#0B1220]/80 pointer-events-none" />

          {/* STAGE CONTENT OVERLAY */}
          <div className="relative z-20 container-editorial h-full flex flex-col justify-between py-20">
            {/* Header HUD */}
            <div>
              <span className="inline-flex items-center gap-2 font-mono text-xs text-[#E0B544] uppercase tracking-widest bg-[#C89216]/20 border border-[#C89216]/40 px-4 py-1.5 rounded-full backdrop-blur-md mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E0B544] animate-pulse" />
                STAGE 02 // DRILL & REACH
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white max-w-2xl leading-tight">
                Exploration Drilling & Reach
              </h2>
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
              <motion.div style={{ opacity: card2_1_opacity, y: card2_1_y }}>
                <AnimatedServiceCard card={STAGE_2_CARDS[0]} compact />
              </motion.div>
              <motion.div style={{ opacity: card2_2_opacity, y: card2_2_y }}>
                <AnimatedServiceCard card={STAGE_2_CARDS[1]} compact />
              </motion.div>
              <motion.div style={{ opacity: card2_3_opacity, y: card2_3_y }}>
                <AnimatedServiceCard card={STAGE_2_CARDS[2]} compact />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            STAGE 03: ASSAY & PROVE (Geological Core Sample Laboratory Photography)
           ========================================================================= */}
        <motion.div
          className="absolute inset-0 z-0 overflow-hidden"
          style={{ opacity: stage3Opacity, pointerEvents: stage3Pointer }}
        >
          <motion.div
            className="absolute inset-0 w-full h-full"
            style={{
              scale: stage3Scale,
              x: stage3X,
              y: stage3Y,
            }}
          >
            <Image
              src="/services/03-assay.jpg"
              alt="Geologist logging diamond drill core trays"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>

          {/* GRADIENT SCRIM FOR TEXT LEGIBILITY */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/95 via-[#0B1220]/50 to-[#0B1220]/20 pointer-events-none" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0B1220]/30 to-[#0B1220]/80 pointer-events-none" />

          {/* STAGE CONTENT OVERLAY */}
          <div className="relative z-20 container-editorial h-full flex flex-col justify-between py-20">
            {/* Header HUD */}
            <div>
              <span className="inline-flex items-center gap-2 font-mono text-xs text-[#E0B544] uppercase tracking-widest bg-[#C89216]/20 border border-[#C89216]/40 px-4 py-1.5 rounded-full backdrop-blur-md mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E0B544] animate-pulse" />
                STAGE 03 // ASSAY & PROVE
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white max-w-2xl leading-tight">
                Assay Verification & PR
              </h2>
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <motion.div style={{ opacity: card3_1_opacity, y: card3_1_y }}>
                <AnimatedServiceCard card={STAGE_3_CARDS[0]} />
              </motion.div>
              <motion.div style={{ opacity: card3_2_opacity, y: card3_2_y }}>
                <AnimatedServiceCard card={STAGE_3_CARDS[1]} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            STAGE 04: SMELT & SHIP (Massive Open-Pit Mine Photography)
           ========================================================================= */}
        <motion.div
          className="absolute inset-0 z-0 overflow-hidden"
          style={{ opacity: stage4Opacity, pointerEvents: stage4Pointer }}
        >
          <motion.div
            className="absolute inset-0 w-full h-full"
            style={{
              scale: stage4Scale,
              x: stage4X,
              y: stage4Y,
            }}
          >
            <Image
              src="/services/04-pit.jpg"
              alt="Massive open pit mine with haul trucks and terraces"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>

          {/* GRADIENT SCRIM FOR TEXT LEGIBILITY */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/95 via-[#0B1220]/50 to-[#0B1220]/20 pointer-events-none" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0B1220]/30 to-[#0B1220]/80 pointer-events-none" />

          {/* STAGE CONTENT OVERLAY */}
          <div className="relative z-20 container-editorial h-full flex flex-col justify-between py-20">
            {/* Header HUD */}
            <div>
              <span className="inline-flex items-center gap-2 font-mono text-xs text-[#E0B544] uppercase tracking-widest bg-[#C89216]/20 border border-[#C89216]/40 px-4 py-1.5 rounded-full backdrop-blur-md mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E0B544] animate-pulse" />
                STAGE 04 // SMELT & SHIP
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white max-w-2xl leading-tight">
                Commercial Production & Hub
              </h2>
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <motion.div style={{ opacity: card4_1_opacity, y: card4_1_y }}>
                <AnimatedServiceCard card={STAGE_4_CARDS[0]} />
              </motion.div>
              <motion.div style={{ opacity: card4_2_opacity, y: card4_2_y }}>
                <AnimatedServiceCard card={STAGE_4_CARDS[1]} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* BOTTOM SCROLL PROGRESS INDICATOR BAR */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-3 bg-[#0B1220]/85 backdrop-blur-md px-6 py-2 rounded-full border border-[#C89216]/30 pointer-events-none">
          <div className="w-48 h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C89216] to-[#E0B544] transition-all duration-75"
              style={{ width: `${Math.min(currentProgress * 100, 100)}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-[#E0B544] font-semibold">
            {Math.round(currentProgress * 100)}%
          </span>
        </div>

      </div>
    </section>
  );
};

// --- ANIMATED SERVICE CARD COMPONENT ---
const AnimatedServiceCard: React.FC<{ card: ServiceCardData; compact?: boolean }> = ({
  card,
  compact = false,
}) => {
  const IconComponent = card.icon;
  return (
    <div className={`group relative bg-[#0B1220]/85 backdrop-blur-md border border-[#C89216]/40 hover:border-[#E0B544] rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,146,22,0.25)] font-sans ${compact ? "p-4 sm:p-5" : "p-6 sm:p-7"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2.5 bg-[#C89216]/20 text-[#E0B544] rounded-lg group-hover:bg-[#C89216] group-hover:text-[#0B1220] transition-colors">
          <IconComponent className="w-5 h-5" />
        </div>
        <span className="font-mono text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase text-[#E0B544] bg-[#C89216]/15 px-2.5 py-0.5 rounded border border-[#C89216]/35">
          {card.category}
        </span>
      </div>

      <h3 className={`font-serif font-normal text-[#F5F1E8] group-hover:text-[#E0B544] transition-colors leading-snug mb-2 ${compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"}`}>
        {card.title}
      </h3>

      <p className={`font-sans text-[#D8D2C7]/85 leading-relaxed font-normal mb-4 ${compact ? "text-xs line-clamp-2" : "text-xs sm:text-sm"}`}>
        {card.description}
      </p>

      <Link
        href={card.href}
        className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#E0B544] hover:text-white transition-colors"
      >
        Learn More
        <ArrowRight className="w-3.5 h-3.5 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
};

// --- STATIC SERVICE CARD COMPONENT FOR MOBILE ---
const StaticServiceCard: React.FC<{ card: ServiceCardData }> = ({ card }) => {
  const IconComponent = card.icon;
  return (
    <div className="bg-[#0B1220]/90 border border-[#C89216]/35 rounded-xl p-6 flex flex-col justify-between font-sans">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-[#C89216]/20 text-[#E0B544] rounded-lg">
            <IconComponent className="w-5 h-5" />
          </div>
          <span className="font-mono text-[9px] font-semibold tracking-wider uppercase text-[#E0B544] bg-[#C89216]/15 px-2 py-0.5 rounded border border-[#C89216]/35">
            {card.category}
          </span>
        </div>
        <h4 className="font-serif text-lg text-[#F5F1E8] mb-2">{card.title}</h4>
        <p className="text-xs text-[#D8D2C7]/85 leading-relaxed mb-4">{card.description}</p>
      </div>
      <Link
        href={card.href}
        className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#E0B544] hover:text-white transition-colors"
      >
        Learn More
        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
      </Link>
    </div>
  );
};
