import React from "react";

/**
 * The hero's geological ground: survey contours, an irregular coordinate grid, a few
 * global routes, and map marginalia. Premium survey paper, not a decorated web page.
 *
 * TWO THINGS THIS FILE HAS TO GET RIGHT, both of which sank the first attempt:
 *
 * 1. HEIGHT. The parent <section> is STAGE_COUNT * STAGE_VH tall - about 1155vh - so an
 *    `inset-0` layer would stretch this artwork over roughly twelve thousand pixels and
 *    the first screen would show a near-empty sliver of it. This layer is pinned to the
 *    first viewport only (`top-0 h-screen`), which is exactly where the white space that
 *    needs treating actually lives. Below that the globe card's opaque white covers it.
 *
 * 2. INK. Alphas are 0.05-0.12, and the centre mask clears fully by 62% rather than
 *    fading all the way out to the rim, so a line at mid-radius keeps most of its
 *    weight instead of being multiplied down to nothing.
 *
 * Everything is inert: aria-hidden, pointer-events-none, and painted at -z-10, which
 * puts it above the section's own white but below the copy's text and below the globe
 * card entirely. No cooperation is needed from the hero's layout, and the globe never
 * has to know this exists.
 */

/**
 * Three base loops, drawn about the origin. A cluster nests scaled copies of one of
 * them, which is how elevation contours read around a peak - for a fraction of the path
 * data a hand-drawn set would cost. Three shapes plus per-cluster rotation is enough
 * that no two clusters rhyme.
 */
const SHAPES = [
  "M -120 0 C -120 -70 -62 -122 10 -122 C 88 -122 140 -62 140 8 C 140 82 78 130 4 130 C -72 130 -120 72 -120 0 Z",
  "M -140 -14 C -128 -84 -54 -128 22 -116 C 96 -104 146 -44 132 26 C 118 92 46 134 -26 122 C -98 110 -150 56 -140 -14 Z",
  "M -104 26 C -122 -38 -78 -104 -8 -118 C 70 -134 136 -88 146 -18 C 156 56 104 118 30 126 C -46 134 -88 92 -104 26 Z",
];

/**
 * Six clusters, deliberately unbalanced: different ring counts, different rotations,
 * three of them running off the edge of the frame the way a survey sheet's contours run
 * off the paper. `at` is the ring index that carries gold - one per cluster, no more.
 */
const CLUSTERS: Array<{
  cx: number;
  cy: number;
  rot: number;
  shape: number;
  rings: number[];
  at: number;
  /** Breakpoint below which this cluster is dropped, to thin the pattern out. */
  from?: "md" | "lg";
}> = [
  { cx: -30, cy: 96, rot: -18, shape: 0, rings: [0.34, 0.56, 0.8, 1.06, 1.34, 1.64, 1.96], at: 3 },
  { cx: 1316, cy: -44, rot: 24, shape: 1, rings: [0.4, 0.66, 0.95, 1.28, 1.64, 2.02], at: 2 },
  { cx: 96, cy: 508, rot: 8, shape: 2, rings: [0.3, 0.52, 0.76, 1.02, 1.3, 1.6], at: 4, from: "md" },
  { cx: 1398, cy: 452, rot: -34, shape: 0, rings: [0.36, 0.62, 0.9, 1.2, 1.52], at: 1, from: "md" },
  { cx: 214, cy: 880, rot: 42, shape: 1, rings: [0.44, 0.72, 1.02, 1.34, 1.68, 2.04], at: 3, from: "lg" },
  { cx: 1180, cy: 846, rot: -12, shape: 2, rings: [0.38, 0.64, 0.92, 1.22, 1.54], at: 2, from: "lg" },
];

/**
 * Coordinate grid. Irregularly spaced on purpose - an even lattice reads as a website
 * grid, uneven spacing with long dashes reads as a survey sheet.
 */
const GRID_X = [96, 238, 402, 654, 918, 1104, 1288];
const GRID_Y = [128, 286, 470, 690];

/** Global routes. One of them draws itself; the other two just sit there. */
const ARCS: Array<{ d: string; draw?: boolean }> = [
  { d: "M -60 250 C 168 168 300 244 392 344", draw: true },
  { d: "M 1500 206 C 1286 156 1146 236 1060 342" },
  { d: "M 1520 636 C 1320 586 1198 640 1098 726" },
];

/** Survey points. The gold ones sit on route ends and pulse; the greys punctuate. */
const POINTS: Array<{ cx: number; cy: number; r: number; gold?: boolean }> = [
  { cx: 392, cy: 344, r: 3, gold: true },
  { cx: 1060, cy: 342, r: 3, gold: true },
  { cx: 1098, cy: 726, r: 2.6, gold: true },
  { cx: 150, cy: 566, r: 2 },
  { cx: 1294, cy: 508, r: 2 },
  { cx: 268, cy: 742, r: 2 },
];

/**
 * Marginalia. Coordinates and zone names only - the kind of annotation a survey sheet
 * carries in its margins. Nothing here names a real place, a real deposit, or anything
 * that could read as a claim about the business.
 */
