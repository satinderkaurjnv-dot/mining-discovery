"use client";

import React, { useState } from "react";
import { TRUSTED_BRANDS, type TrustedBrand } from "@/data/trustedBrands";

// Split 26 brands into 2 rows of 13 for multi-stream flow
const ROW_1 = TRUSTED_BRANDS.slice(0, 13);
const ROW_2 = TRUSTED_BRANDS.slice(13, 26);

const BrandCard: React.FC<{ brand: TrustedBrand }> = ({ brand }) => {
  const [available, setAvailable] = useState(true);

  return (
    <div className="group relative flex h-24 w-44 sm:h-28 sm:w-56 lg:h-32 lg:w-64 shrink-0 items-center justify-center rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#B8860B]/40 hover:shadow-md">
      {available ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.logo}
          alt={`${brand.name} logo`}
          className="h-[3.2rem] w-auto max-w-[85%] object-contain sm:h-[4rem] lg:h-[4.6rem] transition-transform duration-300 group-hover:scale-105"
          style={{ mixBlendMode: "multiply" }}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setAvailable(false)}
        />
      ) : (
        <span className="px-3 text-center font-sans text-xs font-bold tracking-tight text-[#081121] uppercase">
          {brand.name}
        </span>
      )}
    </div>
  );
};

export const AboutTrustedBrands: React.FC = () => {
  return (
    <section className="w-full border-t border-gray-200 bg-white py-14 sm:py-20 overflow-hidden select-none">
      <style>{`
        @keyframes marquee-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marquee-right {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .animate-stream-left {
          display: flex;
          width: max-content;
          animation: marquee-left 38s linear infinite;
        }
        .animate-stream-right {
          display: flex;
          width: max-content;
          animation: marquee-right 42s linear infinite;
        }
        .marquee-container:hover .animate-stream-left,
        .marquee-container:hover .animate-stream-right {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-stream-left,
          .animate-stream-right {
            animation: none !important;
          }
        }
      `}</style>

      {/* Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="mb-6">
          <h2 className="text-[#081121] text-2xl sm:text-3xl font-bold tracking-tight">
            Our Trusted <span className="text-[#B8860B]">Brands</span>
          </h2>
          <div className="mt-3 flex items-center">
            <div className="size-2.5 shrink-0 rounded-full bg-[#B8860B]" />
            <div className="h-px w-40 bg-gradient-to-r from-[#081121] to-transparent" />
          </div>
        </div>
      </div>

      {/* 2-Row Continuous Moving Stream Container */}
      <div className="marquee-container relative flex flex-col gap-4 sm:gap-6 w-full overflow-hidden">
        {/* Soft Side Fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 sm:w-16 lg:w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 sm:w-16 lg:w-24 bg-gradient-to-l from-white to-transparent" />

        {/* ROW 1 (Glides Left) */}
        <div className="overflow-hidden flex w-full">
          <div className="animate-stream-left flex gap-4 sm:gap-6 shrink-0 items-center">
            {[...ROW_1, ...ROW_1].map((brand, idx) => (
              <BrandCard key={`r1-${brand.name}-${idx}`} brand={brand} />
            ))}
          </div>
        </div>

        {/* ROW 2 (Glides Right) */}
        <div className="overflow-hidden flex w-full">
          <div className="animate-stream-right flex gap-4 sm:gap-6 shrink-0 items-center">
            {[...ROW_2, ...ROW_2].map((brand, idx) => (
              <BrandCard key={`r2-${brand.name}-${idx}`} brand={brand} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutTrustedBrands;
