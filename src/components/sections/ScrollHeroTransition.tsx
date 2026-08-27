"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, MotionStyle } from "framer-motion";

export interface HeroMotionStyles {
  heroStyle?: MotionStyle;
  buttonsStyle?: MotionStyle;
  globeStyle?: MotionStyle;
}

export interface ScrollHeroTransitionProps {
  renderHero: (motionStyles: HeroMotionStyles) => React.ReactNode;
  nextSection: React.ReactNode;
}

export const ScrollHeroTransition: React.FC<ScrollHeroTransitionProps> = ({
  renderHero,
  nextSection,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobileOrReduced, setIsMobileOrReduced] = useState(false);

  useEffect(() => {
    const checkMediaQuery = () => {
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isMobile = window.innerWidth < 768;
      setIsMobileOrReduced(isReduced || isMobile);
    };

    checkMediaQuery();
    window.addEventListener("resize", checkMediaQuery);
    return () => window.removeEventListener("resize", checkMediaQuery);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Physics spring for silky-smooth scroll progress without abrupt steps or lag
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  // Stage 1: Headline editorial text & CTAs exit upward (0.00 -> 0.40)
  const heroY = useTransform(smoothProgress, [0, 0.40], ["0%", "-50%"]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.35], [1, 0]);

  const buttonsY = useTransform(smoothProgress, [0, 0.35], ["0%", "-40%"]);
  const buttonsOpacity = useTransform(smoothProgress, [0, 0.30], [1, 0]);

  // Stage 2: Globe continuous transform & elegant handoff (0.00 -> 0.75)
  const globeScale = useTransform(smoothProgress, [0, 0.70], [1, 1.25]);
  const globeX = useTransform(smoothProgress, [0, 0.70], ["0%", "4%"]);
  const globeRotate = useTransform(smoothProgress, [0, 1.00], [0, 30]);
  const globeOpacity = useTransform(smoothProgress, [0.35, 0.75], [1, 0]);

  // Stage 3: Master hero dark container opacity transition (0.45 -> 0.80)
  const masterHeroOpacity = useTransform(smoothProgress, [0.45, 0.80], [1, 0]);

  // Hard pointer-events and visibility cutoff once HERO_COMPLETE is reached (progress >= 0.80 / 0.90)
  const pointerEvents = useTransform(smoothProgress, (progress) =>
    progress >= 0.80 ? "none" : "auto"
  );
  const heroVisibility = useTransform(smoothProgress, (progress) =>
    progress >= 0.90 ? "hidden" : "visible"
  );

  // Stage 4: Next section (Stats) slides up & crossfades over hero (0.35 -> 0.95)
  const nextSectionY = useTransform(smoothProgress, [0.35, 0.95], ["30vh", "0vh"]);
  const nextSectionOpacity = useTransform(smoothProgress, [0.35, 0.70], [0, 1]);

  if (isMobileOrReduced) {
    return (
      <div className="relative">
        {renderHero({})}
        <div>{nextSection}</div>
      </div>
    );
  }

  return (
    <>
      {/* 180vh STABLE PINNED HERO TRANSITION CONTAINER */}
      <div ref={containerRef} className="relative h-[180vh]">
        {/* STICKY HERO VIEWPORT (Base dark navy canvas z-10) */}
        <div className="sticky top-0 h-screen overflow-hidden z-10 flex flex-col justify-center bg-[#0B1220]">

          {/* Master Hero Wrapper */}
          <motion.div
            style={{
              opacity: masterHeroOpacity,
              pointerEvents,
              visibility: heroVisibility,
            }}
            className="w-full h-full flex flex-col justify-center"
          >
            {renderHero({
              heroStyle: { y: heroY, opacity: heroOpacity },
              buttonsStyle: { y: buttonsY, opacity: buttonsOpacity },
              globeStyle: {
                scale: globeScale,
                x: globeX,
                rotate: globeRotate,
                opacity: globeOpacity,
              },
            })}
          </motion.div>
        </div>
      </div>

      {/* NEXT SECTION (STATS) — Z-20 OVERLAYS THE HERO WITH CONTINUOUS OPACITY & Y CROSSFADE */}
      <motion.div
        style={{ y: nextSectionY, opacity: nextSectionOpacity }}
        className="relative z-20 bg-[#FBFBFA] -mt-[40vh] shadow-[0_-20px_50px_rgba(11,18,32,0.3)]"
      >
        {/* Top Gradient Handoff Strip */}
        <div className="absolute -top-16 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-[#FBFBFA] pointer-events-none" />
        {nextSection}
      </motion.div>
    </>
  );
};
