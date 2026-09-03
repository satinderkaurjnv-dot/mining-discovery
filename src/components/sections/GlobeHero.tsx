"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { HeroBackdrop } from "@/components/sections/hero-layers/HeroBackdrop";
import { UnitedCarriersGlobe } from "@/components/ui/globe/UnitedCarriersGlobe";

const HORIZON_OVERRUN = 1.08;
function horizonDiameter(width: number, height: number) {
  return ((width * width) / (4 * height) + height) * HORIZON_OVERRUN;
}

const GLOBE_FIT = 0.9;
const SILHOUETTE_STOP = GLOBE_FIT * 100;
const HALO_OUTER_STOP = SILHOUETTE_STOP + 5.5;
const HALO_HEADROOM = (HALO_OUTER_STOP / 100 - GLOBE_FIT) / 2;
const STAGE_COUNT = 5;
const STAGE_VH = 165;

const STATS_WIPE =
  "linear-gradient(to bottom, transparent 0%, rgba(2,8,23,0.12) 16%, rgba(2,8,23,0.72) 48%, #020817 76%, #020817 100%)";

interface Metrics {
  boxSize: number;
  boxTop: number;
}

export const GlobeHero: React.FC = () => {
  const rangeRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const globeBoxRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);

  const [metrics, setMetrics] = useState<Metrics>({ boxSize: 0, boxTop: 0 });
  const [ready, setReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const range = rangeRef.current;
      if (!range) return;
      const rect = range.getBoundingClientRect();
      const totalDist = range.offsetHeight - window.innerHeight;
      if (totalDist <= 0) return;
      const scrolled = -rect.top;
      const p = Math.min(Math.max(scrolled / totalDist, 0), 1);
      setScrollProgress(p);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    const slot = slotRef.current;
    if (!card || !slot) return;

    const measure = () => {
      const c = card.getBoundingClientRect();
      const s = slot.getBoundingClientRect();
      if (!c.height || !s.width || !s.height) return;

      const sphereSize = horizonDiameter(s.width, s.height);
      const boxSize = sphereSize / GLOBE_FIT;
      const boxTop = -(boxSize - sphereSize) / 2 + boxSize * HALO_HEADROOM;

      setMetrics({ boxSize, boxTop });
      setReady(true);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    observer.observe(slot);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative w-full bg-[#DFE7F3] text-[#0B1F3A]">
      {/* Soft Blurry Atmospheric Background Image */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[105vh] overflow-hidden z-0"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0) 78%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0) 78%)",
        }}
      >
        <Image
          src="/stats/open-pit-mine.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center blur-[1.5px] scale-105 opacity-[0.44] brightness-[0.76] contrast-[1.12]"
        />
        {/* Soft wash overlay preserving mining detail and text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(223, 231, 243, 0.35) 0%, rgba(223, 231, 243, 0.28) 35%, rgba(223, 231, 243, 0.85) 70%, #DFE7F3 100%)",
          }}
        />
      </div>

      {/* Copy — normal flow with strong visual hierarchy */}
      <div
        ref={copyRef}
        className="relative z-10 flex flex-col items-center px-4 pb-6 pt-[clamp(80px,16vh,115px)] text-center sm:px-10 sm:pb-8 sm:pt-[clamp(60px,calc(46vh-310px),128px)] lg:pt-[clamp(64px,calc(46vh-310px),150px)]"
      >
        {/* Subtle Live Industrial Status Pill */}
        <div className="hero-rise inline-flex items-center gap-2 rounded-full border border-[#B8860B]/30 bg-white/75 px-4 py-1.5 backdrop-blur-md shadow-xs transition-all duration-300 hover:border-[#B8860B]/50 hover:bg-white/90">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B8860B] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#B8860B]" />
          </span>
          <span className="font-mono text-[10.5px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9E7208]">
            GLOBAL MINING MEDIA & DIGITAL MARKETING
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="hero-rise [animation-delay:160ms] mt-4 sm:mt-5 max-w-[1140px] font-geist text-[clamp(2.05rem,7.4vw,5.6rem)] font-extrabold uppercase leading-[0.98] tracking-[-0.03em] text-[#0B1F3A] break-words">
          MAKE YOUR MINING<br />
          <span className="text-[#0B1F3A]">STORY IMPOSSIBLE TO</span><br />
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-[#0B1F3A] via-[#8C6507] to-[#0B1F3A] bg-clip-text text-transparent">IGNORE.</span>
            <span className="absolute -bottom-1 left-0 right-0 h-[2.5px] rounded-full bg-gradient-to-r from-transparent via-[#B8860B]/50 to-transparent" />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-rise [animation-delay:260ms] mt-4 sm:mt-6 max-w-[740px] font-geist text-[clamp(0.95rem,3.4vw,1.25rem)] font-normal leading-[1.55] tracking-[-0.01em] text-[#475569] px-2 sm:px-0">
          Mining Discovery combines industry media, digital marketing and investor-focused communication to put mining companies in front of the audiences that matter.
        </p>

        {/* Premium CTA Button Group */}
        <div className="hero-rise [animation-delay:360ms] mt-6 sm:mt-8 flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none">
          <Link
            href="/#contact"
            className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-lg bg-[#B8860B] px-6 py-3.5 sm:px-8 sm:py-4 font-sans text-[12.5px] sm:text-[13px] font-semibold uppercase tracking-[0.09em] text-white shadow-md shadow-[#B8860B]/20 transition-all duration-300 hover:bg-[#C99718] hover:shadow-lg hover:shadow-[#B8860B]/30 hover:-translate-y-0.5 active:translate-y-0 min-h-[46px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] focus-visible:ring-offset-2"
          >
            <span className="relative z-10">START A CAMPAIGN</span>
            <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>

          <Link
            href="/#services"
            className="group relative inline-flex items-center justify-center gap-2.5 rounded-lg border border-[#0B1F3A]/25 bg-white/60 backdrop-blur-md px-6 py-3.5 sm:px-8 sm:py-4 font-sans text-[12.5px] sm:text-[13px] font-semibold uppercase tracking-[0.09em] text-[#0B1F3A] shadow-xs transition-all duration-300 hover:border-[#B8860B] hover:bg-white/90 hover:text-[#0B1F3A] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 min-h-[46px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A] focus-visible:ring-offset-2"
          >
            <span className="relative z-10">EXPLORE OUR SERVICES</span>
            <ArrowRight className="relative z-10 h-4 w-4 text-[#0B1F3A] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#B8860B]" />
          </Link>
        </div>
      </div>

      {/* Globe range — exactly as in https://mining-discovery-rho.vercel.app/ */}
      <div
        ref={rangeRef}
        className="relative -mt-5 lg:-mt-6"
        style={{ height: reduceMotion ? "100vh" : `${STAGE_COUNT * STAGE_VH}vh` }}
      >
        <div
          ref={cardRef}
          className="sticky top-0 h-[100dvh] w-full overflow-hidden"
        >
          <div ref={slotRef} className="relative h-full w-full">

            {/* Globe Box — sized and positioned via horizonDiameter */}
            {metrics.boxSize > 0 && (
              <div
                ref={globeBoxRef}
                className={`
                  absolute left-1/2 z-10 -translate-x-1/2 will-change-transform aspect-square
                  transition-[opacity,scale] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                  motion-reduce:transition-none
                  ${ready ? "opacity-100 scale-100" : "opacity-0 scale-[0.94] motion-reduce:scale-100"}
                `}
                style={{
                  width: metrics.boxSize,
                  height: metrics.boxSize,
                  top: metrics.boxTop,
                }}
              >
                <UnitedCarriersGlobe className="w-full h-full" scrollProgress={scrollProgress} />
              </div>
            )}

            {/* Layer 5 — stats wipe */}
            <div
              ref={curtainRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[130vh] will-change-transform"
              style={{
                transform: "translate3d(0, 100%, 0)",
                background: STATS_WIPE,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobeHero;
