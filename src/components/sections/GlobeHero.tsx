"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { FOCUS_ANCHOR_ID, GLOBE_FIT } from "@/components/ui/globe/EarthGlobe";
import type {
  GlobeAnchor,
  GlobeFocus,
  ProjectedAnchor,
} from "@/components/ui/globe/EarthGlobe";

// WebGL has no server render, and the topojson chunk should not block first paint.
const EarthGlobe = dynamic(
  () => import("@/components/ui/globe/EarthGlobe").then((m) => m.EarthGlobe),
  { ssr: false },
);

interface MiningSite extends GlobeAnchor {
  /** Continent, used as the primary label. */
  region: string;
  /** Country or territory, used as the sub-label. */
  country: string;
  /** One short line shown only while the marker is hovered or focused. */
  detail: string;
  /** Antarctica's label is dropped on phones, where space is tightest. */
  labelOnMobile?: boolean;
}

/**
 * One site per continent, positioned by real coordinates rather than by eye.
 *
 * Antarctica is a geographic representation only — the Antarctic Treaty's Madrid
 * Protocol bans commercial mining there, so its detail line says research, not
 * production. Swap it if the company has real data to put behind it.
 */
const MINING_SITES: MiningSite[] = [
  { id: "north-america", region: "North America", country: "Canada", detail: "Mining region", lat: 56, lng: -106, labelOnMobile: true },
  { id: "south-america", region: "South America", country: "Chile", detail: "Mining region", lat: -30, lng: -71, labelOnMobile: true },
  { id: "europe", region: "Europe", country: "Sweden", detail: "Mining region", lat: 60, lng: 18, labelOnMobile: true },
  { id: "africa", region: "Africa", country: "South Africa", detail: "Mining region", lat: -30, lng: 24, labelOnMobile: true },
  { id: "asia", region: "Asia", country: "Mongolia", detail: "Mining region", lat: 46, lng: 104, labelOnMobile: true },
  { id: "australia", region: "Australia", country: "Western Australia", detail: "Mining region", lat: -25, lng: 122, labelOnMobile: true },
  // NOTE: at -82 this pin sits permanently below the container's bottom crop — the globe
  // is deliberately cut off there, and no view pitch brings 82S onto the visible arc
  // without pushing Sweden and Canada over the top rim. It is kept geographically honest;
  // to actually surface it, either raise VISIBLE_FRACTION toward 0.9 (a ~20% smaller
  // globe) or move the pin to the Antarctic Peninsula.
  { id: "antarctica", region: "Antarctica", country: "Research site", detail: "Geographic representation", lat: -82, lng: 0, labelOnMobile: false },
];

const ANCHORS: GlobeAnchor[] = MINING_SITES.map(({ id, lat, lng }) => ({
  id,
  lat,
  lng,
}));

/**
 * How far past the card's bottom corners the planet runs. At exactly 1 the arc is
 * tangent to them; a little over reads better than a tangent, which looks accidental.
 */
const HORIZON_OVERRUN = 1.08;

/**
 * Diameter of the sphere whose arc passes exactly through the bottom two corners of a
 * `width` x `height` slot — the horizon framing, solved rather than dialled in.
 *
 * Half-width of a circle of radius r at depth h below its crown is sqrt(r² - (r - h)²).
 * Setting that to width / 2 and solving for the diameter gives the expression below.
 *
 * Two properties fall out of it that hold at every breakpoint, whatever the copy above
 * wraps to, so neither needs a guard constant:
 *   - diameter > height, always — the planet is cropped by the card's floor, never
 *     small enough to sit whole inside the card with white underneath it.
 *   - diameter >= width, always, since it reduces to (width - 2·height)² >= 0 — the
 *     planet is never narrower than the card, so no white gutters beside the arc.
 */
function horizonDiameter(width: number, height: number) {
  return ((width * width) / (4 * height) + height) * HORIZON_OVERRUN;
}

/**
 * Outer bloom, painted in CSS behind the canvas. The shader's haze is an *inner* glow
 * that stops at the silhouette; this is the part that spills onto the white card, so
 * the limb reads as lit rather than as a cut edge.
 *
 * `closest-side` makes 100% the box's half-width, so GLOBE_FIT is directly the stop
 * where the silhouette sits — the halo tracks the sphere at any size.
 *
 * The band is deliberately tight and bright rather than wide and faint. The card crops
 * at the sphere's crown, so glow living far out at 96–100% of the half-width is cut off
 * across most of the arc and never paid for itself; concentrating the same alpha budget
 * into 89.6–95.5% puts the brightest ring immediately outside the limb, where it clears
 * the crop over far more of the visible curve. Peak sits just *past* the silhouette —
 * an atmosphere reads as a rim of light on the edge, not a wash centred on it.
 */
