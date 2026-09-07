"use client";

import React from "react";

export const AboutHero: React.FC = () => {
  return (
    <section className="bg-[#081121] pt-28 pb-14 sm:pt-36 sm:pb-16 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-white md:text-5xl tracking-tight">
          About <span className="text-[#FF6B4A]">Us</span>
        </h1>
      </div>
    </section>
  );
};

export default AboutHero;
