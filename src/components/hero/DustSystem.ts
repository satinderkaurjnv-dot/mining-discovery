import * as THREE from "three";

const DUST_COUNT_DESKTOP = 140;
const DUST_COUNT_MOBILE = 45;

export interface DustSystem {
  points: THREE.Points;
  update: (delta: number, speed: number, truckPos: THREE.Vector3) => void;
  dispose: () => void;
}

export function createDustSystem(mobile = false): DustSystem {
  const N = mobile ? DUST_COUNT_MOBILE : DUST_COUNT_DESKTOP;

  const positions = new Float32Array(N * 3);
  const velocities = new Float32Array(N * 3);
  const lifetimes = new Float32Array(N);
  const maxLifetimes = new Float32Array(N);

  // Park all particles far below scene initially
  for (let i = 0; i < N; i++) {
    positions[i * 3 + 1] = -9999;
    lifetimes[i] = 0;
    maxLifetimes[i] = 1.8 + Math.random() * 1.6;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: "#C8C2B4",
    size: mobile ? 0.38 : 0.55,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    blending: THREE.NormalBlending,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geom, mat);
  let spawnCursor = 0;

  const update = (delta: number, speed: number, truckPos: THREE.Vector3) => {
    const pos = geom.attributes.position.array as Float32Array;
    const movingFast = speed > 0.12;

    // Spawn new dust motes from rear-wheel positions when truck is moving
    if (movingFast) {
      const spawnsThisFrame = Math.min(Math.ceil(speed * 8 * delta * 60), mobile ? 3 : 7);
      for (let s = 0; s < spawnsThisFrame; s++) {
        const i = spawnCursor % N;
        // Rear axle region — both sides
        const side = Math.random() > 0.5 ? -1 : 1;
        pos[i * 3] = truckPos.x + side * (0.8 + Math.random() * 1.2);
        pos[i * 3 + 1] = truckPos.y + 0.25 + Math.random() * 0.45;
        pos[i * 3 + 2] = truckPos.z - 1.8 + (Math.random() - 0.5) * 0.9;

        velocities[i * 3] = (Math.random() - 0.5) * 0.65;
        velocities[i * 3 + 1] = 0.35 + Math.random() * 0.7;
        velocities[i * 3 + 2] = -(0.6 + Math.random() * 1.2); // drift backward

        lifetimes[i] = maxLifetimes[i];
        spawnCursor++;
      }
    }

    // Advance all alive particles
    for (let i = 0; i < N; i++) {
      if (lifetimes[i] <= 0) continue;
      lifetimes[i] -= delta;

      pos[i * 3] += velocities[i * 3] * delta;
      pos[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      pos[i * 3 + 2] += velocities[i * 3 + 2] * delta;

      // Gravity-ish slow down & settle
      velocities[i * 3 + 1] *= 1 - delta * 0.55;

      // Wind drift (mild X-axis)
      velocities[i * 3] += (0.05 + Math.random() * 0.04) * delta;

      if (lifetimes[i] <= 0) {
        pos[i * 3 + 1] = -9999; // hide
      }
    }

    // Fade opacity based on average lifetime remaining (rough global fade)
    const alive = lifetimes.filter((l) => l > 0).length;
    mat.opacity = Math.min(0.34, 0.05 + (alive / N) * 0.32);

    geom.attributes.position.needsUpdate = true;
  };

  const dispose = () => {
    geom.dispose();
    mat.dispose();
  };

  return { points, update, dispose };
}
