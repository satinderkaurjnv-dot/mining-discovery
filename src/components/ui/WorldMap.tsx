"use client";

import React, { useMemo } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import * as topojson from "topojson-client";
import world110m from "world-atlas/land-110m.json";
import countries110m from "world-atlas/countries-110m.json";

export interface CityData {
  id: string;
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  description: string;
  metric?: string;
  metricLabel?: string;
  color?: string;
  labelOffset?: { dx: number; dy: number; align?: "start" | "middle" | "end" };
}

export interface ConnectionData {
  from: string;
  to: string;
}

/**
 * REALISTIC CARTOGRAPHIC PALETTE & 5-CITY DATA-DRIVEN NETWORK
 * Includes: Toronto, Johannesburg, Perth, Santiago, and Udaipur (India)
 */
export const DEFAULT_CITIES: CityData[] = [
  {
    id: "toronto",
    name: "Toronto",
    country: "Canada",
    region: "North America",
    latitude: 43.653,
    longitude: -79.383,
    description:
      "Global mining finance capital. TSX & TSX-V list over 40% of the world's public exploration and mining companies.",
    metric: "$1.4T+",
    metricLabel: "Combined Market Cap",
    color: "#E0AD63",
    labelOffset: { dx: -45, dy: -24, align: "end" },
  },
  {
    id: "johannesburg",
    name: "Johannesburg",
    country: "South Africa",
    region: "Africa",
    latitude: -26.204,
    longitude: 28.047,
    description:
      "Deep-level gold and PGM mining epicenter, powering African mineral development, metallurgy, and equipment manufacturing.",
    metric: "75%",
    metricLabel: "Global Platinum Supply",
    color: "#E0AD63",
    labelOffset: { dx: 45, dy: 0, align: "start" },
  },
  {
    id: "perth",
    name: "Perth",
    country: "Australia",
    region: "Asia-Pacific",
    latitude: -31.951,
    longitude: 115.861,
    description:
      "Battery metals and iron ore powerhouse driving clean energy transition minerals and autonomous mining tech.",
    metric: "38%",
    metricLabel: "Global Lithium Production",
    color: "#E0AD63",
    labelOffset: { dx: -42, dy: -22, align: "end" },
  },
  {
    id: "santiago",
    name: "Santiago",
    country: "Chile",
    region: "South America",
    latitude: -33.449,
    longitude: -70.669,
    description:
      "World leader in copper and lithium reserves, spanning the mineral-rich Andes porphyry copper belt.",
    metric: "28%",
    metricLabel: "World Copper Export",
    color: "#E0AD63",
    labelOffset: { dx: 42, dy: 22, align: "start" },
  },
  {
    id: "udaipur",
    name: "Udaipur",
    country: "India",
    region: "Rajasthan",
    latitude: 24.5854,
    longitude: 73.7125,
    description:
      "Hindustan Zinc — Rajasthan. World-class integrated zinc, lead, and silver mining operations driving South Asian industrial mineral supply.",
    metric: "#2",
    metricLabel: "Global Zinc Producer",
    color: "#E0AD63",
    labelOffset: { dx: 42, dy: -20, align: "start" },
  },
];

export const EXTENDED_CITIES: CityData[] = [
  ...DEFAULT_CITIES,
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    region: "Europe",
    latitude: 51.507,
    longitude: -0.127,
    description:
      "International metal trading hub and home to the London Metal Exchange (LME) and global resource finance institutions.",
    metric: "$450B",
    metricLabel: "Annual LME Volume",
    color: "#E0AD63",
    labelOffset: { dx: 0, dy: -24, align: "middle" },
  },
];

export const DEFAULT_CONNECTIONS: ConnectionData[] = [
  { from: "toronto", to: "santiago" },
  { from: "santiago", to: "johannesburg" },
  { from: "johannesburg", to: "perth" },
  { from: "perth", to: "udaipur" },
  { from: "udaipur", to: "toronto" },
];

export const EXTENDED_CONNECTIONS: ConnectionData[] = [
  ...DEFAULT_CONNECTIONS,
  { from: "toronto", to: "london" },
  { from: "london", to: "johannesburg" },
  { from: "udaipur", to: "london" },
];

// Parse official Natural Earth TopoJSON features once
const landGeoJSON = topojson.feature(
  world110m as any,
  world110m.objects.land as any
) as any;

const countriesGeoJSON = topojson.feature(
  countries110m as any,
  countries110m.objects.countries as any
) as any;

export function getD3Projection(width = 1000, height = 500) {
  return geoNaturalEarth1().fitExtent(
    [
      [20, 20],
      [width - 20, height - 20],
    ],
    landGeoJSON
  );
}

