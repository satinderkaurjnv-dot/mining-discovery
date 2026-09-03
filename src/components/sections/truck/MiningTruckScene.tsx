"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MiningTruckAssetManager } from "./MiningTruckAsset";
import { CaveAssetManager } from "./CaveAsset";
import { loadMiningLoaderAsset } from "./LoaderAsset";
import { TruckPath } from "./animation/TruckPath";
import { CameraDirector } from "./animation/CameraDirector";
import { MiningTimeline } from "./animation/MiningTimeline";
import { createMineEnvironment } from "./MineEnvironment";
import { createOreParticleSystem } from "./OreParticles";
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

  const [missingAssets, setMissingAssets] = useState<string[]>([]);
  const [isAssetCheckComplete, setIsAssetCheckComplete] = useState(false);

  useEffect(() => {
    scrollRef.current = scrollProgress;
    telemetryRef.current = onTelemetry;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isRunning = true;
    let animId = 0;

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // --- WebGL Renderer Setup ------------------------------------------------
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // --- Scene & Camera Setup ------------------------------------------------
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      42,
      canvas.clientWidth / canvas.clientHeight || 1,
      0.1,
      1000
    );

    // --- Lighting Rig Setup --------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFFAED, 2.2);
    sunLight.position.set(40, 60, 30);
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0x444444, 0.6);
    scene.add(hemiLight);

    // --- Instantiate Mine Environment & Ore Particle Systems ----------------
    const mineEnv = createMineEnvironment();
    scene.add(mineEnv.group);

    const oreParticles = createOreParticleSystem();
    scene.add(oreParticles.group);

    // --- Instantiate Path & Camera Director Engines --------------------------
    const truckPath = new TruckPath();
    const cameraDirector = new CameraDirector();

    // --- Instantiate GLTF Asset Managers -------------------------------------
    const truckManager = new MiningTruckAssetManager();
    scene.add(truckManager.getGroup());

    const caveManager = new CaveAssetManager();
    scene.add(caveManager.getGroup());

    let loaderGroup: THREE.Group | null = null;
    let updateLoaderWheelRotation: ((distance: number) => void) | null = null;
    loadMiningLoaderAsset(
      scene,
      (group, updateWheels) => {
        loaderGroup = group;
        loaderGroup.visible = false;
        updateLoaderWheelRotation = updateWheels ?? null;
      },
      () => {
        missingList.push("public/assets/mining/loader.glb");
        setMissingAssets([...missingList]);
      }
    );

    const missingList: string[] = [];

    truckManager.load(
      scene,
      () => {},
      () => {
        missingList.push("public/assets/mining/mining-truck.glb");
        setMissingAssets([...missingList]);
      }
    );

    caveManager.load(
      scene,
      () => {},
      () => {
        missingList.push("public/assets/mining/cave.glb");
        setMissingAssets([...missingList]);
      }
    );

    setTimeout(() => {
      setIsAssetCheckComplete(true);
    }, 1000);

    const handleResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    let prevTime = performance.now();
    let prevPosition = new THREE.Vector3();
    const bucketScoopPos = new THREE.Vector3();

    // =======================================================================
    // RENDER LOOP — VEHICLE SWAP AT CAVE EXIT (sp = 0.45) & TOP-DOWN CAMERA LERP (sp >= 0.65)
    // =======================================================================
    const renderFrame = (timestamp: number) => {
      if (!isRunning) {
        animId = 0;
        return;
      }

      animId = requestAnimationFrame(renderFrame);

      const delta = Math.min((timestamp - prevTime) / 1000, 0.1);
      prevTime = timestamp;

      const sp = THREE.MathUtils.clamp(scrollRef.current, 0, 1);

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      scene.background = null;

      // 1. Vehicle Trajectory Transformation & Post-Cave Exit Swap synchronized with Camera Angle Change (sp = 0.85)
      const pathTransform = truckPath.getTransform(sp);
      const truckGroup = truckManager.getGroup();

      if (sp < 0.70) {
        // Inside cave & open road approach: Haul Truck active throughout cave transit
        truckGroup.visible = true;
        caveManager.getGroup().visible = true;
        if (loaderGroup) loaderGroup.visible = false;

        truckGroup.position.copy(pathTransform.position);
        truckGroup.quaternion.copy(pathTransform.orientation);

        const moveDist = pathTransform.position.distanceTo(prevPosition);
        prevPosition.copy(pathTransform.position);
        truckManager.updateWheelRotation(moveDist);
      } else {
        // Post-Cave Exit Road & Turn (sp >= 0.70): Wheel Loader on 100% clean pristine road
        truckGroup.visible = false;
        caveManager.getGroup().visible = false; // Hide cave meshes completely for clean road
        if (loaderGroup) {
          loaderGroup.visible = true;
          loaderGroup.position.copy(pathTransform.position);
          
          // Continuous, smooth steering: front bowl faces right along straight road and steers smoothly through turn
          const yaw = Math.atan2(pathTransform.tangent.z, pathTransform.tangent.x);
          loaderGroup.rotation.set(0, Math.PI - yaw, 0);

          const moveDist = pathTransform.position.distanceTo(prevPosition);
          prevPosition.copy(pathTransform.position);
          updateLoaderWheelRotation?.(moveDist);
        }
      }

      // Sprinkle glowing gold ore particles directly from loader bucket scoop
      if (sp >= 0.70) {
        bucketScoopPos.copy(pathTransform.position)
          .add(pathTransform.tangent.clone().multiplyScalar(3.0))
          .add(new THREE.Vector3(0, 0.55, 0));
        oreParticles.updateOreTrail(delta, bucketScoopPos, true);
      } else {
        oreParticles.updateOreTrail(delta, pathTransform.position, false);
      }

      // 2. Camera Director Update - rock-solid vertical road alignment matching Pic 2
      if (sp >= 0.84) {
        camera.position.set(185.0, 38.0, pathTransform.position.z);
        camera.up.set(0, 0, -1);
        camera.lookAt(185.0, 0.0, pathTransform.position.z);
        camera.fov = 34;
        camera.updateProjectionMatrix();
      } else {
        const dummyVec = new THREE.Vector3();
        const activeMouseX = sp >= 0.70 ? 0 : mouseX;
        const activeMouseY = sp >= 0.70 ? 0 : mouseY;
        const camFrame = cameraDirector.getFrame(sp, pathTransform.position, dummyVec, activeMouseX, activeMouseY);
        
        const lerpSpeed = Math.min(delta * 6, 1);
        camera.position.lerp(camFrame.position, lerpSpeed);
        camera.up.copy(camFrame.up || new THREE.Vector3(0, 1, 0));
        camera.lookAt(camFrame.lookAt);
        camera.fov = THREE.MathUtils.lerp(camera.fov, camFrame.fov, lerpSpeed);
        camera.updateProjectionMatrix();
      }

      // 3. Timeline Phase Sync & Telemetry
      const phase = MiningTimeline.getPhase(sp);

      telemetryRef.current?.({
        progress: sp,
        speedKmh: phase.speedKmh,
        gear: phase.gear,
        payloadTons: Math.round(320 + sp * 80),
        heading: "NORTH-WEST 314°",
        coordinates: {
          lat: "52° 21' 44\" N",
          lng: "121° 54' 18\" W",
          elevation: `${Math.round(1420 - sp * 180)}m EL`,
        },
        scanningActive: phase.isScanning,
        discoveryActive: phase.isDiscovered,
        scanDepthMeters: phase.isScanning ? 580 : 0,
        detectedDeposit: phase.isDiscovered
          ? {
              mineral: "Native Gold-Quartz Seam",
              grade: "42.8 g/t Au (High-Grade)",
              width: "18.5m True Thickness",
              confidence: "99.4% Verified",
            }
          : undefined,
      });

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(renderFrame);

    return () => {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      mineEnv.dispose();
      oreParticles.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full block" />

      {/* Asset Check Banner */}
      {isAssetCheckComplete && missingAssets.length > 0 && (
        <div className="absolute top-4 left-4 z-50 rounded-lg bg-amber-500/90 px-3 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-sm">
          <span>Demo Mode: Synthetic assets active</span>
        </div>
      )}
    </div>
  );
};
