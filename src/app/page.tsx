"use client";

import { GlobeHero } from "@/components/sections/GlobeHero";
import { Stats } from "@/components/sections/Stats";
import { MiningTruckStory } from "@/components/sections/truck/MiningTruckStory";
import { About } from "@/components/sections/About";
import { TrustedBy } from "@/components/sections/TrustedBy";
import { ServicesScrollStory } from "@/components/sections/ServicesScrollStory";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#DFE7F3]">
      {/* SCENE 01: ROTATING HEMISPHERE GLOBE HERO */}
      <GlobeHero />

      {/* SCENE 02: MARKET INFLUENCE & AUDIENCE REACH (THE COUNT / STATS) */}
      <div className="relative z-20">
        <Stats />
      </div>

      {/* SCENE 03: 3D ULTRA-CLASS MINING HAUL TRUCK JOURNEY */}
      <MiningTruckStory />

      {/* SCENE 04: EDITORIAL JOURNEY & TRUSTED COMPANIES */}
      <About />
      <TrustedBy />

      {/* SCENE 05: END-TO-END DELIVERY PIPELINE (SERVICES) */}
      <ServicesScrollStory />
    </div>
  );
}