const SILHOUETTE_STOP = GLOBE_FIT * 100;
/** Where the bloom finally reaches zero, as a percent of the box's half-width. */
const HALO_OUTER_STOP = SILHOUETTE_STOP + 5.5;
const ATMOSPHERE_HALO = [
  "radial-gradient(circle closest-side at 50% 50%,",
  `rgba(143,179,217,0) ${SILHOUETTE_STOP - 8}%,`,
  `rgba(150,187,224,0.07) ${SILHOUETTE_STOP - 3.5}%,`,
  `rgba(163,199,233,0.26) ${SILHOUETTE_STOP - 0.4}%,`,
  `rgba(178,210,240,0.34) ${SILHOUETTE_STOP + 0.7}%,`,
  `rgba(163,199,233,0.20) ${SILHOUETTE_STOP + 1.8}%,`,
  `rgba(150,187,224,0.08) ${SILHOUETTE_STOP + 3.4}%,`,
  `rgba(143,179,217,0) ${HALO_OUTER_STOP}%)`,
].join(" ");

/**
 * How far the bloom reaches past the silhouette, as a fraction of the box's edge.
 *
 * The break in the ring at the crown was never a shape mismatch — the bloom and the
 * canvas share one box, so they cannot drift. It was the crop: boxTop used to seat the
 * crown exactly on the card's top edge, which leaves the ring above it nowhere to
 * render. Dropping the crown by precisely this fraction lands the bloom's outermost
 * pixel flush with that edge instead, so the arc closes with no space wasted.
 *
 * Derived from the gradient's own outer stop rather than dialled in, so retuning the
 * bloom moves the headroom with it and the two cannot fall out of sync.
 */
const HALO_HEADROOM = (HALO_OUTER_STOP / 100 - GLOBE_FIT) / 2;

/** Below this projected opacity a pin is edge-on: no label, no pointer events. */
const LABEL_OPACITY_FLOOR = 0.5;

/**
 * Order the tour visits. One entry per continent, matched to MINING_SITES by id, and
 * the scroll range is split into this many equal stages.
 */
const TOUR = [
  "north-america",
  "south-america",
  "europe",
  "africa",
  "asia",
  "australia",
  "antarctica",
] as const;
const STAGE_COUNT = TOUR.length;

/** Scale held at every stop, so each continent gets the same treatment. */
const STOP_ZOOM = 2.8;
/** Scale at the midpoint of a hop, so the globe pulls back to travel and dives back in. */
const TRAVEL_ZOOM = 1.55;
/**
 * Where inside a stage the hop happens. Up to ARRIVE the globe is still settling onto
 * this stop, past DEPART it has started leaving for the next; the span between is the
 * held stop. The two halves of a hop straddle a stage boundary and meet at its centre.
 */
const STAGE_ARRIVE = 0.18;
const STAGE_DEPART = 0.82;
/** Progress over which the globe hands off from free drift to the tour. */
const ENGAGE = 0.03;
/**
 * Rate the sampled progress is damped toward the true scroll position, per second.
 *
 * Sampling is once per rendered frame now, so this is not carrying much weight — it
 * only has to absorb the odd frame where the globe's loop and Lenis's ticker land out
 * of order, or a dropped frame. Hence a short 1/20s time constant, about three frames
 * of steady-state lag: Lenis already applies its own easing upstream, and stacking a
 * long constant on top of it reads as float rather than as smoothness.
 *
 * Lower it to soften further, raise it to track the wheel harder.
 */
const PROGRESS_SMOOTHING = 20;
/**
 * A frame gap longer than this means the loop was parked — tab hidden, or the globe
 * scrolled out of view and its render loop suspended. Damping across that gap would
 * play the whole skipped span back as a slide, so progress snaps instead.
 */
const RESUME_GAP = 0.2;

/** Labels other than the active stop's are dimmed to this while the tour runs. */
const RESTING_LABEL_OPACITY = 0.32;

