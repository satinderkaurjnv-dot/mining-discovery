"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

interface HubNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  size?: number;
}

interface CorridorArc {
  from: [number, number];
  to: [number, number];
  alt: number;
}

interface GlobeData {
  edge: number[];
  fill: number[];
}

function latLngToVec3(lat: number, lng: number, r = 1): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

// Crisp luminous digital dot texture with radiant white-gold core
function createDotTexture(size = 64): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  const r = size / 2;
  // High-intensity radiant white-hot core to rich neon amber gold
  const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, "rgba(255, 255, 255, 1)");
  grad.addColorStop(0.30, "rgba(255, 225, 90, 1)");
  grad.addColorStop(0.70, "rgba(255, 165, 10, 0.95)");
  grad.addColorStop(1, "rgba(212, 130, 0, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(r, r, r - 0.5, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

// Radiant starburst flare texture for beacon hubs matching reference image
function createBeaconStarburstTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;
  ctx.clearRect(0, 0, size, size);

  // Soft spherical fiery-gold bloom with digital lens flare
  const bloom = ctx.createRadialGradient(c, c, 0, c, c, c);
  bloom.addColorStop(0, "rgba(255, 255, 255, 1)");
  bloom.addColorStop(0.18, "rgba(255, 240, 170, 0.98)");
  bloom.addColorStop(0.42, "rgba(255, 175, 10, 0.90)");
  bloom.addColorStop(0.72, "rgba(255, 110, 0, 0.40)");
  bloom.addColorStop(1, "rgba(255, 140, 0, 0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, size, size);

  // Precision 4-point cross flares
  ctx.strokeStyle = "rgba(255, 255, 245, 0.98)";
  ctx.lineWidth = 2.2;
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

// Points material shader with digital glowing golden dots and specular glint
function createLitPointsMaterial(
  size: number,
  mapTexture: THREE.CanvasTexture
): THREE.PointsMaterial {
  const mat = new THREE.PointsMaterial({
    size,
    sizeAttenuation: true,
    depthWrite: false,
    transparent: true,
    color: new THREE.Color("#FFBE1A"),
    map: mapTexture,
    alphaTest: 0,
    opacity: 1,
    blending: THREE.AdditiveBlending,
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uCamPos = { value: new THREE.Vector3() };

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>\nvarying vec3 vWorldPos;\nvarying vec3 vNorm;\nuniform vec3 uCamPos;`
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>\nvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvNorm = normalize(vWorldPos);`
      )
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>\nfloat ndv = dot(normalize(uCamPos - vWorldPos), vNorm);\ngl_PointSize *= mix(0.70, 1.15, smoothstep(0.0, 0.30, ndv));`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>\nvarying vec3 vWorldPos;\nvarying vec3 vNorm;\nuniform vec3 uCamPos;`
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        vec3 viewDir = normalize(uCamPos - vWorldPos);
        float nd = dot(viewDir, vNorm);
        if (nd <= 0.0) discard;

        // Radiant digital gold with specular highlight matching reference image
        vec3 exactLineGold = vec3(1.0, 0.74, 0.10);
        float rimGlint = pow(1.0 - nd, 2.0);
        diffuseColor.rgb = mix(exactLineGold, vec3(1.0, 0.95, 0.65), rimGlint * 0.45);
        diffuseColor.a *= smoothstep(0.0, 0.10, nd);
        `
      );

    mat.userData.shader = shader;
  };

  return mat;
}

export function UnitedCarriersGlobe({
  className = "",
  scrollProgress = 0,
}: {
  className?: string;
  scrollProgress?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

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

    // CSS2D Label Renderer
    const labelRenderer = new CSS2DRenderer({ element: labelContainer });
    labelRenderer.setSize(width, height);

    // Scene & Camera matching https://mining-discovery-rho.vercel.app/ math
    const FOV = 34;
    const FIT = 0.9;
    const halfFov = THREE.MathUtils.degToRad(FOV) / 2;
    const silhouetteAngle = Math.atan(FIT * Math.tan(halfFov));
    const baseCameraZ = 1 / Math.sin(silhouetteAngle);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, width / height, 0.1, 100);
    camera.position.set(0, 0, baseCameraZ);

    // Master Globe Group
    const globeGroup = new THREE.Group();
    // Tilt to show Atlantic, North America, South America, Africa, India, and Australia
    globeGroup.rotation.x = 0.20;
    globeGroup.rotation.y = 3.90;
    globeGroup.rotation.z = 0.03;
    scene.add(globeGroup);

    // 1. 3D Ocean Sphere with Continent Land Mask (Dark Ocean, Lighter Continents)
    const landTex = new THREE.TextureLoader().load("/globe/land-mask.png");
    landTex.colorSpace = THREE.SRGBColorSpace;

    const oceanGeom = new THREE.SphereGeometry(0.995, 64, 64);
    const oceanMat = new THREE.ShaderMaterial({
      uniforms: {
        uCamPos: { value: camera.position },
        uLandMap: { value: landTex },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        varying vec3 vNorm;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vNorm = normalize(normalMatrix * normal);
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uLandMap;
        uniform vec3 uCamPos;
        varying vec3 vWorldPos;
        varying vec3 vNorm;
        varying vec2 vUv;
        void main() {
          vec3 norm = normalize(vWorldPos);
          vec3 viewDir = normalize(uCamPos - vWorldPos);
          float nd = max(0.0, dot(viewDir, norm));
          float fresnel = 1.0 - nd;

          // Sample land mask: rich deep digital midnight sapphire ocean
          vec4 mapCol = texture2D(uLandMap, vUv);

          // Subtle sunlit illumination with gold-sapphire tint
          vec3 sunDir = normalize(vec3(0.65, 0.55, 0.45));
          float sunDot = max(0.0, dot(norm, sunDir));
          vec3 deepOcean = vec3(0.025, 0.065, 0.135);
          vec3 surfaceCol = mix(deepOcean, mapCol.rgb, 0.60) * (0.85 + 0.35 * sunDot);

          // Top-left electric atmospheric horizon crescent glow matching reference image
          vec3 crescentDir = normalize(vec3(-0.48, 0.72, 0.50));
          float crescentDot = max(0.0, dot(norm, crescentDir));
          float crescentBloom = pow(fresnel, 2.6) * (0.40 + 3.0 * pow(crescentDot, 1.8));
          vec3 crescentCol = mix(vec3(1.0, 0.82, 0.30), vec3(0.70, 0.92, 1.0), pow(crescentDot, 1.4));
          surfaceCol += crescentCol * crescentBloom * 0.95;

          // Digital gold rim glow at horizon
          vec3 goldRim = vec3(1.0, 0.75, 0.15);
          surfaceCol += goldRim * pow(fresnel, 4.0) * 0.45;

          // Atmosphere rim blend into website background (#DFE7F3)
          vec3 skyBg = vec3(0.875, 0.906, 0.953);
          float rimHaze = pow(fresnel, 2.6);
          surfaceCol = mix(surfaceCol, skyBg, rimHaze * 0.85);

          // Smooth edge alpha feathering
          float edgeAlpha = smoothstep(0.0, 0.12, nd);
          gl_FragColor = vec4(surfaceCol, edgeAlpha * 0.98);
        }
      `,
      transparent: true,
      depthWrite: true,
    });
    const oceanMesh = new THREE.Mesh(oceanGeom, oceanMat);
    oceanMesh.renderOrder = 0;
    globeGroup.add(oceanMesh);

    // Digital Latitude & Longitude Coordinate Grid Matrix
    const gridMat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#FFAE00"),
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const gridGeom = new THREE.BufferGeometry();
    const gridPts: number[] = [];

    // Latitude rings
    const lats = [-60, -30, 0, 30, 60];
    lats.forEach((lat) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const r = 0.998 * Math.sin(phi);
      const y = 0.998 * Math.cos(phi);
      const segs = 64;
      for (let i = 0; i < segs; i++) {
        const theta1 = (i / segs) * Math.PI * 2;
        const theta2 = ((i + 1) / segs) * Math.PI * 2;
        gridPts.push(r * Math.cos(theta1), y, r * Math.sin(theta1));
        gridPts.push(r * Math.cos(theta2), y, r * Math.sin(theta2));
      }
    });

    // Longitude meridians
    for (let lng = 0; lng < 360; lng += 30) {
      const theta = (lng * Math.PI) / 180;
      const segs = 64;
      for (let i = 0; i < segs; i++) {
        const phi1 = (i / segs) * Math.PI * 2;
        const phi2 = ((i + 1) / segs) * Math.PI * 2;
        gridPts.push(
          0.998 * Math.sin(phi1) * Math.cos(theta),
          0.998 * Math.cos(phi1),
          0.998 * Math.sin(phi1) * Math.sin(theta)
        );
        gridPts.push(
          0.998 * Math.sin(phi2) * Math.cos(theta),
          0.998 * Math.cos(phi2),
          0.998 * Math.sin(phi2) * Math.sin(theta)
        );
      }
    }

    gridGeom.setAttribute("position", new THREE.Float32BufferAttribute(gridPts, 3));
    const gridLines = new THREE.LineSegments(gridGeom, gridMat);
    gridLines.renderOrder = 1;
    globeGroup.add(gridLines);

    // Outer atmospheric glow halo feathering the globe rim directly into the website background
    const haloGeom = new THREE.SphereGeometry(1.02, 64, 64);
    const haloMat = new THREE.ShaderMaterial({
      uniforms: {
        uCamPos: { value: camera.position },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uCamPos;
        varying vec3 vWorldPos;
        void main() {
          vec3 norm = normalize(vWorldPos);
          vec3 viewDir = normalize(uCamPos - vWorldPos);
          float nd = max(0.0, dot(viewDir, norm));
          float alpha = pow(1.0 - nd, 3.5) * 0.48;
          vec3 skyBg = vec3(0.875, 0.906, 0.953);
          gl_FragColor = vec4(skyBg, alpha);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const haloMesh = new THREE.Mesh(haloGeom, haloMat);
    haloMesh.renderOrder = 0;
    globeGroup.add(haloMesh);

    // 2. Continents: Dense Dot Matrix with two-tone lighting
    const dotTex = createDotTexture(64);
    const edgeMat = createLitPointsMaterial(0.0058, dotTex);
    const fillMat = createLitPointsMaterial(0.0044, dotTex);
    const shaderMats = [edgeMat, fillMat];

    fetch("/globe/globe-data.json")
      .then((res) => res.json())
      .then((data: GlobeData) => {
        if (isDisposed) return;

        const edgeGeom = new THREE.BufferGeometry();
        edgeGeom.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(data.edge), 3)
        );
        const edgePoints = new THREE.Points(edgeGeom, edgeMat);
        edgePoints.renderOrder = 1;
        globeGroup.add(edgePoints);

        const fillGeom = new THREE.BufferGeometry();
        fillGeom.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(data.fill), 3)
        );
        const fillPoints = new THREE.Points(fillGeom, fillMat);
        fillPoints.renderOrder = 1;
        globeGroup.add(fillPoints);
      })
      .catch((err) => console.error("Globe data load error:", err));

    // Golden Continent Outline Lines - laser-sharp glowing vector lines
    const coastlineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#FFC000"),
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthTest: true,
    });

    fetch("/globe/coastline-segments.json")
      .then((res) => res.json())
      .then((segments: number[]) => {
        if (isDisposed) return;
        const geom = new THREE.BufferGeometry();
        geom.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(segments), 3)
        );
        const lines = new THREE.LineSegments(geom, coastlineMat);
        lines.renderOrder = 2;
        globeGroup.add(lines);
      })
      .catch((err) => console.error("Coastline load error:", err));

    // 3. Highlighted Mining Hub Jurisdictions with mineral metadata & interactive tooltips
    const HUB_NODES: (HubNode & { minerals: string; region: string })[] = [
      { id: "na", name: "USA & CANADA", region: "TIER-1 JURISDICTION", minerals: "GOLD • COPPER • CRITICAL MINERALS", lat: 41.5, lng: -116.2, size: 1.4 },
      { id: "sa", name: "CHILE & PERU", region: "GLOBAL COPPER BELT", minerals: "COPPER • LITHIUM • SILVER", lat: -24.3, lng: -69.1, size: 1.4 },
      { id: "eu", name: "SWEDEN & FINLAND", region: "NORDIC BATTERY METALS", minerals: "IRON ORE • NICKEL • RARE EARTHS", lat: 67.8, lng: 20.2, size: 1.35 },
      { id: "afr", name: "SOUTH AFRICA", region: "STRATEGIC MINERAL BASIN", minerals: "PGM • MANGANESE • GOLD", lat: -26.4, lng: 27.4, size: 1.35 },
      { id: "asia", name: "MONGOLIA & CENTRAL ASIA", region: "OREBELT CORRIDOR", minerals: "COPPER • GOLD • URANIUM", lat: 43.0, lng: 106.8, size: 1.4 },
      { id: "aus", name: "WESTERN AUSTRALIA", region: "PREMIER RESOURCE HUB", minerals: "IRON ORE • GOLD • LITHIUM", lat: -30.7, lng: 121.5, size: 1.4 },
    ];

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

    const activeRipples: { ring: THREE.Mesh; phaseOffset: number }[] = [];
    const labelObjects: Array<{ obj: CSS2DObject; pos: THREE.Vector3 }> = [];

    HUB_NODES.forEach((node) => {
      const pinGroup = new THREE.Group();
      const pos = latLngToVec3(node.lat, node.lng, 1.003);
      pinGroup.position.copy(pos);
      pinGroup.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        pos.clone().normalize()
      );

      // Starburst glowing sprite
      const sprite = new THREE.Sprite(beaconMat);
      const s = (node.size || 1) * 0.065;
      sprite.scale.set(s, s, 1);
      pinGroup.add(sprite);

      // 3 Multi-phase animated radar ripple rings
      [0, 0.33, 0.66].forEach((offset) => {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.90, 1, 32),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color("#FFB81C"),
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false,
          })
        );
        ring.scale.set(0.015, 0.015, 1);
        pinGroup.add(ring);
        activeRipples.push({ ring, phaseOffset: offset });
      });

      // Outer static concentric golden halo
      const outerRing = new THREE.Mesh(
        new THREE.RingGeometry(0.95, 1, 32),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color("#FF8C00"),
          transparent: true,
          opacity: 0.40,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      outerRing.scale.set(0.035, 0.035, 1);
      pinGroup.add(outerRing);

      // Interactive CSS2D Label badge with rich mineral tooltip and click-to-center
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
        targetFocusRotY = -(node.lng + 90) * (Math.PI / 180);
        targetFocusRotX = (node.lat - 10) * (Math.PI / 180);
        lastInteractionTime = performance.now();
      });

      const labelObj = new CSS2DObject(labelDiv);
      pinGroup.add(labelObj);
      labelObjects.push({ obj: labelObj, pos });

      globeGroup.add(pinGroup);
    });

    // 4. Sleek, Radiant Golden Network Arcs
    const CORRIDORS: CorridorArc[] = [
      { from: [41.5, -116.2], to: [-24.3, -69.1], alt: 0.05 }, // USA/Canada -> Chile/Peru
      { from: [41.5, -116.2], to: [67.8, 20.2], alt: 0.06 }, // USA/Canada -> Sweden/Finland
      { from: [67.8, 20.2], to: [-26.4, 27.4], alt: 0.06 }, // Sweden/Finland -> South Africa
      { from: [67.8, 20.2], to: [43.0, 106.8], alt: 0.05 }, // Sweden/Finland -> Mongolia
      { from: [43.0, 106.8], to: [-30.7, 121.5], alt: 0.06 }, // Mongolia -> Western Australia
      { from: [-26.4, 27.4], to: [-30.7, 121.5], alt: 0.06 }, // South Africa -> Western Australia
      { from: [-24.3, -69.1], to: [-26.4, 27.4], alt: 0.06 }, // Chile/Peru -> South Africa
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
      // Delicate thin filament (0.0008)
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

    // 5. Floating Concentric Digital Orbital Rings (Matching Reference Image)
    const orbitGroup = new THREE.Group();
    orbitGroup.name = "DigitalOrbitalRings";

    // Primary Equatorial Dashed Data Ring (R = 1.14)
    const orbitRing1Geom = new THREE.BufferGeometry();
    const orbitRing1Pts: number[] = [];
    const orbitSegs = 144;
    for (let i = 0; i < orbitSegs; i++) {
      if (i % 3 === 0) continue; // Dashed digital tick spacing
      const t1 = (i / orbitSegs) * Math.PI * 2;
      const t2 = ((i + 0.65) / orbitSegs) * Math.PI * 2;
      orbitRing1Pts.push(Math.cos(t1) * 1.14, 0, Math.sin(t1) * 1.14);
      orbitRing1Pts.push(Math.cos(t2) * 1.14, 0, Math.sin(t2) * 1.14);
    }
    orbitRing1Geom.setAttribute("position", new THREE.Float32BufferAttribute(orbitRing1Pts, 3));
    const orbitRing1Mat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#FFAE00"),
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const orbitRing1 = new THREE.LineSegments(orbitRing1Geom, orbitRing1Mat);
    orbitRing1.rotation.x = 0.26;
    orbitRing1.rotation.z = -0.12;
    orbitGroup.add(orbitRing1);

    // Secondary Outer Dotted Coordinate Ring (R = 1.24)
    const orbitPointsCount = 96;
    const orbitRing2Geom = new THREE.BufferGeometry();
    const orbitRing2Pos = new Float32Array(orbitPointsCount * 3);
    for (let i = 0; i < orbitPointsCount; i++) {
      const angle = (i / orbitPointsCount) * Math.PI * 2;
      orbitRing2Pos[i * 3] = Math.cos(angle) * 1.24;
      orbitRing2Pos[i * 3 + 1] = Math.sin(angle * 3) * 0.035;
      orbitRing2Pos[i * 3 + 2] = Math.sin(angle) * 1.24;
    }
    orbitRing2Geom.setAttribute("position", new THREE.BufferAttribute(orbitRing2Pos, 3));
    const orbitPointsMat = new THREE.PointsMaterial({
      color: new THREE.Color("#FFC000"),
      size: 0.016,
      transparent: true,
      opacity: 0.60,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const orbitPoints = new THREE.Points(orbitRing2Geom, orbitPointsMat);
    orbitPoints.rotation.x = -0.20;
    orbitPoints.rotation.y = 0.35;
    orbitGroup.add(orbitPoints);

    globeGroup.add(orbitGroup);

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

      // On touch, allow native vertical scroll if vertical motion dominates
      if (e.pointerType === "touch" && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
        return;
      }

      const sensitivity = 0.0055;
      globeGroup.rotation.y += deltaX * sensitivity;
      globeGroup.rotation.x += deltaY * sensitivity;

      // Clamp vertical pitch so the globe doesn't invert
      globeGroup.rotation.x = Math.max(-0.80, Math.min(0.80, globeGroup.rotation.x));

      // Momentum velocity for smooth gliding
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
    const tempWorldPos = new THREE.Vector3();

    const animate = () => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Hand Dragging, Target Focus Navigation, Scroll Tour, or Ambient Kinetic Glide
      if (isDragging) {
        // Direct hand dragging
      } else if (targetFocusRotY !== null && targetFocusRotX !== null) {
        // Smooth cinematic ease directly to clicked mining jurisdiction
        let diffY = targetFocusRotY - globeGroup.rotation.y;
        while (diffY > Math.PI) diffY -= Math.PI * 2;
        while (diffY < -Math.PI) diffY += Math.PI * 2;

        globeGroup.rotation.y += diffY * 0.09;
        globeGroup.rotation.x = THREE.MathUtils.lerp(globeGroup.rotation.x, targetFocusRotX, 0.09);

        const targetScale = 1.28;
        globeGroup.scale.setScalar(THREE.MathUtils.lerp(globeGroup.scale.x, targetScale, 0.08));

        if (Math.abs(diffY) < 0.005 && Math.abs(targetFocusRotX - globeGroup.rotation.x) < 0.005) {
          targetFocusRotY = null;
          targetFocusRotX = null;
        }
      } else if (scrollRef.current > 0.003) {
        // Scroll-driven tour: smoothly rotate and zoom into each highlighted country one by one
        const p = scrollRef.current;
        const totalSegments = HUB_NODES.length - 1;
        const s = Math.min(Math.max(p * totalSegments, 0), totalSegments);
        const idx = Math.min(Math.floor(s), totalSegments - 1);
        const nextIdx = idx + 1;
        const localT = s - idx;
        const easeT = localT * localT * (3 - 2 * localT);

        const targetLat = THREE.MathUtils.lerp(HUB_NODES[idx].lat, HUB_NODES[nextIdx].lat, easeT);
        let dLng = HUB_NODES[nextIdx].lng - HUB_NODES[idx].lng;
        while (dLng > 180) dLng -= 360;
        while (dLng < -180) dLng += 360;
        const targetLng = HUB_NODES[idx].lng + dLng * easeT;

        // Desired rotation bringing the target country to front center
        const desiredRotY = -(targetLng + 90) * (Math.PI / 180);
        const desiredRotX = (targetLat - 10) * (Math.PI / 180);

        // Zoom scale: zooms in deep on each country (1.38x), slight pullback during transit (1.15x)
        const targetZoom = 1.38 - 0.23 * Math.sin(localT * Math.PI);

        let diffY = desiredRotY - globeGroup.rotation.y;
        while (diffY > Math.PI) diffY -= Math.PI * 2;
        while (diffY < -Math.PI) diffY += Math.PI * 2;

        globeGroup.rotation.y += diffY * 0.08;
        globeGroup.rotation.x = THREE.MathUtils.lerp(globeGroup.rotation.x, desiredRotX, 0.08);

        const curScale = globeGroup.scale.x;
        const nextScale = THREE.MathUtils.lerp(curScale, targetZoom, 0.08);
        globeGroup.scale.set(nextScale, nextScale, nextScale);

        timeUniform.uTime.value += 0.002;
      } else {
        // At rest / top: smooth inertia friction + subtle auto-rotation + magnetic cursor tilt
        globeGroup.rotation.y += velocityX;
        globeGroup.rotation.x += velocityY;
        globeGroup.rotation.x = Math.max(-0.80, Math.min(0.80, globeGroup.rotation.x));
        velocityX *= 0.92;
        velocityY *= 0.92;

        // Auto-rotation resumes gently when not interacting
        if (now - lastInteractionTime > 1200) {
          const turn = 0.0014 * (delta / 0.0166);
          globeGroup.rotation.y += turn;
          timeUniform.uTime.value += turn * 2.2;
        }

        const curScale = globeGroup.scale.x;
        const nextScale = THREE.MathUtils.lerp(curScale, 1.0, 0.05);
        globeGroup.scale.set(nextScale, nextScale, nextScale);
      }

      // Multi-phase pulse radar ripple rings
      activeRipples.forEach(({ ring, phaseOffset }) => {
        const pulseCycle = (now * 0.0016 + phaseOffset) % 1;
        const ringScale = 0.012 + pulseCycle * 0.038;
        const ringOpacity = (1 - pulseCycle) * 0.85;
        ring.scale.set(ringScale, ringScale, 1);
        (ring.material as THREE.MeshBasicMaterial).opacity = ringOpacity;
      });

      // Update shader uniforms
      oceanMat.uniforms.uCamPos.value.copy(camera.position);
      shaderMats.forEach((mat) => {
        if (mat.userData.shader) {
          mat.userData.shader.uniforms.uCamPos.value.copy(camera.position);
        }
      });

      // Occlude labels when on the back side of the Earth
      labelObjects.forEach(({ obj, pos }) => {
        tempWorldPos.copy(pos).applyMatrix4(globeGroup.matrixWorld);
        const dot = tempWorldPos.dot(camera.position);
        obj.element.style.opacity = dot > 0.12 ? "1" : "0";
        obj.element.style.pointerEvents = dot > 0.12 ? "auto" : "none";
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
      dotTex.dispose();
      landTex.dispose();
      beaconTex.dispose();
      oceanGeom.dispose();
      oceanMat.dispose();
      haloGeom.dispose();
      haloMat.dispose();
      edgeMat.dispose();
      fillMat.dispose();
      beaconMat.dispose();
      coastlineMat.dispose();
      arcMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full aspect-square select-none overflow-visible cursor-grab active:cursor-grabbing touch-pan-y ${className}`}
      style={{ isolation: "isolate" }}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="relative z-10 w-full h-full pointer-events-none block"
      />

      {/* CSS2D Label Layer */}
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
          background: rgba(11, 27, 48, 0.90);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(212, 175, 55, 0.40);
          border-radius: 4px;
          padding: 2.5px 7px;
          transform: translate(-50%, -145%);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
        }

        .globe-country-badge:hover {
          background: rgba(11, 27, 48, 0.98);
          border-color: rgba(212, 175, 55, 0.85);
          transform: translate(-50%, -152%) scale(1.08);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.65), 0 0 10px rgba(212, 175, 55, 0.25);
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
          background: #D4AF37;
          box-shadow: 0 0 4px #D4AF37;
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

        .globe-country-badge:hover .badge-tooltip {
          max-height: 38px;
          opacity: 1;
          margin-top: 3px;
        }

        .tooltip-region {
          font-size: 7px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: #D4AF37;
        }

        .tooltip-minerals {
          font-size: 6.5px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: #94A3B8;
        }

        @media (min-width: 640px) {
          .globe-country-badge {
            padding: 3px 9px;
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
