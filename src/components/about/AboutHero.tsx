"use client";

import React, { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Sparkles } from "lucide-react";

interface MiningVideoScene {
  id: number;
  title: string;
  badge: string;
  src: string;
}

const MINING_SCENES: MiningVideoScene[] = [
  {
    id: 1,
    title: "Subterranean Mine & Tunnel Exploration",
    badge: "SCENE 01 // CAVE TRANSIT",
    src: "/assets/cave-mining-1.mp4",
  },
  {
    id: 2,
    title: "Heavy Underground Extraction & Drilling",
    badge: "SCENE 02 // ORE EXTRACTION",
    src: "/assets/cave-mining-2.mp4",
  },
];

export const AboutHero: React.FC = () => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentScene = MINING_SCENES[currentSceneIndex];

  // When scene changes, load and play new video
  useEffect(() => {
    if (videoRef.current) {
      setVideoLoaded(false);
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Autoplay may be restricted until user interaction
      });
    }
  }, [currentSceneIndex]);

  // Advance to next video when the current one ends for seamless continuous story
  const handleVideoEnded = () => {
    setCurrentSceneIndex((prev) => (prev + 1) % MINING_SCENES.length);
  };

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#081121] min-h-[78vh] sm:min-h-[85vh] lg:min-h-[92vh] flex items-end select-none">
      {/* -------------------------------------------------------------------- */}
      {/* 01. FULL-BLEED CINEMATIC BACKGROUND UNDERGROUND MINING VIDEO          */}
      {/* -------------------------------------------------------------------- */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#081121]">
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          playsInline
          preload="auto"
          onEnded={handleVideoEnded}
          onLoadedData={() => setVideoLoaded(true)}
          poster="/about/open-pit-golden-hour.png"
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
            videoLoaded ? "opacity-100 scale-100" : "opacity-40 scale-105"
          }`}
        >
          <source src={currentScene.src} type="video/mp4" />
        </video>

        {/* Deep cinematic Vignette & dark midnight navy gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#081121] via-[#081121]/50 to-black/60 z-10" />
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, transparent 35%, rgba(8, 17, 33, 0.8) 100%)",
          }}
        />

        {/* Subtle high-tech grid matrix overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] z-10 pointer-events-none" />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 02. HERO CONTENT OVERLAY (EDITORIAL TYPOGRAPHY + SCENE SWITCHER)     */}
      {/* -------------------------------------------------------------------- */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 sm:pb-16 lg:pb-18">
        {/* Top Floating Badge for Active Cave Operation */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#B8860B]/30 bg-black/60 px-3.5 py-1 text-xs font-semibold tracking-widest text-[#B8860B] backdrop-blur-md">
          <Sparkles className="size-3 text-[#B8860B]" />
          <span>{currentScene.badge}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          {/* Left Column: Big Bold Typography */}
          <div className="lg:col-span-8">
            <p className="text-sm sm:text-base md:text-lg font-medium text-white/90 mb-3 tracking-wide">
              Your trusted partner for
            </p>

            <h1 className="font-sans text-[clamp(2.4rem,5.8vw,5.2rem)] font-black uppercase leading-[0.94] tracking-tighter text-white">
              <span className="block">GLOBAL MINING</span>
              <span className="block text-white">MEDIA &amp;</span>
              <span className="block text-[#B8860B]">INTELLIGENCE</span>
            </h1>
          </div>

          {/* Right Column: Narrative Summary with Gold Accent Line */}
          <div className="lg:col-span-4 lg:pb-2">
            <div className="border-l-2 border-[#B8860B] pl-5 sm:pl-6 backdrop-blur-xs">
              <p className="text-sm sm:text-base leading-relaxed font-medium text-white/85">
                Your trusted partner in global mining intelligence, subterranean exploration news, and corporate storytelling — combining deep industry reach with powerful digital marketing to deliver visibility across the resources sector.
              </p>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------- */}
        {/* 03. FOOTER CONTROLS: SCENE SELECTOR & SOUND TOGGLE                   */}
        {/* -------------------------------------------------------------------- */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          {/* Scene Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 mr-1 hidden sm:inline">
              Mining Action:
            </span>
            {MINING_SCENES.map((scene, idx) => {
              const isActive = idx === currentSceneIndex;
              return (
                <button
                  key={scene.id}
                  onClick={() => setCurrentSceneIndex(idx)}
                  type="button"
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-[#B8860B] text-black shadow-lg shadow-[#B8860B]/20 font-bold"
                      : "bg-black/50 text-white/70 hover:text-white hover:bg-black/70 border border-white/15 backdrop-blur-md"
                  }`}
                >
                  <Play className={`size-2.5 ${isActive ? "fill-black text-black" : "text-white/60"}`} />
                  <span>{scene.title}</span>
                </button>
              );
            })}
          </div>

          {/* Audio Toggle Control */}
          <button
            onClick={toggleSound}
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-black/50 hover:bg-black/70 border border-white/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white transition-all backdrop-blur-md"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? (
              <>
                <VolumeX className="size-3.5 text-[#B8860B]" />
                <span>Sound Off</span>
              </>
            ) : (
              <>
                <Volume2 className="size-3.5 text-[#B8860B]" />
                <span>Sound On</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
