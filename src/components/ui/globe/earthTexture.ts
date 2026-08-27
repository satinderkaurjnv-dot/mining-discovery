/**
 * PROCEDURAL EARTH TEXTURE BUILDER
 *
 * Renders an equirectangular (2:1) day map and a companion data mask straight from
 * the `world-atlas` TopoJSON already vendored in this project, so the globe ships with
 * real coastlines and no external image assets or CDN requests.
 *
 * Outputs
 *  - day  : sRGB colour map (deep ocean, latitude-banded terrain, coastlines, borders, ice caps)
 *  - mask : linear data map where the red channel is 0 over ocean and roughly 0.35..1.0 over
 *           land. The shader reads it for (a) land/ocean specular separation, (b) surface
 *           relief via a gradient, and (c) sparse night-side city lights above a threshold.
 */

import { geoEquirectangular, geoPath } from "d3-geo";
import * as topojson from "topojson-client";
import type { GeoPermissibleObjects } from "d3-geo";

export interface EarthTextureResult {
  day: HTMLCanvasElement;
  mask: HTMLCanvasElement;
  clouds: HTMLCanvasElement;
}

interface NoiseOptions {
  seed: number;
  octaves: number;
  lo: number;
  hi: number;
  falloff: number;
}

/** Deterministic PRNG so the terrain grain is identical on every load. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/**
 * Approximates fBm by stacking bilinearly upscaled lattices of random values.
 * The browser interpolates natively, which is far cheaper than looping multi-octave
 * value noise over several million pixels in JS.
 *
 * Returns its own canvas rather than painting into the target: the finest octave is only
 * a few hundred rows, so the result is smooth enough to compose onto the (much larger)
 * map in a single scaled drawImage instead of one blend per octave at full resolution.
 */
function createFractalNoise(w: number, h: number, opts: NoiseOptions): HTMLCanvasElement {
  const out = makeCanvas(w, h);
  const ctx = out.getContext("2d");
  const rand = mulberry32(opts.seed);
  const lattice = document.createElement("canvas");
  const lctx = lattice.getContext("2d");
  if (!ctx || !lctx) return out;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  for (let o = 0; o < opts.octaves; o += 1) {
    const rows = 4 * 2 ** o;
    lattice.width = rows * 2;
    lattice.height = rows;

    const img = lctx.createImageData(lattice.width, lattice.height);
    const span = opts.hi - opts.lo;
    for (let i = 0; i < img.data.length; i += 4) {
      // Octave 0 is the opaque base layer, so it stays inside [lo, hi] to guarantee land
      // never darkens into the ocean value range. Detail octaves use the full range
      // because they are blended at low alpha on top.
      const v = o === 0 ? opts.lo + rand() * span : rand() * 255;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    lctx.putImageData(img, 0, 0);

    ctx.globalAlpha = o === 0 ? 1 : opts.falloff / 2 ** (o - 1);
    ctx.drawImage(lattice, 0, 0, w, h);
  }

  return out;
}

/** Resolution the noise is generated at before being scaled onto a map. */
function noiseSize(mapWidth: number) {
  const w = Math.min(2048, mapWidth);
  return { w, h: w / 2 };
}

/**
 * Latitude-banded terrain palette: ice, tundra, boreal, arid, tropic, ice.
 *
 * Deliberately muted and mid-toned. The sphere is composited semi-transparently over a
 * white card, which already lifts everything several stops, so a saturated palette here
 * would wash out to pastel while a dark one would fight the airy look.
 */
/**
 * Latitude-banded terrain palette: ice, tundra, boreal, arid, tropic, ice.
 * Tuned with rich mineral undertones (warm ochre, geological greens, subtle gold ore hints).
 */
function terrainGradient(ctx: CanvasRenderingContext2D, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0.0, "#0F2B4E");
  g.addColorStop(0.12, "#133863");
  g.addColorStop(0.28, "#184577");
  g.addColorStop(0.42, "#24558F"); // Digital mineral belt
  g.addColorStop(0.55, "#1B477A");
  g.addColorStop(0.70, "#22528A");
  g.addColorStop(0.85, "#153A65");
  g.addColorStop(1.0, "#0F2B4E");
  return g;
}

/** Deep sleek digital navy/sapphire ocean. */
function oceanGradient(ctx: CanvasRenderingContext2D, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0.0, "#061322");
  g.addColorStop(0.25, "#0A1F38");
  g.addColorStop(0.50, "#0E2848");
  g.addColorStop(0.75, "#0A1F38");
  g.addColorStop(1.0, "#061322");
  return g;
}

/** Soft cyber polar caps. */
function paintIceCaps(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const north = ctx.createLinearGradient(0, 0, 0, h * 0.10);
  north.addColorStop(0, "rgba(220,240,255,0.75)");
  north.addColorStop(0.6, "rgba(200,230,255,0.30)");
  north.addColorStop(1, "rgba(200,230,255,0)");
  ctx.fillStyle = north;
  ctx.fillRect(0, 0, w, h * 0.10);

  const south = ctx.createLinearGradient(0, h, 0, h * 0.88);
  south.addColorStop(0, "rgba(220,240,255,0.85)");
  south.addColorStop(0.6, "rgba(200,230,255,0.35)");
  south.addColorStop(1, "rgba(200,230,255,0)");
  ctx.fillStyle = south;
  ctx.fillRect(0, h * 0.88, w, h * 0.12);
}

function equirectPath(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const projection = geoEquirectangular()
    .translate([w / 2, h / 2])
    .scale(w / (2 * Math.PI));
  return geoPath(projection, ctx);
}

