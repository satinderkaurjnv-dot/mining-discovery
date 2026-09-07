"use client";

import React from "react";

export const AboutOrigin: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <div className="mb-6">
            <h2 className="text-[#0B1F3A] text-2xl sm:text-3xl font-bold tracking-tight">
              Origin of Mining <span className="text-[#B8860B]">Discovery</span>
            </h2>
            <div className="mt-3 flex items-center">
              <div className="size-2.5 shrink-0 rounded-full bg-[#B8860B]" />
              <div className="h-px w-40 bg-gradient-to-r from-[#0B1F3A] to-transparent" />
            </div>
          </div>
          <div className="mt-8 space-y-6 text-base leading-relaxed font-medium text-gray-600">
            <p>
              Mining Discovery began in 2022, founded by{" "}
              <strong className="text-[#0B1F3A] font-bold">Gaurav Sharma</strong> and{" "}
              <strong className="text-[#0B1F3A] font-bold">Sagar Bakshi</strong> with a shared vision: to bring
              clarity and depth to a field often clouded by noise and half-truths. Both coming from different backgrounds
              — mining markets and strategic communication — they realised the mining sector lacked a strong,
              trustworthy voice dedicated to the stories that matter: corporate actions, sustainability, exploration,
              regulation, investor relations, and innovation.
            </p>
            <p>
              They believed that mining isn&apos;t just about rocks and machines; it&apos;s about people, communities,
              economies, and the future of our planet. And they set out to build a platform that honors all of that.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutOrigin;
