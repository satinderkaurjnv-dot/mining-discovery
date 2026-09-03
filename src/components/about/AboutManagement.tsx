"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface Person {
  name: string;
  initials: string;
  role: string;
  bio: string;
  focus: string[];
}

const MANAGEMENT: Person[] = [
  {
    name: "Gaurav Sharma",
    initials: "GS",
    role: "Founder, Mining Discovery",
    bio: "Gaurav Sharma established Mining Discovery to change how the global mining industry communicates. Focusing on the U.S. and Canadian mining markets, he directs content strategy, digital marketing, and platform outreach. His expertise spans advertising, PR, eCommerce, and web development — the range behind Mining Discovery's development as a media and marketing platform connecting mining companies, investors, and professionals.",
    focus: [
      "Content Strategy",
      "Digital Marketing",
      "Platform Outreach",
      "Advertising",
      "PR",
      "eCommerce",
      "Web Development",
    ],
  },
  {
    name: "Sagar Bakshi",
    initials: "SB",
    role: "Director & Co-Founder, Mining Discovery",
    bio: "Sagar Bakshi helps build and develop the Mining Discovery platform, connecting the global mining community with a focus on U.S. and Canadian mining activities. He manages company messaging across industry news, corporate updates, and event promotions, working through advertising, public relations, brand marketing, and web development. His earlier work supported eCommerce startups through Shopify, Amazon, dropshipping, and digital marketing.",
    focus: [
      "Industry News",
      "Corporate Updates",
      "Event Promotions",
      "Advertising",
      "Public Relations",
      "Brand Marketing",
      "Web Development",
    ],
  },
];

export const AboutManagement: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative border-b border-[#E5E4DE] bg-white py-16 md:py-24 overflow-hidden">
      <div className="container-editorial relative z-10">
        {/* Section Heading */}
        <div className="max-w-3xl mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-0.5 w-10 bg-[#B8860B]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#9E7208]">
              Management
            </span>
          </div>

          <h2 className="font-serif text-[clamp(2.25rem,4.5vw,3.75rem)] font-normal leading-[1.08] tracking-[-0.025em] text-[#0B1F3A]">
            The people behind the platform.
          </h2>
        </div>

        {/* Editorial Profiles with Alternating Composition */}
        <div className="flex flex-col gap-16 md:gap-20">
          {MANAGEMENT.map((person, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={person.name}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
              >
                {/* Visual / Monogram Architectural Block */}
                <motion.div
                  initial={reduceMotion ? {} : { clipPath: "inset(0 100% 0 0)", opacity: 0 }}
                  whileInView={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                  className={`lg:col-span-4 ${isEven ? "lg:order-1" : "lg:order-2"}`}
                >
                  <div className="relative aspect-square w-full max-w-[340px] mx-auto rounded-2xl border border-[#E5E4DE] bg-[#FAF9F5] p-8 flex flex-col justify-between shadow-sm overflow-hidden group hover:border-[#B8860B]/50 transition-colors duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(#B8860B_1px,transparent_1px)] opacity-15 [background-size:12px_12px]" />
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#9E7208]">
                        Leadership
                      </span>
                      <span className="font-mono text-xs text-[#888A8E]">
                        REF #{String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="my-auto text-center py-6">
                      <span className="font-geist text-6xl md:text-7xl font-bold tracking-tight text-[#0B1F3A] group-hover:text-[#B8860B] transition-colors">
                        {person.initials}
                      </span>
                    </div>

                    <div className="border-t border-[#E5E4DE] pt-3">
                      <p className="font-mono text-[11px] font-semibold text-[#0B1F3A]">
                        {person.name}
                      </p>
                      <p className="text-[10.5px] font-mono text-[#57595E] truncate">
                        {person.role}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Narrative & Focus Remit */}
                <motion.div
                  initial={reduceMotion ? {} : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className={`lg:col-span-8 flex flex-col gap-6 ${
                    isEven ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <div>
                    <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#0B1F3A] tracking-tight">
                      {person.name}
                    </h3>
                    <p className="mt-2 font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#9E7208]">
                      {person.role}
                    </p>
                  </div>

                  <p className="text-lg leading-relaxed text-[#3A3D42]">
                    {person.bio}
                  </p>

                  {/* Sequential Focus Tags */}
                  <div className="pt-4 border-t border-[#E5E4DE]">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0B1F3A] block mb-3">
                      Core Strategic Focus:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {person.focus.map((item, fIdx) => (
                        <motion.span
                          key={item}
                          initial={reduceMotion ? {} : { opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.04 * fIdx }}
                          className="px-3 py-1.5 rounded-lg border border-[#E5E4DE] bg-[#FAF9F5] font-mono text-xs text-[#3A3D42] hover:border-[#B8860B]/40 hover:bg-white transition-colors"
                        >
                          {item}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutManagement;
