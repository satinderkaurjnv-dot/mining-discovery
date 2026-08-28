"use client";

import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  WorldMap,
  CityData,
  ConnectionData,
  DEFAULT_CITIES,
  DEFAULT_CONNECTIONS,
  EXTENDED_CITIES,
  EXTENDED_CONNECTIONS,
  projectGeoTo2D,
} from "@/components/ui/WorldMap";
import { StarfieldBackground, MineralDustField, GlowPulse } from "./hero-layers";

export interface WorldMapHeroProps {
  initialCities?: CityData[];
  initialConnections?: ConnectionData[];
}

/**
 * CLOCKWISE CAMERA TRAJECTORY ENGINE
 * Sign Convention: Strictly increasing unwrapped longitude (Δ > 0) guarantees 100% clockwise orbital camera sweep around the globe.
 *
 * Unwrapped Longitudes (Eastward Clockwise Progression):
 * 1. Toronto:      lngUnwrapped = -79.383°
 * 2. Johannesburg: lngUnwrapped = +28.047°    (Δ = +107.43° Eastward/Clockwise)
 * 3. Perth:        lngUnwrapped = +115.861°   (Δ = +87.81° Eastward/Clockwise)
 * 4. Santiago:     lngUnwrapped = +289.331°   (Δ = +173.47° Eastward/Clockwise across Pacific)
 * 5. Udaipur:      lngUnwrapped = +433.7125°  (Δ = +144.38° Eastward/Clockwise across Indian Ocean)
 *
 * Total Clockwise Sweep = 513.10°
 */
const UNWRAPPED_LONGITUDES: Record<string, number> = {
  toronto: -79.383,
  johannesburg: 28.047,
  perth: 115.861,
  santiago: 289.331,
  udaipur: 433.7125,
  london: 359.873,
};

