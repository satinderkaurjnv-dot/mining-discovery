"use client";

import React, { useRef, useState, useCallback } from "react";
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

  // Opacity fade for scene transition into next section (Stats)
  const sceneOpacity = useTransform(smoothProgress, [0.88, 0.98], [1, 0]);

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
      : sp < 0.52
      ? {
          badge: "PHASE 05 // ORE LOADING & REEF EXTRACTION",
          title: "Deep Reef Ore Loading Sequence",
          desc: "Underground loader scoops raw gold-bearing quartz boulders from the reef face, dumping high-grade mineralized ore into the haul truck bed.",
        }
      : sp < 0.62
      ? {
          badge: "PHASE 06 // TRUCK TURNAROUND IN CAVERN",
          title: "360° Cavern Turnaround & Steering",
          desc: "The haul truck executes a realistic turnaround inside the subterranean cavern, steering through 360° perspective.",
        }
      : sp < 0.72
      ? {
          badge: "PHASE 07 // CAVE EXIT & FALLING ORE TRAIL",
          title: "Portal Exit & Falling Ore Gravity Physics",
          desc: "Camera follows behind as the haul truck exits into daylight. Small mineral rock fragments drop under physical gravity and bounce on the road.",
        }
      : sp < 0.80
      ? {
          badge: "PHASE 08 // OPEN-PIT HORIZONTAL JOURNEY",
          title: "Open-Pit Haul Road Transit",
          desc: "Emerging into daylight, the haul truck traverses wide open-pit mine benches against a sweeping sunlit mountain vista.",
        }
      : sp < 0.88
      ? {
          badge: "PHASE 09 // 90° VERTICAL RAMP TRANSITION",
          title: "90° Curved Mining Ramp Ascent",
          desc: "The horizontal route transitions 90° upward into an elevated vertical mining ramp with smooth, continuous perspective.",
        }
      : {
          badge: "PHASE 10 // AIRCRAFT LOGISTICS & GOLD DUST TRAIL",
          title: "Industrial Cargo Flight & Mineral Release",
          desc: "Heavy industrial transport aircraft soars across sunlit mountain peaks, releasing a controlled stream of fine gold mineral dust.",
        };

  return (
    <section
      ref={containerRef}
      className="relative h-[550vh] w-full bg-white"
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

        {/* --- Top Right: Live Industrial Vehicle Telemetry ------------------- */}
        <div className="pointer-events-none absolute right-6 top-8 z-20 hidden flex-col items-end gap-2 text-right sm:flex sm:right-12 sm:top-12">
          <div className="rounded-xl border border-[#0B1F3A]/10 bg-white/85 p-4 font-mono text-[11px] backdrop-blur-md shadow-[0_10px_30px_rgba(11,31,58,0.08)]">
            <div className="flex items-center justify-between gap-6 border-b border-[#0B1F3A]/10 pb-2">
              <span className="text-[#64748B]">MINING HAULAGE SYSTEM</span>
              <span className="flex items-center gap-1.5 text-[#059669]">
                <span className="h-2 w-2 rounded-full bg-[#059669] animate-ping" />
                ACTIVE
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[#64748B]">Speed</div>
                <div className="text-sm font-semibold text-[#0B1F3A]">
                  {telemetry.speedKmh}{" "}
                  <span className="text-[10px] font-normal text-[#64748B]">KM/H</span>
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[#64748B]">Path Vector</div>
                <div className="text-sm font-semibold text-[#B8860B]">{telemetry.gear}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[#64748B]">Elevation</div>
                <div className="text-sm font-semibold text-[#0B1F3A]">
                  {sp < 0.26 ? "PORTAL" : sp < 0.58 ? "-420m CAVE" : sp < 0.84 ? "OPEN PIT" : "+1,850m SKY"}
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[#64748B]">Ore Payload</div>
                <div className="text-sm font-semibold text-[#059669]">
                  320 TONS 24K Au
                </div>
              </div>
            </div>

            <div className="mt-3 border-t border-[#0B1F3A]/10 pt-2 text-[9px] text-[#64748B]">
              CAT-797F // HEAVY RIGID HAULAGE // CONTINUOUS JOURNEY
            </div>
          </div>
        </div>

        {/* --- Bottom Center: Interactive Scroll Indicator ------------------ */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#64748B]">
            Scroll to Experience the Mining Journey
          </span>
          <div className="h-6 w-3.5 rounded-full border border-[#0B1F3A]/25 p-0.5">
            <div
              className="h-1.5 w-1.5 rounded-full bg-[#B8860B] transition-transform duration-75"
              style={{
                transform: `translateY(${Math.min(scrollVal * 12, 12)}px)`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