/** Paints digital latitude & longitude grid lines (graticules) across the world. */
function paintDigitalGraticule(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.lineWidth = 0.65;
  ctx.strokeStyle = "rgba(70, 140, 220, 0.12)";

  // Latitude lines every 15 degrees (12 steps)
  for (let lat = 15; lat < 180; lat += 15) {
    const y = (lat / 180) * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    if (lat === 90) {
      // Equator highlight
      ctx.strokeStyle = "rgba(184, 134, 11, 0.35)";
      ctx.lineWidth = 1.0;
      ctx.stroke();
      ctx.strokeStyle = "rgba(70, 140, 220, 0.12)";
      ctx.lineWidth = 0.65;
    } else {
      ctx.stroke();
    }
  }

  // Longitude lines every 30 degrees (12 steps)
  for (let lng = 0; lng <= 360; lng += 30) {
    const x = (lng / 360) * w;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  ctx.restore();
}

/** Instant GPU pattern for high-tech digital telemetry dot matrix. */
function createDotMatrixPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = 12;
  patternCanvas.height = 12;
  const pctx = patternCanvas.getContext("2d");
  if (!pctx) return null;

  pctx.fillStyle = "rgba(212, 175, 55, 0.45)";
  pctx.beginPath();
  pctx.arc(6, 6, 1.1, 0, Math.PI * 2);
  pctx.fill();

  return ctx.createPattern(patternCanvas, "repeat");
}

function paintDayMap(
  land: GeoPermissibleObjects,
  borders: GeoPermissibleObjects,
  w: number
): HTMLCanvasElement {
  const h = w / 2;
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const path = equirectPath(ctx, w, h);
  const unit = w / 2048;

  // Ocean: Deep digital cyber-navy base
  ctx.fillStyle = oceanGradient(ctx, h);
  ctx.fillRect(0, 0, w, h);

  // Digital coordinate grid
  paintDigitalGraticule(ctx, w, h);

  // Land: Clipped to world-atlas geometry
  ctx.save();
  ctx.beginPath();
  path(land);
  ctx.clip();

  // Digital land fill
  ctx.fillStyle = terrainGradient(ctx, h);
  ctx.fillRect(0, 0, w, h);

  // High-tech digital dot matrix over continental landmasses (instant GPU pattern)
  const dotPattern = createDotMatrixPattern(ctx);
  if (dotPattern) {
    ctx.fillStyle = dotPattern;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.restore();

  // Crisp gold vector coastlines
  ctx.save();
  ctx.lineJoin = "round";
  ctx.beginPath();
  path(land);
  ctx.lineWidth = 1.35 * unit;
  ctx.strokeStyle = "rgba(212, 175, 55, 0.85)";
  ctx.stroke();

  // Subtle administrative borders
  ctx.beginPath();
  path(borders);
  ctx.lineWidth = 0.75 * unit;
  ctx.strokeStyle = "rgba(140, 190, 255, 0.25)";
  ctx.stroke();
  ctx.restore();

  paintIceCaps(ctx, w, h);

  return canvas;
}

function paintMaskMap(land: GeoPermissibleObjects, w: number): HTMLCanvasElement {
  const h = w / 2;
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const path = equirectPath(ctx, w, h);

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.beginPath();
  path(land);
  ctx.clip();
  // The base sits well above the shader land cutoff; the fine octaves supply both the
  // relief gradient and the sparse peaks that become night-side city lights.
  ctx.drawImage(
    createFractalNoise(w, h, { seed: 24601, octaves: 7, lo: 132, hi: 236, falloff: 0.36 }),
    0,
    0,
    w,
    h
  );
  ctx.restore();

  return canvas;
}

/**
 * White cloud sheet on its own transparent canvas.
 *
 * fBm luminance is remapped to alpha through a soft threshold, so the low end opens up
 * into clear sky and the high end forms banded cloud masses. Alpha stays well under 1 —
 * this layer is meant to soften the planet, not to hide it.
 */
function paintCloudMap(w: number): HTMLCanvasElement {
  const h = w / 2;
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const noise = createFractalNoise(w, h, {
    seed: 7717,
    octaves: 6,
    lo: 40,
    hi: 232,
    falloff: 0.42,
  });
  ctx.drawImage(noise, 0, 0);

  const image = ctx.getImageData(0, 0, w, h);
  const data = image.data;

  for (let i = 0; i < data.length; i += 4) {
    const luminance = data[i] / 255;
    // Soft threshold: nothing below 0.46, ramping to full cloud by 0.86.
    const t = Math.min(Math.max((luminance - 0.46) / 0.4, 0), 1);
    const coverage = t * t * (3 - 2 * t);

    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = Math.round(coverage * 208);
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

/**
 * Builds the maps. The TopoJSON is pulled in via dynamic import so the ~750KB atlas
 * lands in its own chunk, fetched after the hero has already painted.
 */
export async function buildEarthTextures(dayWidth: number): Promise<EarthTextureResult> {
  const atlas = await import("world-atlas/countries-50m.json");
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const topology = ((atlas as any).default ?? atlas) as any;

  const land = topojson.merge(
    topology,
    topology.objects.countries.geometries
  ) as unknown as GeoPermissibleObjects;

  const borders = topojson.mesh(
    topology,
    topology.objects.countries,
    (a: any, b: any) => a !== b
  ) as unknown as GeoPermissibleObjects;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return {
    day: paintDayMap(land, borders, dayWidth),
    mask: paintMaskMap(land, Math.max(1024, Math.round(dayWidth / 2))),
    // Clouds are soft, low-frequency shapes with nothing to resolve, so they are pinned
    // rather than scaled with the day map. Following it to 3072 would cost ~19MB and a
    // per-pixel alpha remap over 2.25x the area to render the same blurry puffs.
    clouds: paintCloudMap(Math.max(1024, Math.min(2048, Math.round(dayWidth / 2)))),
  };
}
