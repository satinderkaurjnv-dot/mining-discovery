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

      {/* Copy — normal flow */}
      <div
        ref={copyRef}
        className="relative z-10 flex flex-col items-center px-4 pb-6 pt-[clamp(80px,18vh,120px)] text-center sm:px-10 sm:pb-8 sm:pt-[clamp(60px,calc(48vh-316px),132px)] lg:pt-[clamp(64px,calc(48vh-320px),160px)]"
      >
        <h1 className="hero-rise [animation-delay:160ms] mt-3 sm:mt-5 max-w-[1100px] font-geist text-[clamp(1.95rem,7.8vw,5.5rem)] font-bold uppercase leading-[1.02] tracking-[-0.02em] text-[#0B1F3A] break-words">
          MAKE YOUR MINING<br />STORY IMPOSSIBLE TO<br />IGNORE.
        </h1>

        <p className="hero-rise [animation-delay:260ms] mt-4 sm:mt-7 max-w-[720px] font-geist text-[clamp(0.92rem,3.8vw,1.25rem)] font-normal leading-[1.5] tracking-[-0.005em] text-[#475569] px-2 sm:px-0">
          Mining Discovery combines industry media, digital marketing and investor-focused communication to put mining companies in front of the audiences that matter.
        </p>

        <div className="hero-rise [animation-delay:360ms] mt-6 sm:mt-8 flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-4 max-w-sm sm:max-w-none">
          <Link
            href="/#contact"
            className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#B8860B] px-5 py-3 sm:px-7 sm:py-3.5 font-sans text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.08em] text-white shadow-sm transition-colors duration-200 hover:bg-[#D4AF37] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] focus-visible:ring-offset-2 min-h-[44px]"
          >
            START A CAMPAIGN
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/#services"
            className="group inline-flex items-center justify-center gap-2 rounded-lg border border-[#0B1F3A]/25 bg-white/40 backdrop-blur-sm px-5 py-3 sm:px-7 sm:py-3.5 font-sans text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.08em] text-[#0B1F3A] transition-colors duration-200 hover:border-[#0B1F3A] hover:bg-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A] focus-visible:ring-offset-2 min-h-[44px]"
          >
            EXPLORE OUR SERVICES
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
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
