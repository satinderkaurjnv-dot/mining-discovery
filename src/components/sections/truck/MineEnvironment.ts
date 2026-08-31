import * as THREE from "three";

export interface MineEnvironmentResult {
  group: THREE.Group;
  updateDust: (delta: number, truckSpeed: number, truckPos: THREE.Vector3) => void;
  dispose: () => void;
}

/**
 * Creates the cinematic open-pit mine benches, haul road, rock berms, and active dust physics.
 */
export function createMineEnvironment(): MineEnvironmentResult {
  const group = new THREE.Group();

  // --- Terrain & Road Materials ---------------------------------------------
  const roadMat = new THREE.MeshStandardMaterial({
    color: "#24272D",
    roughness: 0.92,
    metalness: 0.08,
  });

  const benchRockMat = new THREE.MeshStandardMaterial({
    color: "#1A1D23",
    roughness: 0.95,
    metalness: 0.05,
  });

  const bermMat = new THREE.MeshStandardMaterial({
    color: "#2D313A",
    roughness: 0.9,
    metalness: 0.1,
  });

  // --- 1. Main Bench Haul Road (Runs along Z axis) ---------------------------
  const roadWidth = 14;
  const roadLength = 160;
  const roadGeom = new THREE.PlaneGeometry(roadWidth, roadLength, 32, 64);
  roadGeom.rotateX(-Math.PI / 2);

  // Subtle natural elevation undulation
  const posAttr = roadGeom.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const wave = Math.sin(z * 0.08) * 0.18 + Math.cos(x * 0.3) * 0.12;
    posAttr.setY(i, wave);
  }
  roadGeom.computeVertexNormals();

  const roadMesh = new THREE.Mesh(roadGeom, roadMat);
  roadMesh.receiveShadow = true;
  group.add(roadMesh);

  // --- 2. Safety Berms (Rock ridges lining the haul road edge) --------------
  const bermLength = 150;
  const bermGeom = new THREE.CylinderGeometry(0.65, 0.9, bermLength, 12);
  bermGeom.rotateX(Math.PI / 2);

  const leftBerm = new THREE.Mesh(bermGeom, bermMat);
  leftBerm.position.set(-roadWidth / 2 - 0.4, 0.4, 0);
  leftBerm.receiveShadow = true;

  const rightBerm = new THREE.Mesh(bermGeom, bermMat);
  rightBerm.position.set(roadWidth / 2 + 0.4, 0.4, 0);
  rightBerm.receiveShadow = true;

  group.add(leftBerm, rightBerm);

  // --- 3. Stepped Open-Pit Terraces (Benches) --------------------------------
  // Upper bench on the right side
  const upperBenchGeom = new THREE.BoxGeometry(32, 6.0, roadLength);
  const upperBench = new THREE.Mesh(upperBenchGeom, benchRockMat);
  upperBench.position.set(roadWidth / 2 + 16, 3.0, 0);
  upperBench.receiveShadow = true;
  group.add(upperBench);

  // Lower pit wall on the left side
  const lowerPitGeom = new THREE.BoxGeometry(36, 12.0, roadLength);
  const lowerPit = new THREE.Mesh(lowerPitGeom, benchRockMat);
  lowerPit.position.set(-roadWidth / 2 - 18, -6.0, 0);
  lowerPit.receiveShadow = true;
  group.add(lowerPit);

  // Distant Geological Mountain Backdrop Silhouette
  const mountainGeom = new THREE.ConeGeometry(42, 28, 8);
  const mountainMat = new THREE.MeshBasicMaterial({ color: "#11141A" });
  for (let m = 0; m < 5; m++) {
    const mountain = new THREE.Mesh(mountainGeom, mountainMat);
    const mZ = (m - 2) * 35;
    mountain.position.set(55 + Math.random() * 15, 8, mZ);
    mountain.scale.set(1 + Math.random() * 0.5, 0.8 + Math.random() * 0.4, 1);
    group.add(mountain);
  }

  // --- 4. Interactive Physical Dust Particle System -------------------------
  const DUST_COUNT = 90;
  const dustPositions = new Float32Array(DUST_COUNT * 3);
  const dustVelocities = new Float32Array(DUST_COUNT * 3);
  const dustLifetimes = new Float32Array(DUST_COUNT);

  for (let i = 0; i < DUST_COUNT; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 4;
    dustPositions[i * 3 + 1] = Math.random() * 1.5;
    dustPositions[i * 3 + 2] = -1000; // start hidden
    dustVelocities[i * 3] = (Math.random() - 0.5) * 1.2;
    dustVelocities[i * 3 + 1] = 0.4 + Math.random() * 0.8;
    dustVelocities[i * 3 + 2] = -0.5 - Math.random() * 1.5;
    dustLifetimes[i] = 0;
  }

  const dustGeom = new THREE.BufferGeometry();
  dustGeom.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));

  const dustMat = new THREE.PointsMaterial({
    color: "#B4B0A4",
    size: 0.42,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const dustPoints = new THREE.Points(dustGeom, dustMat);
  group.add(dustPoints);

  let dustSpawnIdx = 0;

  const updateDust = (delta: number, truckSpeed: number, truckPos: THREE.Vector3) => {
    const pos = dustGeom.attributes.position.array as Float32Array;

    // Spawn dust motes when truck is in motion
    if (Math.abs(truckSpeed) > 0.05) {
      const spawnsPerFrame = Math.min(Math.floor(Math.abs(truckSpeed) * 12), 4);
      for (let s = 0; s < spawnsPerFrame; s++) {
        const i = dustSpawnIdx;
        // Behind rear wheels
        pos[i * 3] = truckPos.x + (Math.random() - 0.5) * 2.8;
        pos[i * 3 + 1] = truckPos.y + 0.3 + Math.random() * 0.4;
        pos[i * 3 + 2] = truckPos.z - 2.8 + (Math.random() - 0.5) * 0.8;

        dustLifetimes[i] = 1.0; // full life
        dustVelocities[i * 3] = (Math.random() - 0.5) * 0.8;
        dustVelocities[i * 3 + 1] = 0.3 + Math.random() * 0.6;
        dustVelocities[i * 3 + 2] = -Math.sign(truckSpeed) * (0.8 + Math.random() * 1.4);

        dustSpawnIdx = (dustSpawnIdx + 1) % DUST_COUNT;
      }
    }

    // Advance existing particles
    for (let i = 0; i < DUST_COUNT; i++) {
      if (dustLifetimes[i] > 0) {
        dustLifetimes[i] -= delta * 0.9;

        pos[i * 3] += dustVelocities[i * 3] * delta;
        pos[i * 3 + 1] += dustVelocities[i * 3 + 1] * delta;
        pos[i * 3 + 2] += dustVelocities[i * 3 + 2] * delta;

        if (dustLifetimes[i] <= 0) {
          pos[i * 3 + 2] = -1000; // hide
        }
      }
    }

    dustGeom.attributes.position.needsUpdate = true;
  };

  const dispose = () => {
    roadGeom.dispose();
    roadMat.dispose();
    bermGeom.dispose();
    bermMat.dispose();
    upperBenchGeom.dispose();
    lowerPitGeom.dispose();
    benchRockMat.dispose();
    mountainGeom.dispose();
    mountainMat.dispose();
    dustGeom.dispose();
    dustMat.dispose();
  };

  return {
    group,
    updateDust,
    dispose,
  };
}
