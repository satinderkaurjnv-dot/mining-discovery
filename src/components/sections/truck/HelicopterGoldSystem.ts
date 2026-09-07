import * as THREE from "three";
import { HelicopterAsset, loadHelicopterAsset } from "./HelicopterAsset";

export interface HelicopterGoldSystem {
  group: THREE.Group;
  update: (delta: number, sp: number, loaderPos: THREE.Vector3, timestamp: number) => void;
  getShineIntensity: () => number;
  dispose: () => void;
}

/**
 * Creates and manages:
 * 1. The 3D Helicopter flight across the screen from Right to Left at the end of the road (sp >= 0.93)
 * 2. Cascading golden particle sprinkle pouring from the helicopter down to the road/website
 * 3. A dynamic gold surface illumination and ground shimmer particle carpet that sparkles for some time
 */
export function createHelicopterGoldSystem(scene: THREE.Scene): HelicopterGoldSystem {
  const group = new THREE.Group();
  group.name = "HelicopterGoldSystemGroup";
  scene.add(group);

  let helicopter: HelicopterAsset | null = null;
  loadHelicopterAsset(scene, (asset) => {
    helicopter = asset;
  });

  // =========================================================================
  // 1. FALLING GOLD PARTICLES (SPRINKLING CASCADE)
  // =========================================================================
  const PARTICLE_COUNT = 240;
  const goldGeom = new THREE.DodecahedronGeometry(0.14, 1);
  const goldMat = new THREE.MeshStandardMaterial({
    color: "#FFDF00",
    emissive: "#FFA500",
    emissiveIntensity: 1.6,
    metalness: 0.95,
    roughness: 0.15,
  });

  const goldInstanced = new THREE.InstancedMesh(goldGeom, goldMat, PARTICLE_COUNT);
  goldInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(goldInstanced);

  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    pos: new THREE.Vector3(0, -100, 0),
    vel: new THREE.Vector3(0, 0, 0),
    rot: new THREE.Vector3(0, 0, 0),
    rotVel: new THREE.Vector3(0, 0, 0),
    scale: 1,
    life: 0,
    maxLife: 1,
    groundTimer: 0,
  }));

  // =========================================================================
  // 2. GROUND SHIMMER SPARKLE FIELD (SETTLED GOLD PARTICLES SHINING ON SURFACE)
  // =========================================================================
  const GROUND_COUNT = 140;
  const groundGeom = new THREE.OctahedronGeometry(0.18, 0);
  const groundMat = new THREE.MeshStandardMaterial({
    color: "#FFF099",
    emissive: "#FFB300",
    emissiveIntensity: 1.8,
    metalness: 0.92,
    roughness: 0.12,
  });

  const groundInstanced = new THREE.InstancedMesh(groundGeom, groundMat, GROUND_COUNT);
  groundInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(groundInstanced);

  const groundSparkles = Array.from({ length: GROUND_COUNT }, () => ({
    pos: new THREE.Vector3(0, -100, 0),
    baseScale: 0.6 + Math.random() * 0.8,
    phase: Math.random() * Math.PI * 2,
    intensity: 0,
    life: 0,
  }));

  // =========================================================================
  // 3. DYNAMIC GOLDEN DOWNWARD BEAM & AMBIENT SURFACE GLOW
  // =========================================================================
  const goldPointLight = new THREE.PointLight(0xFFD700, 0, 48, 1.2);
  goldPointLight.position.set(185, 12, 0);
  group.add(goldPointLight);

  const dummy = new THREE.Object3D();
  let shineIntensity = 0;

  // Active helicopter trajectory parameters
  const START_X = 226.0; // Off-screen right
  const END_X = 142.0;   // Off-screen left
  const FLIGHT_Y = 22.0;  // Elevation above road

  const update = (delta: number, sp: number, loaderPos: THREE.Vector3, timestamp: number) => {
    const time = timestamp * 0.001;

    // Flight triggers at the end of the vertical road (sp in [0.93, 1.0])
    const isFlightActive = sp >= 0.925;
    
    // Normalized flight progress across [0.93, 0.995]
    const flightT = THREE.MathUtils.clamp((sp - 0.925) / (0.995 - 0.925), 0, 1);

    if (isFlightActive && helicopter) {
      helicopter.setVisible(true);

      // Smooth flight position from right (+X) to left (-X)
      const currentX = THREE.MathUtils.lerp(START_X, END_X, flightT);
      const currentY = FLIGHT_Y + Math.sin(time * 2.8) * 0.4;
      const currentZ = loaderPos.z - 2.5;

      helicopter.setPosition(currentX, currentY, currentZ);

      // Aerodynamic pitch and bank as it flies right-to-left
      // Model default forward is -X
      const forwardPitch = -0.09 - Math.sin(time * 3.0) * 0.02;
      const aerodynamicRoll = -0.05 + Math.sin(time * 2.0) * 0.03;
      const subtleYaw = Math.sin(time * 1.5) * 0.04;

      helicopter.setRotation(aerodynamicRoll, subtleYaw, forwardPitch);
      helicopter.update(delta);

      // Update PointLight following the helicopter and illuminating ground
      goldPointLight.position.set(currentX, currentY - 6.0, currentZ);
      goldPointLight.intensity = THREE.MathUtils.lerp(goldPointLight.intensity, 4.2, delta * 4);

      // Website shine intensity ramps up
      shineIntensity = Math.min(shineIntensity + delta * 1.2, 1.0);

      // =====================================================================
      // EMIT CASCADING GOLD PARTICLES FROM HELICOPTER UNDERSIDE
      // =====================================================================
      particles.forEach((p, idx) => {
        if (p.life <= 0 && Math.random() < 0.45) {
          // Spawn just beneath helicopter belly
          p.pos.set(
            currentX + (Math.random() - 0.5) * 2.4,
            currentY - 1.2 - Math.random() * 0.8,
            currentZ + (Math.random() - 0.5) * 2.4
          );
          // Blown downwards and outwards by rotor downwash
          p.vel.set(
            (Math.random() - 0.5) * 5.2 - 1.5, // Slight bias left with helicopter motion
            -11.0 - Math.random() * 7.0,       // Fast downward rotor draft
            (Math.random() - 0.5) * 5.2
          );
          p.rot.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
          p.rotVel.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, 0);
          p.scale = 0.8 + Math.random() * 0.6;
          p.life = 1.0;
          p.maxLife = 1.8 + Math.random() * 1.2;
          p.groundTimer = 0;
        }
      });
    } else {
      if (helicopter) helicopter.setVisible(false);
      goldPointLight.intensity = THREE.MathUtils.lerp(goldPointLight.intensity, 0, delta * 2);
      shineIntensity = Math.max(shineIntensity - delta * 0.6, 0);
    }

    // =======================================================================
    // UPDATE FALLING PARTICLES & BOUNCE ONTO GROUND
    // =======================================================================
    particles.forEach((p, idx) => {
      if (p.life > 0) {
        p.life -= delta / p.maxLife;

        // Apply downward velocity & gravity
        p.vel.y -= 14.0 * delta;
        p.pos.addScaledVector(p.vel, delta);

        p.rot.addScaledVector(p.rotVel, delta);

        // Landing & scattering on the ground/website surface (y = 0.06)
        if (p.pos.y <= 0.06) {
          p.pos.y = 0.06;
          p.vel.y = -p.vel.y * 0.22; // Low bounce
          p.vel.x *= 0.7;
          p.vel.z *= 0.7;
          p.groundTimer += delta;

          // Seed a ground sparkle near impact
          const gIdx = (idx * 3) % GROUND_COUNT;
          const gs = groundSparkles[gIdx];
          if (gs.intensity <= 0.2) {
            gs.pos.copy(p.pos);
            gs.pos.y = 0.05;
            gs.intensity = 1.0;
            gs.life = 3.5 + Math.random() * 2.5; // Shines for some time!
          }
        }

        const currentScale = Math.max(p.scale * p.life, 0.001);
        dummy.position.copy(p.pos);
        dummy.rotation.set(p.rot.x, p.rot.y, p.rot.z);
        dummy.scale.set(currentScale, currentScale, currentScale);
        dummy.updateMatrix();
        goldInstanced.setMatrixAt(idx, dummy.matrix);
      } else {
        dummy.position.set(0, -100, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        goldInstanced.setMatrixAt(idx, dummy.matrix);
      }
    });
    goldInstanced.instanceMatrix.needsUpdate = true;

    // =======================================================================
    // UPDATE SETTLED GROUND SPARKLES ("WEBSITE UNDER IT WILL SHINE FOR SOMETIME")
    // =======================================================================
    groundSparkles.forEach((gs, idx) => {
      if (gs.intensity > 0.01) {
        gs.life -= delta;
        if (gs.life <= 0) {
          gs.intensity = Math.max(gs.intensity - delta * 0.8, 0);
        }

        // Shimmering twinkling pulsation
        const pulse = Math.sin(time * 7.5 + gs.phase) * 0.35 + 0.65;
        const scale = gs.baseScale * gs.intensity * pulse;

        dummy.position.copy(gs.pos);
        dummy.rotation.set(0, time * 2.0 + gs.phase, 0);
        dummy.scale.set(scale, scale * 0.4, scale);
        dummy.updateMatrix();
        groundInstanced.setMatrixAt(idx, dummy.matrix);
      } else {
        dummy.position.set(0, -100, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        groundInstanced.setMatrixAt(idx, dummy.matrix);
      }
    });
    groundInstanced.instanceMatrix.needsUpdate = true;
  };

  const getShineIntensity = () => shineIntensity;

  const dispose = () => {
    scene.remove(group);
    goldGeom.dispose();
    goldMat.dispose();
    groundGeom.dispose();
    groundMat.dispose();
    goldPointLight.dispose();
  };

  return {
    group,
    update,
    getShineIntensity,
    dispose,
  };
}
