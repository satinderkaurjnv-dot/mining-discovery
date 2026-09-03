"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface CountryBadge {
  id: string;
  name: string;
  region: string;
  minerals: string;
  top: string;
  left: string;
}

const COUNTRY_BADGES: CountryBadge[] = [
  {
    id: "na",
    name: "USA & CANADA",
    region: "TIER-1 JURISDICTION",
    minerals: "GOLD • COPPER • CRITICAL MINERALS",
    top: "29%",
    left: "22%",
  },
  {
    id: "sa",
    name: "CHILE & PERU",
    region: "GLOBAL COPPER BELT",
    minerals: "COPPER • LITHIUM • SILVER",
    top: "66%",
    left: "27%",
  },
  {
    id: "eu",
    name: "SWEDEN & FINLAND",
    region: "NORDIC BATTERY METALS",
    minerals: "IRON ORE • NICKEL • RARE EARTHS",
    top: "18%",
    left: "62%",
  },
  {
    id: "afr",
    name: "SOUTH AFRICA",
    region: "STRATEGIC MINERAL BASIN",
    minerals: "PGM • MANGANESE • GOLD",
    top: "72%",
    left: "68%",
  },
  {
    id: "asia",
    name: "MONGOLIA & CENTRAL ASIA",
    region: "OREBELT CORRIDOR",
    minerals: "COPPER • GOLD • URANIUM",
    top: "27%",
    left: "81%",
  },
  {
    id: "aus",
    name: "WESTERN AUSTRALIA",
    region: "PREMIER RESOURCE HUB",
    minerals: "IRON ORE • GOLD • LITHIUM",
    top: "65%",
    left: "88%",
  },
];

export function UnitedCarriersGlobe({
  className = "",
  scrollProgress = 0,
}: {
  className?: string;
  scrollProgress?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeBadge, setActiveBadge] = useState<string | null>(null);

  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const baseRotRef = useRef({ x: 0, y: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    baseRotRef.current = { ...rotation };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      const newRotY = baseRotRef.current.y + dx * 0.25;
      const newRotX = Math.max(-25, Math.min(25, baseRotRef.current.x - dy * 0.15));
      setRotation({ x: newRotX, y: newRotY });
    } else {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: -py * 8, y: px * 12 });
      }
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const onPointerLeave = () => {
    isDraggingRef.current = false;
    setTilt({ x: 0, y: 0 });
  };

  useEffect(() => {
    let animId: number;
    const animate = () => {
      if (!isDraggingRef.current) {
        setRotation((prev) => ({
          x: prev.x * 0.96,
          y: prev.y + 0.04,
        }));
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerLeave}
      className={`relative w-full h-full aspect-square select-none overflow-visible cursor-grab active:cursor-grabbing touch-pan-y ${className}`}
      style={{ isolation: "isolate" }}
    >
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x + rotation.x * 0.3}deg) rotateY(${tilt.y + (rotation.y % 360) * 0.15 + (scrollProgress || 0) * 45}deg) scale3d(1, 1, 1)`,
          transformStyle: "preserve-3d",
        }}
      >
        <div className="relative w-[92%] h-[92%] rounded-full overflow-hidden shadow-2xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <Image
            src="/globe/digital-earth.jpg"
            alt="Global Mining Intelligence Digital Earth"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover object-center rounded-full pointer-events-none transition-transform duration-700 ease-out"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(circle at 50% 50%, transparent 70%, rgba(0,229,255,0.18) 95%, rgba(255,174,0,0.25) 100%)",
            }}
          />
        </div>

        <div className="absolute inset-0 pointer-events-none z-20">
          {COUNTRY_BADGES.map((badge) => {
            const isActive = activeBadge === badge.id;
            return (
              <div
                key={badge.id}
                className="absolute pointer-events-auto"
                style={{ top: badge.top, left: badge.left }}
              >
                <button
                  type="button"
                  onClick={() => setActiveBadge(isActive ? null : badge.id)}
                  className="globe-country-badge group"
                  aria-label={`${badge.name} mining hub`}
                >
                  <span className="badge-header">
                    <span className="badge-dot" />
                    <span className="badge-title">{badge.name}</span>
                  </span>
                  <span className="badge-tooltip">
                    <span className="tooltip-region">{badge.region}</span>
                    <span className="tooltip-minerals">{badge.minerals}</span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        .globe-country-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          white-space: nowrap !important;
          cursor: pointer;
          font-family: var(--font-geist-mono, monospace), monospace;
          background: rgba(11, 27, 48, 0.90);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 174, 0, 0.45);
          border-radius: 5px;
          padding: 3px 8px;
          transform: translate(-50%, -50%);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.55), 0 0 10px rgba(255, 174, 0, 0.15);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
        }

        .globe-country-badge:hover,
        .globe-country-badge:focus-visible {
          background: rgba(11, 27, 48, 0.98);
          border-color: rgba(255, 174, 0, 0.90);
          transform: translate(-50%, -54%) scale(1.08);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.75), 0 0 16px rgba(255, 174, 0, 0.35);
          z-index: 50;
        }

        .badge-header {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #FFAE00;
          box-shadow: 0 0 6px #FFAE00;
        }

        .badge-title {
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ffffff;
        }

        .badge-tooltip {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5px;
          transition: max-height 0.25s ease, opacity 0.25s ease, margin-top 0.25s ease;
        }

        .globe-country-badge:hover .badge-tooltip,
        .globe-country-badge:focus-visible .badge-tooltip {
          max-height: 40px;
          opacity: 1;
          margin-top: 3px;
        }

        .tooltip-region {
          font-size: 7px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: #FFAE00;
        }

        .tooltip-minerals {
          font-size: 6.5px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: #CBD5E1;
        }

        @media (min-width: 640px) {
          .globe-country-badge {
            padding: 3.5px 10px;
          }
          .badge-title {
            font-size: 9.5px;
          }
          .tooltip-region {
            font-size: 7.5px;
          }
          .tooltip-minerals {
            font-size: 7px;
          }
        }
      `}</style>
    </div>
  );
}
