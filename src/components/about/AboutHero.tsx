"use client";

import React, { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

export const AboutHero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be restricted until user interaction
      });
    }
  }, []);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#081121] min-h-[75vh] sm:min-h-[82vh] lg:min-h-[88vh] flex items-end select-none">
      {/* -------------------------------------------------------------------- */}
      {/* 01. FULL-BLEED CINEMATIC BACKGROUND VIDEO                           */}
      {/* -------------------------------------------------------------------- */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#081121]">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          poster="/about/open-pit-golden-hour.png"
          onLoadedData={() => setVideoLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${
            videoLoaded ? "opacity-100 scale-100" : "opacity-85 scale-105"
          }`}
        >
          <source src="/assets/mining-journey.mp4" type="video/mp4" />
        </video>

        {/* Cinematic Vignette & Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#081121] via-black/45 to-black/55 z-10" />
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, transparent 40%, rgba(8, 17, 33, 0.75) 100%)",
          }}
        />

        {/* Subtle grid pattern overlay for high-tech editorial touch */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] z-10 pointer-events-none" />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 02. HERO CONTENT OVERLAY (MATCHING UNITED CARRIERS EDITORIAL STYLE)   */}
      {/* -------------------------------------------------------------------- */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-14 sm:pb-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          {/* Left Column: Big Bold Typography */}
          <div className="lg:col-span-8">
            <p className="text-sm sm:text-base md:text-lg font-medium text-white/90 mb-3 tracking-wide">
              Your trusted partner for
            </p>

            <h1 className="font-sans text-[clamp(2.5rem,6.2vw,5.5rem)] font-black uppercase leading-[0.94] tracking-tighter text-white">
              <span className="block">GLOBAL MINING</span>
              <span className="block text-white">MEDIA &amp;</span>
              <span className="block text-[#B8860B]">INTELLIGENCE</span>
            </h1>
          </div>

          {/* Right Column: Narrative Summary with Gold Border Line */}
          <div className="lg:col-span-4 lg:pb-2">
            <div className="border-l-2 border-[#B8860B] pl-5 sm:pl-6 backdrop-blur-xs">
              <p className="text-sm sm:text-base leading-relaxed font-medium text-white/85">
                Your trusted partner in global mining intelligence, exploration news, and corporate storytelling — combining deep industry reach with powerful digital marketing to deliver visibility across the resources sector.
              </p>
            </div>
          </div>
        </div>

        {/* Subtle Audio Toggle Control at Bottom Right */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={toggleSound}
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/80 hover:text-white transition-all backdrop-blur-md"
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
