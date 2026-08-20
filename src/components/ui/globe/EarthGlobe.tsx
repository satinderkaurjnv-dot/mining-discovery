"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildEarthTextures } from "./earthTexture";
import {
  atmosphereFragmentShader,
  atmosphereVertexShader,
  cloudFragmentShader,
  cloudVertexShader,
  earthFragmentShader,
  earthVertexShader,
} from "./shaders";

export interface GlobeAnchor {
  id: string;
  lat: number;
  lng: number;
}

export interface ProjectedAnchor {
  id: string;
  /** Surface point, in CSS pixels relative to the canvas box. */
  x: number;
  y: number;
  /** Unit vector pointing radially away from the globe centre, in screen space. */
  dirX: number;
  dirY: number;
  /** 0 when the anchor has rotated onto the far side, 1 when it faces the camera. */
  opacity: number;
}

/**
 * An orientation the globe can be aimed at, written through a ref so the hero can
 * retarget it every frame without re-rendering this component.
 */
export interface GlobeFocus {
  lat: number;
  lng: number;
  /**
   * Radians of extra upward pitch. Aiming alone puts the coordinate at the centre of
   * the projected disc, which sits below the container's crop in a horizon framing;
   * this lifts it into the part that is actually on screen. The caller owns it because
   * only the caller knows how much of the sphere its container leaves visible.
   */
  tiltBias: number;
  /** 0 = free drift, 1 = fully aimed. Blended, so entering focus never snaps. */
  weight: number;
}

export interface EarthGlobeProps {
  className?: string;
  style?: React.CSSProperties;
  /** Aim target, read every frame. Null or weight 0 leaves the globe drifting. */
  focusRef?: React.RefObject<GlobeFocus | null>;
  /** Geographic points the caller wants projected to screen space every frame. */
  anchors?: GlobeAnchor[];
  /** Fired once per frame with projected anchors. Write to DOM refs here, never to state. */
  onProject?: (anchors: ProjectedAnchor[]) => void;
  /** Fired once the textures are built and the first frame has rendered. */
  onReady?: () => void;
  /** Seconds for one full revolution. */
  rotationPeriod?: number;
  /** Longitude facing the camera on first paint. */
  initialLongitude?: number;
  /**
   * Multiplier on the rotation speed, eased rather than applied instantly. 1 is the
   * normal drift; the hero drops it while a marker is hovered so the site stays under
   * the cursor without the globe snapping to a stop.
   */
  speedScale?: number;
}

/**
 * Id of the synthetic anchor reporting where the current focus point landed on screen.
 *
 * Solving for it analytically is not enough: the axial roll sits outside the pitch, so
 * it swings the tilt-bias offset sideways, and perspective bends the result again. The
 * projection already knows the answer exactly, so it reports it instead.
 */
export const FOCUS_ANCHOR_ID = "__focus";

/** Vertical field of view, kept narrow so a planet-scale sphere reads near-orthographic. */
const FOV = 20;
/**
 * Fraction of the canvas box the sphere silhouette fills, leaving room for the haze.
 * Exported so the hero can derive a canvas size from the sphere diameter it wants.
 */
export const GLOBE_FIT = 0.9;
const FIT = GLOBE_FIT;

/** Radians the spin axis leans, close to the real 23.4 degree obliquity. */
const AXIAL_TILT = THREE.MathUtils.degToRad(-19);
/**
 * Radians of pitch. The container only leaves a shallow cap of the sphere on screen, and
 * a negative pitch swings the populated northern mid-latitudes up into it — at 0 the cap
 * shows little but the Arctic, and GlobeHero's markers would sit below the crop for most
 * of every revolution. Tuned together with AXIAL_TILT (which is applied first, so the two
 * interact) to keep one to three markers on screen at all times.
 */
const VIEW_PITCH = THREE.MathUtils.degToRad(-15);

/**
 * Converts a coordinate to a point on the unit sphere using the same convention as
 * THREE.SphereGeometry UVs, so markers land exactly on their painted landmass.
 * With phiStart = 0, u = 0 maps to (-1, 0, 0), which is longitude -180.
 */
