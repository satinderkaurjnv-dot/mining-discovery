import * as THREE from "three";

export function createOreParticleSystem(): {
  group: THREE.Group;
  updateOreTrail: (delta: number, dumpBedPos: THREE.Vector3, isFalling: boolean) => void;
  updateAircraftDust: (delta: number, aircraftPos: THREE.Vector3, isReleasing: boolean) => void;
  updateLoaderGoldSparkles: (delta: number, loaderPos: THREE.Vector3, tangent: THREE.Vector3, isMoving: boolean) => void;
  dispose: () => void;
} {
  const group = new THREE.Group();

  // 1. Physical Gold Ore Fall Trail (Cave Exit)
  const ORE_COUNT = 80;
  const oreGeom = new THREE.DodecahedronGeometry(0.18, 1);
  const oreMatGold = new THREE.MeshStandardMaterial({
    color: "#F5BA13",
    emissive: "#D48806",
    emissiveIntensity: 0.6,
    metalness: 0.9,
    roughness: 0.2,
  });

  const oreInstanced = new THREE.InstancedMesh(oreGeom, oreMatGold, ORE_COUNT);
  oreInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(oreInstanced);

  const particleData = Array.from({ length: ORE_COUNT }, () => ({
    pos: new THREE.Vector3(0, -100, 0),
    vel: new THREE.Vector3(0, 0, 0),
    rot: new THREE.Vector3(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      0
    ),
    rotVel: new THREE.Vector3(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 6,
      0
    ),
    life: 0,
  }));

  const dummy = new THREE.Object3D();

  const updateOreTrail = (
    delta: number,
    dumpBedPos: THREE.Vector3,
    isFalling: boolean
  ) => {
    particleData.forEach((p, idx) => {
      if (p.life <= 0 && isFalling && Math.random() < 0.35) {
        p.pos.set(
          dumpBedPos.x + (Math.random() - 0.5) * 2.2,
          dumpBedPos.y + 0.4,
          dumpBedPos.z - 3.8 + (Math.random() - 0.5) * 1.2
        );
        p.vel.set(
          (Math.random() - 0.5) * 1.8,
          Math.random() * 0.8 + 0.2,
          -Math.random() * 2.4 - 1.2
        );
        p.life = 1.0;
      }

      if (p.life > 0) {
        p.life -= delta * 0.8;
        p.vel.y -= 9.8 * delta; // Gravity acceleration

        p.pos.x += p.vel.x * delta;
        p.pos.y += p.vel.y * delta;
        p.pos.z += p.vel.z * delta;

        // Ground Bed Collision & Bounce
        if (p.pos.y <= 0.12) {
          p.pos.y = 0.12;
          p.vel.y = -p.vel.y * 0.35; // Restitution bounce
          p.vel.x *= 0.6;
          p.vel.z *= 0.6;
        }

        p.rot.x += p.rotVel.x * delta;
        p.rot.y += p.rotVel.y * delta;

        const scale = Math.max(p.life, 0.001);
        dummy.position.copy(p.pos);
        dummy.rotation.set(p.rot.x, p.rot.y, 0);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        oreInstanced.setMatrixAt(idx, dummy.matrix);
      } else {
        dummy.position.set(0, -100, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        oreInstanced.setMatrixAt(idx, dummy.matrix);
      }
    });

    oreInstanced.instanceMatrix.needsUpdate = true;
  };

  // 2. Aircraft Gold Dust Stream
  const DUST_COUNT = 120;
  const dustGeom = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(DUST_COUNT * 3);
  const dustSizes = new Float32Array(DUST_COUNT);

  for (let i = 0; i < DUST_COUNT; i++) {
    dustPositions[i * 3 + 1] = -100;
    dustSizes[i] = Math.random() * 0.4 + 0.15;
  }

  dustGeom.setAttribute(
    "position",
    new THREE.BufferAttribute(dustPositions, 3)
  );
  dustGeom.setAttribute("size", new THREE.BufferAttribute(dustSizes, 1));

  const dustMat = new THREE.PointsMaterial({
    color: "#F5BA13",
    size: 0.4,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
  });

  const dustPoints = new THREE.Points(dustGeom, dustMat);
  group.add(dustPoints);

  const dustData = Array.from({ length: DUST_COUNT }, () => ({
    pos: new THREE.Vector3(0, -100, 0),
    vel: new THREE.Vector3(0, 0, 0),
    life: 0,
  }));

  const updateAircraftDust = (
    delta: number,
    aircraftPos: THREE.Vector3,
    isReleasing: boolean
  ) => {
    const posAttr = dustGeom.attributes.position as THREE.BufferAttribute;

    dustData.forEach((p, idx) => {
      if (p.life <= 0 && isReleasing && Math.random() < 0.4) {
        p.pos.set(
          aircraftPos.x + (Math.random() - 0.5) * 1.5,
          aircraftPos.y - 0.6,
          aircraftPos.z - 6.5
        );
        p.vel.set(
          (Math.random() - 0.5) * 2.0,
          -Math.random() * 1.2 - 0.4,
          -Math.random() * 4.0 - 2.0
        );
        p.life = 1.0;
      }

      if (p.life > 0) {
        p.life -= delta * 0.5;
        p.pos.x += p.vel.x * delta;
        p.pos.y += p.vel.y * delta;
        p.pos.z += p.vel.z * delta;

        posAttr.setXYZ(idx, p.pos.x, p.pos.y, p.pos.z);
      } else {
        posAttr.setXYZ(idx, 0, -100, 0);
      }
    });

    posAttr.needsUpdate = true;
  };

  // 3. Loader Glowing Gold Sparkle Sprinkle System
  const SPARKLE_COUNT = 150;
  const sparkleGeom = new THREE.BufferGeometry();
  const sparklePositions = new Float32Array(SPARKLE_COUNT * 3);

  for (let i = 0; i < SPARKLE_COUNT; i++) {
    sparklePositions[i * 3 + 1] = -100;
  }

  sparkleGeom.setAttribute("position", new THREE.BufferAttribute(sparklePositions, 3));

  const sparkleMat = new THREE.PointsMaterial({
    color: "#FFD700",
    size: 0.85,
    transparent: true,
    opacity: 0.90,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const sparklePoints = new THREE.Points(sparkleGeom, sparkleMat);
  group.add(sparklePoints);

  const sparkleData = Array.from({ length: SPARKLE_COUNT }, () => ({
    pos: new THREE.Vector3(0, -100, 0),
    vel: new THREE.Vector3(0, 0, 0),
    life: 0,
  }));

  const updateLoaderGoldSparkles = (
    delta: number,
    loaderPos: THREE.Vector3,
    tangent: THREE.Vector3,
    isMoving: boolean
  ) => {
    const posAttr = sparkleGeom.attributes.position as THREE.BufferAttribute;

    sparkleData.forEach((p, idx) => {
      if (p.life <= 0 && isMoving && Math.random() < 0.45) {
        // Spawn from loader scoop bucket & chassis
        const lateralSpread = (Math.random() - 0.5) * 3.5;
        p.pos.set(
          loaderPos.x + lateralSpread,
          loaderPos.y + 0.3 + Math.random() * 0.8,
          loaderPos.z + (Math.random() - 0.5) * 2.0
        );
        // Sprinkle backwards against motion vector with gentle upward pop
        p.vel.set(
          (Math.random() - 0.5) * 1.5 - tangent.x * 2.5,
          Math.random() * 1.5 + 0.4,
          (Math.random() - 0.5) * 1.5 - tangent.z * 2.5
        );
        p.life = 1.0;
      }

      if (p.life > 0) {
        p.life -= delta * 0.9;
        p.vel.y -= 4.0 * delta; // gentle gravity

        p.pos.x += p.vel.x * delta;
        p.pos.y = Math.max(0.05, p.pos.y + p.vel.y * delta);
        p.pos.z += p.vel.z * delta;

        posAttr.setXYZ(idx, p.pos.x, p.pos.y, p.pos.z);
      } else {
        posAttr.setXYZ(idx, 0, -100, 0);
      }
    });

    posAttr.needsUpdate = true;
  };

  const dispose = () => {
    oreGeom.dispose();
    oreMatGold.dispose();
    dustGeom.dispose();
    dustMat.dispose();
    sparkleGeom.dispose();
    sparkleMat.dispose();
  };

  return { group, updateOreTrail, updateAircraftDust, updateLoaderGoldSparkles, dispose };
}
