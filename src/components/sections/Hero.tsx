"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Globe } from "@/components/ui/Globe";
import {
  CursorParallax,
  MineralDustField,
  GlowPulse,
  StarfieldBackground,
  ConnectionArcs,
  ParallaxState,
} from "./hero-layers";
import { motion, MotionStyle } from "framer-motion";
import { ArrowRight, TrendingUp, Globe2 } from "lucide-react";

export interface HeroProps {
  /** Background Variant: "navy-topo" (solid navy + geological lines) or "dark-blur" */
  bgVariant?: "navy-topo" | "dark-blur";
  /** Layer 1: Cursor-Reactive Parallax Depth */
  enableParallax?: boolean;
  /** Layer 2: Ambient Gold/White Mineral Dust Field Canvas */
  enableMineralDust?: boolean;
  /** Layer 4: Ambient Gold Glow Breathing Pulse */
  enableGlowPulse?: boolean;
  /** Layer A: Starfield Depth Canvas Background */
  enableStarfield?: boolean;
  /** Layer B & C: Animated Connection Arcs & Floating Location Tags */
  enableConnectionArcs?: boolean;
  /** Framer Motion Scroll Styles passed from ScrollHeroTransition */
  heroStyle?: MotionStyle;
  buttonsStyle?: MotionStyle;
  globeStyle?: MotionStyle;
}

const bodyText =
  "Mining Discovery puts your exploration milestones, production updates, and corporate news directly in front of institutional investors, industry analysts, and 150,000+ mining decision-makers worldwide.";

