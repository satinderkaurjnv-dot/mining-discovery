"use client";

import React, { useEffect, useRef } from "react";

export interface StarfieldBackgroundProps {
  className?: string;
  disabled?: boolean;
}

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  isTwinkling: boolean;
  color: string;
}

export const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({
  className = "",
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);
  const isInViewRef = useRef(true);

  useEffect(() => {
    if (disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const starCount = 100; // 80-120 sparse stars for subtle ambient depth
    let stars: Star[] = [];

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const colors = ["#FFFFFF", "#D4AF37", "#E5E5E3", "#FAF5E8"];

      for (let i = 0; i < starCount; i++) {
        const baseAlpha = Math.random() * 0.3 + 0.1; // 10-40% opacity
        const isTwinkling = Math.random() < 0.15; // 15% twinkle

        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.2 + 0.8, // 1-2px size
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
          isTwinkling,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // 2-4px max subtle opposite mouse movement
      const nx = (e.clientX / innerWidth) * 2 - 1;
      const ny = (e.clientY / innerHeight) * 2 - 1;
      mouseRef.current = { x: -nx * 3, y: -ny * 3 };
    };

    window.addEventListener("mousemove", handleMouseMove);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    let time = 0;

    const render = () => {
      if (!isInViewRef.current) {
        animFrameId.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.02;

      ctx.save();
      ctx.translate(mouseRef.current.x, mouseRef.current.y);

      for (let star of stars) {
        if (!prefersReduced && star.isTwinkling) {
          star.alpha =
            star.baseAlpha +
            Math.sin(time * star.twinkleSpeed * 10 + star.twinklePhase) * 0.15;
          star.alpha = Math.max(0.05, Math.min(0.5, star.alpha));
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.fill();
      }

      ctx.restore();
      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [disabled]);

  if (disabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none -z-30 ${className}`}
    />
  );
};