const TOUR_SITES = TOUR.map((id) => {
  const site = MINING_SITES.find((entry) => entry.id === id);
  if (!site) throw new Error(`TOUR references unknown site id: ${id}`);
  return site;
});

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

/** Shortest-arc interpolation between two longitudes, in degrees. */
function lerpLongitude(a: number, b: number, k: number) {
  const delta = ((b - a + 540) % 360) - 180;
  return a + delta * k;
}

interface StageState {
  /** Index of the stop that owns this moment, for the label highlight. */
  index: number;
  lat: number;
  lng: number;
  zoom: number;
}

/**
 * Resolves scroll progress into an aim point and a zoom.
 *
 * Progress is cut into STAGE_COUNT equal stages, one per continent. Inside a stage the
 * globe sits on that continent, then hands over to the next across the boundary; the
 * hop is eased and the zoom dips through it, so every stop reads as an arrival.
 */
function stageAt(progress: number): StageState {
  const f = Math.min(Math.max(progress, 0), 1) * STAGE_COUNT;
  const index = Math.min(Math.floor(f), STAGE_COUNT - 1);
  const u = f - index;

  let from = index;
  let to = index;
  let hop = 0;

  if (u < STAGE_ARRIVE && index > 0) {
    // Second half of the hop that began at the end of the previous stage.
    from = index - 1;
    to = index;
    hop = 0.5 + 0.5 * (u / STAGE_ARRIVE);
  } else if (u > STAGE_DEPART && index < STAGE_COUNT - 1) {
    from = index;
    to = index + 1;
    hop = 0.5 * ((u - STAGE_DEPART) / (1 - STAGE_DEPART));
  }

  const a = TOUR_SITES[from];
  const b = TOUR_SITES[to];
  const eased = smoothstep(0, 1, hop);

  return {
    index: hop > 0.5 ? to : from,
    lat: a.lat + (b.lat - a.lat) * eased,
    lng: lerpLongitude(a.lng, b.lng, eased),
    // sin() puts the shallowest point of the dip exactly at the hop's midpoint and
    // returns to STOP_ZOOM at both ends, so consecutive stages join without a step.
    zoom: STOP_ZOOM - (STOP_ZOOM - TRAVEL_ZOOM) * Math.sin(Math.PI * eased),
  };
}

