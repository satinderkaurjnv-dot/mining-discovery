"use client";

import React, { useEffect, useState, useRef } from "react";

export interface ParallaxState {
  glowX: number;
  glowY: number;
  orbitX: number;
  orbitY: number;
  tiltX: number;
  tiltY: number;
}

export interface CursorParallaxProps {
  children: (parallax: ParallaxState) => React.ReactNode;
  disabled?: boolean;
}

export const CursorParallax: React.FC<CursorParallaxProps> = ({
  children,
  disabled = false,
}) => {
  const [parallax, setParallax] = useState<ParallaxState>({
    glowX: 0,
    glowY: 0,
    orbitX: 0,
    orbitY: 0,
    tiltX: 0,
    tiltY: 0,
  });

  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Disable on touch devices or reduced motion
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (disabled || isTouch || reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalized coords from -1 to 1
      const nx = (e.clientX / innerWidth) * 2 - 1;
      const ny = (e.clientY / innerHeight) * 2 - 1;
      targetRef.current = { x: nx, y: ny };
    };

    window.addEventListener("mousemove", handleMouseMove);

    const updateLoop = () => {
      // Lerp for smooth spring easing
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.05;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.05;

      const { x, y } = currentRef.current;

      setParallax({
        glowX: -x * 7, // Moves 5-8px opposite to cursor
        glowY: -y * 7,
        orbitX: x * 12, // Moves 10-15px with cursor
        orbitY: y * 12,
        tiltX: -y * 2.5, // 2-3 deg max tilt
        tiltY: x * 2.5,
      });

      animFrameId.current = requestAnimationFrame(updateLoop);
    };

    animFrameId.current = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [disabled]);

  return <>{children(parallax)}</>;
};
