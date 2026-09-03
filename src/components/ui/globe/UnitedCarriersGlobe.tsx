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

// Crisp circular dot texture for point cloud
function createDotTexture(size = 64): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  const r = size / 2;
  // Exact #FFAE00 golden color matching the lines
  const grad = ctx.createRadialGradient(r, r, r * 0.75, r, r, r);
  grad.addColorStop(0, "rgba(255, 174, 0, 1)");
  grad.addColorStop(0.85, "rgba(255, 174, 0, 1)");
  grad.addColorStop(1, "rgba(255, 174, 0, 0)");
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

// Radiant starburst flare texture for beacon hubs
function createBeaconStarburstTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;
  ctx.clearRect(0, 0, size, size);

  // Soft spherical fiery-gold bloom matching media_1788173039083.png
  const bloom = ctx.createRadialGradient(c, c, 0, c, c, c);
  bloom.addColorStop(0, "rgba(255, 255, 255, 1)");
  bloom.addColorStop(0.16, "rgba(255, 235, 150, 0.98)");
  bloom.addColorStop(0.38, "rgba(255, 165, 0, 0.88)");
  bloom.addColorStop(0.70, "rgba(255, 95, 0, 0.35)");
  bloom.addColorStop(1, "rgba(255, 140, 0, 0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, size, size);

  // Cross flares
  ctx.strokeStyle = "rgba(255, 255, 240, 0.96)";
  ctx.lineWidth = 2.0;
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

// Points material shader with pure golden dots
function createLitPointsMaterial(
  size: number,
  mapTexture: THREE.CanvasTexture
): THREE.PointsMaterial {
  const mat = new THREE.PointsMaterial({
    size,
    sizeAttenuation: true,
    depthWrite: false,
    transparent: true,
    color: new THREE.Color("#FFAE00"),
    map: mapTexture,
    alphaTest: 0,
    opacity: 1,
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
        `#include <project_vertex>\nfloat ndv = dot(normalize(uCamPos - vWorldPos), vNorm);\ngl_PointSize *= mix(0.6, 1.0, smoothstep(0.0, 0.25, ndv));`
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

        // Exact golden color matching the lines (#FFAE00)
        vec3 exactLineGold = vec3(1.0, 0.682, 0.0);
        diffuseColor.rgb = exactLineGold;
        diffuseColor.a *= smoothstep(0.0, 0.12, nd);
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

          // Sample land mask: dark ocean where there are no continents, lighter sapphire where continents are
          vec4 mapCol = texture2D(uLandMap, vUv);

          // Subtle sunlit illumination
          vec3 sunDir = normalize(vec3(0.65, 0.55, 0.45));
          float sunDot = max(0.0, dot(norm, sunDir));
          vec3 surfaceCol = mapCol.rgb * (0.85 + 0.35 * sunDot);

          // Atmosphere rim blend into website background (#DFE7F3)
          vec3 skyBg = vec3(0.875, 0.906, 0.953);
          float rimHaze = pow(fresnel, 2.6);
          surfaceCol = mix(surfaceCol, skyBg, rimHaze * 0.85);

          // Smooth edge alpha feathering so the globe dissolves seamlessly into the website canvas
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
    const edgeMat = createLitPointsMaterial(0.0055, dotTex);
    const fillMat = createLitPointsMaterial(0.0042, dotTex);
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

    // Golden Continent Outline Lines - crisp razor-sharp vector lines
    const coastlineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#FFAE00"),
      transparent: false,
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

    // 3. Highlighted Mining Countries matching https://mining-discovery-rho.vercel.app/
    const HUB_NODES: HubNode[] = [
      { id: "na", name: "USA & CANADA", lat: 41.5, lng: -116.2, size: 1.4 },
      { id: "sa", name: "CHILE & PERU", lat: -24.3, lng: -69.1, size: 1.4 },
      { id: "eu", name: "SWEDEN & FINLAND", lat: 67.8, lng: 20.2, size: 1.35 },
      { id: "afr", name: "SOUTH AFRICA", lat: -26.4, lng: 27.4, size: 1.35 },
      { id: "asia", name: "MONGOLIA & CENTRAL ASIA", lat: 43.0, lng: 106.8, size: 1.4 },
      { id: "aus", name: "WESTERN AUSTRALIA", lat: -30.7, lng: 121.5, size: 1.4 },
    ];

    const beaconTex = createBeaconStarburstTexture(128);
    const beaconMat = new THREE.SpriteMaterial({
      map: beaconTex,
      color: new THREE.Color("#FFAE19"),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const activeRipples: THREE.Mesh[] = [];
    const labelObjects: Array<{ obj: CSS2DObject; pos: THREE.Vector3 }> = [];

    HUB_NODES.forEach((node) => {
      const pinGroup = new THREE.Group();
      const pos = latLngToVec3(node.lat, node.lng, 1.003);
      pinGroup.position.copy(pos);
      pinGroup.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        pos.clone().normalize()
      );

      // Starburst sprite
      const sprite = new THREE.Sprite(beaconMat);
      const s = (node.size || 1) * 0.058;
      sprite.scale.set(s, s, 1);
      pinGroup.add(sprite);

      // Inner animated ripple ring
      const innerRing = new THREE.Mesh(
        new THREE.RingGeometry(0.92, 1, 32),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color("#FFB81C"),
          transparent: true,
          opacity: 0.90,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      innerRing.scale.set(0.017, 0.017, 1);
      pinGroup.add(innerRing);
      activeRipples.push(innerRing);

      // Outer static concentric halo ring
      const outerRing = new THREE.Mesh(
        new THREE.RingGeometry(0.95, 1, 32),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color("#FF8C00"),
          transparent: true,
          opacity: 0.50,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      outerRing.scale.set(0.034, 0.034, 1);
      pinGroup.add(outerRing);

      // CSS2D Label badge [ NAME ]
      const labelDiv = document.createElement("div");
      labelDiv.className = "globe-country-badge";
      labelDiv.textContent = node.name;
      const labelObj = new CSS2DObject(labelDiv);
      pinGroup.add(labelObj);
      labelObjects.push({ obj: labelObj, pos });

      globeGroup.add(pinGroup);
    });

    // 4. Golden Network Arcs & Filaments (#F5A900)
    // 4. Sleek, Elegant Golden Network Arcs (#FFA414)
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
      // Delicate thin filament (0.0008) instead of thick bulging tube (0.0018)
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

    // Render Animation Loop
    let lastTime = performance.now();
    const tempWorldPos = new THREE.Vector3();

    const animate = () => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Hand Dragging, Scroll-Driven Country Zoom Tour, or Gentle Idle Spin
      if (isDragging) {
        // Direct hand tracking
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
        // At rest / top: smooth inertia friction + subtle auto-rotation
        globeGroup.rotation.y += velocityX;
        globeGroup.rotation.x += velocityY;
        globeGroup.rotation.x = Math.max(-0.80, Math.min(0.80, globeGroup.rotation.x));
        velocityX *= 0.92;
        velocityY *= 0.92;

        // Auto-rotation resumes gently when hand is not rotating it
        if (now - lastInteractionTime > 1200) {
          const turn = 0.0012 * (delta / 0.0166);
          globeGroup.rotation.y += turn;
          timeUniform.uTime.value += turn * 2.0;
        }

        const curScale = globeGroup.scale.x;
        const nextScale = THREE.MathUtils.lerp(curScale, 1.0, 0.05);
        globeGroup.scale.set(nextScale, nextScale, nextScale);
      }

      // Pulse ripple rings
      const pulseCycle = (now * 0.002) % 1;
      const ringScale = 0.015 + pulseCycle * 0.025;
      const ringOpacity = (1 - pulseCycle) * 0.75;
      activeRipples.forEach((ring) => {
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
        obj.element.style.opacity = dot > 0.1 ? "1" : "0";
        obj.element.style.pointerEvents = dot > 0.1 ? "auto" : "none";
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
          white-space: nowrap !important;
          pointer-events: none;
          font-family: var(--font-geist-mono, monospace), monospace;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #ffffff;
          background: rgba(2, 8, 23, 0.90);
          border: 1px solid rgba(245, 169, 0, 0.45);
          border-radius: 2px;
          padding: 1.5px 5px;
          transform: translate(-50%, -150%);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.85);
          transition: opacity 0.3s ease;
        }
        @media (min-width: 640px) {
          .globe-country-badge {
            font-size: 9px;
            padding: 2px 7px;
          }
        }
      `}</style>
    </div>
  );
}