interface Metrics {
  /** Edge of the square canvas box. The sphere silhouette fills GLOBE_FIT of it. */
  boxSize: number;
  /** Offset from the top of the globe slot, so the sphere's crown lands on the slot. */
  boxTop: number;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

export const GlobeHero: React.FC = () => {
  const rangeRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const globeBoxRef = useRef<HTMLDivElement>(null);
  const markerLayerRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef(new Map<string, HTMLDivElement | null>());
  const labelRefs = useRef(new Map<string, HTMLDivElement | null>());

  /**
   * Card bounds in the globe canvas's coordinate space, plus the label footprint
   * for the current breakpoint. Cached on resize rather than measured per frame, so the
   * render loop never forces layout.
   */
  const layoutRef = useRef({
    minY: -Infinity,
    maxY: Infinity,
    minX: -Infinity,
    maxX: Infinity,
    fadeX: 110,
    fadeY: 130,
    labelW: 132,
    labelH: 40,
    compact: false,
  });

  const [metrics, setMetrics] = useState<Metrics>({ boxSize: 0, boxTop: 0 });
  const [ready, setReady] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // --- Scroll-linked zoom ----------------------------------------------------------
  /**
   * Progress across the tall pinned range: 0 as its top reaches the top of the
   * viewport, 1 as its bottom does — exactly the span over which the sticky child
   * stays parked. Measured directly rather than through framer-motion's useScroll,
   * whose ref-based target threw "Target ref is defined but not hydrated" here.
   * Everything derived from it is written straight to the DOM, so scrolling never
   * re-renders the tree.
   */
  const progressRef = useRef(0);

  /** Aim target handed to the globe; mutated in place, never triggers a render. */
  const focusRef = useRef<GlobeFocus | null>(null);
  /** Where the aim actually landed this frame, reported by the projection. */
  const aimPointRef = useRef<{ x: number; y: number } | null>(null);
  /**
   * Where the aimed coordinate lands, and where it should land, in the canvas box's
   * pixel space. `centre` is the middle of the sphere's projected disc; `visible` is
   * the middle of the slice the card actually shows.
   */
  const geometryRef = useRef({ centre: 0, visibleY: 0, tiltBias: 0 });
  /**
   * The range's document-space top and its travel, cached so progress can be sampled
   * from window.scrollY every frame. Reading scrollY is free; a getBoundingClientRect
   * in the render loop would force layout on every frame instead.
   */
  const rangeMetricsRef = useRef({ top: 0, travel: 0 });
  const lastSampleRef = useRef(0);
  const reduceMotionRef = useRef(false);
  /** Index of the stop being visited, for the label highlight. Read every frame. */
  const stageIndexRef = useRef(0);
  const engagedRef = useRef(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Reused across frames so collision resolution allocates nothing per tick.
  const placedBoxes = useRef<Array<{ x: number; y: number; w: number; h: number }>>([]);
  const orderScratch = useRef<ProjectedAnchor[]>([]);

  useEffect(() => {
    const card = cardRef.current;
    const slot = slotRef.current;
    if (!card || !slot) return;

    const measure = () => {
      const c = card.getBoundingClientRect();
      const s = slot.getBoundingClientRect();
      if (!c.height || !s.width || !s.height) return;

      const compact = window.matchMedia("(max-width: 767px)").matches;

      // The slot is a normal flow child sitting directly under the subtitle and
      // stretching to the card's bottom edge, so its box already *is* the frame the
      // planet has to fill. Nothing here decides where the globe starts — the flow
      // does, which is why no gap can open up between the copy and the sphere.
      const sphereSize = horizonDiameter(s.width, s.height);

      const boxSize = sphereSize / GLOBE_FIT;
      // GLOBE_FIT leaves haze room around the silhouette; lift the box by that margin so
      // the sphere's crown, not the transparent canvas edge, sits on the slot's top.
      // Everything below the card's floor is cropped by its overflow-hidden.
      //
      // Then give the bloom its headroom back: seating the crown *exactly* on the top
      // edge clipped the ring above it, which is the break in the arc at top-centre.
      // This drops the crown by the bloom's own reach, so its outermost pixel lands on
      // the edge and the curve runs unbroken from limb to limb.
      const boxTop = -(boxSize - sphereSize) / 2 + boxSize * HALO_HEADROOM;

      // Aiming puts a coordinate at the centre of the projected disc, which in a horizon
      // framing is far below the card's floor. tiltBias is the extra pitch that lifts it
      // to the middle of the visible slice instead:
      //   the disc's centre sits sphereSize/2 below its crown, the visible middle sits
      //   slotHeight/2 below it, so the gap to close is (sphereSize - slotHeight)/2,
      //   which as a fraction of the radius is 1 - slotHeight/sphereSize.
      geometryRef.current = {
        centre: boxSize / 2,
        visibleY: -boxTop + s.height / 2,
        tiltBias: Math.asin(clamp(1 - s.height / sphereSize, 0, 0.995)),
      };
      setMetrics({ boxSize, boxTop });
      // Markers are reported in the canvas box's space, so the card bounds that clip
      // them have to be restated in it.
      const boxTopInCard = s.top - c.top + boxTop;
      const boxLeft = s.left - c.left + (s.width - boxSize) / 2;

      layoutRef.current = {
        // The card extends above the canvas box, so a label sitting over the whitespace
        // between the copy and the globe is still on screen — it just has a negative y
        // in the box's coordinate space.
        minY: -boxTopInCard,
        maxY: c.height - boxTopInCard,
        minX: -boxLeft,
        maxX: c.width - boxLeft,
        // Scaled to the card: a fixed band would keep a marker faded for most of its
        // pass across a narrow phone container.
        fadeX: Math.min(80, c.width * 0.12),
        fadeY: Math.min(60, c.height * 0.08),
        labelW: compact ? 96 : 132,
        labelH: compact ? 32 : 40,
        compact,
      };
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    observer.observe(slot);
    return () => observer.disconnect();
  }, []);

  /**
   * Writes the tour state for the current scroll progress: where the globe is aimed,
   * how far it is zoomed, and how the markers should read.
   *
   * Only `transform` and `opacity` are touched here — nothing that can trigger layout.
   * The globe is aimed by rotating the sphere itself rather than by panning the element,
   * which is what lets a stop like Antarctica be reached at all: it never enters the
   * visible crop under free rotation, so no CSS transform could have found it.
   */
  const applyStage = useCallback(() => {
    const box = globeBoxRef.current;
    if (!box || reduceMotionRef.current) return;

    const layer = markerLayerRef.current;

    // --- Sample and damp -------------------------------------------------------------
    // Progress is read here, inside the frame that is about to draw, rather than being
    // pushed in from a scroll event. Scroll events fire at their own irregular cadence
    // and land a frame or two behind Lenis's own rAF, so sampling from them meant every
    // frame drew a slightly stale, unevenly spaced position — which is what read as
    // stutter. Sampling per frame removes the hop; the damping below absorbs whatever
    // unevenness is left in the underlying scroll position.
    const { top, travel } = rangeMetricsRef.current;
    const target = travel > 0 ? clamp((window.scrollY - top) / travel, 0, 1) : 0;

    const now = performance.now();
    const gap = (now - lastSampleRef.current) / 1000;
    lastSampleRef.current = now;

    let t = progressRef.current;
    if (gap <= 0 || gap > RESUME_GAP) {
      t = target;
    } else {
      t += (target - t) * (1 - Math.exp(-gap * PROGRESS_SMOOTHING));
      // Settle exactly, so a resting globe stops rewriting its transform every frame.
      if (Math.abs(target - t) < 1e-4) t = target;
    }
    progressRef.current = t;

    // Only the highlighted stop has to travel through React, and that changes seven
    // times across the whole tour. The ref is updated here rather than further down,
    // because the engage <= 0 path below returns early — leaving it stale there would
    // re-fire setStageIndex every frame once the tour is scrolled back to the top.
    const stop = stageAt(t).index;
    if (stop !== stageIndexRef.current) {
      stageIndexRef.current = stop;
      setStageIndex(stop);
    }

    const engage = smoothstep(0, ENGAGE, t);

    if (engage <= 0) {
      // Back at the very top: hand the globe back to its free drift and every property
      // back to the classes, so the entry reveal behaves as if the tour did not exist.
      focusRef.current = null;
      engagedRef.current = false;
      box.style.transitionProperty = "";
      box.style.transform = "";
      box.style.opacity = "";
      layer?.style.removeProperty("--unzoom");
      return;
    }

    const stage = stageAt(t);
    const { centre, visibleY, tiltBias } = geometryRef.current;

    focusRef.current = { lat: stage.lat, lng: stage.lng, tiltBias, weight: engage };

    // Scale eases in from 1 alongside the aim, so engaging the tour is one continuous
    // move rather than a snap to STOP_ZOOM.
    const scale = 1 + (stage.zoom - 1) * engage;

    // Pin the aimed point at the middle of the visible slice and zoom around it.
    //
    // P is where the aim actually landed, reported by the projection rather than assumed
    // — the axial roll swings the tilt-bias offset sideways, so the aimed point is not on
    // the vertical centre line, and at STOP_ZOOM that error would carry it off screen.
    // Scaling happens about the element's own centre O, so:
    //   position = O + d + scale·(P - O), and we want P + (C - P)·engage
    //   =>  d = (P - O)·(1 - scale) + (C - P)·engage
    // which is identity at engage 0 and lands P exactly on C at engage 1.
    //
    // transform-origin is deliberately left at its default: in Tailwind v4 the box's
    // -translate-x-1/2 and its reveal scale are the standalone translate/scale
    // properties, which apply before transform and share its origin.
    const aim = aimPointRef.current;
    const px = aim ? aim.x : centre;
    const py = aim ? aim.y : visibleY;
    const dx = (px - centre) * (1 - scale) + (centre - px) * engage;
    const dy = (py - centre) * (1 - scale) + (visibleY - py) * engage;

    if (!engagedRef.current) {
      // The reveal's 1400ms ease covers opacity; leaving it on would smear every scroll
      // frame through it instead of tracking the wheel. It has finished by now.
      box.style.transitionProperty = "none";
      engagedRef.current = true;
    }
    box.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
    box.style.opacity = "";

    // Pins ride inside the scaled box, which is what keeps them glued to their landmass.
    // This cancels the magnification on the pin art so a marker keeps its designed size.
    layer?.style.setProperty("--unzoom", (1 / scale).toFixed(4));
  }, []);

  useEffect(() => {
    const range = rangeRef.current;
    if (!range) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reduceMotionRef.current = reduced;
    // The tour is the only reason the range is taller than one viewport. With it off
    // there is nothing to scroll through, so collapse the range rather than leave
    // several screens of dead scroll over a frozen globe.
    setReduceMotion(reduced);
    if (reduced) return;

    // The one layout read, kept out of the render loop: where the range sits in the
    // document and how far the sticky child stays pinned. Both only change on resize.
    const measureRange = () => {
      const rect = range.getBoundingClientRect();
      rangeMetricsRef.current = {
        top: rect.top + window.scrollY,
        travel: rect.height - window.innerHeight,
      };
    };

    measureRange();
    applyStage();

    const observer = new ResizeObserver(() => {
      measureRange();
      applyStage();
    });
    observer.observe(range);

    // The globe's render loop is what samples progress now. This only covers the gap
    // where it is suspended — tab hidden, or the canvas scrolled out of view — so the
    // hero is still correct the moment it comes back.
    const onScroll = () => applyStage();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measureRange);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measureRange);
    };
  }, [applyStage]);

