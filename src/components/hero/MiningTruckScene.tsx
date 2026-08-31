"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { createHaulTruck } from "./TruckModel";
import { createPitEnvironment } from "./PitEnvironment";
import { createDustSystem } from "./DustSystem";

// ─── Scroll-to-scene progress (0 → 1) fed down from CinematicHero ────────────
interface SceneProps {
  scrollProgress: number;
  onSpeedChange?: (kmh: number, gear: string, elevation: number) => void;
  className?: string;
}

// ─── Camera path keyframes ─────────────────────────────────────────────────────
// Each keyframe: { sp, pos, target }
interface CamFrame {
  sp: number;
  pos: THREE.Vector3;
  target: THREE.Vector3;
}

function lerp3(a: THREE.Vector3, b: THREE.Vector3, t: number) {
  return new THREE.Vector3().lerpVectors(a, b, t);
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

// Smoothstep easing
function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

// Map progress into a local 0-1 within a segment [a, b]
function seg(sp: number, a: number, b: number) {
  return smooth(clamp01((sp - a) / (b - a)));
}

export const MiningTruckScene: React.FC<SceneProps> = ({
  scrollProgress,
  onSpeedChange,
  className = "w-full h-full",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);
  const callbackRef = useRef(onSpeedChange);

  useEffect(() => {
    scrollRef.current = scrollProgress;
    callbackRef.current = onSpeedChange;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let animId = 0;
    let isVisible = true;

    const isMobile = window.innerWidth < 768;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.setClearColor(0x0c0e12);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    // ── Scene ───────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c0e12, isMobile ? 0.011 : 0.0088);

    // ── Camera ──────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 400);
    camera.position.set(-22, 8, -55);
    camera.lookAt(0, 3, 0);

    // ── Lights ──────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0x8da8c8, 0.42);
    scene.add(ambient);

    // Pre-dawn directional sun (raking from upper-right)
    const sun = new THREE.DirectionalLight(0xffecd5, 2.4);
    sun.position.set(38, 55, 18);
    sun.castShadow = !isMobile;
    if (!isMobile) {
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.near = 5;
      sun.shadow.camera.far = 140;
      sun.shadow.camera.left = -35;
      sun.shadow.camera.right = 35;
      sun.shadow.camera.top = 35;
      sun.shadow.camera.bottom = -35;
      sun.shadow.bias = -0.0003;
    }
    scene.add(sun);

    // Cool sky fill from opposite
    const skyFill = new THREE.DirectionalLight(0x6d8fbb, 0.6);
    skyFill.position.set(-25, 22, -35);
    scene.add(skyFill);

    // ── Build Scene Objects ──────────────────────────────────────────────────
    const truck = createHaulTruck();
    truck.group.castShadow = true;
    scene.add(truck.group);

    const pit = createPitEnvironment();
    scene.add(pit.group);

    const dust = createDustSystem(isMobile);
    scene.add(dust.points);

    // ── Travel Path ──────────────────────────────────────────────────────────
    // Truck travels Z from far-away to past camera
    const PATH_START_Z = -85;
    const PATH_END_Z = 55;
    const PATH_SPAN = PATH_END_Z - PATH_START_Z;
    const TIRE_R = 1.55 * 0.68; // scaled

    // Camera keyframes (positions + look-at)
    const camFrames: CamFrame[] = [
      // Act 1: Wide establishing — truck far ahead
      {
        sp: 0,
        pos: new THREE.Vector3(-22, 9.5, -58),
        target: new THREE.Vector3(0, 3, 0),
      },
      // Act 1→2: Pull in as truck approaches
      {
        sp: 0.22,
        pos: new THREE.Vector3(-18, 7, -32),
        target: new THREE.Vector3(0, 3, 12),
      },
      // Act 2: Low-angle side tracking — massive scale
      {
        sp: 0.38,
        pos: new THREE.Vector3(-28, 4, 8),
        target: new THREE.Vector3(0, 4, 18),
      },
      // Act 2→3: Close-up rear 3/4 as truck passes
      {
        sp: 0.52,
        pos: new THREE.Vector3(-20, 5.5, 32),
        target: new THREE.Vector3(0, 3.5, 22),
      },
      // Act 3: Aerial pull-up shows scale of pit
      {
        sp: 0.72,
        pos: new THREE.Vector3(-12, 28, 50),
        target: new THREE.Vector3(0, 0, 20),
      },
      // Act 4: High aerial vista — reveal open-pit
      {
        sp: 0.88,
        pos: new THREE.Vector3(6, 55, 65),
        target: new THREE.Vector3(0, -5, 10),
      },
      // Act 5: Top-down fade-out into Stats
      {
        sp: 1.0,
        pos: new THREE.Vector3(6, 72, 75),
        target: new THREE.Vector3(0, -10, 10),
      },
    ];

    // Interpolate camera between keyframes based on scroll progress
    function getCameraForSP(sp: number): { pos: THREE.Vector3; target: THREE.Vector3 } {
      let i = 0;
      while (i < camFrames.length - 2 && camFrames[i + 1].sp <= sp) i++;
      const a = camFrames[i];
      const b = camFrames[i + 1];
      const t = smooth(clamp01((sp - a.sp) / (b.sp - a.sp)));
      return {
        pos: lerp3(a.pos, b.pos, t),
        target: lerp3(a.target, b.target, t),
      };
    }

    // Smooth camera with spring
    let camPos = camera.position.clone();
    let camTarget = new THREE.Vector3(0, 3, 0);

    let prevTime = performance.now();
    let prevZ = PATH_START_Z;

    // ── Main Loop ────────────────────────────────────────────────────────────
    const renderFrame = (ts: number) => {
      if (disposed) return;
      if (!isVisible) { animId = 0; return; }
      animId = requestAnimationFrame(renderFrame);

      const delta = Math.min((ts - prevTime) / 1000, 0.1);
      prevTime = ts;

      const sp = clamp01(scrollRef.current);

      // Truck position along path
      const targetZ = PATH_START_Z + sp * PATH_SPAN;
      truck.group.position.z += (targetZ - truck.group.position.z) * Math.min(delta * 7.5, 1);
      truck.group.position.x = Math.sin(truck.group.position.z * 0.025) * 2.2;
      truck.group.position.y = 0;

      // Slight truck yaw to follow curve
      truck.group.rotation.y = -Math.cos(truck.group.position.z * 0.025) * 0.025 * 2.2;

      // Velocity + wheel physics
      const dZ = truck.group.position.z - prevZ;
      const speedUPS = Math.abs(dZ) / Math.max(delta, 0.001);
      const wheelAngle = dZ / TIRE_R;
      for (const w of truck.wheels) w.rotation.x -= wheelAngle;
      prevZ = truck.group.position.z;

      // Suspension
      truck.animateSuspension(ts / 1000, speedUPS);

      // Front wheel steering yaw
      const steer = -Math.sin(truck.group.position.z * 0.025) * 0.07;
      truck.wheels[0].rotation.y = steer;
      truck.wheels[1].rotation.y = steer;

      // Dust
      dust.update(delta, speedUPS * 0.18, truck.group.position);

      // Sun shadow tracks truck loosely
      sun.target.position.lerp(truck.group.position, 0.05);
      sun.target.updateMatrixWorld();

      // Camera spring
      const { pos: desiredPos, target: desiredTarget } = getCameraForSP(sp);
      const lerpSpeed = reduceMotion ? 1 : Math.min(delta * 4.5, 1);
      camPos.lerp(desiredPos, lerpSpeed);
      camTarget.lerp(desiredTarget, lerpSpeed);
      camera.position.copy(camPos);
      camera.lookAt(camTarget);

      // Telemetry callback
      const kmh = Math.round(speedUPS * 3.6 * 1.4);
      const gear = kmh === 0 ? "N" : kmh > 28 ? "D3" : kmh > 14 ? "D2" : "D1";
      const elevation = Math.round(1420 - sp * 160);
      callbackRef.current?.(kmh, gear, elevation);

      renderer.render(scene, camera);
    };

    // ── Resize ───────────────────────────────────────────────────────────────
    const resize = () => {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── Pause when off-screen ────────────────────────────────────────────────
    const io = new IntersectionObserver(([e]) => {
      isVisible = e.isIntersecting;
      if (isVisible && !animId) {
        prevTime = performance.now();
        animId = requestAnimationFrame(renderFrame);
      }
    });
    io.observe(canvas);

    animId = requestAnimationFrame(renderFrame);

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      ro.disconnect();
      io.disconnect();
      pit.dispose();
      dust.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
};
