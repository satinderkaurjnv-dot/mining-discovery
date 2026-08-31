"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Compass, Pickaxe, Sparkles, TrendingUp, ChevronDown, Activity, Eye } from "lucide-react";

interface StratumLayer {
  id: string;
  depth: string;
  depthNum: number;
  title: string;
  subtitle: string;
  color: string;
  accent: string;
  desc: string;
  metrics: Array<{ label: string; value: string }>;
  icon: React.ElementType;
}

const STRATA_LAYERS: StratumLayer[] = [
  {
    id: "surface",
    depth: "0.0m",
    depthNum: 0,
    title: "Surface & Concession Topography",
    subtitle: "Airborne Geophysics & Claim Staking",
    color: "from-[#112847] to-[#163863]",
    accent: "#D4AF37",
    desc: "Satellite radiometric mapping, LiDAR topography scanning, and high-conviction concession staking across Tier-1 mining jurisdictions.",
    metrics: [
      { label: "Survey Resolution", value: "0.5m LiDAR" },
      { label: "Radiometrics", value: "U/Th/K Gamma" },
      { label: "Concession Area", value: "48,000 Ha" },
    ],
    icon: Compass,
  },
  {
    id: "orebody",
    depth: "-250m",
    depthNum: 250,
    title: "Sedimentary Ore Body & Core Drilling",
    subtitle: "Diamond Core Intercepts & Lithology",
    color: "from-[#1C2636] to-[#25364D]",
    accent: "#7EB6FF",
    desc: "Continuous HQ/NQ diamond drill core extraction penetrating sedimentary overburden into brecciated hydrothermal mineralized zones.",
    metrics: [
      { label: "Core Recovery", value: "98.4%" },
      { label: "Drill Depth", value: "320m Intercept" },
      { label: "Fault Dip", value: "64° South" },
    ],
    icon: Pickaxe,
  },
  {
    id: "goldvein",
    depth: "-600m",
    depthNum: 600,
    title: "High-Grade Gold & Critical Mineral Vein",
    subtitle: "Bonanza Seam & Quartz Hydrothermal Seams",
    color: "from-[#2D2210] to-[#453616]",
    accent: "#FFD700",
    desc: "Visible native gold in quartz-carbonate stockworks, high-tenor copper-gold porphyry systems, and certified laboratory assay verification.",
    metrics: [
      { label: "Assay Grade", value: "14.2 g/t Au" },
      { label: "True Width", value: "8.6 Metres" },
      { label: "Compliance", value: "NI 43-101 / JORC" },
    ],
    icon: Sparkles,
  },
  {
    id: "market",
    depth: "-1000m",
    depthNum: 1000,
    title: "Market Data & Investor Syndication",
    subtitle: "Global Capital Markets & Institutional Reach",
    color: "from-[#0E1E33] to-[#152B47]",
    accent: "#00E5FF",
    desc: "Transforming verified underground assay intercepts into Tier-1 news syndication, institutional investor roadshows, and capital liquidity.",
    metrics: [
      { label: "Monthly Reach", value: "150,000+" },
      { label: "Fund Syndication", value: "Global" },
      { label: "Market Focus", value: "TSX / ASX / NYSE" },
    ],
    icon: TrendingUp,
  },
];

