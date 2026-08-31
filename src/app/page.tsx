"use client";

import { GlobeHero } from "@/components/sections/GlobeHero";
import { MiningTruckStory } from "@/components/sections/truck/MiningTruckStory";
import { CinematicHero } from "@/components/hero/CinematicHero";
import { Stats } from "@/components/sections/Stats";
import { About } from "@/components/sections/About";
import { TrustedBy } from "@/components/sections/TrustedBy";
import { ServicesScrollStory } from "@/components/sections/ServicesScrollStory";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#DFE7F3]">
      {/* SCENE 01: ROTATING HEMISPHERE GLOBE HERO */}
      <GlobeHero />

      {/* SCENE 01.5: CINEMATIC MINING TRUCK SCROLL STORY */}
      <MiningTruckStory />

      {/* SCENE 01.8: CINEMATIC 3D MINING HAUL TRUCK HERO */}
      <CinematicHero />

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
