"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

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

function latLngToVec3(lat: number, lng: number, r = 1): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

// Radiant starburst flare texture for beacon hubs
function createBeaconStarburstTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;
  ctx.clearRect(0, 0, size, size);

  const bloom = ctx.createRadialGradient(c, c, 0, c, c, c);
  bloom.addColorStop(0, "rgba(255, 255, 255, 1)");
  bloom.addColorStop(0.16, "rgba(255, 235, 150, 0.98)");
  bloom.addColorStop(0.38, "rgba(255, 165, 0, 0.88)");
  bloom.addColorStop(0.70, "rgba(255, 95, 0, 0.35)");
  bloom.addColorStop(1, "rgba(255, 140, 0, 0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, size, size);

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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

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
    // Tilt to show Atlantic, North America, South America, Africa, India, and Australia
    globeGroup.rotation.x = 0.20;
    globeGroup.rotation.y = 3.90;
    globeGroup.rotation.z = 0.03;
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

    // 2. Highlighted Mining Hub Jurisdictions with mineral metadata & interactive tooltips
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
      const s = (node.size || 1) * 0.062;
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

      // Update GLTF animation mixer for revolving cloud layer
      if (mixer) {
        mixer.update(delta);
      }

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
      beaconTex.dispose();
      beaconMat.dispose();
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
          background: rgba(11, 31, 58, 0.88);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(184, 134, 11, 0.55);
          border-radius: 4px;
          padding: 2.5px 7px;
          transform: translate(-50%, -145%);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.55), 0 0 10px rgba(184, 134, 11, 0.25);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
        }

        .globe-country-badge:hover {
          background: rgba(11, 31, 58, 0.96);
          border-color: #FFAE00;
          transform: translate(-50%, -155%) scale(1.12);
          box-shadow: 0 6px 22px rgba(0, 0, 0, 0.75), 0 0 16px rgba(255, 174, 0, 0.5);
          z-index: 50;
        }

        .badge-header {
          display: flex;
          align-items: center;
          gap: 4.5px;
        }

        .badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #FFAE00;
          box-shadow: 0 0 6px #FFAE00;
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
          max-height: 40px;
          opacity: 1;
          margin-top: 3px;
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
