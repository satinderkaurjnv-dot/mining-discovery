"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface HubNode {
  id: string;
  name: string;
  shortName: string;
  countryCode: string;
  lat: number;
  lng: number;
  size?: number;
  minerals: string;
  mineralTags: string[];
  region: string;
  description: string;
  highlights: string[];
}

export const MINING_HUBS: HubNode[] = [
  {
    id: "na",
    name: "USA & CANADA",
    shortName: "North America",
    countryCode: "US / CA",
    region: "TIER-1 MINING JURISDICTIONS",
    minerals: "GOLD • COPPER • CRITICAL MINERALS • LITHIUM",
    mineralTags: ["Gold", "Copper", "Critical Minerals", "Lithium"],
    description: "Anchor mining districts spanning Nevada's prolific Carlin Trend and Canada's world-class Abitibi Greenstone Belt.",
    highlights: ["Carlin & Battle Mountain Gold Trends", "Abitibi Greenstone Belt", "Major Exploration Capital"],
    lat: 41.5,
    lng: -96.0,
    size: 1.45,
  },
  {
    id: "sa",
    name: "CHILE & PERU",
    shortName: "Andean Belt",
    countryCode: "CL / PE",
    region: "GLOBAL COPPER & LITHIUM CORRIDOR",
    minerals: "COPPER • LITHIUM • SILVER • MOLYBDENUM",
    mineralTags: ["Copper", "Lithium", "Silver", "Molybdenum"],
    description: "The world's highest-grade copper-producing belt and the heart of the South American lithium triangle powering global electrification.",
    highlights: ["Atacama & Escondida Copper", "Salar de Atacama Lithium", "Andean Porphyry Belt"],
    lat: -22.5,
    lng: -66.5,
    size: 1.45,
  },
  {
    id: "eu",
    name: "SWEDEN & FINLAND",
    shortName: "Nordic Region",
    countryCode: "SE / FI",
    region: "NORDIC CRITICAL RAW MATERIALS",
    minerals: "IRON ORE • NICKEL • RARE EARTHS • COBALT",
    mineralTags: ["Iron Ore", "Nickel", "Rare Earths", "Cobalt"],
    description: "Europe's leading resource frontier with massive Arctic iron ore complexes and strategic critical mineral discoveries.",
    highlights: ["Kiruna Underground Iron Ore", "Per Geijer Rare Earths", "Nordic Battery Value Chain"],
    lat: 65.0,
    lng: 20.0,
    size: 1.4,
  },
  {
    id: "afr",
    name: "SOUTH AFRICA",
    shortName: "South Africa",
    countryCode: "ZA",
    region: "STRATEGIC MINERAL BASIN",
    minerals: "PGM (PLATINUM/PALLADIUM) • MANGANESE • GOLD",
    mineralTags: ["Platinum Group Metals", "Manganese", "Gold", "Chrome"],
    description: "Dominant global supplier of Platinum Group Metals and battery-grade manganese, backed by century-deep mining heritage.",
    highlights: ["Bushveld Igneous Complex", "Kalahari Manganese Field", "Witwatersrand Basin"],
    lat: -26.0,
    lng: 28.0,
    size: 1.4,
  },
  {
    id: "asia",
    name: "MONGOLIA & CENTRAL ASIA",
    shortName: "Central Asia",
    countryCode: "MN / KZ",
    region: "EURASIAN MEGA-DEPOSIT CORRIDOR",
    minerals: "COPPER • GOLD • URANIUM • COAL",
    mineralTags: ["Copper", "Gold", "Uranium", "Rare Metals"],
    description: "Vast mineral frontier hosting Tier-1 mega-deposits including Oyu Tolgoi's world-scale copper-gold porphyry systems.",
    highlights: ["Oyu Tolgoi Underground", "South Gobi Copper Belt", "Central Asian Orogenic Belt"],
    lat: 46.5,
    lng: 105.0,
    size: 1.45,
  },
  {
    id: "aus",
    name: "WESTERN AUSTRALIA",
    shortName: "Western Australia",
    countryCode: "AU-WA",
    region: "PREMIER RESOURCE SUPER-HUB",
    minerals: "IRON ORE • GOLD • LITHIUM SPODUMENE • NICKEL",
    mineralTags: ["Iron Ore", "Gold", "Lithium Spodumene", "Nickel"],
    description: "The global resource superpower in bulk seaborne iron ore, hard-rock lithium spodumene, and premier gold discoveries.",
    highlights: ["Pilbara Iron Ore Super-Hub", "Greenbushes Lithium", "Kalgoorlie Golden Mile"],
    lat: -28.0,
    lng: 121.5,
    size: 1.45,
  },
];