const LABELS: Array<{ x: number; y: number; text: string; anchor?: "end" }> = [
  { x: 72, y: 74, text: "N 43° 12' 04\"" },
  { x: 72, y: 92, text: "W 79° 22' 18\"" },
  { x: 1368, y: 74, text: "SHEET 04 / 12", anchor: "end" },
  { x: 72, y: 622, text: "EXPLORATION ZONE" },
  { x: 1368, y: 664, text: "LAT / LONG — WGS 84", anchor: "end" },
  { x: 72, y: 806, text: "MINING REGION" },
];

const NAVY_STRONG = "rgba(15,39,67,0.11)";
const NAVY_SOFT = "rgba(15,39,67,0.055)";
const GOLD = "rgba(190,135,20,0.28)";
const GOLD_LINE = "rgba(190,135,20,0.13)";

export const HeroBackdrop: React.FC = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-screen overflow-hidden"
  >
    {/*
      Atmospheric depth. A very wide, very soft blue-grey lift low in the frame, under
      everything else, so the white does not read as flat paper where the planet meets
      it. Wide enough that no edge is ever perceptible as a glow.
    */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(115% 78% at 50% 104%, rgba(15,39,67,0.075) 0%, rgba(15,39,67,0.032) 38%, rgba(15,39,67,0) 70%)",
      }}
    />

    {/*
      The artwork. The mask keeps the headline's ground clean without gutting the rest:
      fully clear across the central ellipse to 34%, back to full ink by 62%, so a
      contour at mid-radius keeps its weight rather than being multiplied away.
    */}
    <div
      className="hero-backdrop-drift absolute inset-0"
      style={{
        maskImage:
          "radial-gradient(ellipse 54% 48% at 50% 41%, transparent 0%, transparent 34%, rgba(0,0,0,0.62) 50%, #000 62%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 54% 48% at 50% 41%, transparent 0%, transparent 34%, rgba(0,0,0,0.62) 50%, #000 62%)",
      }}
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        fill="none"
        focusable="false"
      >
        {/* Layer 3 - coordinate grid, with a tick at every crossing on the verticals */}
        <g className="hidden md:inline" stroke={NAVY_SOFT} strokeWidth="1">
          {GRID_X.map((x, i) => (
            <line
              key={`gx${x}`}
              x1={x}
              y1="-20"
              x2={x + (i % 2 ? 26 : -18)}
              y2="920"
              strokeDasharray={i % 3 === 0 ? "58 26 12 26" : "112 34"}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {GRID_Y.map((y, i) => (
            <line
              key={`gy${y}`}
              x1="-20"
              y1={y}
              x2="1460"
              y2={y + (i % 2 ? -14 : 20)}
              strokeDasharray={i % 2 ? "146 42" : "74 30 16 30"}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>

        {/* Layer 2 - survey contours */}
        {CLUSTERS.map((c) => (
          <g
            key={`${c.cx}-${c.cy}`}
            className={
              c.from === "lg" ? "hidden lg:inline" : c.from === "md" ? "hidden md:inline" : undefined
            }
            transform={`translate(${c.cx} ${c.cy}) rotate(${c.rot})`}
          >
            {c.rings.map((s, i) => (
              <path
                key={s}
                d={SHAPES[c.shape]}
                transform={`scale(${s})`}
                vectorEffect="non-scaling-stroke"
                stroke={i === c.at ? GOLD_LINE : i % 2 ? NAVY_SOFT : NAVY_STRONG}
                strokeWidth="1"
              />
            ))}
          </g>
        ))}

        {/* Layer 4 - global routes and survey points */}
        <g className="hero-backdrop-breathe hidden lg:inline">
          {ARCS.map((a) => (
            <path
              key={a.d}
              d={a.d}
              className={a.draw ? "hero-backdrop-draw" : undefined}
              stroke="rgba(15,39,67,0.1)"
              strokeWidth="1"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {POINTS.map((p) => (
            <circle
              key={`${p.cx}-${p.cy}`}
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              className={p.gold ? "hero-backdrop-pulse" : undefined}
              fill={p.gold ? GOLD : "rgba(15,39,67,0.18)"}
            />
          ))}
        </g>

        {/* Marginalia - edges only, never behind the copy */}
        <g className="hidden lg:inline font-mono" fill="rgba(15,39,67,0.17)">
          {LABELS.map((l) => (
            <text
              key={l.text}
              x={l.x}
              y={l.y}
              textAnchor={l.anchor}
              fontSize="10"
              letterSpacing="1.6"
            >
              {l.text}
            </text>
          ))}
        </g>
      </svg>
    </div>

    {/*
      Paper grain - the same 16px dot lattice, at the same opacity, that Stats already
      carries. Borrowed rather than invented so the two sections read as one stock.
    */}
    <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] opacity-[0.025] [background-size:16px_16px]" />
  </div>
);

export default HeroBackdrop;
