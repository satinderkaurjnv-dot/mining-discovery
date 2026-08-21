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
function terrainGradient(ctx: CanvasRenderingContext2D, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0.0, "#E4E8E8");
  g.addColorStop(0.06, "#A3ADA5");
  g.addColorStop(0.14, "#78846F");
  g.addColorStop(0.26, "#6C7A64");
  g.addColorStop(0.36, "#87866A");
  g.addColorStop(0.44, "#948E70");
  g.addColorStop(0.52, "#6D7B62");
  g.addColorStop(0.6, "#78805F");
  g.addColorStop(0.68, "#8F8B6D");
  g.addColorStop(0.78, "#77806A");
  g.addColorStop(0.88, "#9EA6A0");
  g.addColorStop(1.0, "#E4E8E8");
  return g;
}

/** Soft blue-grey ocean, lighter toward the poles. */
function oceanGradient(ctx: CanvasRenderingContext2D, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0.0, "#5B7791");
  g.addColorStop(0.16, "#4C6883");
  g.addColorStop(0.5, "#3B586F");
  g.addColorStop(0.84, "#4C6883");
  g.addColorStop(1.0, "#5B7791");
  return g;
}

/** Soft white polar caps blended over both land and sea ice. */
function paintIceCaps(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const north = ctx.createLinearGradient(0, 0, 0, h * 0.1);
  north.addColorStop(0, "rgba(240,245,248,0.92)");
  north.addColorStop(0.45, "rgba(240,245,248,0.42)");
  north.addColorStop(1, "rgba(240,245,248,0)");
  ctx.fillStyle = north;
  ctx.fillRect(0, 0, w, h * 0.1);

  const south = ctx.createLinearGradient(0, h, 0, h * 0.87);
  south.addColorStop(0, "rgba(244,248,250,0.96)");
  south.addColorStop(0.5, "rgba(244,248,250,0.5)");
  south.addColorStop(1, "rgba(244,248,250,0)");
  ctx.fillStyle = south;
  ctx.fillRect(0, h * 0.87, w, h * 0.13);
}

function equirectPath(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const projection = geoEquirectangular()
    .translate([w / 2, h / 2])
    .scale(w / (2 * Math.PI));
  return geoPath(projection, ctx);
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
  const noise = noiseSize(w);

  // Ocean
  ctx.fillStyle = oceanGradient(ctx, h);
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.12;
  ctx.drawImage(
    createFractalNoise(noise.w, noise.h, { seed: 90210, octaves: 4, lo: 96, hi: 190, falloff: 0.3 }),
    0,
    0,
    w,
    h
  );
  ctx.restore();

  // Land
  ctx.save();
  ctx.beginPath();
  path(land);
  ctx.clip();

  ctx.fillStyle = terrainGradient(ctx, h);
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.38;
  ctx.drawImage(
    createFractalNoise(noise.w, noise.h, { seed: 1337, octaves: 6, lo: 88, hi: 208, falloff: 0.34 }),
    0,
    0,
    w,
    h
  );
  ctx.restore();

  // Coastlines and administrative borders
  ctx.save();
  ctx.lineJoin = "round";
  ctx.beginPath();
  path(land);
  ctx.lineWidth = 1.1 * unit;
  ctx.strokeStyle = "rgba(196,214,214,0.34)";
  ctx.stroke();

  ctx.beginPath();
  path(borders);
  ctx.lineWidth = 0.8 * unit;
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
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
