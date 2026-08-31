"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface StoryMilestone {
  id: string;
  scene: string;
  title: string;
  tag: string;
}

const MILESTONES: StoryMilestone[] = [
  { id: "hero-top", scene: "SCENE 01", title: "DISCOVER", tag: "Stake The Claim" },
  { id: "stats-section", scene: "SCENE 02", title: "EXPLORE", tag: "Global Presence" },
  { id: "about-journey", scene: "SCENE 03", title: "PROVE", tag: "Editorial Assay" },
  { id: "services-pipeline", scene: "SCENE 04", title: "INVEST", tag: "Market Delivery" },
];

export const MiningTimelineHUD: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // Only show after initial scroll down
      if (scrollY > 150) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Check section bounding rects to determine active milestone
      const sections = MILESTONES.map((m) => document.getElementById(m.id));
      let current = 0;

      sections.forEach((sec, idx) => {
        if (sec) {
          const rect = sec.getBoundingClientRect();
          if (rect.top <= vh * 0.45 && rect.bottom >= vh * 0.15) {
            current = idx;
          }
        }
      });

      setActiveIdx(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToMilestone = (id: string) => {
    if (id === "hero-top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4 }}
          className="fixed right-4 top-1/2 z-40 -translate-y-1/2 hidden md:flex flex-col items-end pointer-events-auto"
        >
          <div className="flex flex-col items-end rounded-2xl border border-white/15 bg-[#0B1F3A]/85 p-3.5 backdrop-blur-xl shadow-[0_12px_40px_rgba(11,31,58,0.4)]">
            <div className="mb-2.5 px-2 text-right">
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#D4AF37]">
                Mining Story HUD
              </span>
            </div>

            <div className="relative flex flex-col gap-2.5">
              {/* Connecting Geological Line */}
              <div className="absolute right-[11px] top-2.5 bottom-2.5 w-px bg-white/15" />

              {MILESTONES.map((item, idx) => {
                const isActive = activeIdx === idx;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToMilestone(item.id)}
                    className={`group flex items-center justify-end gap-3 rounded-lg px-2 py-1 transition-all duration-300 text-right cursor-pointer ${
                      isActive ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[8px] font-semibold text-[#D4AF37]/80">
                          {item.scene}
                        </span>
                        <span
                          className={`font-geist text-[11px] font-bold tracking-tight transition-colors duration-300 ${
                            isActive ? "text-white" : "text-[#F0F4F8]/60 group-hover:text-white"
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                      <span className="font-geist text-[9px] text-[#F0F4F8]/50">
                        {item.tag}
                      </span>
                    </div>

                    {/* Node Dot */}
                    <div className="relative grid h-6 w-6 place-items-center">
                      <span
                        className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                          isActive
                            ? "bg-[#D4AF37] scale-125 shadow-[0_0_12px_#D4AF37]"
                            : "bg-white/30 group-hover:bg-[#D4AF37]/70"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MiningTimelineHUD;
