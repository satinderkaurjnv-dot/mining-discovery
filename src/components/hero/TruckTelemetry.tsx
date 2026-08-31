"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TruckTelemetryProps {
  speedKmh: number;
  gear: string;
  payloadTons: number;
  elevation: number;
  scrollProgress: number;
}

function AnimatedValue({ value, unit }: { value: string; unit?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="text-white font-semibold tabular-nums"
    >
      {value}
      {unit && (
        <span className="text-[10px] font-normal text-[#9CA3AF] ml-0.5">{unit}</span>
      )}
    </motion.span>
  );
}

export const TruckTelemetry: React.FC<TruckTelemetryProps> = ({
  speedKmh,
  gear,
  payloadTons,
  elevation,
  scrollProgress,
}) => {
  const isScanning = scrollProgress >= 0.35 && scrollProgress <= 0.72;

  return (
    <motion.div
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
      className="pointer-events-none select-none"
    >
      <div className="rounded-xl border border-white/10 bg-[#0D1018]/82 p-4 backdrop-blur-md shadow-2xl shadow-black/60 min-w-[210px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
            Truck Telemetry
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] font-medium text-[#10B981]">
            <motion.span
              className="h-2 w-2 rounded-full bg-[#10B981]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            ONLINE
          </span>
        </div>

        {/* Grid values */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-3 font-mono text-[11px]">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-[#6B7280] mb-0.5">Speed</div>
            <AnimatedValue value={String(speedKmh)} unit="KM/H" />
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-[#6B7280] mb-0.5">Gear / Drive</div>
            <span className="text-[#D4AF37] font-bold text-sm">{gear}</span>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-[#6B7280] mb-0.5">Payload</div>
            <AnimatedValue value={String(payloadTons)} unit="TONS" />
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-[#6B7280] mb-0.5">Elevation</div>
            <AnimatedValue value={String(elevation)} unit="M EL" />
          </div>
        </div>

        {/* Scanning indicator */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-2.5 border-t border-[#D4AF37]/20">
                <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-[#D4AF37]">
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.7, repeat: Infinity }}
                  >
                    ◆
                  </motion.span>
                  Subsurface Scan Active
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coordinates */}
        <div className="mt-3 border-t border-white/8 pt-2">
          <div className="text-[9px] font-mono text-[#4B5563]">
            52° 21&apos; 44&quot; N / 121° 54&apos; 18&quot; W
          </div>
        </div>
      </div>
    </motion.div>
  );
};
