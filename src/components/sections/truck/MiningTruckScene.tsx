"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { createMiningTruck, TruckMeshGroup } from "./MiningTruckModel";
import { createMineEnvironment } from "./MineEnvironment";
import { createGeologicalScanner } from "./GeologicalScanner";
import { TelemetryState } from "./truckTypes";

interface MiningTruckSceneProps {
  scrollProgress: number;
  onTelemetry?: (state: TelemetryState) => void;
  className?: string;
}

export const MiningTruckScene: React.FC<MiningTruckSceneProps> = ({
  scrollProgress,
  onTelemetry,
  className = "w-full h-full",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollRef = useRef(scrollProgress);
  const telemetryRef = useRef(onTelemetry);

  useEffect(() => {
    scrollRef.current = scrollProgress;
    telemetryRef.current = onTelemetry;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let animId = 0;
    let isRunning = true;

    // --- Renderer Setup -----------------------------------------------------
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearAlpha(0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();

    // Subtle atmospheric distance fog
    scene.fog = new THREE.FogExp2(0x13171f, 0.015);

    // --- Camera Setup -------------------------------------------------------
    const camera = new THREE.PerspectiveCamera(36, 1, 0.5, 300);
    camera.position.set(-18, 9, -28);

    // --- Lighting -----------------------------------------------------------
    // Soft cool ambient sky fill
    const ambientLight = new THREE.AmbientLight(0xd6e5f7, 0.65);
    scene.add(ambientLight);

    // Warm directional sun key light
    const sunLight = new THREE.DirectionalLight(0xfff3db, 2.2);
    sunLight.position.set(24, 38, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    // Secondary subtle fill
    const fillLight = new THREE.DirectionalLight(0x8cb5e2, 0.45);
    fillLight.position.set(-20, 15, -20);
    scene.add(fillLight);

    // --- Scene Objects ------------------------------------------------------
    const truck = createMiningTruck();
    scene.add(truck);

    const environment = createMineEnvironment();
    scene.add(environment.group);

    const scanner = createGeologicalScanner();
    scene.add(scanner.group);

    // --- Path Travel Trajectory Coordinates ---------------------------------
    const START_Z = -42;
    const END_Z = 48;
    const TRAVEL_SPAN = END_Z - START_Z;

    let prevZ = START_Z;
    let prevTime = performance.now();

    // Wheel rotation physics
    const TIRE_RADIUS = 1.45 * 0.72; // scaled radius

    // --- Viewport Sizing ----------------------------------------------------
    const applySize = () => {
      const w = Math.max(canvas.clientWidth, 1);
      const h = Math.max(canvas.clientHeight, 1);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    applySize();

    const resizeObserver = new ResizeObserver(applySize);
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isRunning = entry.isIntersecting;
      if (isRunning && !animId) {
        prevTime = performance.now();
        animId = requestAnimationFrame(renderFrame);
      }
    });
    intersectionObserver.observe(canvas);

    // --- Main Render & Physics Loop -----------------------------------------
    const renderFrame = (timestamp: number) => {
      if (disposed) return;
      if (!isRunning) {
        animId = 0;
        return;
      }

      animId = requestAnimationFrame(renderFrame);

      const delta = Math.min((timestamp - prevTime) / 1000, 0.1);
      prevTime = timestamp;

      const sp = THREE.MathUtils.clamp(scrollRef.current, 0, 1);

      // 1. Truck Position & Motion
      // Easing curve for cinematic acceleration & decelerations
      const targetZ = START_Z + sp * TRAVEL_SPAN;
      truck.position.z += (targetZ - truck.position.z) * Math.min(delta * 8, 1);
      truck.position.x = 0.5 + Math.sin(truck.position.z * 0.04) * 0.8;
      truck.position.y = 0.0;

      // Realistic steering angle for front wheels
      const steerAngle = Math.cos(truck.position.z * 0.04) * 0.08;
      truck.userData.wheels[0].rotation.y = steerAngle;
      truck.userData.wheels[1].rotation.y = steerAngle;

      // Dynamic wheel rotation directly coupled to travel distance (ω = Δz / r)
      const dZ = truck.position.z - prevZ;
      const wheelRotation = dZ / TIRE_RADIUS;
      for (const wheel of truck.userData.wheels) {
        wheel.rotation.x -= wheelRotation;
      }
      prevZ = truck.position.z;

      // Vehicle speed calculation
      const speedUnitsPerSec = Math.abs(dZ) / Math.max(delta, 0.001);
      const speedKmh = Math.round(speedUnitsPerSec * 3.6 * 1.8);

      // Subtle chassis suspension rumble when in motion
      if (speedUnitsPerSec > 0.1) {
        truck.position.y = Math.sin(timestamp * 0.02) * 0.04;
      }

      // 2. Geological Scanning & Discovery State
      // 0% - 30%: Transit
      // 30% - 60%: Scanning Active (LiDAR fan beams down)
      // 60% - 85%: Discovery Moment (Ore seam detected, gold pulses)
      // 85% - 100%: Payload hauling exit
      const isScanning = sp >= 0.28 && sp <= 0.82;
      const isDiscovered = sp >= 0.52 && sp <= 0.82;

      scanner.updateScan(delta, sp, truck.position, isScanning, isDiscovered);
      environment.updateDust(delta, speedUnitsPerSec, truck.position);

      // 3. Cinematic Camera Choreography
      // 0% - 25%: Front 3/4 heroic low-angle
      // 25% - 65%: Side profile tracking showing the subsurface cross-section
      // 65% - 85%: Focus on discovered mineral deposit & truck
      // 85% - 100%: Pull back into wide vista as next section reveals
      let camTargetPos = new THREE.Vector3();
      let camLookAt = new THREE.Vector3();

      if (sp < 0.25) {
        const t = sp / 0.25;
        camTargetPos.set(
          THREE.MathUtils.lerp(-18, -14, t),
          THREE.MathUtils.lerp(7, 6.5, t),
          truck.position.z + THREE.MathUtils.lerp(18, 12, t)
        );
        camLookAt.set(truck.position.x, 2.5, truck.position.z);
      } else if (sp < 0.65) {
        const t = (sp - 0.25) / 0.4;
        camTargetPos.set(
          THREE.MathUtils.lerp(-14, -20, t),
          THREE.MathUtils.lerp(6.5, 4.5, t),
          truck.position.z + THREE.MathUtils.lerp(12, 4, t)
        );
        camLookAt.set(
          THREE.MathUtils.lerp(truck.position.x, -4.0, t),
          THREE.MathUtils.lerp(2.5, -2.5, t),
          truck.position.z
        );
      } else if (sp < 0.85) {
        const t = (sp - 0.65) / 0.2;
        camTargetPos.set(
          THREE.MathUtils.lerp(-20, -18, t),
          THREE.MathUtils.lerp(4.5, 8.5, t),
          truck.position.z + THREE.MathUtils.lerp(4, -8, t)
        );
        camLookAt.set(-3.5, -3.0, truck.position.z);
      } else {
        const t = (sp - 0.85) / 0.15;
        camTargetPos.set(
          THREE.MathUtils.lerp(-18, -26, t),
          THREE.MathUtils.lerp(8.5, 16.0, t),
          truck.position.z + THREE.MathUtils.lerp(-8, -24, t)
        );
        camLookAt.set(truck.position.x, 2.0, truck.position.z);
      }

      camera.position.lerp(camTargetPos, Math.min(delta * 4, 1));
      camera.lookAt(camLookAt);

      // 4. Telemetry Reporting to UI
      const gear = speedKmh === 0 ? "N" : speedKmh > 24 ? "D3" : speedKmh > 12 ? "D2" : "D1";
      const scanDepthMeters = isScanning
        ? Math.min(Math.round(((sp - 0.28) / 0.24) * 580), 580)
        : 0;

      telemetryRef.current?.({
        progress: sp,
        speedKmh,
        gear,
        payloadTons: Math.round(320 + sp * 80),
        heading: "NORTH-WEST 314°",
        coordinates: {
          lat: "52° 21' 44\" N",
          lng: "121° 54' 18\" W",
          elevation: `${Math.round(1420 - sp * 180)}m EL`,
        },
        scanningActive: isScanning,
        discoveryActive: isDiscovered,
        scanDepthMeters,
        detectedDeposit: isDiscovered
          ? {
              mineral: "Native Gold-Quartz Seam",
              grade: "14.2 g/t Au (High-Grade)",
              width: "8.6m True Thickness",
              confidence: "99.4% Verified",
            }
          : undefined,
      });

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(renderFrame);

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      environment.dispose();
      scanner.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
};
