"use client";

import React from "react";

const PURPOSES = [
  {
    num: "1",
    title: "Illuminate the Industry",
    description: "Report clearly on exploration, production, regulation, investment, and ESG.",
  },
  {
    num: "2",
    title: "Insight into Action",
    description: "Interpret the news so that leaders and investors can make informed decisions.",
  },
  {
    num: "3",
    title: "Foster Transparency",
    description: "Provide a clear view of company operations, risks, and community impact.",
  },
  {
    num: "4",
    title: "Build Bridges",
    description: "Connecting firms, investors, regulators, and communities through journalism and data.",
  },
];

export const AboutPurpose: React.FC = () => {
  return (
    <section className="bg-[#081121] relative overflow-hidden py-20 sm:py-24 text-white">
      {/* Background radial gold glow */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_50%_50%,#B8860B_0%,transparent_70%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-14 sm:mb-20">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white uppercase">
            Our <span className="text-[#B8860B]">Purpose</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {PURPOSES.map((purpose) => (
            <div
              key={purpose.num}
              className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20"
            >
              <div className="bg-[#B8860B] text-[#081121] mb-6 flex size-10 items-center justify-center rounded-full font-black text-base shadow-md">
                {purpose.num}
              </div>
              <h4 className="mb-4 text-xl font-black tracking-tighter text-white uppercase">
                {purpose.title}
              </h4>
              <p className="text-sm leading-relaxed font-medium text-gray-300">
                {purpose.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutPurpose;
