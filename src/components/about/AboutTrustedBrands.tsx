"use client";

import React, { useState } from "react";
import { TRUSTED_BRANDS, type TrustedBrand } from "@/data/trustedBrands";

const BrandLogo: React.FC<{ brand: TrustedBrand }> = ({ brand }) => {
  const [available, setAvailable] = useState(true);

  if (!available) {
    return (
      <span className="px-3 text-center font-sans text-xs font-bold tracking-tight text-[#081121]">
        {brand.name}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brand.logo}
      alt={`${brand.name} logo`}
      className="h-[3.8rem] w-auto max-w-full object-contain sm:h-[4.4rem] lg:h-[5rem] transition-all duration-300 group-hover:scale-105"
      style={{ mixBlendMode: "multiply" }}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setAvailable(false)}
    />
  );
};

export const AboutTrustedBrands: React.FC = () => {
  return (
    <section className="w-full border-t border-gray-200 bg-white py-12 sm:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
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

      {/* Marquee Row 1 */}
      <div className="relative flex w-full flex-col overflow-hidden">
        <div className="group flex flex-row overflow-hidden p-2 gap-4">
          <div className="animate-marquee flex shrink-0 flex-row justify-around gap-4 group-hover:[animation-play-state:paused]">
            {TRUSTED_BRANDS.map((brand) => (
              <div
                key={`b1-${brand.name}`}
                className="group relative flex h-24 sm:h-28 lg:h-32 w-40 sm:w-48 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:bg-gray-100/80 hover:border-[#B8860B]/40"
              >
                <BrandLogo brand={brand} />
              </div>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="animate-marquee flex shrink-0 flex-row justify-around gap-4 group-hover:[animation-play-state:paused]"
          >
            {TRUSTED_BRANDS.map((brand) => (
              <div
                key={`b2-${brand.name}`}
                className="group relative flex h-24 sm:h-28 lg:h-32 w-40 sm:w-48 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:bg-gray-100/80 hover:border-[#B8860B]/40"
              >
                <BrandLogo brand={brand} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutTrustedBrands;
