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
  /** Surface point in CSS pixels relative to the canvas. */
  x: number;
  y: number;
  /** Unit vector pointing radially away from the globe centre in screen space. */
  dirX: number;
  dirY: number;
  /** 0 when rotated away, 1 when facing camera. */
  opacity: number;
}

export interface GlobeFocus {
  lat: number;
  lng: number;
  tiltBias: number;
  weight: number;
}

export interface EarthGlobeProps {
  className?: string;
  style?: React.CSSProperties;
  focusRef?: React.RefObject<GlobeFocus | null>;
  anchors?: GlobeAnchor[];
  onProject?: (anchors: ProjectedAnchor[]) => void;
  onReady?: () => void;
  onUserInteract?: () => void;
  rotationPeriod?: number;
  initialLongitude?: number;
  speedScale?: number;
  interactive?: boolean;
  activeAnchorId?: string;
  scrollProgress?: number;
  scrollProgressRef?: React.RefObject<number | null>;
}

export const FOCUS_ANCHOR_ID = "__focus";

const FOV = 20;
export const GLOBE_FIT = 0.9;
const FIT = GLOBE_FIT;

const AXIAL_TILT = THREE.MathUtils.degToRad(-19);
const VIEW_PITCH = THREE.MathUtils.degToRad(-15);

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

// Global strategic mining corridors for curved 3D great-circle arcs
const MINING_CORRIDORS = [
  { from: { lat: 40.7, lng: -116.3 }, to: { lat: -24.2, lng: -69.1 } }, // Nevada -> Chile
  { from: { lat: 48.4, lng: -79.2 }, to: { lat: 67.8, lng: 20.2 } },   // Abitibi -> Sweden
  { from: { lat: 67.8, lng: 20.2 }, to: { lat: 43.0, lng: 106.8 } },   // Sweden -> Mongolia
  { from: { lat: 43.0, lng: 106.8 }, to: { lat: -30.7, lng: 121.5 } }, // Mongolia -> Australia
  { from: { lat: -30.7, lng: 121.5 }, to: { lat: -4.0, lng: 137.1 } }, // Australia -> Indonesia
  { from: { lat: -24.2, lng: -69.1 }, to: { lat: -26.4, lng: 27.4 } }, // Chile -> South Africa
  { from: { lat: -26.4, lng: 27.4 }, to: { lat: 6.2, lng: -1.7 } },    // South Africa -> Ghana
  { from: { lat: 6.2, lng: -1.7 }, to: { lat: -6.0, lng: -50.5 } },    // Ghana -> Brazil
  { from: { lat: 64.8, lng: -147.7 }, to: { lat: 40.7, lng: -116.3 } },// Alaska -> Nevada
];

