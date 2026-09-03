"use client";

import React, { useState } from "react";
import { Navigation } from "lucide-react";

export interface OrbitTooltipsProps {
  className?: string;
  disabled?: boolean;
}

interface OrbitDot {
  id: string;
  name: string;
  region: string;
  commodity: string;
  top: string;
  left: string;
  color: string;
}

const orbitDots: OrbitDot[] = [
  {
    id: "perth",
    name: "Perth",
    region: "Western Australia",
    commodity: "Gold & Iron Ore",
    top: "38%",
    left: "14%",
    color: "#D4AF37",
  },
  {
    id: "toronto",
    name: "Toronto",
    region: "Canada Capital",
    commodity: "Mining Finance & Gold",
    top: "22%",
    left: "48%",
    color: "#D4AF37",
  },
  {
    id: "santiago",
    name: "Santiago",
    region: "Chile",
    commodity: "Copper & Lithium Hub",
    top: "76%",
    left: "82%",
    color: "#D4AF37",
  },
  {
    id: "johannesburg",
    name: "Johannesburg",
    region: "South Africa",
    commodity: "Platinum & Diamonds",
    top: "62%",
    left: "64%",
    color: "#FFFFFF",
  },
];

export const OrbitTooltips: React.FC<OrbitTooltipsProps> = ({
  className = "",
  disabled = false,
}) => {
  const [activeDot, setActiveDot] = useState<OrbitDot | null>(null);

  if (disabled) return null;

  return (
    <div className={`absolute inset-0 pointer-events-auto z-30 ${className}`}>
      {orbitDots.map((dot) => {
        const isHovered = activeDot?.id === dot.id;

        return (
          <div
            key={dot.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ top: dot.top, left: dot.left }}
            onMouseEnter={() => setActiveDot(dot)}
            onMouseLeave={() => setActiveDot(null)}
          >
            {/* Pulsing Interactive Marker Ring */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                isHovered
                  ? "bg-[#D4AF37]/40 scale-125 shadow-[0_0_15px_#D4AF37]"
                  : "bg-transparent group-hover:bg-white/20"
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full transition-transform duration-300 group-hover:scale-125"
                style={{ backgroundColor: dot.color }}
              />
            </div>

            {/* Hover Tooltip Popup */}
            <div
              className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#0B1F3A]/95 text-white border border-[#D4AF37]/50 rounded-lg shadow-xl backdrop-blur-md whitespace-nowrap transition-all duration-200 pointer-events-none ${
                isHovered
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-1 scale-95"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Navigation className="w-3 h-3 text-[#D4AF37]" />
                <span>{dot.name}</span>
                <span className="text-[10px] font-normal text-[#D4AF37]">
                  • {dot.region}
                </span>
              </div>
              <div className="text-[10px] text-[#E5E5E3]/80 font-mono mt-0.5">
                {dot.commodity}
              </div>
              
              {/* Tooltip Down Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0B1F3A]" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
