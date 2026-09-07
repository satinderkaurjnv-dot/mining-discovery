"use client";

import React from "react";
import Link from "next/link";

export const AboutLookingAhead: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#081121] relative overflow-hidden rounded-3xl p-8 sm:p-14 lg:p-20 shadow-2xl text-left">
          <div className="mb-6">
            <h2 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
              Looking <span className="text-[#B8860B]">Ahead</span>
            </h2>
            <div className="mt-3 flex items-center">
              <div className="size-2.5 shrink-0 rounded-full bg-[#B8860B]" />
              <div className="h-px w-40 bg-gradient-to-r from-white/60 to-transparent" />
            </div>
          </div>

          <div className="relative z-10 max-w-4xl">
            <p className="mb-10 sm:mb-12 text-base sm:text-lg leading-relaxed font-medium text-gray-300">
              Mining Discovery aims to be the trusted global voice in mining — expanding coverage in Africa, Latin
              America, and Asia, developing advanced data tools, enriching video storytelling, and nurturing an
              engaged community that values truth over noise.
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-xl bg-[#B8860B] hover:bg-[#9E7208] px-8 sm:px-12 py-4 text-xs sm:text-sm font-black tracking-widest text-white uppercase shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Explore Services
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/20 hover:border-[#B8860B] hover:bg-white/5 px-8 sm:px-12 py-4 text-xs sm:text-sm font-black tracking-widest text-white uppercase transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutLookingAhead;
