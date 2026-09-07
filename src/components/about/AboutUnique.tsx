"use client";

import React from "react";

const UNIQUE_ITEMS = [
  {
    feature: "Industry-Focused Journalism",
    why: "We specialize in mining for depth, context, and consistency.",
  },
  {
    feature: "Integrated Approach",
    why: "We connect reporting, data, and branding — treating them as a single story.",
  },
  {
    feature: "Dual Perspective",
    why: "We address both industry professionals and community stakeholders.",
  },
  {
    feature: "Media & Digital Strength",
    why: "Editorial excellence meets SEO, visual storytelling, and syndication.",
  },
  {
    feature: "Founder-Driven Vision",
    why: "Guided by the personal commitment of our founders for purpose-driven growth.",
  },
];

export const AboutUnique: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-[#FAFAF9]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-[#081121] text-2xl sm:text-3xl font-bold tracking-tight">
            What Makes Us <span className="text-[#B8860B]">Unique</span>
          </h2>
          <div className="mt-3 flex items-center">
            <div className="size-2.5 shrink-0 rounded-full bg-[#B8860B]" />
            <div className="h-px w-40 bg-gradient-to-r from-[#081121] to-transparent" />
          </div>
        </div>

        {/* Mobile View: Stacked Responsive Cards (< sm) */}
        <div className="mt-6 flex flex-col gap-4 sm:hidden">
          {UNIQUE_ITEMS.map((item, idx) => (
            <div
              key={item.feature}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[10px] font-bold text-[#B8860B] bg-[#B8860B]/10 px-2 py-0.5 rounded-full">
                  0{idx + 1}
                </span>
                <h3 className="text-[#081121] font-black uppercase text-sm tracking-tight">
                  {item.feature}
                </h3>
              </div>
              <p className="text-xs leading-relaxed font-medium text-gray-600 pl-7">
                {item.why}
              </p>
            </div>
          ))}
        </div>

        {/* Tablet & Desktop View: Clean Table (sm+) */}
        <div className="mt-8 mx-auto max-w-5xl hidden sm:block overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#081121] text-white">
                <th className="p-6 sm:p-8 text-xs sm:text-sm font-black tracking-widest uppercase">
                  Feature
                </th>
                <th className="border-l border-white/10 p-6 sm:p-8 text-xs sm:text-sm font-black tracking-widest uppercase">
                  Why It Matters
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {UNIQUE_ITEMS.map((item) => (
                <tr key={item.feature} className="transition-colors hover:bg-gray-50/80">
                  <td className="text-[#081121] border-r border-gray-100 p-6 sm:p-8 font-black tracking-tighter uppercase text-sm sm:text-base">
                    {item.feature}
                  </td>
                  <td className="p-6 sm:p-8 font-medium text-gray-600 text-sm sm:text-base">
                    {item.why}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default AboutUnique;