export const WorldMapHero: React.FC<WorldMapHeroProps> = ({
  initialCities = DEFAULT_CITIES,
  initialConnections = DEFAULT_CONNECTIONS,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const [cityDataset] = useState<"5-cities" | "6-cities">("5-cities");
  const [isMobileOrReduced, setIsMobileOrReduced] = useState(false);

  const activeCities = useMemo(() => {
    return cityDataset === "6-cities" ? EXTENDED_CITIES : initialCities;
  }, [cityDataset, initialCities]);

  const activeConnections = useMemo(() => {
    return cityDataset === "6-cities" ? EXTENDED_CONNECTIONS : initialConnections;
  }, [cityDataset, initialConnections]);

  useEffect(() => {
    const checkMediaQuery = () => {
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isMobile = window.innerWidth < 768;
      setIsMobileOrReduced(isReduced || isMobile);
    };

    checkMediaQuery();
    window.addEventListener("resize", checkMediaQuery);
    return () => window.removeEventListener("resize", checkMediaQuery);
  }, []);

  // Synchronized Render State
  const [heroState, setHeroState] = useState({
    progress: 0,
    copyY: 0,
    copyOpacity: 1,
    gradientOpacity: 1,
    cameraScale: 1,
    cameraX: 0,
    cameraY: 0,
    activeCityId: null as string | null,
    activeCityIndex: -1,
    hasScrolled: false,
  });

  // Calculate all visual states from one progress value
  const calculateState = useCallback(
    (p: number) => {
      const numCities = activeCities.length;
      const clampedP = Math.max(0, Math.min(1, p));
      const hasStartedScroll = clampedP > 0.02;

      // Phase 1 & 2: Copy Exit animation (progress 0.00 -> 0.15)
      const copyExitFrac = Math.min(1, clampedP / 0.15);
      const copyY = -80 * copyExitFrac;
      const copyOpacity = 1 - copyExitFrac;
      const gradientOpacity = 1 - 0.85 * copyExitFrac;

      // Phase 3 & 4: Camera & City Chapter Calculation
      const overviewEnd = 0.15;
      const chapterEnd = 0.90;

      let targetScale = 1;
      let targetX = 0;
      let targetY = 0;
      let activeId: string | null = null;
      let activeIndex = -1;

      if (isMobileOrReduced) {
        targetScale = 1;
        targetX = 0;
        targetY = 0;
        if (clampedP > overviewEnd) {
          const chapterProgress = (clampedP - overviewEnd) / (chapterEnd - overviewEnd);
          activeIndex = Math.min(numCities - 1, Math.floor(chapterProgress * numCities));
          activeId = activeCities[activeIndex]?.id || null;
        }
      } else if (clampedP <= overviewEnd) {
        const t = clampedP / overviewEnd;
        const firstCity = activeCities[0];
        const firstProj = projectGeoTo2D(firstCity.latitude, firstCity.longitude);
        const fX = (500 - firstProj.x) * 1.25;
        const fY = (250 - firstProj.y) * 1.25;

        targetScale = 1 + 0.85 * t;
        targetX = fX * t;
        targetY = fY * t;
        activeId = t > 0.5 ? firstCity.id : null;
        activeIndex = t > 0.5 ? 0 : -1;
      } else if (clampedP >= chapterEnd) {
        // Hold final city focus (Santiago) at 1.85x scale with 0 scale snap
        const lastCity = activeCities[numCities - 1];
        const proj = projectGeoTo2D(lastCity.latitude, lastCity.longitude);
        targetScale = 1.85;
        targetX = (500 - proj.x) * 1.25;
        targetY = (250 - proj.y) * 1.25;
        activeId = lastCity.id;
        activeIndex = numCities - 1;
      } else {
        // CONTINUOUS DIRECT CAMERA INTERPOLATION ACROSS CITY CHAPTERS (STRICT 1.85x SCALE, NO OVERVIEW ZOOM-OUT RESET)
        const chapterProgress = (clampedP - overviewEnd) / (chapterEnd - overviewEnd);
        const rawIndex = chapterProgress * (numCities - 1);
        const index = Math.min(numCities - 2, Math.floor(rawIndex));
        const subFrac = rawIndex - index;

        activeIndex = subFrac > 0.5 ? Math.min(numCities - 1, index + 1) : index;
        const currentCity = activeCities[index];
        const nextCity = activeCities[Math.min(numCities - 1, index + 1)];

        const t = subFrac * subFrac * (3 - 2 * subFrac);

        const currUnwrappedLng = UNWRAPPED_LONGITUDES[currentCity.id] ?? currentCity.longitude;
        const nextUnwrappedLng = UNWRAPPED_LONGITUDES[nextCity.id] ?? nextCity.longitude;

        const interpLat = currentCity.latitude + (nextCity.latitude - currentCity.latitude) * t;
        const interpUnwrappedLng = currUnwrappedLng + (nextUnwrappedLng - currUnwrappedLng) * t;
        const wrappedLng = ((((interpUnwrappedLng + 180) % 360) + 360) % 360) - 180;

        const interpProj = projectGeoTo2D(interpLat, wrappedLng);

        targetX = (500 - interpProj.x) * 1.25;
        targetY = (250 - interpProj.y) * 1.25;
        targetScale = 1.85;
        activeId = activeCities[activeIndex].id;
      }

      return {
        progress: clampedP,
        copyY,
        copyOpacity,
        gradientOpacity,
        cameraScale: targetScale,
        cameraX: targetX,
        cameraY: targetY,
        activeCityId: activeId,
        activeCityIndex: activeIndex,
        hasScrolled: hasStartedScroll,
      };
    },
    [activeCities, isMobileOrReduced]
  );

  // Single-pass 1-to-1 scroll progress render loop (Lenis handles momentum; 0 double-smoothing lag)
  useEffect(() => {
    let heroTop = 0;
    let heroHeight = 1;

    const updateBounds = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      heroTop = window.scrollY + rect.top;
      heroHeight = Math.max(1, rect.height - window.innerHeight);
    };

    updateBounds();
    window.addEventListener("resize", updateBounds, { passive: true });

    const updateFrame = () => {
      const scrollY = window.scrollY;
      const rawProgress = Math.max(0, Math.min(1, (scrollY - heroTop) / heroHeight));

      const newState = calculateState(rawProgress);
      setHeroState(newState);

      // Phase 2 Instrumentation Logging
      if (rawProgress > 0.05 && rawProgress < 0.95) {
        console.log(
          `[SCROLL_SYNC_LOG] scrollY: ${scrollY.toFixed(1)}, progress: ${rawProgress.toFixed(3)}, ` +
          `cameraX: ${newState.cameraX.toFixed(1)}, cameraY: ${newState.cameraY.toFixed(1)}, ` +
          `scale: ${newState.cameraScale.toFixed(2)}, activeCity: ${newState.activeCityIndex}`
        );
      }

      animationFrameIdRef.current = requestAnimationFrame(updateFrame);
    };

    animationFrameIdRef.current = requestAnimationFrame(updateFrame);

    return () => {
      window.removeEventListener("resize", updateBounds);
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [calculateState]);

  const activeCityObj = useMemo(() => {
    if (heroState.activeCityIndex >= 0 && heroState.activeCityIndex < activeCities.length) {
      return activeCities[heroState.activeCityIndex];
    }
    return null;
  }, [activeCities, heroState.activeCityIndex]);

  // Zero-Conflict, Single-Step City Navigation Function
  const scrollToCity = useCallback(
    (index: number) => {
      if (!containerRef.current) return;
      const numCities = activeCities.length;
      const overviewEnd = 0.15;
      const chapterEnd = 0.90;

      let targetFraction = 0;
      if (index < 0) {
        targetFraction = 0;
      } else {
        const step = (chapterEnd - overviewEnd) / Math.max(1, numCities - 1);
        targetFraction = overviewEnd + index * step;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const containerTop = window.scrollY + rect.top;
      const containerHeight = Math.max(1, rect.height - window.innerHeight);
      const targetY = containerTop + targetFraction * containerHeight;

      // Lenis zero-conflict smooth scroll integration
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(targetY, { duration: 1.0 });
      } else {
        window.scrollTo({
          top: targetY,
          behavior: isMobileOrReduced ? "auto" : "smooth",
        });
      }
    },
    [activeCities.length, isMobileOrReduced]
  );

  const handleCitySelect = useCallback(
    (cityId: string) => {
      const idx = activeCities.findIndex((c) => c.id === cityId);
      if (idx >= 0) {
        scrollToCity(idx);
      }
    },
    [activeCities, scrollToCity]
  );

  return (
    <>
      {/* SCREEN-READER ACCESSIBLE FALLBACK DATA (SR-ONLY) */}
      <div className="sr-only">
        <h2>Global Mining Hubs Interactive Map</h2>
        <p>Explore Mining Discovery hub locations around the globe:</p>
        <ul>
          {activeCities.map((c, i) => (
            <li key={c.id}>
              <h3>
                {i + 1}. {c.name}, {c.country} ({c.region})
              </h3>
              <p>{c.description}</p>
              {c.metric && (
                <p>
                  Metric: {c.metric} ({c.metricLabel})
                </p>
              )}
              <button onClick={() => scrollToCity(i)}>Jump to {c.name} chapter</button>
            </li>
          ))}
        </ul>
      </div>

      {/* TALL HERO SCROLL CONTAINER (cities.length * 100vh) */}
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: `${activeCities.length * 100}vh` }}
      >
        {/* VIEWPORT-HEIGHT STICKY STAGE (#091923 OCEAN BASE BACKGROUND) */}
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#091923] flex flex-col justify-center select-none z-10">

          {/* BACKGROUND GRADIENT */}
          <div className="absolute inset-0 bg-[#091923] bg-gradient-to-b from-[#091923] via-[#102A35]/30 to-[#091923] -z-20" />

          {/* LAYER A: STARFIELD & RESTRAINED AMBIENT GLOW */}
          <StarfieldBackground />
          <MineralDustField />
          <GlowPulse />

          {/* DEDICATED LEFT-TO-RIGHT READABILITY OVERLAY GRADIENT */}
          <div
            className="absolute inset-y-0 left-0 w-full lg:w-3/5 z-10 pointer-events-none transition-opacity duration-75"
            style={{
              opacity: heroState.gradientOpacity,
              background:
                "linear-gradient(90deg, rgba(7, 19, 27, 0.98) 0%, rgba(7, 19, 27, 0.88) 26%, rgba(7, 19, 27, 0.48) 45%, rgba(7, 19, 27, 0.08) 68%, rgba(7, 19, 27, 0) 100%)",
            }}
          />

          {/* FULL-WIDTH SCROLL-DRIVEN WORLD MAP (.map-scene) */}
          <div className="absolute inset-0 w-full h-full z-0 map-scene">
            <WorldMap
              cities={activeCities}
              connections={activeConnections}
              activeCityId={heroState.activeCityId}
              zoomScale={isMobileOrReduced ? 1 : heroState.cameraScale}
              cameraX={isMobileOrReduced ? 0 : heroState.cameraX}
              cameraY={isMobileOrReduced ? 0 : heroState.cameraY}
              onCitySelect={handleCitySelect}
              className="w-full h-full"
            />
          </div>

          {/* PHASE 1 & 2: HERO WRITTEN CONTENT GROUP (.hero-copy) */}
          <div
            style={{
              transform: `translate3d(0, ${heroState.copyY}px, 0)`,
              opacity: heroState.copyOpacity,
              pointerEvents: heroState.hasScrolled && heroState.progress > 0.12 ? "none" : "auto",
            }}
            className="absolute top-1/2 -translate-y-1/2 left-[clamp(24px,5vw,80px)] w-[calc(100%-48px)] sm:w-[min(500px,38vw)] z-20 flex flex-col items-start text-left hero-copy transition-opacity duration-75"
          >
            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] font-normal text-[#F1E9D8] leading-[1.12] tracking-[-0.015em] mb-5 max-w-[500px]">
              Mining Stories, Mapped <br className="hidden sm:inline" />
              for the{" "}
              <span className="relative text-[#F1E9D8] inline-block">
                <span className="relative z-10">World</span>
                <svg
                  className="absolute -bottom-1.5 left-0 w-full h-2.5 text-[#C68A4B]"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0 14 Q 45 4, 100 12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              .
            </h1>

            {/* Subheadline Paragraph */}
            <p className="font-sans text-sm sm:text-base text-[#B5C0BB] leading-relaxed mb-7 max-w-[460px] font-normal">
              Bring your mining milestones and company news to a global audience.
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center gap-3.5 sm:gap-4 w-full">
              <Link href="#submit-news" className="w-full min-[420px]:w-auto">
                <Button
                  variant="gold"
                  size="lg"
                  fullWidth
                  className="font-sans font-semibold tracking-wide text-[#091923] bg-[#C68A4B] hover:bg-[#D09A54] transition-all group cursor-pointer px-6 sm:px-7 py-3 sm:py-3.5 text-sm justify-center shadow-md border-none"
                >
                  Submit Your News
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link href="#reach" className="w-full min-[420px]:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="font-sans font-semibold tracking-wide border-[#70857D] text-[#F1E9D8] hover:border-[#B5C0BB] hover:bg-[#142B35]/60 cursor-pointer px-6 sm:px-7 py-3 sm:py-3.5 text-sm justify-center"
                >
                  <TrendingUp className="w-4 h-4 mr-2 text-[#E0AD63]" />
                  Explore Our Reach
                </Button>
              </Link>
            </div>
          </div>

          {/* PERSISTENT CITY NAVIGATION STEPPER (.map-controls) */}
          <nav
            aria-label="Mining Hub Navigation"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[rgba(20,43,53,0.85)] border border-[rgba(112,133,125,0.4)] rounded-full px-3.5 py-1.5 backdrop-blur-md shadow-lg map-controls"
          >
            <button
              onClick={() => scrollToCity(-1)}
              className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full transition-all cursor-pointer ${heroState.activeCityIndex === -1
                  ? "bg-[#C68A4B] text-[#091923] font-bold"
                  : "text-[#B5C0BB] hover:text-[#F1E9D8]"
                }`}
              aria-label="Overview"
              aria-current={heroState.activeCityIndex === -1 ? "step" : undefined}
            >
              Overview
            </button>

            <span className="text-[#70857D] text-xs">|</span>

            <div className="flex items-center gap-1 sm:gap-1.5">
              {activeCities.map((city, idx) => {
                const isActive = heroState.activeCityIndex === idx;
                return (
                  <button
                    key={city.id}
                    onClick={() => scrollToCity(idx)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${isActive
                        ? "bg-[#C68A4B] text-[#091923] font-bold shadow-sm"
                        : "text-[#B5C0BB] hover:text-[#F1E9D8] hover:bg-[#142B35]"
                      }`}
                    aria-label={`Jump to ${city.name}, ${city.country}`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <span>0{idx + 1}</span>
                    <span className="hidden md:inline">{city.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* EDITORIAL ACTIVE CITY NARRATIVE CARD */}
          {activeCityObj && (
            <div
              key={activeCityObj.id}
              className="absolute bottom-6 right-4 sm:right-8 lg:bottom-10 lg:right-12 z-30 max-w-sm sm:max-w-md w-full bg-[rgba(20,43,53,0.94)] border border-[rgba(112,133,125,0.45)] rounded-xl p-4 sm:p-5 backdrop-blur-md shadow-xl pointer-events-auto transition-all duration-300"
            >
              <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-[rgba(112,133,125,0.3)]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#E0AD63]" />
                  <span className="font-sans font-bold text-[#F1E9D8] text-base tracking-wide">
                    {activeCityObj.name},{" "}
                    <span className="text-[#E0AD63]">{activeCityObj.country}</span>
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#B5C0BB] uppercase tracking-widest bg-[#091923] px-2.5 py-0.5 rounded-full border border-[#70857D]/50">
                  0{heroState.activeCityIndex + 1} / 0{activeCities.length}
                </span>
              </div>

              <p className="font-sans text-xs text-[#B5C0BB] leading-relaxed mb-3">
                {activeCityObj.description}
              </p>

              {activeCityObj.metric && (
                <div className="flex items-center gap-2.5 pt-1 border-t border-[rgba(112,133,125,0.25)]">
                  <span className="font-serif text-lg font-bold text-[#E0AD63]">
                    {activeCityObj.metric}
                  </span>
                  <span className="text-[10px] font-sans text-[#B5C0BB] uppercase tracking-wider">
                    {activeCityObj.metricLabel}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* SUBTLE BOTTOM-CENTER EXPLORATION CUE */}
          {!heroState.hasScrolled && !isMobileOrReduced && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 pointer-events-none">
              <span className="text-[11px] font-sans tracking-widest uppercase text-[#B5C0BB]">
                Scroll to explore 5 mining hubs
              </span>
              <ChevronDown className="w-4 h-4 text-[#E0AD63] animate-bounce" />
            </div>
          )}

          {/* BOTTOM GRADIENT BOUNDARY */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-[#091923] pointer-events-none z-20" />
        </div>
      </div>
    </>
  );
};
