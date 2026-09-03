"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TRUSTED_BRANDS, type TrustedBrand } from "@/data/trustedBrands";

const BrandLogo: React.FC<{ brand: TrustedBrand }> = ({ brand }) => {
  const [available, setAvailable] = useState(true);

  if (!available) {
    return (
      <span className="px-3 text-center font-sans text-xs font-semibold tracking-tight text-[#57595E]">
        {brand.name}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brand.logo}
      alt={`${brand.name} logo`}
      className="h-auto w-full max-w-[130px] sm:max-w-[145px] object-contain opacity-65 grayscale transition-all duration-300 ease-out group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105"
      style={{ mixBlendMode: "multiply" }}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setAvailable(false)}
    />
  );
};

export const AboutTrustedBrands: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative border-b border-[#E5E4DE] bg-white py-16 md:py-24 overflow-hidden">
      <div className="container-editorial relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 md:mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-0.5 w-10 bg-[#B8860B]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#9E7208]">
              Trusted Brands
            </span>
          </div>

          <h2 className="font-serif text-[clamp(2.25rem,4.5vw,3.75rem)] font-normal leading-[1.08] tracking-[-0.025em] text-[#0B1F3A]">
            The companies we work with.
          </h2>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* EDITORIAL ASYMMETRIC LOGO WALL (No Marquee)                        */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {TRUSTED_BRANDS.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={reduceMotion ? {} : { opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.5,
                delay: (index % 6) * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group flex h-[105px] sm:h-[120px] items-center justify-center rounded-xl border border-[#E5E4DE] bg-[#FAF9F5] p-4 transition-all duration-300 hover:bg-white hover:border-[#B8860B]/40 hover:shadow-sm"
            >
              <BrandLogo brand={brand} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutTrustedBrands;
