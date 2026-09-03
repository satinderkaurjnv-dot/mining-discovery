"use client";

import React, { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { MiningTruckScene } from "./MiningTruckScene";
import { TelemetryState, STRATA_DATA } from "./truckTypes";
import { Activity, Compass, Database, Layers, Radio, Sparkles, Zap } from "lucide-react";

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
    stiffness: 95,
    damping: 24,
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

  // Stage narrative badges & copy
  const sp = scrollVal;
  const stage =
    sp < 0.08
      ? {
          badge: "PHASE 01 // MOUNTAIN & PORTAL ESTABLISHING",
          title: "Wide Open-Pit Portal Establishing View",
          desc: "Cinematic wide-angle view of the reinforced underground mine portal as natural daylight illuminates the steep mountain bench.",
        }
      : sp < 0.18
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
      className="relative h-[800vh] w-full bg-white"
      aria-label="Interactive 3D Mining Truck and Subsurface Discovery Animation"
    >
      {/* Pinned 100vh Sticky Canvas Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* 3D WebGL Canvas Layer */}
        <motion.div style={{ opacity: sceneOpacity }} className="absolute inset-0 h-full w-full">
          <MiningTruckScene
            scrollProgress={scrollVal}
            onTelemetry={handleTelemetry}
            className="h-full w-full"
          />
        </motion.div>

        {/* --- Top Left: Stage Story Narrative Badge -------------------------- */}
        <div className="pointer-events-none absolute left-6 top-8 z-20 max-w-[420px] sm:left-12 sm:top-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B8860B]/35 bg-white/85 px-3.5 py-1.5 backdrop-blur-md shadow-xs">
            <Radio className="h-3.5 w-3.5 animate-pulse text-[#B8860B]" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9E7208] sm:text-[11px]">
              {stage.badge}
            </span>
          </div>

          <h2 className="mt-3 font-geist text-2xl font-bold uppercase leading-tight tracking-[-0.02em] text-[#0B1F3A] sm:text-3xl lg:text-4xl">
            {stage.title}
          </h2>
          <p className="mt-2 font-geist text-xs leading-relaxed text-[#475569] sm:text-sm">
            {stage.desc}
          </p>
        </div>

        {/* --- Side-of-Road Vertical Journey Typography (sp >= 0.84) --- */}
        <AnimatePresence mode="wait">
          {sp >= 0.84 && (
            <motion.div
              key={sp < 0.895 ? "milestone-1" : sp < 0.95 ? "milestone-2" : "milestone-3"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="pointer-events-none absolute bottom-12 left-6 z-20 max-w-[460px] sm:bottom-16 sm:left-12"
            >
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#9E7208]">
                {sp < 0.895
                  ? "MILESTONE 01 // PRECISION TRAMMING"
                  : sp < 0.95
                  ? "MILESTONE 02 // AUTONOMOUS HAULAGE"
                  : "MILESTONE 03 // SUSTAINABLE MINING"}
              </div>
              <h1 className="mt-1 font-geist text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-[#0B1F3A] sm:text-5xl lg:text-6xl">
                {sp < 0.895 ? (
                  <>
                    RELIABILITY <br />
                    <span className="text-[#64748B]">AT EVERY</span> <br />
                    SEAM
                  </>
                ) : sp < 0.95 ? (
                  <>
                    AUTONOMOUS <br />
                    <span className="text-[#64748B]">FLEET</span> <br />
                    DISPATCH
                  </>
                ) : (
                  <>
                    HIGH-YIELD <br />
                    <span className="text-[#64748B]">MINERAL</span> <br />
                    DISCOVERY
                  </>
                )}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