export const Hero: React.FC<HeroProps> = ({
  bgVariant = "navy-topo",
  enableParallax = true,
  enableMineralDust = true,
  enableGlowPulse = true,
  enableStarfield = true,
  enableConnectionArcs = true,
  heroStyle,
  buttonsStyle,
  globeStyle,
}) => {
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const paragraphRef = useRef<HTMLParagraphElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const headlineWords = headlineRef.current?.querySelectorAll(".gsap-word");
      const paragraphWords = paragraphRef.current?.querySelectorAll(".gsap-body-word");

      if (headlineWords && headlineWords.length > 0) {
        const tl = gsap.timeline();

        tl.fromTo(
          headlineWords,
          {
            y: 30,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.07,
            ease: "power3.out",
          }
        );

        if (paragraphWords && paragraphWords.length > 0) {
          tl.fromTo(
            paragraphWords,
            {
              y: 20,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.015,
              ease: "power2.out",
            },
            "-=0.5"
          );
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const bodyWords = bodyText.split(" ");

  return (
    <CursorParallax disabled={!enableParallax}>
      {(parallax: ParallaxState) => (
        <section
          ref={sectionRef}
          className="relative bg-[#0B1220] text-white pt-24 pb-16 sm:pt-28 sm:pb-18 lg:pt-32 lg:pb-20 overflow-hidden font-sans w-full min-h-screen flex flex-col justify-center"
        >
          {/* LAYER A: STARFIELD DEPTH BACKGROUND CANVAS */}
          <StarfieldBackground disabled={!enableStarfield} />

          {/* CLEAN BASE BACKGROUND GRADIENT (NO OBSTRUCTING SHAPE ARTIFACTS) */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1220] via-[#0B1F3A] to-[#061224] -z-20" />

          {/* AMBIENT GOLD GLOW PULSE WITH CURSOR PARALLAX */}
          <div
            style={{
              transform: `translate3d(${parallax.glowX}px, ${parallax.glowY}px, 0)`,
              transition: "transform 0.1s linear",
            }}
          >
            <GlowPulse disabled={!enableGlowPulse} />
          </div>

          {/* MINERAL DUST PARTICLE CANVAS FIELD */}
          <MineralDustField disabled={!enableMineralDust} />

          {/* GEOLOGICAL CONTOUR LINES WITH PARALLAX */}
          {bgVariant === "navy-topo" && (
            <div
              className="absolute inset-0 -z-10 pointer-events-none opacity-[0.05] overflow-hidden transition-transform duration-100 ease-out"
              style={{
                transform: `translate3d(${parallax.glowX * 0.5}px, ${parallax.glowY * 0.5}px, 0)`,
              }}
            >
              <svg
                className="w-full h-full object-cover"
                viewBox="0 0 1200 800"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1200,100 C900,150 700,50 400,200 C100,350 50,600 0,700"
                  stroke="#D4AF37"
                  strokeWidth="2"
                />
                <path
                  d="M1200,250 C950,280 800,180 500,320 C200,460 100,680 0,800"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          )}

          {/* SUBTLE NOISE GRAIN OVERLAY */}
          <div className="absolute inset-0 -z-10 opacity-[0.025] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* MAIN VIEWPORT LAYOUT CONTAINER */}
          <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1440px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-10 items-center">
              
              {/* LEFT COLUMN: Editorial Copy & CTAs */}
              <div className="lg:col-span-6 flex flex-col items-start text-left z-20 pt-1">
                
                {/* Headline & Subheadline Motion Wrapper */}
                <motion.div style={heroStyle} className="flex flex-col items-start w-full">
                  {/* Eyebrow Badge */}
                  <div className="mb-3.5">
                    <Badge
                      variant="gold"
                      size="sm"
                      className="gap-2 shadow-sm bg-[#B8860B]/20 text-[#D4AF37] border border-[#B8860B]/40 px-3.5 py-1.5 font-sans uppercase tracking-[0.05em] text-[11px] font-semibold"
                    >
                      <Globe2 className="w-4 h-4 text-[#D4AF37]" />
                      The Voice of Global Mining
                    </Badge>
                  </div>

                  {/* GSAP Animated Headline */}
                  <h1
                    ref={headlineRef}
                    className="font-serif text-3xl sm:text-5xl lg:text-6xl xl:text-[62px] font-normal text-white leading-[1.08] sm:leading-[1.06] tracking-[-0.015em] mb-4"
                  >
                    <span className="inline-block gsap-word mr-2.5 sm:mr-3">Where</span>
                    <span className="inline-block gsap-word mr-2.5 sm:mr-3">Mining</span>
                    <span className="inline-block gsap-word mr-2.5 sm:mr-3">Companies</span>
                    <span className="inline-block gsap-word mr-2.5 sm:mr-3">Get</span>
                    <span className="inline-block gsap-word relative text-white">
                      <span className="relative z-10">Discovered</span>
                      <svg
                        className="absolute -bottom-1.5 left-0 w-full h-3 text-[#D4AF37]"
                        viewBox="0 0 100 20"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M 0 14 Q 45 4, 100 12"
                          stroke="currentColor"
                          strokeWidth="4.5"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    .
                  </h1>

                  {/* Subheadline Paragraph — mb-8 (+8px breathing room to CTAs) */}
                  <p
                    ref={paragraphRef}
                    className="font-sans text-sm sm:text-lg lg:text-xl text-[#E5E5E3]/95 leading-relaxed mb-8 max-w-lg lg:max-w-xl font-normal"
                  >
                    {bodyWords.map((word, idx) => (
                      <span
                        key={`${word}-${idx}`}
                        className="inline-block gsap-body-word mr-[0.25em]"
                      >
                        {word}
                      </span>
                    ))}
                  </p>
                </motion.div>

                {/* Dual Action CTAs Motion Wrapper */}
                <motion.div style={buttonsStyle} className="w-full">
                  <div className="flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center gap-3.5 sm:gap-4 w-full min-[420px]:w-auto">
                    <Link href="#submit-news" className="w-full min-[420px]:w-auto">
                      <Button
                        variant="gold"
                        size="lg"
                        fullWidth
                        className="font-sans font-semibold tracking-wide text-[#0B1F3A] bg-[#B8860B] hover:bg-[#D4AF37] shadow-[0_0_25px_rgba(184,134,11,0.35)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] transition-all group cursor-pointer px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base justify-center"
                      >
                        Submit Your News
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>

                    <Link href="#reach" className="w-full min-[420px]:w-auto">
                      <Button
                        variant="outline"
                        size="lg"
                        fullWidth
                        className="font-sans font-semibold tracking-wide border-white/30 text-white hover:border-white hover:bg-white/10 cursor-pointer px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base justify-center"
                      >
                        <TrendingUp className="w-4 h-4 mr-2 text-[#D4AF37]" />
                        See Our Reach
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </div>

              {/* RIGHT COLUMN: WebGL Globe Visual Motion Wrapper — Measured Gap Reduction (lg:translate-x-6 xl:translate-x-10) */}
              <motion.div
                style={globeStyle}
                className="lg:col-span-6 relative flex flex-col items-center lg:items-end justify-center z-10 mt-2 sm:mt-4 lg:-mt-4 w-full"
              >
                <div className="relative w-full max-w-[340px] sm:max-w-[480px] lg:max-w-[650px] xl:max-w-[680px] aspect-square flex justify-center items-center lg:translate-x-6 xl:translate-x-10">
                  <div
                    className="relative w-full h-full flex items-center justify-center"
                    style={{
                      transform: `translate3d(${parallax.orbitX}px, ${parallax.orbitY}px, 0) rotateX(${parallax.tiltX}deg) rotateY(${parallax.tiltY}deg)`,
                    }}
                  >
                    <ConnectionArcs disabled={!enableConnectionArcs} />
                    <div className="relative z-0 w-full h-full flex items-center justify-center">
                      <Globe size={680} className="w-full h-full" />
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>

          {/* ELEGANT INTENTIONAL HERO BOTTOM GRADIENT BOUNDARY */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-[#0B1220] pointer-events-none z-20" />
        </section>
      )}
    </CursorParallax>
  );
};
