"use client";

import React from "react";

export interface GlowPulseProps {
  className?: string;
  disabled?: boolean;
}

export const GlowPulse: React.FC<GlowPulseProps> = ({
  className = "",
  disabled = false,
}) => {
  if (disabled) return null;

  return (
    <div
      className={`absolute top-1/2 right-0 -translate-y-1/2 w-[720px] h-[720px] rounded-full bg-radial from-[#C39A4A]/08 via-[#17232C]/30 to-transparent blur-3xl -z-10 pointer-events-none transition-opacity duration-1000 ${className}`}
    />
  );
};