  const handleProject = useCallback((projected: ProjectedAnchor[]) => {
    const { minY, maxY, minX, maxX, fadeX, fadeY, labelW, labelH, compact } =
      layoutRef.current;

    // Which stop owns this frame. Read from a ref rather than a prop, so the label
    // treatment costs nothing per frame.
    const tourStop = engagedRef.current ? TOUR[stageIndexRef.current] : null;

    // The aim point drifts while the globe swings onto a new stop, so the zoom has to be
    // re-pinned every frame, not only when the scroll position changes.
    const aim = projected.find((a) => a.id === FOCUS_ANCHOR_ID);
    if (aim) aimPointRef.current = { x: aim.x, y: aim.y };
    // Unconditional: this is the per-frame heartbeat that samples the scroll position,
    // so it has to run before any focus exists too, or the tour could never engage.
    applyStage();

    const order = orderScratch.current;
    order.length = 0;

    for (const anchor of projected) {
      const el = markerRefs.current.get(anchor.id);
      if (!el) continue;

      // Fade before the container edge clips the marker, not after.
      const bottomFade = clamp((maxY - anchor.y) / fadeY, 0, 1);
      const leftFade = clamp((anchor.x - minX) / fadeX, 0, 1);
      const rightFade = clamp((maxX - anchor.x) / fadeX, 0, 1);
      const opacity = anchor.opacity * bottomFade * leftFade * rightFade;

      const style = el.style;
      if (opacity <= 0.01) {
        if (style.visibility !== "hidden") style.visibility = "hidden";
        const label = labelRefs.current.get(anchor.id);
        if (label) label.style.opacity = "0";
        continue;
      }
      if (style.visibility === "hidden") style.visibility = "";

      style.setProperty("--mx", `${anchor.x.toFixed(1)}px`);
      style.setProperty("--my", `${anchor.y.toFixed(1)}px`);
      style.setProperty("--dx", anchor.dirX.toFixed(4));
      style.setProperty("--dy", anchor.dirY.toFixed(4));
      style.setProperty(
        "--angle",
        `${Math.atan2(anchor.dirY, anchor.dirX).toFixed(4)}rad`,
      );
      style.opacity = opacity.toFixed(3);
      style.pointerEvents = opacity >= LABEL_OPACITY_FLOOR ? "auto" : "none";

      order.push({ ...anchor, opacity });
    }

    // --- Label collision ---------------------------------------------------------
    // Most face-on markers win; anything whose label would overlap an already placed one,
    // or would sit outside the card, keeps its pin but drops its text.
    order.sort((a, b) => b.opacity - a.opacity);

    const boxes = placedBoxes.current;
    boxes.length = 0;

    for (const anchor of order) {
      const label = labelRefs.current.get(anchor.id);
      if (!label) continue;

      const site = MINING_SITES.find((s) => s.id === anchor.id);
      // The stop being visited is exempt from every suppression rule — it is the point
      // of the stage, so it keeps its label even edge-on, on a phone, or under a
      // collision that would otherwise drop it.
      const isStop = tourStop !== null && anchor.id === tourStop;
      const suppressed =
        !isStop &&
        (anchor.opacity < LABEL_OPACITY_FLOOR ||
          (compact && site?.labelOnMobile === false));

      if (suppressed) {
        label.style.opacity = "0";
        continue;
      }

      const len = compact ? 40 : 64;
      const cx = anchor.x + anchor.dirX * len;
      const cy = anchor.y + anchor.dirY * len;

      const insideCard =
        cx - labelW / 2 >= minX &&
        cx + labelW / 2 <= maxX &&
        cy - labelH / 2 >= minY &&
        cy + labelH / 2 <= maxY;

      let collides = false;
      if (insideCard) {
        for (const b of boxes) {
          if (
            Math.abs(cx - b.x) < (labelW + b.w) / 2 + 8 &&
            Math.abs(cy - b.y) < (labelH + b.h) / 2 + 8
          ) {
            collides = true;
            break;
          }
        }
      }

      if (!isStop && (!insideCard || collides)) {
        label.style.opacity = "0";
        continue;
      }

      boxes.push({ x: cx, y: cy, w: labelW, h: labelH });
      // While the tour runs the other continents stay legible but recede, so the stop
      // reads as the subject without the rest of the world blinking out.
      label.style.opacity =
        isStop || tourStop === null ? "1" : String(RESTING_LABEL_OPACITY);
    }
  }, [applyStage]);

