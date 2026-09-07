"use client";

import React from "react";

const PRINCIPLES = [
  {
    title: "Integrity",
    desc: "Truthful, verified reporting above all else.",
  },
  {
    title: "Clarity",
    desc: "Explain complex issues in plain, impactful language.",
  },
  {
    title: "Innovation",
    desc: "Adopting new tools and formats to keep coverage relevant.",
  },
  {
    title: "Respect",
    desc: "Consideration for communities, environment, investors, and workers.",
  },
  {
    title: "Partnership",
    desc: "Collaborating with companies, experts, and institutions as allies.",
  },
];

export const AboutPrinciples: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-[#0B1F3A] text-2xl sm:text-3xl font-bold tracking-tight">
            Our <span className="text-[#B8860B]">Principles</span>
          </h2>
          <div className="mt-3 flex items-center">
            <div className="size-2.5 shrink-0 rounded-full bg-[#B8860B]" />
            <div className="h-px w-40 bg-gradient-to-r from-[#0B1F3A] to-transparent" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {PRINCIPLES.map((principle) => (
            <div
              key={principle.title}
              className="hover:border-[#B8860B] rounded-2xl border border-gray-100 bg-gray-50/40 p-6 sm:p-8 transition-colors duration-300 hover:shadow-md"
            >
              <h4 className="text-[#0B1F3A] mb-3 text-lg font-black tracking-tighter uppercase">
                {principle.title}
              </h4>
              <p className="text-xs leading-relaxed font-bold text-gray-600">
                {principle.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutPrinciples;