function latLngToVector3(lat: number, lng: number, target = new THREE.Vector3()) {
  const phi = THREE.MathUtils.degToRad(lng + 180);
  const theta = THREE.MathUtils.degToRad(90 - lat);
  const sinTheta = Math.sin(theta);
  return target.set(
    -Math.cos(phi) * sinTheta,
    Math.cos(theta),
    Math.sin(phi) * sinTheta
  );
}

/** Signed shortest way from a to b, so a blend never unwinds the long way round. */
function shortestAngle(a: number, b: number) {
  return ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

export const EarthGlobe: React.FC<EarthGlobeProps> = ({
  className = "",
  style,
  focusRef,
  anchors,
  onProject,
  onReady,
  rotationPeriod = 52,
  initialLongitude = 18,
  speedScale = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Props consumed inside the render loop live in refs so changing them never
  // tears down the WebGL context.
  const onProjectRef = useRef(onProject);
  const onReadyRef = useRef(onReady);
  const anchorsRef = useRef(anchors);
  const rotationPeriodRef = useRef(rotationPeriod);
  const speedScaleRef = useRef(speedScale);
  const focusSourceRef = useRef(focusRef);

  useEffect(() => {
    onProjectRef.current = onProject;
    onReadyRef.current = onReady;
    anchorsRef.current = anchors;
    rotationPeriodRef.current = rotationPeriod;
    speedScaleRef.current = speedScale;
    focusSourceRef.current = focusRef;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let frameId: number | null = null;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        // MSAA is deliberately off. It smooths *geometry* edges only — the limb and the
        // atmosphere shell — and does nothing for the surface texture, which is what goes
        // soft when the box is CSS-scaled at a tour stop. Its memory (a multisampled
        // renderbuffer, commonly 4x) buys far more sharpness spent on drawing-buffer
        // resolution instead: the larger buffer is downsampled to the element at rest,
        // which supersamples those same edges, *and* it holds real detail to magnify
        // into when the zoom arrives. See applySize for the resulting budget.
        antialias: false,
        powerPreference: "high-performance",
      });
    } catch {
      // No WebGL: the hero degrades to typography on a plain card.
      return;
    }

    const isSmallViewport = window.matchMedia("(max-width: 767px)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    renderer.setClearAlpha(0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();

    const halfFov = THREE.MathUtils.degToRad(FOV) / 2;
    const silhouetteAngle = Math.atan(FIT * Math.tan(halfFov));
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, 1 / Math.sin(silhouetteAngle));
    camera.lookAt(0, 0, 0);

    // Three nested frames, and the nesting order is load-bearing.
    //
    // Aiming a coordinate at the camera is Rx(lat)·Ry(-(lng + 90))·v = (0, 0, 1). That
    // identity only holds if nothing sits between the pitch and the spin, so the axial
    // lean moves OUT to a parent and becomes a roll about the view axis — which leaves
    // an already-centred point exactly where it is. With the lean in its old slot
    // (rotation.z on the same group, applied to v before the pitch) every aim would be
    // off by the tilt.
    const rollGroup = new THREE.Group();
    rollGroup.rotation.z = AXIAL_TILT;
    scene.add(rollGroup);

    // tiltGroup carries the viewing pitch; the earth spins inside it.
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.x = VIEW_PITCH;
    rollGroup.add(tiltGroup);

    const sunDirection = new THREE.Vector3(-0.62, 0.34, 0.7).normalize();

    // --- Atmosphere shell -------------------------------------------------------
    // Front-faced and depth-test free, so the haze washes over the limb of the earth
    // and fades to nothing at the centre of the disc.
    const ATMOSPHERE_RADIUS = 1.055;
    const atmosphereGeometry = new THREE.SphereGeometry(ATMOSPHERE_RADIUS, 96, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color("#8FB3D9") },
        uSunDirection: { value: sunDirection },
        uStrength: { value: 0.34 },
        uLimb: { value: Math.sqrt(1 - 1 / (ATMOSPHERE_RADIUS * ATMOSPHERE_RADIUS)) },
        // Lower falloff spreads the haze further in from the limb, so the lit edge is a
        // soft band rather than a thin bright line at horizon scale.
        uInnerFalloff: { value: 9 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.FrontSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.renderOrder = 10;
    tiltGroup.add(atmosphere);

    // --- Earth ------------------------------------------------------------------
    const earthGeometry = new THREE.SphereGeometry(
      1,
      isSmallViewport ? 96 : 160,
      isSmallViewport ? 64 : 96
    );
    // Placeholder until the textures finish building; swapped out in the promise below.
    const placeholderMaterial = new THREE.MeshBasicMaterial({ visible: false });
    const earth = new THREE.Mesh<THREE.SphereGeometry, THREE.Material>(
      earthGeometry,
      placeholderMaterial
    );
    earth.rotation.y = THREE.MathUtils.degToRad(-(initialLongitude + 90));
    earth.visible = false;
    earth.renderOrder = 1;
    tiltGroup.add(earth);

    // --- Cloud shell ------------------------------------------------------------
    // Its own mesh just above the surface, drifting slightly faster than the ground so
    // the two layers separate as the planet turns.
    const cloudGeometry = new THREE.SphereGeometry(
      1.012,
      isSmallViewport ? 64 : 96,
      isSmallViewport ? 48 : 64
    );
    const cloudPlaceholder = new THREE.MeshBasicMaterial({ visible: false });
    const clouds = new THREE.Mesh<THREE.SphereGeometry, THREE.Material>(
      cloudGeometry,
      cloudPlaceholder
    );
    clouds.visible = false;
    clouds.renderOrder = 2;
    tiltGroup.add(clouds);

    let earthMaterial: THREE.ShaderMaterial | null = null;
    let cloudMaterial: THREE.ShaderMaterial | null = null;
    let dayTexture: THREE.CanvasTexture | null = null;
    let maskTexture: THREE.CanvasTexture | null = null;
    let cloudTexture: THREE.CanvasTexture | null = null;

    // --- Sizing -----------------------------------------------------------------
    let width = canvas.clientWidth || 1;
    let height = canvas.clientHeight || 1;

    const applySize = () => {
      width = Math.max(canvas.clientWidth, 1);
      height = Math.max(canvas.clientHeight, 1);

      // The box is deliberately far wider than the viewport, so a raw devicePixelRatio
      // would allocate an enormous framebuffer. Cap the longest drawing-buffer edge; the
      // globe is smooth-gradient heavy and holds up well below 2x.
      //
      // ZOOM_HEADROOM is why the ratio is not simply capped at devicePixelRatio. The tour
      // magnifies this element with a CSS scale(), so its on-screen size at a stop is far
      // larger than the size measured here — and a buffer sized to the *resting* box has
      // no detail left to supply once it is stretched, which is what read as blur at 2-3x.
      // On a 1x display the old cap made the buffer exactly the CSS size, so every pixel
      // of the zoom was pure upscale. Rendering above the device ratio is normally waste;
      // here it is the whole point.
      const ZOOM_HEADROOM = 1.6;
      const maxEdge = isSmallViewport ? 2600 : 4096;
      const ratioCap = maxEdge / Math.max(width, height);
      renderer.setPixelRatio(
        Math.max(
          1,
          Math.min(
            (window.devicePixelRatio || 1) * ZOOM_HEADROOM,
            isSmallViewport ? 2.5 : 3,
            ratioCap
          )
        )
      );

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    applySize();

    // --- Anchor projection ------------------------------------------------------
    const anchorBase = new Map<string, THREE.Vector3>();
    const worldPoint = new THREE.Vector3();
    const surfaceNormal = new THREE.Vector3();
    const toCamera = new THREE.Vector3();
    const projected = new THREE.Vector3();
    const outerPoint = new THREE.Vector3();
    const focusPoint = new THREE.Vector3();
    const results: ProjectedAnchor[] = [];

    const projectAnchors = () => {
      const list = anchorsRef.current;
      const report = onProjectRef.current;
      if (!report) return;

      results.length = 0;
      earth.updateMatrixWorld();

      for (const anchor of list ?? []) {
        let base = anchorBase.get(anchor.id);
        if (!base) {
          base = latLngToVector3(anchor.lat, anchor.lng);
          anchorBase.set(anchor.id, base);
        }

        worldPoint.copy(base).applyMatrix4(earth.matrixWorld);
        // The globe sits at the world origin, so the position doubles as the normal.
        surfaceNormal.copy(worldPoint).normalize();
        toCamera.copy(camera.position).sub(worldPoint).normalize();

        const facing = surfaceNormal.dot(toCamera);

        projected.copy(worldPoint).project(camera);
        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height;

        outerPoint.copy(worldPoint).addScaledVector(surfaceNormal, 0.3).project(camera);
        let dirX = (outerPoint.x * 0.5 + 0.5) * width - x;
        let dirY = (-outerPoint.y * 0.5 + 0.5) * height - y;
        const length = Math.hypot(dirX, dirY) || 1;
        dirX /= length;
        dirY /= length;

        results.push({
          id: anchor.id,
          x,
          y,
          dirX,
          dirY,
          // Anything with facing > 0 is on the near side. The cap the hero leaves visible
          // sits near the top of the sphere, where normals point up and away from the
          // camera, so this has to stay low — a high threshold would fade out pins that
          // are plainly on screen. It only needs to catch the silhouette, where facing → 0.
          opacity: smoothstep(0.03, 0.16, facing),
        });
      }

      // Report where the aim landed, so the caller can pin it under a CSS zoom without
      // having to re-derive the projection.
      const focus = focusSourceRef.current?.current ?? null;
      if (focus && focus.weight > 0) {
        latLngToVector3(focus.lat, focus.lng, focusPoint);
        worldPoint.copy(focusPoint).applyMatrix4(earth.matrixWorld);
        surfaceNormal.copy(worldPoint).normalize();
        toCamera.copy(camera.position).sub(worldPoint).normalize();
        projected.copy(worldPoint).project(camera);
        results.push({
          id: FOCUS_ANCHOR_ID,
          x: (projected.x * 0.5 + 0.5) * width,
          y: (-projected.y * 0.5 + 0.5) * height,
          dirX: 0,
          dirY: 0,
          opacity: smoothstep(0.03, 0.16, surfaceNormal.dot(toCamera)),
        });
      }

      report(results);
    };

    // Eased toward the requested scale so hovering a marker slows the drift smoothly
    // instead of snapping it.
    let currentSpeed = 1;
    // The free drift is tracked separately from what is finally written to the mesh, so
    // focus can blend against it and releasing focus resumes mid-drift with no jump.
    let freeYaw = earth.rotation.y;
    let cloudLead = 0;

    const renderFrame = (delta: number) => {
      if (delta > 0) {
        const target = speedScaleRef.current;
        currentSpeed += (target - currentSpeed) * Math.min(delta * 3.5, 1);

        const turn = (delta * Math.PI * 2 * currentSpeed) / rotationPeriodRef.current;
        freeYaw += turn;
        // Slight parallax: the cloud sheet runs a touch ahead of the surface.
        cloudLead += turn * 0.12;
      }

      const focus = focusSourceRef.current?.current ?? null;
      const weight = focus ? Math.min(Math.max(focus.weight, 0), 1) : 0;

      if (weight > 0 && focus) {
        // Ry brings the target's meridian round to face the camera, Rx lifts its
        // latitude to the centre of the disc, and tiltBias then pushes it up into the
        // slice of sphere the container actually shows.
        const aimYaw = THREE.MathUtils.degToRad(-(focus.lng + 90));
        const aimPitch = THREE.MathUtils.degToRad(focus.lat) - focus.tiltBias;
        earth.rotation.y = freeYaw + shortestAngle(freeYaw, aimYaw) * weight;
        tiltGroup.rotation.x = VIEW_PITCH + (aimPitch - VIEW_PITCH) * weight;
      } else {
        earth.rotation.y = freeYaw;
        tiltGroup.rotation.x = VIEW_PITCH;
      }
      clouds.rotation.y = earth.rotation.y + cloudLead;

      renderer.render(scene, camera);
      projectAnchors();
    };

    // --- Loop -------------------------------------------------------------------
    let lastTime = 0;
    let running = false;
    let inViewport = true;

    const tick = (now: number) => {
      if (disposed) return;
      // Clamped so a backgrounded tab does not resume with a visible jump.
      const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
      lastTime = now;
      renderFrame(delta);
      frameId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || disposed || !earthMaterial) return;
      running = true;
      lastTime = 0;
      frameId = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    };

    const syncRunState = () => {
      if (prefersReducedMotion) return;
      if (inViewport && document.visibilityState === "visible") start();
      else stop();
    };

    const resizeObserver = new ResizeObserver(() => {
      applySize();
      // Keep a paused globe (reduced motion, or scrolled out of view) in sync.
      if (!running) renderFrame(0);
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        inViewport = entries.some((entry) => entry.isIntersecting);
        syncRunState();
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(canvas);

    document.addEventListener("visibilitychange", syncRunState);

    // --- Async texture build ----------------------------------------------------
    buildEarthTextures(isSmallViewport ? 2048 : 4096)
      .then(({ day, mask, clouds: cloudMap }) => {
        if (disposed) return;

        const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

        dayTexture = new THREE.CanvasTexture(day);
        dayTexture.colorSpace = THREE.SRGBColorSpace;
        dayTexture.wrapS = THREE.RepeatWrapping;
        dayTexture.wrapT = THREE.ClampToEdgeWrapping;
        dayTexture.anisotropy = maxAnisotropy;

        maskTexture = new THREE.CanvasTexture(mask);
        maskTexture.colorSpace = THREE.NoColorSpace;
        maskTexture.wrapS = THREE.RepeatWrapping;
        maskTexture.wrapT = THREE.ClampToEdgeWrapping;
        maskTexture.anisotropy = maxAnisotropy;

        earthMaterial = new THREE.ShaderMaterial({
          vertexShader: earthVertexShader,
          fragmentShader: earthFragmentShader,
          uniforms: {
            uDayMap: { value: dayTexture },
            uMaskMap: { value: maskTexture },
            uMaskTexel: { value: new THREE.Vector2(1 / mask.width, 1 / mask.height) },
            uSunDirection: { value: sunDirection },
            uHazeColor: { value: new THREE.Color("#9FC0DE") },
            // Ambient is the flatness dial. Held high it lifts the unlit hemisphere up
            // to meet the lit one and the sphere reads as a printed disc; dropped here
            // to roughly a third, so the surface visibly turns away from the sun while
            // the night side still keeps enough light to read against a white band.
            uAmbient: { value: 0.17 },
            uSunIntensity: { value: 1.02 },
            // Relief is the only depth cue left once the tour zooms past the silhouette,
            // so terrain has to carry it at close range.
            uReliefStrength: { value: 0.45 },
            uHazeStrength: { value: 0.34 },
            // Full opacity: at 0.74 a quarter of the white band bled through every pixel
            // and flattened the shading before it reached the screen.
            uOpacity: { value: 1.0 },
            uDesaturate: { value: 0.16 },
            uSpecularStrength: { value: 0.55 },
            uLimbDarkening: { value: 0.38 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.FrontSide,
        });

        cloudTexture = new THREE.CanvasTexture(cloudMap);
        cloudTexture.colorSpace = THREE.SRGBColorSpace;
        cloudTexture.wrapS = THREE.RepeatWrapping;
        cloudTexture.wrapT = THREE.ClampToEdgeWrapping;
        cloudTexture.anisotropy = maxAnisotropy;

        cloudMaterial = new THREE.ShaderMaterial({
          vertexShader: cloudVertexShader,
          fragmentShader: cloudFragmentShader,
          uniforms: {
            uCloudMap: { value: cloudTexture },
            uSunDirection: { value: sunDirection },
            uOpacity: { value: isSmallViewport ? 0.4 : 0.5 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.FrontSide,
        });

        earth.material = earthMaterial;
        earth.visible = true;
        clouds.material = cloudMaterial;
        clouds.visible = true;

        renderFrame(0);
        onReadyRef.current?.();

        if (prefersReducedMotion) return;
        syncRunState();
      })
      .catch(() => {
        /* Texture build failed; the hero stays readable without the globe. */
      });

    return () => {
      disposed = true;
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", syncRunState);

      earthGeometry.dispose();
      cloudGeometry.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      placeholderMaterial.dispose();
      cloudPlaceholder.dispose();
      earthMaterial?.dispose();
      cloudMaterial?.dispose();
      dayTexture?.dispose();
      maskTexture?.dispose();
      cloudTexture?.dispose();
      renderer.dispose();
    };
  }, [initialLongitude]);

  return <canvas ref={canvasRef} className={className} style={style} aria-hidden="true" />;
};

export default EarthGlobe;
