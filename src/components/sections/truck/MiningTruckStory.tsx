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
    sp < 0.28
      ? {
          badge: "PHASE 01 // EXTRACTION ROUTE",
          title: "Autonomous Heavy Haulage",
          desc: "Ultra-class 400-ton mining truck navigating active open-pit bench gradients under central dispatch.",
        }
      : sp < 0.52
      ? {
          badge: "PHASE 02 // REAL-TIME GEOPHYSICAL SCAN",
          title: "Subsurface Radiometric LiDAR",
          desc: "Penetrating volcanic overburden and brecciated host rock to map deep hydrothermal mineralization in real-time.",
        }
      : sp < 0.82
      ? {
          badge: "PHASE 03 // DISCOVERY MOMENT CONFIRMED",
          title: "Bonanza Gold Seam Intercept",
          desc: "High-grade mineral deposit detected at -580m. Certified assay confirmation: 14.2 g/t Au true thickness.",
        }
      : {
          badge: "PHASE 04 // COMMERCIAL EXTRACTION",
          title: "Full-Cycle Value Delivery",
          desc: "From geological discovery to industrial extraction and global capital market syndication.",
        };

  return (
    <section
      ref={containerRef}
      className="relative h-[280vh] w-full bg-[#0E1218]"
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

        {/* Ambient Top & Bottom Vignette Overlays */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0E1218]/90 via-transparent to-[#0E1218]/95"
        />

        {/* --- Top Left: Stage Story Narrative Badge -------------------------- */}
        <div className="pointer-events-none absolute left-6 top-8 z-20 max-w-[420px] sm:left-12 sm:top-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/35 bg-[#141820]/80 px-3.5 py-1.5 backdrop-blur-md">
            <Radio className="h-3.5 w-3.5 animate-pulse text-[#D4AF37]" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37] sm:text-[11px]">
              {stage.badge}
            </span>
          </div>

          <h2 className="mt-3 font-geist text-2xl font-bold uppercase leading-tight tracking-[-0.02em] text-white sm:text-3xl lg:text-4xl">
            {stage.title}
          </h2>
          <p className="mt-2 font-geist text-xs leading-relaxed text-[#9CA3AF] sm:text-sm">
            {stage.desc}
          </p>
        </div>

        {/* --- Top Right: Live Industrial Vehicle Telemetry ------------------- */}
        <div className="pointer-events-none absolute right-6 top-8 z-20 hidden flex-col items-end gap-2 text-right sm:flex sm:right-12 sm:top-12">
          <div className="rounded-xl border border-white/10 bg-[#12161F]/80 p-4 font-mono text-[11px] backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between gap-6 border-b border-white/10 pb-2">
              <span className="text-[#6B7280]">TRUCK TELEMETRY</span>
              <span className="flex items-center gap-1.5 text-[#10B981]">
                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
                ONLINE
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[#6B7280]">Speed</div>
                <div className="text-sm font-semibold text-white">
                  {telemetry.speedKmh}{" "}
                  <span className="text-[10px] font-normal text-[#9CA3AF]">KM/H</span>
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[#6B7280]">Gear / Drive</div>
                <div className="text-sm font-semibold text-[#D4AF37]">{telemetry.gear}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[#6B7280]">Payload</div>
                <div className="text-sm font-semibold text-white">
                  {telemetry.payloadTons}{" "}
                  <span className="text-[10px] font-normal text-[#9CA3AF]">TONS</span>
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[#6B7280]">Elevation</div>
                <div className="text-sm font-semibold text-white">
                  {telemetry.coordinates.elevation}
                </div>
              </div>
            </div>

            <div className="mt-3 border-t border-white/10 pt-2 text-[9px] text-[#9CA3AF]">
              COORD: {telemetry.coordinates.lat} / {telemetry.coordinates.lng}
            </div>
          </div>
        </div>

        {/* --- Bottom Left: Subsurface Geological Strata Reveal HUD ----------- */}
        <AnimatePresence>
          {telemetry.scanningActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.35 }}
              className="pointer-events-none absolute bottom-8 left-6 z-20 w-[90%] max-w-[380px] sm:left-12 sm:bottom-12"
            >
              <div className="rounded-xl border border-[#D4AF37]/30 bg-[#12161F]/85 p-4 backdrop-blur-md shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#D4AF37]" />
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-white sm:text-[11px]">
                      Subsurface Strata Analysis
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-[#D4AF37]">
                    -{telemetry.scanDepthMeters}m
                  </span>
                </div>

                <div className="mt-3 space-y-2 font-mono text-[10px]">
                  {STRATA_DATA.map((layer, idx) => {
                    const isPassed = telemetry.scanDepthMeters >= layer.depthMeters;
                    return (
                      <div
                        key={layer.depth}
                        className={`flex items-center justify-between rounded-md p-1.5 transition-all duration-300 ${
                          isPassed
                            ? "bg-white/5 text-white"
                            : "opacity-40 text-[#6B7280]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: layer.accent }}
                          />
                          <span className="font-semibold">{layer.layerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {layer.grade && (
                            <span className="rounded bg-[#D4AF37]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#D4AF37]">
                              {layer.grade}
                            </span>
                          )}
                          <span className="text-[#9CA3AF]">{layer.depth}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {telemetry.discoveryActive && telemetry.detectedDeposit && (
                  <div className="mt-3 rounded-lg border border-[#D4AF37] bg-[#D4AF37]/15 p-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#FFDF78]">
                      <Sparkles className="h-3.5 w-3.5 text-[#FFDF78]" />
                      Discovery Verified: {telemetry.detectedDeposit.mineral}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[9px] text-white">
                      <span>Grade: {telemetry.detectedDeposit.grade}</span>
                      <span>{telemetry.detectedDeposit.width}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Bottom Center: Interactive Scroll Indicator ------------------ */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#9CA3AF]">
            Scroll to Drive Vehicle & Explore
          </span>
          <div className="h-6 w-3.5 rounded-full border border-white/25 p-0.5">
            <div
              className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] transition-transform duration-75"
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
