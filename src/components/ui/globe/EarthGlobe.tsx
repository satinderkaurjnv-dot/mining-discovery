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
  /** Fired when user interacts with globe via drag/touch. */
  onUserInteract?: () => void;
  /** Seconds for one full revolution. */
  rotationPeriod?: number;
  /** Longitude facing the camera on first paint. */
  initialLongitude?: number;
  /** Multiplier on the rotation speed. */
  speedScale?: number;
  /** Whether interactive drag is enabled */
  interactive?: boolean;
}

/**
 * Id of the synthetic anchor reporting where the current focus point landed on screen.
 */
export const FOCUS_ANCHOR_ID = "__focus";

/** Vertical field of view, kept narrow so a planet-scale sphere reads near-orthographic. */
const FOV = 20;
/** Fraction of the canvas box the sphere silhouette fills. */
export const GLOBE_FIT = 0.9;
const FIT = GLOBE_FIT;

/** Radians the spin axis leans, close to the real 23.4 degree obliquity. */
const AXIAL_TILT = THREE.MathUtils.degToRad(-19);
const VIEW_PITCH = THREE.MathUtils.degToRad(-15);

/**
 * Converts a coordinate to a point on the unit sphere using the same convention as
 * THREE.SphereGeometry UVs.
 */
function latLngToVector3(lat: number, lng: number, radius = 1, target = new THREE.Vector3()) {
  const phi = THREE.MathUtils.degToRad(lng + 180);
  const theta = THREE.MathUtils.degToRad(90 - lat);
  const sinTheta = Math.sin(theta);
  return target.set(
    -Math.cos(phi) * sinTheta * radius,
    Math.cos(theta) * radius,
    Math.sin(phi) * sinTheta * radius
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

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

// Global mining corridors for great-circle arcs
const MINING_CORRIDORS = [
  { from: { lat: 56, lng: -106 }, to: { lat: 60, lng: 18 } },    // Canada -> Sweden
  { from: { lat: 60, lng: 18 }, to: { lat: 46, lng: 104 } },    // Sweden -> Mongolia
  { from: { lat: 46, lng: 104 }, to: { lat: -25, lng: 122 } },  // Mongolia -> Australia
  { from: { lat: -25, lng: 122 }, to: { lat: -30, lng: 24 } },  // Australia -> South Africa
  { from: { lat: -30, lng: 24 }, to: { lat: -30, lng: -71 } },  // South Africa -> Chile
  { from: { lat: -30, lng: -71 }, to: { lat: 56, lng: -106 } }, // Chile -> Canada
  { from: { lat: 56, lng: -106 }, to: { lat: -25, lng: 122 } }, // Canada -> Australia
];

export const EarthGlobe: React.FC<EarthGlobeProps> = ({
  className = "",
  style,
  focusRef,
  anchors,
  onProject,
  onReady,
  onUserInteract,
  rotationPeriod = 22,
  initialLongitude = 18,
  speedScale = 1,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onProjectRef = useRef(onProject);
  const onReadyRef = useRef(onReady);
  const onUserInteractRef = useRef(onUserInteract);
  const anchorsRef = useRef(anchors);
  const rotationPeriodRef = useRef(rotationPeriod);
  const speedScaleRef = useRef(speedScale);
  const focusSourceRef = useRef(focusRef);
  const interactiveRef = useRef(interactive);

  useEffect(() => {
    onProjectRef.current = onProject;
    onReadyRef.current = onReady;
    onUserInteractRef.current = onUserInteract;
    anchorsRef.current = anchors;
    rotationPeriodRef.current = rotationPeriod;
    speedScaleRef.current = speedScale;
    focusSourceRef.current = focusRef;
    interactiveRef.current = interactive;
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
        antialias: false,
        depth: false,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    const isSmallViewport = window.matchMedia("(max-width: 767px)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    renderer.setClearAlpha(0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();

    const halfFov = THREE.MathUtils.degToRad(FOV) / 2;
    const silhouetteAngle = Math.atan(FIT * Math.tan(halfFov));
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, 1 / Math.sin(silhouetteAngle));
    camera.lookAt(0, 0, 0);

    const rollGroup = new THREE.Group();
    rollGroup.rotation.z = AXIAL_TILT;
    scene.add(rollGroup);

    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.x = VIEW_PITCH;
    rollGroup.add(tiltGroup);

    const sunDirection = new THREE.Vector3(-0.62, 0.34, 0.7).normalize();

    // --- Atmosphere shell -------------------------------------------------------
    const ATMOSPHERE_RADIUS = 1.055;
    const atmosphereGeometry = new THREE.SphereGeometry(ATMOSPHERE_RADIUS, 96, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color("#95BEE8") },
        uSunDirection: { value: sunDirection },
        uStrength: { value: 0.38 },
        uLimb: { value: Math.sqrt(1 - 1 / (ATMOSPHERE_RADIUS * ATMOSPHERE_RADIUS)) },
        uInnerFalloff: { value: 8.5 },
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
    const placeholderMaterial = new THREE.MeshBasicMaterial({ visible: false });
    const earth = new THREE.Mesh<THREE.SphereGeometry, THREE.Material>(
      earthGeometry,
      placeholderMaterial
    );
    earth.rotation.y = THREE.MathUtils.degToRad(-(initialLongitude + 90));
    earth.visible = false;
    earth.renderOrder = 1;
    tiltGroup.add(earth);

    // --- 3D Great-Circle Connection Arcs & Light Pulses -------------------------
    const arcGroup = new THREE.Group();
    const pulseData: Array<{
      curve: THREE.CatmullRomCurve3;
      mesh: THREE.Mesh;
      progress: number;
      speed: number;
    }> = [];

    const pulseGeometry = new THREE.SphereGeometry(0.012, 10, 10);
    const pulseBaseMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#FFDF78"),
      transparent: true,
      opacity: 0.95,
    });

    MINING_CORRIDORS.forEach((corridor, idx) => {
      const p1 = latLngToVector3(corridor.from.lat, corridor.from.lng, 1.002);
      const p2 = latLngToVector3(corridor.to.lat, corridor.to.lng, 1.002);

      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      const altitude = 1.0 + Math.min(0.24, Math.max(0.06, dist * 0.14));
      mid.normalize().multiplyScalar(altitude);

      const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
      const points = curve.getPoints(36);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const lineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color("#E5C158"),
        transparent: true,
        opacity: 0.48,
      });

      const line = new THREE.Line(geometry, lineMaterial);
      arcGroup.add(line);

      const pulseMesh = new THREE.Mesh(pulseGeometry, pulseBaseMaterial.clone());
      arcGroup.add(pulseMesh);

      pulseData.push({
        curve,
        mesh: pulseMesh,
        progress: (idx * 0.16) % 1,
        speed: 0.24 + (idx % 3) * 0.06,
      });
    });

    earth.add(arcGroup);

    // --- 3D Golden Mine Landmark Pins on Globe ---------------------------------
    const pinGroup = new THREE.Group();
    const pinHeadGeometry = new THREE.SphereGeometry(0.022, 12, 12);
    const pinHeadMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#FFD700"),
    });

    const pinStemGeometry = new THREE.CylinderGeometry(0.0035, 0.0035, 0.045, 8);
    const pinStemMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#D4AF37"),
    });

    const pinBaseRingGeometry = new THREE.RingGeometry(0.012, 0.022, 16);
    const pinBaseRingMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#FFD700"),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });

    const anchorList = anchorsRef.current || [];
    anchorList.forEach((anchor) => {
      if (anchor.id === "antarctica") return;
      const basePos = latLngToVector3(anchor.lat, anchor.lng, 1.002);
      const topPos = latLngToVector3(anchor.lat, anchor.lng, 1.048);

      const singlePin = new THREE.Group();

      // Pin Head (Glowing Gold Sphere)
      const head = new THREE.Mesh(pinHeadGeometry, pinHeadMaterial);
      head.position.copy(topPos);
      singlePin.add(head);

      // Pin Stem (Gold Vertical Needle)
      const midPos = new THREE.Vector3().addVectors(basePos, topPos).multiplyScalar(0.5);
      const stem = new THREE.Mesh(pinStemGeometry, pinStemMaterial);
      stem.position.copy(midPos);
      stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), basePos.clone().normalize());
      singlePin.add(stem);

      // Pin Base Ground Ring
      const baseRing = new THREE.Mesh(pinBaseRingGeometry, pinBaseRingMaterial);
      baseRing.position.copy(basePos);
      baseRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), basePos.clone().normalize());
      singlePin.add(baseRing);

      pinGroup.add(singlePin);
    });

    earth.add(pinGroup);

    // --- Ambient Mineral Dust / Twinkling Particle Field ------------------------
    const dustCount = 180;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.05 + Math.random() * 0.38;
      dustPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      dustPositions[i * 3 + 1] = r * Math.cos(phi);
      dustPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const isGold = Math.random() > 0.40;
      dustColors[i * 3] = isGold ? 1.0 : 0.85;
      dustColors[i * 3 + 1] = isGold ? 0.85 : 0.95;
      dustColors[i * 3 + 2] = isGold ? 0.35 : 1.0;
    }

    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute("color", new THREE.BufferAttribute(dustColors, 3));

    const dustMaterial = new THREE.PointsMaterial({
      size: isSmallViewport ? 0.018 : 0.026,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });

    const dustPoints = new THREE.Points(dustGeometry, dustMaterial);
    tiltGroup.add(dustPoints);

    // --- Cloud shell ------------------------------------------------------------
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

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);

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
          base = latLngToVector3(anchor.lat, anchor.lng, 1);
          anchorBase.set(anchor.id, base);
        }

        worldPoint.copy(base).applyMatrix4(earth.matrixWorld);
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
          opacity: smoothstep(0.03, 0.16, facing),
        });
      }

      const focus = focusSourceRef.current?.current ?? null;
      if (focus && focus.weight > 0) {
        latLngToVector3(focus.lat, focus.lng, 1, focusPoint);
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

    // --- Interactive Drag & Parallax State ---------------------------------------
    let isPointerDown = false;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let lastDragX = 0;
    let lastDragY = 0;
    let velocityYaw = 0;
    let velocityPitch = 0;
    let manualPitch = 0;
    let parallaxTargetX = 0;
    let parallaxTargetY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    let currentSpeed = 1;
    let freeYaw = earth.rotation.y;
    let cloudLead = 0;

    const renderFrame = (delta: number) => {
      if (isDragging) {
        // Active dragging handled in pointermove
      } else {
        // Smooth physics inertia damping for long fluid full-globe spinning
        velocityYaw *= 0.965;
        velocityPitch *= 0.94;
        freeYaw += velocityYaw;
        manualPitch = clamp(manualPitch + velocityPitch, -1.25, 1.25);

        // Gentle return toward neutral viewing angle when resting
        manualPitch += (0 - manualPitch) * Math.min(delta * 0.8, 1);
      }

      currentParallaxX += (parallaxTargetX - currentParallaxX) * Math.min(delta * 5, 1);
      currentParallaxY += (parallaxTargetY - currentParallaxY) * Math.min(delta * 5, 1);

      const focus = focusSourceRef.current?.current ?? null;
      const weight = focus ? Math.min(Math.max(focus.weight, 0), 1) : 0;

      if (delta > 0) {
        const target = speedScaleRef.current;
        currentSpeed += (target - currentSpeed) * Math.min(delta * 3.5, 1);

        if (!isDragging && (!focus || weight <= 0)) {
          const turn = (delta * Math.PI * 2 * currentSpeed) / rotationPeriodRef.current;
          freeYaw += turn;
          cloudLead += turn * 0.12;
        }

        pulseData.forEach((item) => {
          item.progress = (item.progress + delta * item.speed) % 1;
          const pt = item.curve.getPoint(item.progress);
          item.mesh.position.copy(pt);
          const pMat = item.mesh.material as THREE.MeshBasicMaterial;
          if (pMat) {
            pMat.opacity = 0.5 + 0.45 * Math.sin(item.progress * Math.PI);
          }
        });

        dustPoints.rotation.y += delta * 0.04;
      }

      if (weight > 0 && focus) {
        const aimYaw = THREE.MathUtils.degToRad(-(focus.lng + 90));
        const aimPitch = THREE.MathUtils.degToRad(focus.lat) - focus.tiltBias;
        freeYaw += shortestAngle(freeYaw, aimYaw) * Math.min(delta * 4.0, 1);
        earth.rotation.y = freeYaw;
        tiltGroup.rotation.x = VIEW_PITCH + manualPitch + (aimPitch - VIEW_PITCH) * weight + currentParallaxY;
      } else {
        earth.rotation.y = freeYaw;
        tiltGroup.rotation.x = VIEW_PITCH + manualPitch + currentParallaxY;
      }
      tiltGroup.rotation.z = currentParallaxX;
      clouds.rotation.y = earth.rotation.y + cloudLead;

      renderer.render(scene, camera);
      projectAnchors();
    };

    // --- Pointer / Touch Event Listeners ----------------------------------------
    const handlePointerDown = (e: PointerEvent) => {
      if (!interactiveRef.current) return;
      isPointerDown = true;
      isDragging = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      lastDragX = e.clientX;
      lastDragY = e.clientY;
      velocityYaw = 0;
      velocityPitch = 0;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Fallback ignore
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactiveRef.current) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
        const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;
        parallaxTargetX = normalizedX * 0.06;
        parallaxTargetY = -normalizedY * 0.06;
      }

      if (!isPointerDown) return;

      const dx = e.clientX - lastDragX;
      const dy = e.clientY - lastDragY;
      lastDragX = e.clientX;
      lastDragY = e.clientY;

      if (!isDragging) {
        const totalDist = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY);
        if (totalDist > 3) {
          isDragging = true;
          canvas.style.cursor = "grabbing";
          onUserInteractRef.current?.();
        }
      }

      if (isDragging) {
        // High-sensitivity responsiveness so hand swipe spins the full globe easily
        const sensitivity = 0.014;
        const deltaYaw = dx * sensitivity;
        const deltaPitch = dy * sensitivity * 0.85;

        freeYaw += deltaYaw;
        manualPitch = clamp(manualPitch + deltaPitch, -1.25, 1.25);

        velocityYaw = deltaYaw;
        velocityPitch = deltaPitch;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isPointerDown) {
        isPointerDown = false;
        if (isDragging) {
          isDragging = false;
          canvas.style.cursor = "grab";
        }
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {
          // Fallback ignore
        }
      }
    };

    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);

    // --- Loop -------------------------------------------------------------------
    let lastTime = 0;
    let running = false;
    let inViewport = true;

    const tick = (now: number) => {
      if (disposed) return;
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
    const driverTextureCap = renderer.capabilities.maxTextureSize || 4096;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const desktopWidth = deviceMemory && deviceMemory < 8 ? 4096 : 6144;
    const dayWidth = Math.min(isSmallViewport ? 2048 : desktopWidth, driverTextureCap);

    const buildWithFallback = () =>
      buildEarthTextures(dayWidth).catch((err) => {
        if (dayWidth <= 2048) throw err;
        console.warn(
          "[EarthGlobe] texture build failed at",
          dayWidth,
          "- retrying at 2048",
          err
        );
        return buildEarthTextures(2048);
      });

    buildWithFallback()
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
            uHazeColor: { value: new THREE.Color("#95BEE8") },
            uAmbient: { value: 0.16 },
            uSunIntensity: { value: 1.05 },
            uReliefStrength: { value: 0.48 },
            uHazeStrength: { value: 0.36 },
            uOpacity: { value: 1.0 },
            uDesaturate: { value: 0.14 },
            uSpecularStrength: { value: 0.60 },
            uLimbDarkening: { value: 0.36 },
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
            uOpacity: { value: isSmallViewport ? 0.4 : 0.48 },
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
      .catch((err) => {
        console.error("[EarthGlobe] textures unavailable, globe will not render", err);
      });

    return () => {
      disposed = true;
      stop();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", syncRunState);

      earthGeometry.dispose();
      cloudGeometry.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      placeholderMaterial.dispose();
      cloudPlaceholder.dispose();
      pulseGeometry.dispose();
      pulseBaseMaterial.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      earthMaterial?.dispose();
      cloudMaterial?.dispose();
      dayTexture?.dispose();
      maskTexture?.dispose();
      cloudTexture?.dispose();
      renderer.dispose();
    };
  }, [initialLongitude]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ touchAction: "none", ...style }}
      aria-label="Interactive 3D Earth Globe - Drag to rotate"
    />
  );
};

export default EarthGlobe;
