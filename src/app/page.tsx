"use client";

// Imported per-module rather than through the sections barrel: the barrel also re-exports
// WorldMapHero, which statically imports the world-atlas TopoJSON and would land in this
// page's bundle even though nothing here renders it.
import { GlobeHero } from "@/components/sections/GlobeHero";
import { Stats } from "@/components/sections/Stats";
import { About } from "@/components/sections/About";
import { TrustedBy } from "@/components/sections/TrustedBy";
import { ServicesScrollStory } from "@/components/sections/ServicesScrollStory";
import { MiningTimelineHUD } from "@/components/ui/MiningTimelineHUD";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#F2F2F0]">
      {/* GLOBAL MINING STORY TIMELINE HUD */}
      <MiningTimelineHUD />

      {/* SCENE 01: ROTATING HEMISPHERE HERO */}
      <GlobeHero />

      {/* SCENE 02: MARKET INFLUENCE & AUDIENCE REACH (STATS) */}
      <div className="relative z-20">
        <Stats />
      </div>

      {/* SCENE 03: EDITORIAL JOURNEY & EXPERTISE */}
      <About />
      <TrustedBy />

      {/* SCENE 04: END-TO-END DELIVERY PIPELINE (SERVICES) */}
      <ServicesScrollStory />
    </div>
  );
}
