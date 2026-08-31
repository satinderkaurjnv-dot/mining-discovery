"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import { TruckTelemetry } from "./TruckTelemetry";
import { Radio } from "lucide-react";

// Lazy-load the WebGL scene — avoids SSR and keeps first-paint instant
const MiningTruckScene = dynamic(
  () => import("./MiningTruckScene").then((m) => m.MiningTruckScene),
  { ssr: false }
);

// ─── Scroll Story Phases ──────────────────────────────────────────────────────
const PHASES = [
  {
    range: [0, 0.22] as [number, number],
    badge: "PHASE 01 // EXTRACTION ROUTE",
    heading: ["AUTONOMOUS", "HEAVY HAULAGE"],
    desc: "Ultra-class mining truck navigating active open-pit operations under intelligent fleet control.",
  },
  {
    range: [0.22, 0.52] as [number, number],
    badge: "PHASE 02 // SIDE PROFILE",
    heading: ["OPEN-PIT", "OPERATIONS"],
    desc: "400-ton payload capacity. 13% haul-road gradient. Precision GPS fleet navigation at every bench.",
  },
  {
    range: [0.52, 0.75] as [number, number],
    badge: "PHASE 03 // AERIAL SURVEY",
    heading: ["MINE", "INTELLIGENCE"],
    desc: "Real-time geophysical mapping and ore-grade telemetry across active extraction zones.",
  },
  {
    range: [0.75, 1] as [number, number],
    badge: "PHASE 04 // SCALE REVEALED",
    heading: ["THE WORLD'S", "MINING STORY"],
    desc: "From discovery to extraction to global capital markets — Mining Discovery covers every stage.",
  },
];

function getPhase(sp: number) {
  return PHASES.find((p) => sp >= p.range[0] && sp < p.range[1]) ?? PHASES[PHASES.length - 1];
}

export const CinematicHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [scrollVal, setScrollVal] = useState(0);
  const [telemetry, setTelemetry] = useState({
    speedKmh: 0,
    gear: "N",
    payloadTons: 320,
    elevation: 1420,
  });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 88,
    damping: 24,
    restDelta: 0.001,
  });

  smoothProgress.on("change", (v) => setScrollVal(v));

  const handleSpeedChange = useCallback((kmh: number, gear: string, elevation: number) => {
    setTelemetry((prev) => ({
      ...prev,
      speedKmh: kmh,
      gear,
      elevation,
      payloadTons: Math.round(320 + scrollVal * 80),
    }));
  }, [scrollVal]);

  // Fade out hero overlay as user scrolls into exit phase (85–100%)
  const heroOpacity = useTransform(smoothProgress, [0.82, 0.96], [1, 0]);

  // Scroll indicator fades away after first scroll
  const scrollHintOpacity = useTransform(smoothProgress, [0, 0.06], [1, 0]);

  const sp = scrollVal;
  const phase = getPhase(sp);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#0C0E12]"
      style={{ height: "500vh" }}
      aria-label="Cinematic 3D mining haul truck hero — scroll to drive"
    >
      {/* ── Pinned 100vh Viewport ─────────────────────────────────────────── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* ── WebGL 3D Canvas ─────────────────────────────────────────────── */}
        <MiningTruckScene
          scrollProgress={scrollVal}
          onSpeedChange={handleSpeedChange}
          className="absolute inset-0 h-full w-full"
        />

        {/* ── Cinematic Vignette Overlays ──────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              "linear-gradient(to bottom, rgba(12,14,18,0.78) 0%, transparent 22%, transparent 72%, rgba(12,14,18,0.92) 100%)",
              "linear-gradient(to right, rgba(12,14,18,0.55) 0%, transparent 40%)",
            ].join(", "),
          }}
        />

        {/* ── Hero Copy — Bottom Left ──────────────────────────────────────── */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="pointer-events-none absolute bottom-16 left-8 z-20 sm:left-14 sm:bottom-20 lg:left-20"
        >
          {/* Phase badge */}
          <motion.div
            key={phase.badge}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/35 bg-[#0C0E12]/70 px-3 py-1.5 backdrop-blur-sm"
          >
            <Radio className="h-3 w-3 text-[#D4AF37]" style={{ animation: "pulse 1.4s ease-in-out infinite" }} />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
              {phase.badge}
            </span>
          </motion.div>

          {/* Gold accent rule */}
          <div className="mt-3 mb-2 h-px w-8 bg-[#D4AF37]/60" />

          {/* Main heading */}
          <motion.h1
            key={phase.heading.join("")}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="font-geist font-bold uppercase text-white leading-[0.92] tracking-[-0.025em]"
            style={{ fontSize: "clamp(3.2rem, 6.8vw, 6.5rem)" }}
          >
            {phase.heading.map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </motion.h1>

          {/* Description */}
          <motion.p
            key={phase.desc}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-4 max-w-[420px] font-mono text-[11px] sm:text-[13px] leading-relaxed text-[#9CA3AF] tracking-wide"
          >
            {phase.desc}
          </motion.p>
        </motion.div>

        {/* ── Telemetry HUD — Top Right ────────────────────────────────────── */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute right-6 top-20 z-20 sm:right-10 sm:top-24 hidden sm:block"
        >
          <TruckTelemetry
            speedKmh={telemetry.speedKmh}
            gear={telemetry.gear}
            payloadTons={telemetry.payloadTons}
            elevation={telemetry.elevation}
            scrollProgress={scrollVal}
          />
        </motion.div>

        {/* ── Progress track — Right Edge ───────────────────────────────────── */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col items-center gap-1.5"
        >
          {PHASES.map((p, i) => {
            const inPhase = sp >= p.range[0] && sp < p.range[1];
            return (
              <div
                key={i}
                className={`rounded-full transition-all duration-500 ${
                  inPhase
                    ? "h-6 w-1 bg-[#D4AF37]"
                    : sp >= p.range[1]
                    ? "h-2 w-1 bg-[#D4AF37]/50"
                    : "h-2 w-1 bg-white/20"
                }`}
              />
            );
          })}
        </motion.div>

        {/* ── Scroll hint (fade on scroll) ─────────────────────────────────── */}
        <motion.div
          style={{ opacity: scrollHintOpacity }}
          className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/40">
            Scroll to Drive
          </span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-7 w-3.5 rounded-full border border-white/20 p-0.5 flex items-start justify-center"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
          </motion.div>
        </motion.div>

        {/* ── Mining Journey Lower Band (appears at 75%+ scroll) ───────────── */}
        <motion.div
          style={{ opacity: useTransform(smoothProgress, [0.72, 0.84], [0, 1]) }}
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 border-t border-white/8"
        >
          <div className="flex justify-center gap-8 sm:gap-16 py-3 px-6">
            {["EXPLORATION", "EXTRACTION", "PROCESSING", "LOGISTICS"].map((label, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="h-px w-6 bg-[#D4AF37]/60" />
                <span className="font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.18em] text-white/50">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};
