"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
  HIDDEN_RISE,
  HIDDEN_RULE_X,
  MaskedWords,
  revealBlocks,
  useAboutMotion,
} from "./reveal";

/*
 * Section 02 — Our Origin.
 *
 * The founding, told as a convergence: two people, two backgrounds, one platform. Every
 * fact in here is from miningdiscovery.com/about-us — the year, the two names, the two
 * backgrounds, the six beats, and the closing conviction.
 */

const BEATS = [
  "Corporate actions",
  "Sustainability",
  "Exploration",
  "Regulation",
  "Investor relations",
  "Innovation",
];

export const AboutOrigin: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const storyRef = useRef<HTMLDivElement | null>(null);

  useAboutMotion(sectionRef, () => {
    if (headerRef.current) revealBlocks(headerRef.current);
    if (storyRef.current) revealBlocks(storyRef.current, { stagger: 0.07 });
  });

  return (
    <section ref={sectionRef} className="border-b border-[#E5E4DE] bg-white">
      <div className="container-editorial py-20 md:py-28">
        {/* --- Header: the year, and what it was --------------------------------- */}
        <div ref={headerRef} className="grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div data-about-rule-x className={`h-0.5 w-12 bg-[#B8860B] ${HIDDEN_RULE_X}`} />
            <span
              data-about-reveal
              className={`mt-6 block text-xs font-semibold uppercase tracking-[0.15em] text-[#B8860B] ${HIDDEN_RISE}`}
            >
              Our Origin
            </span>

            <p
              data-about-reveal
              className={`mt-8 font-geist text-[clamp(4rem,10vw,7.5rem)] font-semibold leading-[0.9] tracking-[-0.05em] tabular-nums text-[#0B1F3A] ${HIDDEN_RISE}`}
            >
              2022
            </p>
          </div>

          <div className="lg:col-span-8 lg:border-l lg:border-[#E5E4DE] lg:pl-12">
            <h2 className="max-w-[18ch] font-serif text-[clamp(2rem,4.2vw,3.25rem)] font-normal leading-[1.1] tracking-[-0.02em] text-[#0B1F3A]">
              <MaskedWords text="A shared vision." />
            </h2>

            <p
              data-about-reveal
              className={`mt-8 text-xl font-normal leading-relaxed text-[#3A3D42] sm:text-2xl ${HIDDEN_RISE}`}
            >
              Mining Discovery began with a shared vision: to bring clarity and depth to a
              mining sector often clouded by noise and half-truths. We recognised the
              industry lacked a strong, trustworthy voice dedicated to the stories that
              actually matter.
            </p>
          </div>
        </div>

        {/* --- The animated convergence flow -------------------------------------- */}
        <div className="mt-20 flex flex-col items-center md:mt-24">
          <ConvergenceFlow />
        </div>

        {/* --- What that platform covers ------------------------------------------ */}
        <div ref={storyRef} className="mt-20 grid grid-cols-1 gap-x-16 gap-y-10 md:mt-24 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <span
              data-about-reveal
              className={`block text-xs font-semibold uppercase tracking-[0.15em] text-[#B8860B] ${HIDDEN_RISE}`}
            >
              What We Cover
            </span>

            <p
              data-about-reveal
              className={`mt-6 text-lg font-normal leading-relaxed text-[#57595E] sm:text-xl ${HIDDEN_RISE}`}
            >
              Mining isn&apos;t just rocks and machines. It is people, communities,
              economies, and a meaningful share of the planet&apos;s future — and we set out
              to build a platform that honours all of that.
            </p>
          </div>

          <div className="lg:col-span-8 lg:border-l lg:border-[#E5E4DE] lg:pl-12">
            <ul className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
              {BEATS.map((beat, index) => (
                <li
                  key={beat}
                  data-about-reveal
                  className={`group flex items-baseline gap-4 border-b border-[#E5E4DE] py-3.5 px-3 -mx-3 rounded-lg transition-all duration-300 hover:bg-[#FAF5E8]/50 cursor-default ${HIDDEN_RISE}`}
                >
                  <span className="font-mono text-[11px] tabular-nums text-[#B8860B] font-bold transition-transform duration-300 group-hover:scale-110">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base font-medium text-[#1A1D21] sm:text-lg transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#0B1F3A]">
                    {beat}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

const ConvergenceFlow: React.FC = () => {
  return (
    <div className="w-full max-w-3xl flex flex-col items-center">
      {/* Row 1: The Founders (Converge horizontally from left and right) */}
      <div className="flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, x: -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="group flex-1 rounded-2xl border border-[#E5E4DE] bg-white px-6 py-5 text-center shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60 hover:shadow-md"
        >
          <p className="font-serif text-xl font-normal tracking-[-0.01em] text-[#0B1F3A] sm:text-2xl transition-colors group-hover:text-[#B8860B]">
            Gaurav Sharma
          </p>
          <p className="mt-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#9E7208]">
            Founder
          </p>
        </motion.div>

        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, delay: 0.25, ease: "backOut" }}
          aria-hidden="true"
          className="shrink-0 self-center font-serif text-xl leading-none text-[#B8860B] sm:text-2xl"
        >
          +
        </motion.span>

        <motion.div
          initial={{ opacity: 0, x: 35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="group flex-1 rounded-2xl border border-[#E5E4DE] bg-white px-6 py-5 text-center shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60 hover:shadow-md"
        >
          <p className="font-serif text-xl font-normal tracking-[-0.01em] text-[#0B1F3A] sm:text-2xl transition-colors group-hover:text-[#B8860B]">
            Sagar Bakshi
          </p>
          <p className="mt-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#9E7208]">
            Director & Co-Founder
          </p>
        </motion.div>
      </div>

      {/* Connector 1: Draws down with glowing golden beam */}
      <div className="relative my-4 h-12 w-px overflow-hidden bg-[#E5E4DE] md:h-14">
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.35, ease: "easeInOut" }}
          className="origin-top h-full w-full bg-gradient-to-b from-[#B8860B] via-[#E0B544] to-[#B8860B] shadow-[0_0_8px_#E0B544]"
        />
      </div>

      {/* Row 2: What They Brought */}
      <div className="flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="group flex-1 rounded-2xl border border-[#E5E4DE] bg-white px-6 py-5 text-center shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60 hover:shadow-md"
        >
          <p className="font-serif text-xl font-normal tracking-[-0.01em] text-[#0B1F3A] sm:text-2xl transition-colors group-hover:text-[#B8860B]">
            Mining Markets
          </p>
        </motion.div>

        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, delay: 0.5, ease: "backOut" }}
          aria-hidden="true"
          className="shrink-0 self-center font-serif text-xl leading-none text-[#B8860B] sm:text-2xl"
        >
          +
        </motion.span>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="group flex-1 rounded-2xl border border-[#E5E4DE] bg-white px-6 py-5 text-center shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60 hover:shadow-md"
        >
          <p className="font-serif text-xl font-normal tracking-[-0.01em] text-[#0B1F3A] sm:text-2xl transition-colors group-hover:text-[#B8860B]">
            Strategic Communication
          </p>
        </motion.div>
      </div>

      {/* Connector 2: Draws down with glowing golden beam */}
      <div className="relative my-4 h-12 w-px overflow-hidden bg-[#E5E4DE] md:h-14">
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.6, ease: "easeInOut" }}
          className="origin-top h-full w-full bg-gradient-to-b from-[#B8860B] via-[#E0B544] to-[#B8860B] shadow-[0_0_8px_#E0B544]"
        />
      </div>

      {/* Row 3: The Pinnacle Outcome — Mining Discovery (Est. 2022) */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="group w-full rounded-2xl border border-[#B8860B]/40 bg-[#FAF5E8] px-8 py-6 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#B8860B] hover:shadow-[0_10px_30px_rgba(184,134,11,0.2)]"
      >
        <p className="font-serif text-2xl sm:text-3xl font-normal tracking-[-0.01em] text-[#0B1F3A] transition-colors group-hover:text-[#B8860B]">
          Mining Discovery
        </p>
        <p className="mt-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#9E7208]">
          Est. 2022
        </p>
      </motion.div>
    </div>
  );
};

export default AboutOrigin;
