"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
    tabLabel: "Drilling & Market Reach",
    badge: "Stage 02 // Active Drilling & Campaigns",
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
  const [activeStage, setActiveStage] = useState(0);

  const currentStage = STAGES[activeStage];

  return (
    <section
      id="services"
      className="relative w-full border-b border-[#E5E5E3] bg-[#F8F8F6] font-sans text-[#15181C] py-20 lg:py-28 overflow-hidden"
    >
      <div className="container-editorial relative z-10">
        {/* ========================================================================= */}
        {/* SECTION HEADER                                                            */}
        {/* ========================================================================= */}
        <div className="max-w-3xl mb-12 lg:mb-16">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#B8860B]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#9E7208]">
              Integrated Mining Capabilities
            </span>
          </div>

          <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.1] text-[#0B1F3A]">
            From initial ground discovery to global capital markets.
          </h2>

          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#57595E]">
            We provide full-lifecycle media, branding, public relations, and enterprise digital solutions designed specifically for junior explorers, developers, and global mining producers.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE STAGE SELECTOR TABS                                            */}
        {/* ========================================================================= */}
        <div className="mb-12 border-b border-[#E5E5E3] pb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {STAGES.map((stage, idx) => {
              const isActive = idx === activeStage;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveStage(idx)}
                  className={`group relative flex flex-col p-3.5 sm:p-4 rounded-xl text-left transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-white border border-[#D4AF37]/60 shadow-sm"
                      : "bg-[#EFEFEA]/60 border border-[#E5E5E3] hover:bg-white hover:border-[#D4AF37]/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`font-mono text-xs font-bold transition-colors ${
                        isActive ? "text-[#9E7208]" : "text-[#57595E] group-hover:text-[#0B1F3A]"
                      }`}
                    >
                      Stage {stage.num}
                    </span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#B8860B]" />
                    )}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-semibold tracking-tight transition-colors ${
                      isActive ? "text-[#0B1F3A] font-bold" : "text-[#57595E] group-hover:text-[#0B1F3A]"
                    }`}
                  >
                    {stage.tabLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ACTIVE STAGE SHOWCASE (EDITORIAL OVERVIEW + SERVICES GRID)                 */}
        {/* ========================================================================= */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start"
          >
            {/* --- LEFT COLUMN: STAGE EDITORIAL OVERVIEW & CINEMATIC PHOTO --- */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="rounded-2xl border border-[#E5E5E3] bg-white p-6 sm:p-8 shadow-xs">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#9E7208] block mb-2">
                  {currentStage.badge}
                </span>

                <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#0B1F3A]">
                  {currentStage.title}
                </h3>

                <p className="mt-2 text-sm sm:text-base font-medium text-[#9E7208]">
                  {currentStage.subtitle}
                </p>

                <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#57595E]">
                  {currentStage.description}
                </p>

                {/* Deliverables checklist */}
                <div className="mt-6 pt-6 border-t border-[#E5E5E3]">
                  <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0B1F3A] mb-3">
                    Core Stage Deliverables:
                  </h4>
                  <ul className="space-y-2.5">
                    {currentStage.deliverables.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-xs text-[#3A3D42] leading-relaxed"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Framed Cinematic Photograph */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#E5E5E3] shadow-md">
                <Image
                  src={currentStage.imageSrc}
                  alt={currentStage.imageAlt}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 1023px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 text-[10px] font-mono text-white uppercase font-medium">
                  {currentStage.imageAlt}
                </div>
              </div>
            </div>

            {/* --- RIGHT COLUMN: PROFESSIONAL SERVICE CARDS GRID --- */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-[#9E7208]">
                  Available Services & Solutions // {currentStage.cards.length} Capabilities
                </h4>
                <span className="font-mono text-xs text-[#57595E]">
                  Stage 0{activeStage + 1} of 04
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {currentStage.cards.map((card) => {
                  const IconComponent = card.icon;
                  return (
                    <div
                      key={card.id}
                      className="group relative rounded-2xl border border-[#E5E5E3] bg-white p-6 sm:p-7 shadow-xs transition-all duration-300 hover:border-[#D4AF37]/60 hover:shadow-[0_12px_35px_rgba(11,31,58,0.07)]"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF5E8] text-[#9E7208] border border-[#B8860B]/25 transition-colors group-hover:bg-[#B8860B] group-hover:text-white">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#9E7208]">
                              {card.category}
                            </span>
                            <h5 className="font-serif text-lg sm:text-xl font-normal text-[#0B1F3A] group-hover:text-[#B8860B] transition-colors">
                              {card.title}
                            </h5>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm leading-relaxed text-[#57595E] mb-5">
                        {card.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E3]">
                        <Link
                          href={card.href}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#9E7208] hover:text-[#0B1F3A] transition-colors"
                        >
                          <span>Explore Service Details</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                        <span className="text-[10px] font-mono text-[#57595E]/60 uppercase">
                          Tailored for Mining Issuers
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stage Progression Banner */}
              <div className="rounded-xl border border-[#E5E5E3] bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
                <span className="text-[#57595E]">
                  Looking for multi-stage integrated campaign execution?
                </span>
                <Link
                  href="/contact"
                  className="font-bold text-[#9E7208] hover:text-[#0B1F3A] underline underline-offset-4 transition-colors"
                >
                  Request Consultation →
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ServicesScrollStory;