interface CorridorArc {
  from: [number, number];
  to: [number, number];
  alt: number;
}

function latLngToVec3(lat: number, lng: number, r = 1): THREE.Vector3 {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  return new THREE.Vector3(
    r * Math.cos(latRad) * Math.sin(lngRad),
    r * Math.sin(latRad),
    r * Math.cos(latRad) * Math.cos(lngRad)
  );
}

// Radiant high-contrast glowing beacon starburst & target flare texture
function createBeaconStarburstTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;
  ctx.clearRect(0, 0, size, size);

  // Outer ambient gold halo
  const bloom = ctx.createRadialGradient(c, c, 0, c, c, c);
  bloom.addColorStop(0, "rgba(255, 255, 255, 1)");
  bloom.addColorStop(0.18, "rgba(255, 235, 140, 1)");
  bloom.addColorStop(0.40, "rgba(255, 175, 0, 0.92)");
  bloom.addColorStop(0.72, "rgba(255, 110, 0, 0.45)");
  bloom.addColorStop(1, "rgba(255, 140, 0, 0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, size, size);

  // Concentric targeting ring inside flare
  ctx.strokeStyle = "rgba(255, 255, 220, 0.95)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(c, c, c * 0.42, 0, Math.PI * 2);
  ctx.stroke();

  // Crosshair laser spikes
  ctx.strokeStyle = "rgba(255, 255, 245, 1)";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(c, 0);
  ctx.lineTo(c, size);
  ctx.moveTo(0, c);
  ctx.lineTo(size, c);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

export interface UnitedCarriersGlobeProps {
  className?: string;
  scrollProgress?: number;
  onActiveCountryChange?: (index: number) => void;
  onCountryClick?: (index: number) => void;
}

export function UnitedCarriersGlobe({
  className = "",
  scrollProgress = 0,
  onActiveCountryChange,
  onCountryClick,
}: UnitedCarriersGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);
  const onActiveCountryChangeRef = useRef(onActiveCountryChange);
  const onCountryClickRef = useRef(onCountryClick);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    onActiveCountryChangeRef.current = onActiveCountryChange;
    onCountryClickRef.current = onCountryClick;
  }, [onActiveCountryChange, onCountryClick]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const labelContainer = labelContainerRef.current;
    if (!container || !canvas || !labelContainer) return;

    let isDisposed = false;
    let animId: number;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 700;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // CSS2D Label Renderer
    const labelRenderer = new CSS2DRenderer({ element: labelContainer });
    labelRenderer.setSize(width, height);

    // Scene & Camera math
    const FOV = 34;
    const FIT = 0.9;
    const halfFov = THREE.MathUtils.degToRad(FOV) / 2;
    const silhouetteAngle = Math.atan(FIT * Math.tan(halfFov));
    const baseCameraZ = 1 / Math.sin(silhouetteAngle);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, width / height, 0.1, 100);
    camera.position.set(0, 0, baseCameraZ);

    // Lighting setup for photorealistic 3D Earth GLB
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaec, 3.2);
    sunLight.position.set(5, 3.5, 6);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x5ca9ff, 2.2);
    rimLight.position.set(-6, 3, -4);
    scene.add(rimLight);

    // Master Globe Group
    const globeGroup = new THREE.Group();
    // Initial camera view of the Americas and Atlantic mining corridor
    globeGroup.rotation.x = -0.15;
    globeGroup.rotation.y = 1.70;
    globeGroup.rotation.z = 0.0;
    scene.add(globeGroup);

    let mixer: THREE.AnimationMixer | null = null;

    // 1. Load Genuine 3D Earth Model (earth.glb)
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      "/assets/mining/earth.glb",
      (gltf) => {
        if (isDisposed) return;
        const model = gltf.scene;

        // Auto-scale model to exact radius 1.0 (diameter 2.0)
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 2.0 / (maxDim || 1);
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Center model exactly
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center.multiplyScalar(scaleFactor));

        // Configure textures and materials
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              if (mat.map) {
                mat.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                mat.map.colorSpace = THREE.SRGBColorSpace;
              }
              if (mat.emissiveMap) {
                mat.emissiveMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
                mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
                mat.emissiveIntensity = 1.8;
              }
            }
          }
        });

        // Cloud rotation animation
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            mixer?.clipAction(clip).play();
          });
        }

        globeGroup.add(model);
      },
      undefined,
      (err) => console.error("earth.glb load error:", err)
    );

    let targetFocusRotY: number | null = null;
    let targetFocusRotX: number | null = null;

    const beaconTex = createBeaconStarburstTexture(128);
    const beaconMat = new THREE.SpriteMaterial({
      map: beaconTex,
      color: new THREE.Color("#FFAE19"),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const activeRipples: { ring: THREE.Mesh; phaseOffset: number; nodeIdx: number }[] = [];
    const labelObjects: Array<{
      obj: CSS2DObject;
      pos: THREE.Vector3;
      div: HTMLButtonElement;
      nodeIdx: number;
    }> = [];
    const pinSprites: Array<{ sprite: THREE.Sprite; baseSize: number; nodeIdx: number }> = [];

    // Calibrated pitch offset (+8.5 degrees) placing country highlight circle in the vertical center of the screen
    const CAMERA_PITCH_OFFSET = 8.5;

    MINING_HUBS.forEach((node, nodeIdx) => {
      const pinGroup = new THREE.Group();
      // Position raised above the earth & clouds (radius 1.018)
      const pos = latLngToVec3(node.lat, node.lng, 1.018);
      pinGroup.position.copy(pos);
      pinGroup.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        pos.clone().normalize()
      );

      // 1. Radiant Glowing Starburst Flare Sprite (renders on top)
      const sprite = new THREE.Sprite(beaconMat.clone());
      const s = (node.size || 1) * 0.082;
      sprite.scale.set(s, s, 1);
      sprite.renderOrder = 14;
      pinGroup.add(sprite);
      pinSprites.push({ sprite, baseSize: s, nodeIdx });

      // 2. Multi-phase animated golden radar ripple rings
      [0, 0.33, 0.66].forEach((offset) => {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.85, 1.0, 36),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color("#FFB81C"),
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false,
          })
        );
        ring.scale.set(0.022, 0.022, 1);
        ring.renderOrder = 15;
        pinGroup.add(ring);
        activeRipples.push({ ring, phaseOffset: offset, nodeIdx });
      });

      // 3. Static golden concentric targeting ring
      const outerRing = new THREE.Mesh(
        new THREE.RingGeometry(0.92, 1.0, 36),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color("#FF8C00"),
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      outerRing.scale.set(0.045, 0.045, 1);
      outerRing.renderOrder = 15;
      pinGroup.add(outerRing);

      // 4. Interactive CSS2D Label badge with rich mineral tooltip and click-to-center
      const labelDiv = document.createElement("button");
      labelDiv.className = "globe-country-badge group";
      labelDiv.setAttribute("aria-label", `${node.name} mining hub`);
      labelDiv.innerHTML = `
        <span class="badge-header">
          <span class="badge-dot"></span>
          <span class="badge-title">${node.name}</span>
        </span>
        <span class="badge-tooltip">
          <span class="tooltip-region">${node.region}</span>
          <span class="tooltip-minerals">${node.minerals}</span>
        </span>
      `;

      // Click to focus and center on this mining capital
      labelDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        onCountryClickRef.current?.(nodeIdx);
        targetFocusRotY = -(node.lng * Math.PI) / 180;
        targetFocusRotX = ((node.lat - CAMERA_PITCH_OFFSET) * Math.PI) / 180;
        lastInteractionTime = performance.now();
      });

      const labelObj = new CSS2DObject(labelDiv);
      pinGroup.add(labelObj);
      labelObjects.push({ obj: labelObj, pos, div: labelDiv, nodeIdx });

      globeGroup.add(pinGroup);
    });

    // 4. Sleek, Elegant Golden Network Arcs (#FFA414)
    const CORRIDORS: CorridorArc[] = [
      { from: [41.5, -96.0], to: [-22.5, -66.5], alt: 0.05 },  // USA/Canada -> Chile/Peru
      { from: [-22.5, -66.5], to: [65.0, 20.0], alt: 0.06 },   // Chile/Peru -> Sweden/Finland
      { from: [65.0, 20.0], to: [-26.0, 28.0], alt: 0.06 },    // Sweden/Finland -> South Africa
      { from: [-26.0, 28.0], to: [46.5, 105.0], alt: 0.06 },   // South Africa -> Mongolia
      { from: [46.5, 105.0], to: [-28.0, 121.5], alt: 0.05 },  // Mongolia -> Western Australia
      { from: [-28.0, 121.5], to: [41.5, -96.0], alt: 0.06 },  // Western Australia -> USA/Canada
    ];

    const timeUniform = { uTime: { value: 2.5 } };

    const arcMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#FFA414"),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    arcMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = timeUniform.uTime;
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>\nattribute float aOffset;\nvarying float vProgress;\nvarying float vOffset;`
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>\nvProgress = uv.x;\nvOffset = aOffset;`
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>\nvarying float vProgress;\nvarying float vOffset;\nuniform float uTime;`
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
          float p = mod(uTime * 1.8 + vOffset * 3.0, 3.0);
          float pulse = smoothstep(0.0, 0.4, 0.4 - abs(vProgress * 3.0 - p));
          diffuseColor.rgb += vec3(0.5, 0.35, 0.15) * pulse * 2.0;
          diffuseColor.a *= mix(0.35, 1.0, pulse);
          `
        );
    };

    CORRIDORS.forEach((c, idx) => {
      const start = latLngToVec3(c.from[0], c.from[1], 1.002);
      const end = latLngToVec3(c.to[0], c.to[1], 1.002);
      const dist = start.distanceTo(end);
      const altitude = c.alt + Math.min(0.05, dist * 0.025);

      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 36; i++) {
        const t = i / 36;
        const pt = new THREE.Vector3().copy(start).lerp(end, t).normalize();
        const r = 1.002 + altitude * 4 * t * (1 - t);
        pt.multiplyScalar(r);
        pts.push(pt);
      }

      const curve = new THREE.CatmullRomCurve3(pts);
      const geom = new THREE.TubeGeometry(curve, 36, 0.0008, 4, false);
      const count = geom.attributes.position.count;
      const offset = (idx * 0.6180339887) % 1;
      geom.setAttribute(
        "aOffset",
        new THREE.BufferAttribute(new Float32Array(count).fill(offset), 1)
      );

      const mesh = new THREE.Mesh(geom, arcMat);
      mesh.renderOrder = 2;
      globeGroup.add(mesh);
    });

    // Resize Handler with ResizeObserver
    const handleResize = () => {
      if (!container || !canvas || !labelContainer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      labelRenderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // Hand Drag & Rotate Controls (Smooth interactive spinning with hand/mouse/touch)
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let lastInteractionTime = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      isDragging = true;
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
      velocityX = 0;
      velocityY = 0;
      lastInteractionTime = performance.now();
      if (e.pointerType !== "touch") {
        container.setPointerCapture(e.pointerId);
      }
      container.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousPointerX;
      const deltaY = e.clientY - previousPointerY;
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;

      if (e.pointerType === "touch" && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
        return;
      }

      const sensitivity = 0.0055;
      globeGroup.rotation.y += deltaX * sensitivity;
      globeGroup.rotation.x -= deltaY * sensitivity;

      // Allow wide pitch range so country circles in all jurisdictions are fully centered
      globeGroup.rotation.x = Math.max(-1.25, Math.min(1.25, globeGroup.rotation.x));

      velocityX = deltaX * sensitivity;
      velocityY = deltaY * sensitivity;
      lastInteractionTime = performance.now();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      if (e.pointerType !== "touch") {
        try {
          container.releasePointerCapture(e.pointerId);
        } catch {}
      }
      container.style.cursor = "grab";
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);

    // Magnetic Cursor Tilt Tracking
    let mouseTiltX = 0;
    let mouseTiltY = 0;
    const onContainerPointerMove = (e: PointerEvent) => {
      if (!isDragging) {
        const rect = container.getBoundingClientRect();
        const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        mouseTiltX = mx * 0.08;
        mouseTiltY = my * 0.06;
      }
    };
    container.addEventListener("pointermove", onContainerPointerMove, { passive: true });

    // Render Animation Loop
    let lastTime = performance.now();
    let lastReportedCountryIdx = -1;
    let currentLockedCountryIdx = 0;
    const tempWorldPos = new THREE.Vector3();

    const animate = () => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const p = scrollRef.current;
      const TOUR_START = 0.025;
      const TOUR_END = 0.94;
      const numHubs = MINING_HUBS.length;
      const numSegments = numHubs - 1;

      // Hand Dragging, Target Focus Navigation, Stepped Screen-Locked Tour, or Ambient Glide
      if (isDragging) {
        // Direct manual dragging
      } else if (targetFocusRotY !== null && targetFocusRotX !== null) {
        // Smooth cinematic ease directly to clicked mining jurisdiction
        let diffY = targetFocusRotY - globeGroup.rotation.y;
        while (diffY > Math.PI) diffY -= Math.PI * 2;
        while (diffY < -Math.PI) diffY += Math.PI * 2;

        globeGroup.rotation.y += diffY * 0.09;
        globeGroup.rotation.x = THREE.MathUtils.lerp(globeGroup.rotation.x, targetFocusRotX, 0.09);

        const targetScale = 1.22;
        globeGroup.scale.setScalar(THREE.MathUtils.lerp(globeGroup.scale.x, targetScale, 0.08));

        if (Math.abs(diffY) < 0.005 && Math.abs(targetFocusRotX - globeGroup.rotation.x) < 0.005) {
          targetFocusRotY = null;
          targetFocusRotX = null;
        }
      } else if (p >= TOUR_START) {
        // SYMMETRIC 6-STAGE SCREEN-LOCKED TOUR (ALL 6 COUNTRIES GET EQUAL SOLID LOCK)
        const normP = Math.min(Math.max((p - TOUR_START) / (TOUR_END - TOUR_START), 0), 1);
        const s = normP * numSegments; // 0 to 5
        const k = Math.min(Math.floor(s), numSegments - 1); // 0, 1, 2, 3, 4
        const f = s - k; // 0 to 1

        // Transit window in the middle of each step: [0.35, 0.65] (70% dwell, 30% transition)
        const TRANSIT_START = 0.35;
        const TRANSIT_END = 0.65;

        let easeT = 0;
        let transitFactor = 0;

        if (f <= TRANSIT_START) {
          easeT = 0;
          transitFactor = 0;
          currentLockedCountryIdx = k;
        } else if (f >= TRANSIT_END) {
          easeT = 1;
          transitFactor = 0;
          currentLockedCountryIdx = k + 1;
        } else {
          const tau = (f - TRANSIT_START) / (TRANSIT_END - TRANSIT_START);
          // Quintic smoothstep
          easeT = tau * tau * tau * (tau * (tau * 6 - 15) + 10);
          transitFactor = Math.sin(tau * Math.PI);
          currentLockedCountryIdx = tau < 0.5 ? k : k + 1;
        }

        // Target coordinates along the orbital corridor
        const targetLat = THREE.MathUtils.lerp(MINING_HUBS[k].lat, MINING_HUBS[k + 1].lat, easeT);
        let dLng = MINING_HUBS[k + 1].lng - MINING_HUBS[k].lng;
        while (dLng > 180) dLng -= 360;
        while (dLng < -180) dLng += 360;
        const targetLng = MINING_HUBS[k].lng + dLng * easeT;

        // Desired rotation placing target country perfectly in center view
        const desiredRotY = -(targetLng * Math.PI) / 180;
        const desiredRotX = ((targetLat - CAMERA_PITCH_OFFSET) * Math.PI) / 180;

        // Balanced Zoom: 1.12x locked zoom (clearly centered and framed without cutting off edges), 1.05x during transit
        const targetZoom = 1.12 - 0.07 * transitFactor;

        let diffY = desiredRotY - globeGroup.rotation.y;
        while (diffY > Math.PI) diffY -= Math.PI * 2;
        while (diffY < -Math.PI) diffY += Math.PI * 2;

        globeGroup.rotation.y += diffY * 0.16;
        globeGroup.rotation.x = THREE.MathUtils.lerp(globeGroup.rotation.x, desiredRotX, 0.16);

        const curScale = globeGroup.scale.x;
        const nextScale = THREE.MathUtils.lerp(curScale, targetZoom, 0.12);
        globeGroup.scale.set(nextScale, nextScale, nextScale);

        timeUniform.uTime.value += 0.003;
      } else {
        // At rest / top: smooth inertia friction + subtle auto-rotation + magnetic cursor tilt
        currentLockedCountryIdx = -1;
        globeGroup.rotation.y += velocityX;
        globeGroup.rotation.x += velocityY;
        globeGroup.rotation.x = Math.max(-1.25, Math.min(1.25, globeGroup.rotation.x));
        velocityX *= 0.92;
        velocityY *= 0.92;

        // Gentle ambient auto-rotation
        if (now - lastInteractionTime > 1200) {
          const turn = 0.0014 * (delta / 0.0166);
          globeGroup.rotation.y += turn;
          timeUniform.uTime.value += turn * 2.2;
        }

        const curScale = globeGroup.scale.x;
        const nextScale = THREE.MathUtils.lerp(curScale, 1.0, 0.06);
        globeGroup.scale.set(nextScale, nextScale, nextScale);
      }

      // Notify parent when active locked country changes
      if (currentLockedCountryIdx !== lastReportedCountryIdx) {
        lastReportedCountryIdx = currentLockedCountryIdx;
        if (currentLockedCountryIdx >= 0) {
          onActiveCountryChangeRef.current?.(currentLockedCountryIdx);
        }
      }

      // Dynamic Highlight & Ripple animation for active vs background beacons
      pinSprites.forEach(({ sprite, baseSize, nodeIdx }) => {
        const isActive = p >= TOUR_START && nodeIdx === currentLockedCountryIdx;
        const targetSpriteScale = isActive ? baseSize * 1.65 : baseSize;
        sprite.scale.set(
          THREE.MathUtils.lerp(sprite.scale.x, targetSpriteScale, 0.12),
          THREE.MathUtils.lerp(sprite.scale.y, targetSpriteScale, 0.12),
          1
        );
      });

      // Multi-phase pulse radar ripple rings
      activeRipples.forEach(({ ring, phaseOffset, nodeIdx }) => {
        const isActive = p >= TOUR_START && nodeIdx === currentLockedCountryIdx;
        const speed = isActive ? 0.0028 : 0.0018;
        const pulseCycle = (now * speed + phaseOffset) % 1;
        const baseRing = isActive ? 0.026 : 0.016;
        const ringScale = baseRing + pulseCycle * (isActive ? 0.078 : 0.048);
        const ringOpacity = (1 - pulseCycle) * (isActive ? 1.0 : 0.75);
        ring.scale.set(ringScale, ringScale, 1);
        (ring.material as THREE.MeshBasicMaterial).opacity = ringOpacity;
      });

      // Update GLTF animation mixer for revolving cloud layer
      if (mixer) {
        mixer.update(delta);
      }

      // Occlude labels when on the back side of the Earth & update active badge states
      labelObjects.forEach(({ obj, pos, div, nodeIdx }) => {
        tempWorldPos.copy(pos).applyMatrix4(globeGroup.matrixWorld);
        const dot = tempWorldPos.dot(camera.position);
        const isVisible = dot > 0.12;
        obj.element.style.opacity = isVisible ? "1" : "0";
        obj.element.style.pointerEvents = isVisible ? "auto" : "none";

        const isActive = p >= TOUR_START && nodeIdx === currentLockedCountryIdx;
        if (isActive && isVisible) {
          div.classList.add("is-active");
        } else {
          div.classList.remove("is-active");
        }
      });

      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointermove", onContainerPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
      renderer.dispose();
      beaconTex.dispose();
      beaconMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative select-none touch-pan-y ${className}`}
      style={{ cursor: "grab" }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div
        ref={labelContainerRef}
        className="absolute inset-0 z-20 pointer-events-none overflow-visible"
      />

      <style jsx global>{`
        .globe-country-badge {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          white-space: nowrap !important;
          pointer-events: auto;
          cursor: pointer;
          font-family: var(--font-geist-mono, monospace), monospace;
          background: rgba(11, 31, 58, 0.90);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(184, 134, 11, 0.60);
          border-radius: 6px;
          padding: 3px 8px;
          transform: translate(-50%, -150%);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.60), 0 0 12px rgba(184, 134, 11, 0.35);
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
        }

        .globe-country-badge:hover,
        .globe-country-badge.is-active {
          background: rgba(11, 31, 58, 0.98);
          border-color: #FFAE00;
          border-width: 1.5px;
          transform: translate(-50%, -160%) scale(1.18);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.85), 0 0 24px rgba(255, 174, 0, 0.75);
          z-index: 60;
        }

        .badge-header {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FFAE00;
          box-shadow: 0 0 8px #FFAE00;
        }

        .globe-country-badge.is-active .badge-dot {
          background: #FFD700;
          box-shadow: 0 0 12px #FFD700;
          animation: pulseDot 1.4s infinite ease-in-out;
        }

        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.45); opacity: 0.85; }
        }

        .badge-title {
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ffffff;
        }

        .globe-country-badge.is-active .badge-title {
          color: #FFF2C6;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.75);
        }

        .badge-tooltip {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5px;
          transition: max-height 0.28s ease, opacity 0.28s ease, margin-top 0.28s ease;
        }

        .globe-country-badge:hover .badge-tooltip,
        .globe-country-badge.is-active .badge-tooltip {
          max-height: 48px;
          opacity: 1;
          margin-top: 3.5px;
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
            font-size: 8px;
          }
          .tooltip-minerals {
            font-size: 7.5px;
          }
        }
      `}</style>
    </div>
  );
}
