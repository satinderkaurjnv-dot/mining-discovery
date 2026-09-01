"use client";

import React, { useEffect, useState } from "react";

export interface SeismicSweepProps {
  className?: string;
  disabled?: boolean;
}

export const SeismicSweep: React.FC<SeismicSweepProps> = ({
  className = "",
  disabled = false,
}) => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(isReduced);
  }, []);

  if (disabled || reducedMotion) return null;

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* 360-Degree Rotating Gold Seismic Radar Sweep Cone */}
      <div className="relative w-[750px] h-[750px] flex items-center justify-center">
        <div
          className="w-full h-full rounded-full animate-[spin_10s_linear_infinite]"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, rgba(212, 175, 55, 0.25) 0deg, rgba(184, 134, 11, 0.08) 35deg, transparent 70deg)",
            maskImage:
              "radial-gradient(circle at center, transparent 30%, black 70%)",
            WebkitMaskImage:
              "radial-gradient(circle at center, transparent 30%, black 70%)",
          }}
        />

        {/* Concentric Seismic Wave Rings Pulsing Outward */}
        <div className="absolute w-[450px] h-[450px] rounded-full border border-[#D4AF37]/20 animate-[ping_8s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-[#D4AF37]/15 animate-[ping_8s_cubic-bezier(0,0,0.2,1)_infinite_2s]" />
      </div>
    </div>
  );
};