export function projectGeoTo2D(lat: number, lng: number, width = 1000, height = 500) {
  const proj = getD3Projection(width, height);
  const coords = proj([lng, lat]);
  return { x: coords ? coords[0] : 0, y: coords ? coords[1] : 0 };
}

export interface WorldMapProps {
  cities?: CityData[];
  connections?: ConnectionData[];
  activeCityId?: string | null;
  className?: string;
  zoomScale?: number;
  cameraX?: number;
  cameraY?: number;
  onCitySelect?: (cityId: string) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  cities = DEFAULT_CITIES,
  connections = DEFAULT_CONNECTIONS,
  activeCityId = null,
  className = "",
  zoomScale = 1,
  cameraX = 0,
  cameraY = 0,
  onCitySelect,
}) => {
  const width = 1000;
  const height = 500;

  const projection = useMemo(() => {
    return geoNaturalEarth1().fitExtent(
      [
        [20, 20],
        [width - 20, height - 20],
      ],
      landGeoJSON
    );
  }, []);

  const pathGenerator = useMemo(() => {
    return geoPath().projection(projection);
  }, [projection]);

  const landPathD = useMemo(() => pathGenerator(landGeoJSON) || "", [pathGenerator]);
  const countriesPathD = useMemo(() => pathGenerator(countriesGeoJSON) || "", [pathGenerator]);

  const projectedCities = useMemo(() => {
    return cities.map((city) => {
      const projCoords = projection([city.longitude, city.latitude]);
      const x = projCoords ? projCoords[0] : 0;
      const y = projCoords ? projCoords[1] : 0;
      return { ...city, x, y };
    });
  }, [cities, projection]);

  const cityMap = useMemo(() => {
    return new Map(projectedCities.map((c) => [c.id, c]));
  }, [projectedCities]);

  return (
    <div className={`relative w-full h-full overflow-hidden select-none bg-[#091923] ${className}`}>
      {/* SHARED CAMERA TRANSFORM SCENE WRAPPER (UNCLIPPED ROUTE SCENE) */}
      <div
        className="w-full h-full flex items-center justify-center origin-center overflow-visible"
        style={{
          transform: `translate3d(${cameraX}px, ${cameraY}px, 0) scale(${zoomScale})`,
          willChange: "transform",
        }}
      >
        <svg
          className="w-full h-full max-w-[1400px] aspect-[2/1] overflow-visible"
          viewBox="-100 -50 1200 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Active Copper Arc Gradient */}
            <linearGradient id="mapArcGradInactive" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#75827B" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#75827B" stopOpacity="0.25" />
            </linearGradient>

            <linearGradient id="mapArcGradActive" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F1E9D8" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#C68A4B" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#E0AD63" stopOpacity="0.5" />
            </linearGradient>

            {/* Restrained Soft Blur for Active City Anchor */}
            <filter id="activeCityGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* LATITUDE & LONGITUDE GEOGRAPHIC GRID LINES */}
          <g opacity="0.08" stroke="#75827B" strokeWidth="0.5" strokeDasharray="3 3">
            <line x1="0" y1="125" x2="1000" y2="125" />
            <line x1="0" y1="250" x2="1000" y2="250" /> {/* Equator */}
            <line x1="0" y1="375" x2="1000" y2="375" />
            <line x1="250" y1="0" x2="250" y2="500" />
            <line x1="500" y1="0" x2="500" y2="500" /> {/* Prime Meridian */}
            <line x1="750" y1="0" x2="750" y2="500" />
          </g>

          {/* REALISTIC CARTOGRAPHY: MINERAL GREEN LANDMASS (#3D574F / #536B60), LIMESTONE BORDERS (#9AA99B), COASTLINES (#C0B99D) */}
          <g opacity="0.95">
            {/* Base Mineral Green Landmass (#3D574F) with Distinct Coastline (#C0B99D at 70% opacity) */}
            <path
              d={landPathD}
              fill={activeCityId ? "#536B60" : "#3D574F"}
              stroke="#C0B99D"
              strokeWidth="0.85"
              strokeOpacity="0.7"
              className="transition-colors duration-500"
            />
            {/* Muted Limestone Country Boundaries (#9AA99B at 50% opacity) */}
            <path
              d={countriesPathD}
              fill="none"
              stroke="#9AA99B"
              strokeWidth="0.4"
              strokeOpacity="0.5"
            />
          </g>

          {/* DYNAMIC NETWORK ARCS: INACTIVE MUTED GRAY-GREEN (#75827B), ACTIVE COPPER (#C68A4B) */}
          <g>
            {connections.map((conn, idx) => {
              const cFrom = cityMap.get(conn.from);
              const cTo = cityMap.get(conn.to);
              if (!cFrom || !cTo) return null;

              const isArcActive =
                activeCityId === conn.from || activeCityId === conn.to;

              const midX = (cFrom.x + cTo.x) / 2;
              const midY = (cFrom.y + cTo.y) / 2;
              const dx = cTo.x - cFrom.x;
              const dy = cTo.y - cFrom.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;

              const curveHeight = Math.min(60, Math.max(25, dist * 0.22));
              const ctrlX = midX - (dy / dist) * curveHeight;
              const ctrlY = midY + (dx / dist) * curveHeight;

              return (
                <path
                  key={`${conn.from}-${conn.to}-${idx}`}
                  d={`M ${cFrom.x} ${cFrom.y} Q ${ctrlX} ${ctrlY} ${cTo.x} ${cTo.y}`}
                  stroke={isArcActive ? "url(#mapArcGradActive)" : "url(#mapArcGradInactive)"}
                  strokeWidth={isArcActive ? "2.0" : "1.0"}
                  strokeDasharray={isArcActive ? "none" : "4 3"}
                  strokeLinecap="round"
                  opacity={isArcActive ? 0.95 : 0.45}
                />
              );
            })}
          </g>

          {/* CITIES: TRUE ANCHOR DOTS & INTERACTIVE EDITORIAL LABELS */}
          <g>
            {projectedCities.map((city) => {
              const isActive = activeCityId === city.id;
              const opacity = activeCityId ? (isActive ? 1 : 0.5) : 0.8;
              const offset = city.labelOffset || { dx: 0, dy: 20, align: "middle" };

              return (
                <g
                  key={city.id}
                  opacity={opacity}
                  tabIndex={0}
                  role="button"
                  aria-label={`Explore ${city.name}, ${city.country} mining hub`}
                  className="cursor-pointer outline-none group focus:outline-none"
                  onClick={() => onCitySelect?.(city.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onCitySelect?.(city.id);
                    }
                  }}
                >
                  
                  {/* 1. TRUE GEOGRAPHIC ANCHOR DOT */}
                  <g transform={`translate(${city.x}, ${city.y})`}>
                    {/* Active Copper Ring */}
                    {isActive && (
                      <circle
                        r="12"
                        fill="none"
                        stroke="#E0AD63"
                        strokeWidth="1"
                        opacity="0.6"
                        className="animate-ping"
                      />
                    )}

                    {/* Low-Blur Active Glow */}
                    <circle
                      r={isActive ? "7.5" : "4.5"}
                      fill={isActive ? "#E0AD63" : "#75827B"}
                      opacity={isActive ? "0.45" : "0.35"}
                      filter={isActive ? "url(#activeCityGlow)" : undefined}
                      className="group-hover:scale-125 transition-transform"
                    />

                    {/* Exact Anchor Dot Center */}
                    <circle
                      r={isActive ? "3.5" : "2.5"}
                      fill={isActive ? "#F1E9D8" : "#8B9489"}
                      stroke="#091923"
                      strokeWidth="1"
                    />
                  </g>

                  {/* 2. LEADER LINE */}
                  <line
                    x1={city.x}
                    y1={city.y}
                    x2={city.x + offset.dx}
                    y2={city.y + offset.dy}
                    stroke={isActive ? "#C68A4B" : "#75827B"}
                    strokeWidth="0.85"
                    strokeDasharray="2 2"
                    opacity={isActive ? "0.85" : "0.4"}
                  />

                  {/* 3. EDITORIAL LABEL PILL */}
                  <g transform={`translate(${city.x + offset.dx}, ${city.y + offset.dy})`}>
                    <rect
                      x={offset.align === "start" ? "0" : offset.align === "end" ? "-84" : "-42"}
                      y="-10"
                      width="84"
                      height="20"
                      rx="10"
                      fill={isActive ? "rgba(20, 43, 53, 0.95)" : "rgba(9, 25, 35, 0.85)"}
                      stroke={isActive ? "#E0AD63" : "#75827B"}
                      strokeWidth={isActive ? "1.2" : "0.75"}
                      strokeOpacity={isActive ? "0.9" : "0.45"}
                      className="group-hover:stroke-[#E0AD63] transition-colors"
                    />
                    <text
                      x={offset.align === "start" ? "42" : offset.align === "end" ? "-42" : "0"}
                      y="3"
                      textAnchor="middle"
                      fill={isActive ? "#F1E9D8" : "#8B9489"}
                      fontSize={isActive ? "9.5" : "8.5"}
                      fontWeight={isActive ? "bold" : "500"}
                      fontFamily="sans-serif"
                      letterSpacing="0.05em"
                      className="group-hover:fill-[#F1E9D8] transition-colors"
                    >
                      {city.name.toUpperCase()}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};
