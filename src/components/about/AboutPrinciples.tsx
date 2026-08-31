"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const PRINCIPLES = [
  { num: "01", name: "Integrity", description: "Truthful and verified reporting." },
  { num: "02", name: "Clarity", description: "Complex issues explained in clear, impactful language." },
  { num: "03", name: "Innovation", description: "New tools and formats that keep coverage relevant." },
  {
    num: "04",
    name: "Respect",
    description: "Consideration for communities, the environment, investors, and workers.",
  },
  { num: "05", name: "Partnership", description: "Collaboration with companies, experts, and institutions." },
];

export const AboutPrinciples: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number>(0);

  return (
    <section className="relative border-b border-[#E5E4DE] bg-[#F7F5EF] py-16 md:py-20 overflow-hidden">
      {/* Background Subtle Technical Grid & Geological Contour Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute inset-0 bg-[radial-gradient(#0B1F3A_1px,transparent_1px)] opacity-[0.035] [background-size:24px_24px]" />
        <svg
          viewBox="0 0 1200 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-0 top-0 w-full h-full opacity-20 pointer-events-none"
        >
          <path
            d="M0,100 Q300,40 600,120 T1200,70"
            stroke="#B8860B"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <path
            d="M0,240 Q400,180 800,260 T1200,200"
            stroke="#0B1F3A"
            strokeWidth="0.75"
          />
        </svg>
      </div>

      <div className="container-editorial relative z-10">
        {/* Section Header */}
        <div className="mb-10 md:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-0.5 w-10 bg-[#B8860B]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#9E7208]">
              Our Principles
            </span>
          </div>

          <h2 className="font-serif text-[clamp(2.25rem,4.5vw,3.75rem)] font-normal leading-[1.08] tracking-[-0.025em] text-[#0B1F3A]">
            What we hold to.
          </h2>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* DESKTOP: EDITORIAL HORIZONTAL PANORAMIC STORY                      */}
        {/* ------------------------------------------------------------------ */}
        <div className="hidden lg:grid grid-cols-5 gap-4">
          {PRINCIPLES.map((principle, index) => {
            const isActive = activeIdx === index;

            return (
              <div
                key={principle.name}
                onMouseEnter={() => setActiveIdx(index)}
                className={`group relative rounded-2xl border p-6 flex flex-col justify-between min-h-[210px] transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-white border-[#B8860B] shadow-md -translate-y-1 z-10 opacity-100"
                    : "bg-white border-[#E5E4DE] hover:border-[#B8860B]/40 hover:-translate-y-0.5 shadow-2xs opacity-100"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`font-mono text-xs font-bold transition-colors ${
                        isActive ? "text-[#B8860B]" : "text-[#9E7208]"
                      }`}
                    >
                      {principle.num}
                    </span>
                    {isActive && (
                      <motion.span
                        layoutId="principle-dot"
                        className="w-2 h-2 rounded-full bg-[#B8860B]"
                      />
                    )}
                  </div>

                  <h3 className="font-serif text-2xl xl:text-3xl font-normal leading-tight text-[#0B1F3A] transition-colors group-hover:text-[#B8860B]">
                    {principle.name}
                  </h3>
                </div>

                <p className="text-sm leading-relaxed text-[#3A3D42] border-t border-[#E5E4DE] pt-3.5 mt-4">
                  {principle.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* MOBILE: STACKED VERTICAL LIST (< 1024px)                           */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:hidden flex flex-col gap-4">
          {PRINCIPLES.map((principle) => (
            <div
              key={principle.name}
              className="rounded-xl border border-[#E5E4DE] bg-white p-5 shadow-2xs"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs font-bold text-[#B8860B]">
                  {principle.num}
                </span>
                <h3 className="font-serif text-xl font-normal text-[#0B1F3A]">
                  {principle.name}
                </h3>
              </div>
              <p className="text-sm text-[#57595E] leading-relaxed">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutPrinciples;