export const EarthGlobe: React.FC<EarthGlobeProps> = ({
  className = "",
  style,
  focusRef,
  anchors,
  onProject,
  onReady,
  onUserInteract,
  rotationPeriod = 52,
  initialLongitude = 18,
  speedScale = 1,
  interactive = true,
  activeAnchorId,
  scrollProgress = 0,
  scrollProgressRef,
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
  const activeAnchorIdRef = useRef(activeAnchorId);

  useEffect(() => {
    onProjectRef.current = onProject;
    onReadyRef.current = onReady;
    onUserInteractRef.current = onUserInteract;
    anchorsRef.current = anchors;
    rotationPeriodRef.current = rotationPeriod;
    speedScaleRef.current = speedScale;
    focusSourceRef.current = focusRef;
    interactiveRef.current = interactive;
    activeAnchorIdRef.current = activeAnchorId;
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
        antialias: true,
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
    renderer.toneMappingExposure = 1.24;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();

    const halfFov = THREE.MathUtils.degToRad(FOV) / 2;
    const silhouetteAngle = Math.atan(FIT * Math.tan(halfFov));
    const baseCameraZ = 1 / Math.sin(silhouetteAngle);
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, baseCameraZ);
    camera.lookAt(0, 0, 0);

    const rollGroup = new THREE.Group();
    rollGroup.rotation.z = AXIAL_TILT;
    scene.add(rollGroup);

    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.x = VIEW_PITCH;
    rollGroup.add(tiltGroup);

    const sunDirection = new THREE.Vector3(-0.62, 0.34, 0.7).normalize();

    // --- 1. Earth Sphere (Zero blurry atmospheric shell, 100% sharp 3D surface) --
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

    // --- 3. Curved 3D Global Mining Corridors & Data Pulses --------------------
    const arcGroup = new THREE.Group();
    const pulseData: Array<{
      curve: THREE.CatmullRomCurve3;
      mesh: THREE.Mesh;
      progress: number;
      speed: number;
    }> = [];

    const pulseGeometry = new THREE.SphereGeometry(0.008, 8, 8);
    const pulseBaseMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#80EEFF"),
      transparent: true,
      opacity: 0,
    });

    const arcLines: THREE.Line[] = [];

    MINING_CORRIDORS.forEach((corridor, idx) => {
      const p1 = latLngToVector3(corridor.from.lat, corridor.from.lng, 1.002);
      const p2 = latLngToVector3(corridor.to.lat, corridor.to.lng, 1.002);

      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      const altitude = 1.0 + Math.min(0.18, Math.max(0.04, dist * 0.11));
      mid.normalize().multiplyScalar(altitude);

      const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
      const points = curve.getPoints(40);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const lineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color("#00C8DC"),
        transparent: true,
        opacity: 0,
      });

      const line = new THREE.Line(geometry, lineMaterial);
      arcLines.push(line);
      arcGroup.add(line);

      const pulseMesh = new THREE.Mesh(pulseGeometry, pulseBaseMaterial.clone());
      arcGroup.add(pulseMesh);

      pulseData.push({
        curve,
        mesh: pulseMesh,
        progress: (idx * 0.14) % 1,
        speed: 0.10 + (idx % 3) * 0.03,
      });
    });

    earth.add(arcGroup);

    // --- 4. Expanding Concentric Ripple Rings at Active Mining Node -------------
    const rippleGroup = new THREE.Group();
    const rippleGeometry = new THREE.RingGeometry(0.012, 0.022, 28);
    const rippleMat1 = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#00C8DC"),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const rippleMat2 = rippleMat1.clone();
    const rippleMesh1 = new THREE.Mesh(rippleGeometry, rippleMat1);
    const rippleMesh2 = new THREE.Mesh(rippleGeometry, rippleMat2);
    rippleGroup.add(rippleMesh1);
    rippleGroup.add(rippleMesh2);
    rippleGroup.visible = false;
    earth.add(rippleGroup);

    // --- 5. Small Elegant 3D Mining Location Nodes ------------------------------
    const pinGroup = new THREE.Group();
    const pinCoreGeometry = new THREE.SphereGeometry(0.016, 12, 12);
    const pinCoreMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#E0F8FF"),
      transparent: true,
      opacity: 0,
    });

    const pinStemGeometry = new THREE.CylinderGeometry(0.0025, 0.0025, 0.032, 8);
    const pinStemMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#00A8BE"),
      transparent: true,
      opacity: 0,
    });

    const pinRingGeometry = new THREE.RingGeometry(0.012, 0.019, 20);
    const pinRingMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#00C8DC"),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    const anchorList = anchorsRef.current || [];
    const pinNodes: Array<{
      id: string;
      head: THREE.Mesh;
      ring: THREE.Mesh;
      stem: THREE.Mesh;
      basePos: THREE.Vector3;
    }> = [];

    anchorList.forEach((anchor) => {
      if (anchor.id === "antarctica") return;
      const basePos = latLngToVector3(anchor.lat, anchor.lng, 1.002);
      const topPos = latLngToVector3(anchor.lat, anchor.lng, 1.034);

      const singlePin = new THREE.Group();

      // Pin Core Node
      const head = new THREE.Mesh(pinCoreGeometry, pinCoreMaterial.clone());
      head.position.copy(topPos);
      singlePin.add(head);

      // Pin Stem (Subtle gold connector to crust)
      const midPos = new THREE.Vector3().addVectors(basePos, topPos).multiplyScalar(0.5);
      const stem = new THREE.Mesh(pinStemGeometry, pinStemMaterial.clone());
      stem.position.copy(midPos);
      stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), basePos.clone().normalize());
      singlePin.add(stem);

      // Pin Base Ring
      const baseRing = new THREE.Mesh(pinRingGeometry, pinRingMaterial.clone());
      baseRing.position.copy(basePos);
      baseRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), basePos.clone().normalize());
      singlePin.add(baseRing);

      pinNodes.push({ id: anchor.id, head, ring: baseRing, stem, basePos });
      pinGroup.add(singlePin);
    });

    earth.add(pinGroup);

    // --- 6. Subtle Floating Mineral Data Particles -----------------------------
    const dustCount = 120;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.06 + Math.random() * 0.30;
      dustPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      dustPositions[i * 3 + 1] = r * Math.cos(phi);
      dustPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const isGold = Math.random() > 0.40;
      dustColors[i * 3] = isGold ? 0.98 : 0.85;
      dustColors[i * 3 + 1] = isGold ? 0.82 : 0.92;
      dustColors[i * 3 + 2] = isGold ? 0.35 : 1.0;
    }

    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute("color", new THREE.BufferAttribute(dustColors, 3));

    const dustMaterial = new THREE.PointsMaterial({
      size: isSmallViewport ? 0.015 : 0.020,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });

    const dustPoints = new THREE.Points(dustGeometry, dustMaterial);
    tiltGroup.add(dustPoints);

    // --- 7. Cloud Shell ---------------------------------------------------------
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

      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      renderer.setPixelRatio(dpr);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    applySize();

    // --- Anchor Projection ------------------------------------------------------
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

    // --- Interactive Drag & Smooth Inertia State --------------------------------
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

    let currentSpeed = 0.18;
    let freeYaw = earth.rotation.y;
    let cloudLead = 0;
    let ripplePhase = 0;
    let elapsedTime = 0;

    const renderFrame = (delta: number) => {
      elapsedTime += delta;

      if (!isDragging) {
        velocityYaw *= 0.965;
        velocityPitch *= 0.94;
        freeYaw += velocityYaw;
        manualPitch = clamp(manualPitch + velocityPitch, -1.25, 1.25);
        manualPitch += (0 - manualPitch) * Math.min(delta * 0.8, 1);
      }

      currentParallaxX += (parallaxTargetX - currentParallaxX) * Math.min(delta * 4, 1);
      currentParallaxY += (parallaxTargetY - currentParallaxY) * Math.min(delta * 4, 1);

      const focus = focusSourceRef.current?.current ?? null;
      const weight = focus ? Math.min(Math.max(focus.weight, 0), 1) : 0;

      // --- Cinematic Camera & Scroll Choreography -------------------------------
      const spRaw = scrollProgressRef?.current ?? scrollProgress ?? 0;
      const sp = clamp(typeof spRaw === "number" ? spRaw : 0, 0, 1);

      // 0% - 20%: Camera glides from distant space closer to Earth
      // 20% - 70%: Optimal perspective framing
      // 70% - 85%: Cinematic Regional Zoom into active discovery site
      // 85% - 100%: Smooth pull-back and transition
      const targetCameraZ = baseCameraZ;

      // Smooth camera interpolation
      camera.position.z += (targetCameraZ - camera.position.z) * Math.min(delta * 3.5, 1);
      camera.position.x = currentParallaxX * 2.0;
      camera.position.y = currentParallaxY * 1.8;
      camera.lookAt(0, 0, 0);

      // Progressive reveal opacities based on scroll:
      // Points appear around 30% - 45%
      const pointAlpha = smoothstep(0.28, 0.45, sp);
      // Connection lines draw between 48% - 68%
      const lineAlpha = smoothstep(0.48, 0.68, sp);

      if (delta > 0) {
        const target = speedScaleRef.current;
        currentSpeed += (target - currentSpeed) * Math.min(delta * 1.5, 1);

        if (!isDragging && (!focus || weight <= 0)) {
          const turn = (delta * Math.PI * 2 * currentSpeed) / rotationPeriodRef.current;
          freeYaw += turn;
          cloudLead += turn * 0.10;
        }

        // Animated pulses along mining corridors
        pulseData.forEach((item) => {
          item.progress = (item.progress + delta * item.speed) % 1;
          const pt = item.curve.getPoint(item.progress);
          item.mesh.position.copy(pt);
          const pMat = item.mesh.material as THREE.MeshBasicMaterial;
          if (pMat) {
            pMat.opacity = lineAlpha * (0.35 + 0.55 * Math.sin(item.progress * Math.PI));
          }
        });

        // Connection line opacity
        arcLines.forEach((line) => {
          const mat = line.material as THREE.LineBasicMaterial;
          if (mat) mat.opacity = lineAlpha * 0.38;
        });

        // Subtle mineral dust drift
        dustPoints.rotation.y += delta * 0.022;

        // Mining Location Nodes opacity & gentle pulse
        const activeId = activeAnchorIdRef.current;
        pinNodes.forEach((node) => {
          const isActive = node.id === activeId;
          const hMat = node.head.material as THREE.MeshBasicMaterial;
          const sMat = node.stem.material as THREE.MeshBasicMaterial;
          const rMat = node.ring.material as THREE.MeshBasicMaterial;

          if (hMat) {
            hMat.opacity = pointAlpha * 0.95;
            if (isActive) {
              node.head.scale.setScalar(1.25 + 0.15 * Math.sin(elapsedTime * 4.5));
              hMat.color.set("#FFFFFF");
            } else {
              node.head.scale.setScalar(0.95);
              hMat.color.set("#80EEFF");
            }
          }
          if (sMat) sMat.opacity = pointAlpha * 0.85;
          if (rMat) rMat.opacity = pointAlpha * 0.80;
        });

        // Active Mining Site Expanding Ripple Effect (● → ◯ → ◯ ◯)
        const activeNode = pinNodes.find((n) => n.id === activeId);
        if (activeNode && pointAlpha > 0.1) {
          rippleGroup.visible = true;
          rippleGroup.position.copy(activeNode.basePos);
          rippleGroup.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            activeNode.basePos.clone().normalize()
          );

          ripplePhase = (ripplePhase + delta * 0.85) % 1;
          const phase1 = ripplePhase;
          const phase2 = (ripplePhase + 0.5) % 1;

          rippleMesh1.scale.setScalar(1 + phase1 * 2.8);
          rippleMat1.opacity = Math.max(0, (1 - phase1) * 0.80 * pointAlpha);

          rippleMesh2.scale.setScalar(1 + phase2 * 2.8);
          rippleMat2.opacity = Math.max(0, (1 - phase2) * 0.80 * pointAlpha);
        } else {
          rippleGroup.visible = false;
        }
      }

      // Scroll-driven subtle tilt
      const scrollTilt = sp * 0.08;

      if (weight > 0 && focus) {
        const aimYaw = THREE.MathUtils.degToRad(-(focus.lng + 90));
        const aimPitch = THREE.MathUtils.degToRad(focus.lat) - focus.tiltBias;
        freeYaw += shortestAngle(freeYaw, aimYaw) * Math.min(delta * 1.5, 1);
        earth.rotation.y = freeYaw;
        tiltGroup.rotation.x = VIEW_PITCH + manualPitch + (aimPitch - VIEW_PITCH) * weight + currentParallaxY + scrollTilt;
      } else {
        earth.rotation.y = freeYaw;
        tiltGroup.rotation.x = VIEW_PITCH + manualPitch + currentParallaxY + scrollTilt;
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
        // Subtle mouse parallax
        parallaxTargetX = normalizedX * 0.035;
        parallaxTargetY = -normalizedY * 0.035;
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
        const sensitivity = isSmallViewport ? 0.012 : 0.014;
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

    // --- Async Texture Build ----------------------------------------------------
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

        const maxAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy() || 16, 16);

        dayTexture = new THREE.CanvasTexture(day);
        dayTexture.colorSpace = THREE.SRGBColorSpace;
        dayTexture.wrapS = THREE.RepeatWrapping;
        dayTexture.wrapT = THREE.ClampToEdgeWrapping;
        dayTexture.generateMipmaps = true;
        dayTexture.minFilter = THREE.LinearMipmapLinearFilter;
        dayTexture.magFilter = THREE.LinearFilter;
        dayTexture.anisotropy = maxAnisotropy;

        maskTexture = new THREE.CanvasTexture(mask);
        maskTexture.colorSpace = THREE.NoColorSpace;
        maskTexture.wrapS = THREE.RepeatWrapping;
        maskTexture.wrapT = THREE.ClampToEdgeWrapping;
        maskTexture.generateMipmaps = true;
        maskTexture.minFilter = THREE.LinearMipmapLinearFilter;
        maskTexture.magFilter = THREE.LinearFilter;
        maskTexture.anisotropy = maxAnisotropy;

        earthMaterial = new THREE.ShaderMaterial({
          vertexShader: earthVertexShader,
          fragmentShader: earthFragmentShader,
          uniforms: {
            uDayMap: { value: dayTexture },
            uMaskMap: { value: maskTexture },
            uMaskTexel: { value: new THREE.Vector2(1 / mask.width, 1 / mask.height) },
            uSunDirection: { value: sunDirection },
            uHazeColor: { value: new THREE.Color("#00C8DC") },
            uAmbient: { value: 0.62 },
            uSunIntensity: { value: 0.55 },
            uReliefStrength: { value: 0.28 },
            uHazeStrength: { value: 0.0 },
            uOpacity: { value: 1.0 },
            uDesaturate: { value: 0.0 },
            uSpecularStrength: { value: 0.30 },
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
        cloudTexture.generateMipmaps = true;
        cloudTexture.minFilter = THREE.LinearMipmapLinearFilter;
        cloudTexture.magFilter = THREE.LinearFilter;
        cloudTexture.anisotropy = maxAnisotropy;

        cloudMaterial = new THREE.ShaderMaterial({
          vertexShader: cloudVertexShader,
          fragmentShader: cloudFragmentShader,
          uniforms: {
            uCloudMap: { value: cloudTexture },
            uSunDirection: { value: sunDirection },
            uOpacity: { value: isSmallViewport ? 0.30 : 0.36 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.FrontSide,
        });

        earth.material = earthMaterial;
        earth.visible = true;
        clouds.visible = false;

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
      placeholderMaterial.dispose();
      cloudPlaceholder.dispose();
      pulseGeometry.dispose();
      pulseBaseMaterial.dispose();
      rippleGeometry.dispose();
      rippleMat1.dispose();
      rippleMat2.dispose();
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
      aria-label="Interactive 3D Earth Globe - Global Mining Intelligence"
    />
  );
};

export default EarthGlobe;