export const GeologicalStrata: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState<number>(2); // Default to gold vein

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const active = STRATA_LAYERS[activeLayer];

  return (
    <section
      ref={containerRef}
      id="geological-journey"
      className="relative overflow-hidden bg-[#071322] text-white py-20 md:py-32 border-t border-b border-white/10 font-sans"
    >
      {/* Background grain */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#FFF_1px,transparent_1px)] opacity-[0.025] [background-size:18px_18px]" />

      <div className="container-editorial relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#D4AF37]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
              Interactive Geological Cross-Section // 0.0m → -1000m
            </span>
          </div>
          <h2 className="mt-4 font-serif text-3xl font-normal leading-[1.08] tracking-[-0.02em] text-white sm:text-5xl lg:text-6xl">
            From the deep bedrock to global capital.
          </h2>
          <p className="mt-4 text-base font-normal leading-relaxed text-[#F0F4F8]/75 sm:text-lg">
            Mining value isn’t just excavated — it’s proven, verified, and articulated. Click any stratum layer to inspect the geological transformation in real time.
          </p>
        </div>

        {/* --- Interactive Geological Cutaway + Telemetry Display --- */}
        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 items-center">
          
          {/* LEFT: VISUAL GEOLOGICAL CUTAWAY ILLUSTRATION */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <div className="relative rounded-2xl border border-white/15 bg-[#0A1A2F] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
              
              {/* Header Telemetry Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 px-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#00E5FF] animate-pulse" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#00E5FF]">
                    Geological Core Scanner
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#D4AF37]">
                  Depth: {active.depth}
                </span>
              </div>

              {/* Cross-Section Graphic SVG / Canvas Layers */}
              <div className="relative mt-4 h-[360px] sm:h-[420px] w-full rounded-xl overflow-hidden bg-[#040C17] border border-white/10">
                
                {/* SVG Strata Landscape Illustration */}
                <svg
                  viewBox="0 0 500 400"
                  className="absolute inset-0 h-full w-full object-cover"
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* Gradients */}
                    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0B1E36" />
                      <stop offset="100%" stopColor="#142B4D" />
                    </linearGradient>
                    <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2A3D59" />
                      <stop offset="100%" stopColor="#182A42" />
                    </linearGradient>
                    <linearGradient id="oreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#23344D" />
                      <stop offset="100%" stopColor="#182436" />
                    </linearGradient>
                    <linearGradient id="bedrockGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1A1813" />
                      <stop offset="100%" stopColor="#0D0C0A" />
                    </linearGradient>
                    <linearGradient id="goldVeinGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="50%" stopColor="#FFF3B0" />
                      <stop offset="100%" stopColor="#D4AF37" />
                    </linearGradient>
                    <linearGradient id="dataGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0E233D" />
                      <stop offset="100%" stopColor="#061220" />
                    </linearGradient>
                  </defs>

                  {/* LAYER 01: SKY & SURFACE MOUNTAIN TERRAIN (Y: 0 to 100) */}
                  <rect x="0" y="0" width="500" height="90" fill="url(#skyGrad)" />
                  {/* Mountain Silhouettes */}
                  <polygon points="0,90 80,35 160,85 240,25 340,75 420,30 500,80 500,100 0,100" fill="url(#mountainGrad)" />
                  <polygon points="0,95 120,55 200,85 300,45 380,85 500,60 500,100 0,100" fill="#2E4463" opacity="0.6" />
                  {/* Drill Rig Vector Glyphs on Surface */}
                  <path d="M 120,55 L 120,40 M 115,55 L 125,55 M 117,40 L 123,40" stroke="#FFD700" strokeWidth="2" />
                  <path d="M 300,45 L 300,30 M 295,45 L 305,45 M 297,30 L 303,30" stroke="#FFD700" strokeWidth="2" />

                  {/* Surface Level Line */}
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="4,4" />
                  <text x="15" y="94" fill="#D4AF37" fontSize="10" fontFamily="monospace" fontWeight="bold">0.0m SURFACE</text>

                  {/* LAYER 02: SEDIMENTARY STRATA & CORE HOLES (Y: 100 to 210) */}
                  <rect x="0" y="100" width="500" height="110" fill="url(#oreGrad)" />
                  {/* Geological Stratum Bands */}
                  <path d="M 0,135 Q 150,120 300,145 T 500,130" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
                  <path d="M 0,170 Q 200,185 350,165 T 500,180" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none" />
                  {/* Drill Holes Penetrating Down */}
                  <line x1="120" y1="55" x2="160" y2="290" stroke="#00E5FF" strokeWidth="1.5" strokeDasharray="3,3" />
                  <line x1="300" y1="45" x2="270" y2="290" stroke="#00E5FF" strokeWidth="1.5" strokeDasharray="3,3" />
                  
                  <line x1="0" y1="210" x2="500" y2="210" stroke="#7EB6FF" strokeWidth="1" strokeDasharray="4,4" />
                  <text x="15" y="204" fill="#7EB6FF" fontSize="10" fontFamily="monospace" fontWeight="bold">-250m ORE HORIZON</text>

                  {/* LAYER 03: DEEP BEDROCK & GOLD VEINS (Y: 210 to 320) */}
                  <rect x="0" y="210" width="500" height="110" fill="url(#bedrockGrad)" />
                  {/* Radiant Glowing Golden Veins */}
                  <path
                    d="M 50,230 Q 140,280 200,240 T 360,280 T 480,250"
                    stroke="url(#goldVeinGrad)"
                    strokeWidth="4"
                    fill="none"
                    filter="drop-shadow(0px 0px 8px #FFD700)"
                  />
                  <path
                    d="M 120,290 Q 180,260 250,295 T 420,270"
                    stroke="url(#goldVeinGrad)"
                    strokeWidth="3.5"
                    fill="none"
                    filter="drop-shadow(0px 0px 8px #FFD700)"
                  />
                  {/* Mineral Node Sparks */}
                  <circle cx="160" cy="250" r="4" fill="#FFF3B0" filter="drop-shadow(0 0 6px #FFD700)" />
                  <circle cx="280" cy="275" r="5" fill="#FFF3B0" filter="drop-shadow(0 0 8px #FFD700)" />
                  <circle cx="360" cy="280" r="4" fill="#FFF3B0" filter="drop-shadow(0 0 6px #FFD700)" />

                  <line x1="0" y1="320" x2="500" y2="320" stroke="#FFD700" strokeWidth="1" strokeDasharray="4,4" />
                  <text x="15" y="314" fill="#FFD700" fontSize="10" fontFamily="monospace" fontWeight="bold">-600m GOLD VEIN SEAM</text>

                  {/* LAYER 04: MARKET TRANSMISSION DATA GRID (Y: 320 to 400) */}
                  <rect x="0" y="320" width="500" height="80" fill="url(#dataGrad)" />
                  {/* Data Network Grid */}
                  <path d="M 0,350 L 500,350 M 0,380 L 500,380 M 100,320 L 100,400 M 250,320 L 250,400 M 400,320 L 400,400" stroke="rgba(0,229,255,0.18)" strokeWidth="1" />
                  <circle cx="250" cy="350" r="4" fill="#00E5FF" filter="drop-shadow(0 0 6px #00E5FF)" />
                  <circle cx="400" cy="380" r="3" fill="#00E5FF" />
                  <text x="15" y="375" fill="#00E5FF" fontSize="10" fontFamily="monospace" fontWeight="bold">-1000m MARKET DATA</text>
                </svg>

                {/* Active Layer Highlight Scanner Band */}
                <motion.div
                  className="absolute inset-x-0 border-y-2 pointer-events-none transition-all duration-500"
                  style={{
                    top: `${activeLayer * 25}%`,
                    height: "25%",
                    borderColor: active.accent,
                    background: `linear-gradient(90deg, ${active.accent}15, transparent, ${active.accent}15)`,
                  }}
                />
              </div>

              {/* Quick Layer Switcher Pills */}
              <div className="mt-4 grid grid-cols-4 gap-1.5">
                {STRATA_LAYERS.map((layer, idx) => (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => setActiveLayer(idx)}
                    className={`rounded-lg py-2 px-1 text-center font-mono text-[10px] font-semibold transition-all cursor-pointer ${
                      activeLayer === idx
                        ? "bg-[#D4AF37] text-[#071322] shadow-md font-bold"
                        : "bg-white/5 text-[#F0F4F8]/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {layer.depth}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: INTERACTIVE TELEMETRY & STRATUM DETAILS */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="rounded-2xl border border-white/15 bg-gradient-to-br from-[#0D223F] via-[#102A4C] to-[#0A1A30] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="grid h-12 w-12 place-items-center rounded-xl border"
                      style={{
                        borderColor: `${active.accent}50`,
                        backgroundColor: `${active.accent}15`,
                        color: active.accent,
                      }}
                    >
                      <active.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold uppercase tracking-[0.16em]" style={{ color: active.accent }}>
                        Depth {active.depth} // Active Stratum
                      </span>
                      <h3 className="font-serif text-2xl font-normal text-white sm:text-3xl">
                        {active.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-sm sm:text-base font-normal leading-relaxed text-[#F0F4F8]/80">
                  {active.desc}
                </p>

                {/* Metrics Readout */}
                <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
                  {active.metrics.map((m) => (
                    <div key={m.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                      <span className="block font-mono text-[9px] uppercase tracking-wider text-[#F0F4F8]/60">
                        {m.label}
                      </span>
                      <span className="mt-1 block font-mono text-sm font-bold sm:text-base" style={{ color: active.accent }}>
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Quick Next/Prev Layer Selector */}
            <div className="flex items-center justify-between px-2 text-xs font-mono text-[#F0F4F8]/60">
              <span>Click stratum graphic or buttons to descend/ascend</span>
              <span className="text-[#D4AF37]">Stratum {activeLayer + 1} of 4</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default GeologicalStrata;