  const handleReady = useCallback(() => setReady(true), []);

  // Two blocks, and the split is the whole point of the sequence.
  //
  // The copy is an ordinary flow child: it simply scrolls off the top, no pinning, no
  // scroll-linked anything. Underneath it the globe range supplies STAGE_COUNT viewports
  // of travel and pins its own child for all of it.
  //
  // Because the range starts where the copy ends, the range's top edge reaching the top
  // of the viewport is the same instant the copy finishes leaving — and that instant is
  // progress 0, so the tour starts itself with no coordination between the two.
  //
  // Nothing carries hero-rise any more: its fadeInUp holds transform: translateY(0)
  // under fill-mode both, and a lingering transform on a sticky element's ancestor
  // creates a containing block for it. The heading, subtitle and globe each keep their
  // own entrance, so the effect survives without the wrapper's.
  return (
    <section className="relative w-full bg-white">
      {/* Copy — normal flow, scrolls away before anything pins. */}
      <div className="flex flex-col items-center px-6 pb-10 pt-[148px] text-center sm:px-10 lg:pb-12 lg:pt-[196px]">
        <h1 className="hero-rise [animation-delay:120ms] max-w-[16ch] font-geist font-semibold leading-[1.04] tracking-[-0.035em] text-[#15181C] text-[clamp(2.5rem,5.2vw,4.5rem)]">
          All over the world
        </h1>

        <p className="hero-rise [animation-delay:220ms] mt-6 max-w-[30ch] font-geist font-normal leading-[1.45] tracking-[-0.01em] text-[#57595E] text-[clamp(1.125rem,1.7vw,1.625rem)] sm:mt-7 sm:max-w-[34ch] lg:mt-8">
          Meet our distributed team of experts working across 6 continents.
        </p>
      </div>

      {/* Globe range — its top edge is where the tour begins. */}
      <div
        ref={rangeRef}
        className="relative -mt-5 lg:-mt-6"
        // One viewport of travel per stop, derived from the tour so the two cannot drift.
        style={{ height: reduceMotion ? "100vh" : `${STAGE_COUNT * 100}vh` }}
      >
        {/*
          The pinned frame. It is also what the markers are clipped to, so cardRef lives
          here rather than on the section: the visible frame is now one viewport, not the
          whole band, and clipping against the band would never hide anything.
          overflow-hidden crops the planet, and it is safe on this element — only an
          overflow ancestor would break the stickiness, never the sticky element itself.
        */}
        <div
          ref={cardRef}
          className="sticky top-0 h-screen w-full overflow-hidden bg-white"
        >
          {/*
            The globe slot is now the whole pinned viewport rather than the leftovers
            under the copy, so horizonDiameter() sizes the planet against a much squarer
            frame and roughly half the sphere reads instead of a shallow arc. No padding
            to break out of any more — the copy's gutters are on the block above.
          */}
          <div ref={slotRef} className="relative h-full w-full">
            {/* Layer 2 + 3 — globe, clouds and atmosphere */}
            <div
              ref={globeBoxRef}
              className={`
                absolute left-1/2 z-10 -translate-x-1/2 will-change-transform
                transition-[opacity,scale] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                motion-reduce:transition-none
                ${ready ? "opacity-100 scale-100" : "opacity-0 scale-[0.94] motion-reduce:scale-100"}
              `}
              style={{
                width: metrics.boxSize || undefined,
                height: metrics.boxSize || undefined,
                top: metrics.boxSize ? metrics.boxTop : undefined,
              }}
            >
              {/*
                Atmosphere bloom. Square box, centred sphere, stops keyed to GLOBE_FIT, so
                it stays concentric with the silhouette at every size. Sits under the
                canvas: where the sphere is opaque the planet covers it, and the only part
                that shows is the ring spilling onto the card.
              */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ background: ATMOSPHERE_HALO }}
              />

