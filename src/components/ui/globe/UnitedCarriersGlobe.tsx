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
  region: string;
  minerals: string;
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

// Radiant golden starburst flare texture for beacon hubs
function createBeaconStarburstTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;
  ctx.clearRect(0, 0, size, size);

  // Soft spherical golden bloom with digital lens flare
  const bloom = ctx.createRadialGradient(c, c, 0, c, c, c);
  bloom.addColorStop(0, "rgba(255, 255, 255, 1)");
  bloom.addColorStop(0.20, "rgba(255, 235, 150, 0.98)");
  bloom.addColorStop(0.45, "rgba(255, 165, 0, 0.90)");
  bloom.addColorStop(0.75, "rgba(255, 100, 0, 0.40)");
  bloom.addColorStop(1, "rgba(255, 100, 0, 0)");
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
    // Tilt matching the reference perspective showing Americas, Atlantic, Europe, and Africa
    globeGroup.rotation.x = 0.22;
    globeGroup.rotation.y = 3.95;
    globeGroup.rotation.z = 0.02;
    scene.add(globeGroup);

    // 1. Photorealistic 3D Earth Surface with Land Mask, Vegetation, Sahara Tones & Night Lights
    const landTex = new THREE.TextureLoader().load("/globe/land-mask.png");
    landTex.colorSpace = THREE.SRGBColorSpace;

    const earthGeom = new THREE.SphereGeometry(0.995, 64, 64);
    const earthMat = new THREE.ShaderMaterial({
      uniforms: {
        uCamPos: { value: camera.position },
        uLandMap: { value: landTex },
        uTime: { value: 0 },
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
        uniform float uTime;
        varying vec3 vWorldPos;
        varying vec3 vNorm;
        varying vec2 vUv;
        void main() {
          vec3 norm = normalize(vWorldPos);
          vec3 viewDir = normalize(uCamPos - vWorldPos);
          float nd = max(0.0, dot(viewDir, norm));
          float fresnel = 1.0 - nd;

          // Sample land mask
          vec4 mapCol = texture2D(uLandMap, vUv);
          float isLand = mapCol.r;

          // Directional solar lighting
          vec3 sunDir = normalize(vec3(0.60, 0.55, 0.50));
          float sunDot = max(0.0, dot(norm, sunDir));

          // 1. Deep Royal Sapphire Ocean
          vec3 deepOcean = vec3(0.035, 0.12, 0.28);
          vec3 shallowOcean = vec3(0.07, 0.25, 0.48);
          vec3 oceanCol = mix(deepOcean, shallowOcean, pow(sunDot, 1.8));

          // 2. Realistic Continent Topography & Terrain
          // Sahara / Desert Ochre Latitudes
          float lat = vUv.y;
          float isSahara = smoothstep(0.50, 0.65, lat) * (1.0 - smoothstep(0.70, 0.85, lat));
          vec3 desertCol = vec3(0.76, 0.56, 0.32);
          vec3 lushGreen = vec3(0.12, 0.32, 0.20);
          vec3 mountainTones = vec3(0.42, 0.35, 0.25);
          vec3 arcticIce = vec3(0.88, 0.94, 0.98);

          vec3 landBase = mix(lushGreen, desertCol, isSahara * 0.85);
          if (lat > 0.88 || lat < 0.12) {
            landBase = mix(landBase, arcticIce, 0.90);
          }

          // 3. Golden Night-City Lights & Mineral Nodes
          float cityCluster = sin(vUv.x * 340.0) * sin(vUv.y * 340.0);
          cityCluster = smoothstep(0.45, 0.95, cityCluster);
          float shimmer = sin(uTime * 2.5 + vUv.x * 120.0) * 0.5 + 0.5;
          vec3 goldNightLights = vec3(1.0, 0.72, 0.15) * (0.85 + 0.35 * shimmer);

          vec3 landSurface = landBase * (0.65 + 0.45 * sunDot) + goldNightLights * cityCluster * 0.85;

          // Blend ocean and land
          vec3 surfaceCol = mix(oceanCol, landSurface, isLand);

          // 4. Electric Cyan / Blue Atmospheric Crescent Bloom
          vec3 crescentDir = normalize(vec3(-0.45, 0.75, 0.45));
          float crescentDot = max(0.0, dot(norm, crescentDir));
          float crescentBloom = pow(fresnel, 2.6) * (0.35 + 2.6 * pow(crescentDot, 1.8));
          vec3 crescentCol = mix(vec3(0.12, 0.55, 1.0), vec3(0.75, 0.92, 1.0), crescentDot);
          surfaceCol += crescentCol * crescentBloom * 0.90;

          // Outer edge alpha feathering
          float edgeAlpha = smoothstep(0.0, 0.08, nd);
          gl_FragColor = vec4(surfaceCol, edgeAlpha * 0.98);
        }
      `,
      transparent: true,
      depthWrite: true,
    });
    const earthMesh = new THREE.Mesh(earthGeom, earthMat);
    earthMesh.renderOrder = 0;
    globeGroup.add(earthMesh);

    // 2. Highlighted Global Mining Hub Jurisdictions
    const HUB_NODES: HubNode[] = [
      { id: "na", name: "USA & CANADA", region: "TIER-1 JURISDICTION", minerals: "GOLD • COPPER • CRITICAL MINERALS", lat: 41.5, lng: -116.2, size: 1.4 },
      { id: "sa", name: "CHILE & PERU", region: "GLOBAL COPPER BELT", minerals: "COPPER • LITHIUM • SILVER", lat: -24.3, lng: -69.1, size: 1.4 },
      { id: "eu", name: "SWEDEN & FINLAND", region: "NORDIC BATTERY METALS", minerals: "IRON ORE • NICKEL • RARE EARTHS", lat: 67.8, lng: 20.2, size: 1.35 },
      { id: "afr", name: "SOUTH AFRICA", region: "STRATEGIC MINERAL BASIN", minerals: "PGM • MANGANESE • GOLD", lat: -26.4, lng: 27.4, size: 1.35 },
      { id: "me", name: "SAUDI & MIDDLE EAST", region: "CRITICAL MINERALS CORRIDOR", minerals: "PHOSPHATE • GOLD • COPPER", lat: 24.7, lng: 46.7, size: 1.35 },
      { id: "asia", name: "CENTRAL ASIA & MONGOLIA", region: "OREBELT BASIN", minerals: "COPPER • GOLD • URANIUM", lat: 43.0, lng: 106.8, size: 1.4 },
      { id: "aus", name: "WESTERN AUSTRALIA", region: "PREMIER RESOURCE HUB", minerals: "IRON ORE • GOLD • LITHIUM", lat: -30.7, lng: 121.5, size: 1.4 },
    ];

    let targetFocusRotY: number | null = null;
    let targetFocusRotX: number | null = null;
    let lastInteractionTime = performance.now();

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
      const s = (node.size || 1) * 0.068;
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

    // 4. 3D Glowing Golden Trade Corridors
    const CORRIDORS: CorridorArc[] = [
      { from: [41.5, -116.2], to: [-24.3, -69.1], alt: 0.06 }, // USA/Canada -> Chile/Peru
      { from: [41.5, -116.2], to: [67.8, 20.2], alt: 0.07 }, // USA/Canada -> Sweden/Finland
      { from: [67.8, 20.2], to: [24.7, 46.7], alt: 0.06 }, // Sweden/Finland -> Middle East
      { from: [24.7, 46.7], to: [-26.4, 27.4], alt: 0.06 }, // Middle East -> South Africa
      { from: [67.8, 20.2], to: [43.0, 106.8], alt: 0.06 }, // Sweden/Finland -> Mongolia
      { from: [43.0, 106.8], to: [-30.7, 121.5], alt: 0.07 }, // Mongolia -> Western Australia
      { from: [-26.4, 27.4], to: [-30.7, 121.5], alt: 0.07 }, // South Africa -> Western Australia
      { from: [-24.3, -69.1], to: [-26.4, 27.4], alt: 0.07 }, // Chile/Peru -> South Africa
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
          diffuseColor.rgb += vec3(0.6, 0.45, 0.20) * pulse * 2.2;
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
      const geom = new THREE.TubeGeometry(curve, 36, 0.0010, 4, false);
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

    // Resize Handler
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

    // Interactive Hand Drag Controls
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let velocityX = 0;
    let velocityY = 0;

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
      globeGroup.rotation.x += deltaY * sensitivity;
      globeGroup.rotation.x = Math.max(-0.80, Math.min(0.80, globeGroup.rotation.x));

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

    // Magnetic Cursor Tilt
    const onContainerPointerMove = (e: PointerEvent) => {
      if (!isDragging) {
        const rect = container.getBoundingClientRect();
        const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, mx * 0.35, 0.05);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, -my * 0.35, 0.05);
        camera.lookAt(0, 0, 0);
      }
    };
    container.addEventListener("pointermove", onContainerPointerMove, { passive: true });

    // Render Animation Loop
    let lastTime = performance.now();
    const tempWorldPos = new THREE.Vector3();
    const tempEuler = new THREE.Euler();
    const tempMat = new THREE.Matrix4();

    const animate = () => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Rotation / Interaction Physics
      if (isDragging) {
        // Direct dragging
      } else if (targetFocusRotY !== null && targetFocusRotX !== null) {
        let diffY = targetFocusRotY - globeGroup.rotation.y;
        while (diffY > Math.PI) diffY -= Math.PI * 2;
        while (diffY < -Math.PI) diffY += Math.PI * 2;

        globeGroup.rotation.y += diffY * 0.09;
        globeGroup.rotation.x = THREE.MathUtils.lerp(globeGroup.rotation.x, targetFocusRotX, 0.09);

        const targetScale = 1.25;
        globeGroup.scale.setScalar(THREE.MathUtils.lerp(globeGroup.scale.x, targetScale, 0.08));

        if (Math.abs(diffY) < 0.005 && Math.abs(targetFocusRotX - globeGroup.rotation.x) < 0.005) {
          targetFocusRotY = null;
          targetFocusRotX = null;
        }
      } else if (scrollRef.current > 0.003) {
        // Scroll tour transition
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

        const desiredRotY = -(targetLng + 90) * (Math.PI / 180);
        const desiredRotX = (targetLat - 10) * (Math.PI / 180);

        let diffY = desiredRotY - globeGroup.rotation.y;
        while (diffY > Math.PI) diffY -= Math.PI * 2;
        while (diffY < -Math.PI) diffY += Math.PI * 2;

        globeGroup.rotation.y += diffY * 0.08;
        globeGroup.rotation.x = THREE.MathUtils.lerp(globeGroup.rotation.x, desiredRotX, 0.08);

        timeUniform.uTime.value += 0.002;
      } else {
        // Ambient smooth inertia gliding
        globeGroup.rotation.y += velocityX;
        globeGroup.rotation.x += velocityY;
        globeGroup.rotation.x = Math.max(-0.80, Math.min(0.80, globeGroup.rotation.x));
        velocityX *= 0.92;
        velocityY *= 0.92;

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
      earthMat.uniforms.uCamPos.value.copy(camera.position);
      earthMat.uniforms.uTime.value = now * 0.001;

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
      landTex.dispose();
      beaconTex.dispose();
      earthGeom.dispose();
      earthMat.dispose();
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
          background: rgba(11, 27, 48, 0.90);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 174, 0, 0.45);
          border-radius: 4px;
          padding: 2.5px 7px;
          transform: translate(-50%, -145%);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.55), 0 0 10px rgba(255, 174, 0, 0.15);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
        }

        .globe-country-badge:hover {
          background: rgba(11, 27, 48, 0.98);
          border-color: rgba(255, 174, 0, 0.90);
          transform: translate(-50%, -152%) scale(1.08);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.75), 0 0 16px rgba(255, 174, 0, 0.35);
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
          max-height: 38px;
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
          color: #CBD5E1;
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

export default UnitedCarriersGlobe;
