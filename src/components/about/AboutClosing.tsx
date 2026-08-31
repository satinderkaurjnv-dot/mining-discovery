"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const AboutClosing: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-[#F7F5EF] py-28 md:py-36">
      <div className="container-editorial text-center">
        <motion.div
          initial={reduceMotion ? {} : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto h-0.5 w-12 bg-[#B8860B]"
        />

        <motion.p
          initial={reduceMotion ? {} : { opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-10 max-w-4xl font-serif text-[clamp(1.75rem,3.6vw,3rem)] font-normal leading-[1.18] tracking-[-0.02em] text-[#0B1F3A]"
        >
          Mining Discovery is the first choice for mining news and insights — covering exploration, production, regulation, investment, and ESG across global mining markets.
        </motion.p>

        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-12"
        >
          <Link
            href="/#submit-news"
            className="group inline-flex items-center gap-2 rounded-xl bg-[#0B1F3A] px-7 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-300 hover:bg-[#B8860B] hover:shadow-md"
          >
            <span>Get Featured</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutClosing;