              {metrics.boxSize > 0 && (
                <EarthGlobe
                  // Above the halo, and it composites over it wherever the sphere is lit.
                  style={{ position: "relative" }}
                  className="h-full w-full"
                  anchors={ANCHORS}
                  onProject={handleProject}
                  onReady={handleReady}
                  focusRef={focusRef}
                  speedScale={activeId ? 0.25 : 1}
                />
              )}

              {/* Layer 4 — mining markers, in the same coordinate box as the globe canvas */}
              <div
                ref={markerLayerRef}
                className={`
                  pointer-events-none absolute inset-0 z-10
                  transition-opacity duration-700 delay-500
                  ${ready ? "opacity-100" : "opacity-0"}
                `}
              >
                {MINING_SITES.map((site, index) => {
                  const isActive =
                    activeId === site.id || TOUR[stageIndex] === site.id;
                  return (
                    <div
                      key={site.id}
                      ref={(el) => {
                        markerRefs.current.set(site.id, el);
                      }}
                      style={{
                        transform:
                          "translate3d(var(--mx, -9999px), var(--my, -9999px), 0) scale(var(--unzoom, 1))",
                      }}
                      className="absolute left-0 top-0 [--len:40px] md:[--len:64px]"
                    >
                      {/* Thin gold connector from the surface out to the label */}
                      <span
                        className="absolute left-0 top-0 block h-px origin-left bg-[linear-gradient(90deg,rgba(184,134,11,0.75),rgba(184,134,11,0.18))]"
                        style={{ width: "var(--len)", transform: "rotate(var(--angle, 0rad))" }}
                      />

                      {/* Pin — 44px hit target centred on the geographic point */}
                      <button
                        type="button"
                        aria-label={`${site.region}, ${site.country}. ${site.detail}.`}
                        className="absolute left-0 top-0 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] focus-visible:ring-offset-2"
                        onPointerEnter={() => setActiveId(site.id)}
                        onPointerLeave={() => setActiveId((id) => (id === site.id ? null : id))}
                        onFocus={() => setActiveId(site.id)}
                        onBlur={() => setActiveId((id) => (id === site.id ? null : id))}
                        onClick={() => setActiveId((id) => (id === site.id ? null : site.id))}
                      >
                        <span
                          className="globe-pin-ring"
                          style={{ animationDelay: `${index * 0.42}s` }}
                          aria-hidden="true"
                        />
                        <span
                          className={`globe-pin-dot ${isActive ? "globe-pin-dot--active" : ""}`}
                          style={{ animationDelay: `${index * 0.42}s` }}
                          aria-hidden="true"
                        />
                      </button>

                      {/* Label, offset along the outward normal so it clears the sphere */}
                      <div
                        ref={(el) => {
                          labelRefs.current.set(site.id, el);
                        }}
                        style={{
                          opacity: 0,
                          transform:
                            "translate3d(calc(var(--dx, 0) * var(--len)), calc(var(--dy, 0) * var(--len)), 0)",
                        }}
                        className="absolute left-0 top-0 transition-opacity duration-200"
                      >
                        <div
                          className={`
                            -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-center
                            transition-colors duration-200
                            ${isActive ? "border border-[#E7DCC0] bg-white/95 shadow-[0_4px_16px_rgba(16,24,40,0.12)]" : "border border-transparent"}
                          `}
                        >
                          <span className="block font-geist text-[11px] font-semibold leading-tight tracking-[-0.01em] text-[#15181C] md:text-[12px]">
                            {site.region}
                          </span>
                          <span className="block font-geist text-[9px] font-medium uppercase leading-tight tracking-[0.14em] text-[#9A7B1F] md:text-[10px]">
                            {site.country}
                          </span>
                          {isActive && (
                            <span className="mt-0.5 block font-geist text-[9px] font-normal leading-tight text-[#57595E] md:text-[10px]">
                              {site.detail}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobeHero;
