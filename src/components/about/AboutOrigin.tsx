"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export const AboutOrigin: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const yearY = useTransform(scrollYProgress, [0, 1], [35, -35]);
  const strataOpacity = useTransform(scrollYProgress, [0.1, 0.5, 0.9], [0.05, 0.25, 0.05]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-[#E5E4DE] bg-white py-16 md:py-24"
    >
      {/* -------------------------------------------------------------------- */}
      {/* GEOLOGICAL STRATA UNCOVER ANIMATION                                  */}
      {/* -------------------------------------------------------------------- */}
      <motion.div
        style={{ opacity: reduceMotion ? 0.15 : strataOpacity }}
        className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      >
        <svg
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
        >
          <path
            d="M-50,220 C280,180 580,320 940,240 C1240,170 1480,280 1600,240"
            stroke="rgba(184, 134, 11, 0.3)"
            strokeWidth="1.2"
            strokeDasharray="4 8"
          />
          <path
            d="M-80,440 C320,380 640,510 1020,420 C1320,350 1520,460 1650,420"
            stroke="rgba(11, 31, 58, 0.12)"
            strokeWidth="1"
          />
          <path
            d="M-40,660 C260,600 620,740 980,650 C1280,580 1500,690 1620,660"
            stroke="rgba(184, 134, 11, 0.2)"
            strokeWidth="1"
          />
        </svg>
      </motion.div>

      <div className="container-editorial relative z-10">
        {/* Header Grid: 2022 & A Shared Vision */}
        <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-12 items-start">
          {/* LEFT: Origin Label & Monumental Year 2022 */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-0.5 w-12 bg-[#B8860B]" />
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#9E7208]">
                Our Origin
              </span>
            </div>

            {/* Monumental Year 2022 with Parallax Drift */}
            <motion.p
              style={{ y: reduceMotion ? 0 : yearY }}
              className="font-geist text-[clamp(5.5rem,14vw,10.5rem)] font-bold leading-[0.85] tracking-[-0.06em] tabular-nums text-[#0B1F3A] select-none"
            >
              2022
            </motion.p>
          </div>

          {/* RIGHT: A shared vision & narrative */}
          <div className="lg:col-span-7 lg:border-l lg:border-[#E5E4DE] lg:pl-14">
            <motion.h2
              initial={reduceMotion ? {} : { opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-[clamp(2.25rem,4.5vw,3.75rem)] font-normal leading-[1.08] tracking-[-0.025em] text-[#0B1F3A]"
            >
              A shared vision.
            </motion.h2>

            <motion.p
              initial={reduceMotion ? {} : { opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 text-xl font-normal leading-relaxed text-[#3A3D42] sm:text-2xl"
            >
              Mining Discovery began with a shared vision: to bring clarity and depth to a
              mining sector often clouded by noise and half-truths. We recognised the
              industry lacked a strong, trustworthy voice dedicated to the stories that
              actually matter.
            </motion.p>
          </div>
        </div>

        {/* --- Convergence Flow: Two Founders, Two Strengths, One Platform --------- */}
        <div className="mt-24 md:mt-32">
          <ConvergenceFlow />
        </div>
      </div>
    </section>
  );
};

const ConvergenceFlow: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* Row 1: The Founders */}
      <div className="flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="group flex-1 rounded-2xl border border-[#E5E4DE] bg-[#FAF9F5] px-7 py-6 text-center shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60 hover:shadow-md"
        >
          <p className="font-serif text-2xl font-normal tracking-[-0.01em] text-[#0B1F3A] transition-colors group-hover:text-[#B8860B]">
            Gaurav Sharma
          </p>
          <p className="mt-2 font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#9E7208]">
            Founder
          </p>
        </motion.div>

        <motion.span
          initial={reduceMotion ? {} : { opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "backOut" }}
          aria-hidden="true"
          className="shrink-0 self-center font-serif text-2xl text-[#B8860B]"
        >
          +
        </motion.span>

        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="group flex-1 rounded-2xl border border-[#E5E4DE] bg-[#FAF9F5] px-7 py-6 text-center shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60 hover:shadow-md"
        >
          <p className="font-serif text-2xl font-normal tracking-[-0.01em] text-[#0B1F3A] transition-colors group-hover:text-[#B8860B]">
            Sagar Bakshi
          </p>
          <p className="mt-2 font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#9E7208]">
            Director & Co-Founder
          </p>
        </motion.div>
      </div>

      {/* Connector 1: Thin Elegant Gold Vertical Beam */}
      <div className="relative my-4 h-12 w-px overflow-hidden bg-[#E5E4DE]">
        <motion.div
          initial={reduceMotion ? {} : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeInOut" }}
          className="origin-top h-full w-full bg-[#B8860B]"
        />
      </div>

      {/* Row 2: What They Brought */}
      <div className="flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="group flex-1 rounded-2xl border border-[#E5E4DE] bg-[#FAF9F5] px-7 py-6 text-center shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60 hover:shadow-md"
        >
          <p className="font-serif text-xl sm:text-2xl font-normal tracking-[-0.01em] text-[#0B1F3A] transition-colors group-hover:text-[#B8860B]">
            Mining Markets
          </p>
        </motion.div>

        <motion.span
          initial={reduceMotion ? {} : { opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, delay: 0.45, ease: "backOut" }}
          aria-hidden="true"
          className="shrink-0 self-center font-serif text-2xl text-[#B8860B]"
        >
          +
        </motion.span>

        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="group flex-1 rounded-2xl border border-[#E5E4DE] bg-[#FAF9F5] px-7 py-6 text-center shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60 hover:shadow-md"
        >
          <p className="font-serif text-xl sm:text-2xl font-normal tracking-[-0.01em] text-[#0B1F3A] transition-colors group-hover:text-[#B8860B]">
            Strategic Communication
          </p>
        </motion.div>
      </div>

      {/* Connector 2: Thin Elegant Gold Vertical Beam */}
      <div className="relative my-4 h-12 w-px overflow-hidden bg-[#E5E4DE]">
        <motion.div
          initial={reduceMotion ? {} : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.55, ease: "easeInOut" }}
          className="origin-top h-full w-full bg-[#B8860B]"
        />
      </div>

      {/* Row 3: The Pinnacle Outcome — Mining Discovery (Est. 2022) */}
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 20, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="group w-full rounded-2xl border border-[#B8860B]/30 bg-[#FAF5E8] px-8 py-7 text-center shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#B8860B] hover:shadow-md"
      >
        <p className="font-serif text-2xl sm:text-3xl font-normal tracking-[-0.01em] text-[#0B1F3A] transition-colors group-hover:text-[#B8860B]">
          Mining Discovery
        </p>
        <p className="mt-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#9E7208]">
          Est. 2022
        </p>
      </motion.div>
    </div>
  );
};

export default AboutOrigin;
