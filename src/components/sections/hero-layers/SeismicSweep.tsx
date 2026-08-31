"use client";

import React from "react";

export interface SeismicSweepProps {
  className?: string;
  disabled?: boolean;
}

export const SeismicSweep: React.FC<SeismicSweepProps> = () => {
  // Completely disabled to remove dark blurry background shape artifacts behind headline
  return null;
};
