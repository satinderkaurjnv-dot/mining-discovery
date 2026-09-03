import * as THREE from "three";

export interface MineEnvironmentSystem {
  group: THREE.Group;
  updateDust: (delta: number, intensity: number, truckPos: THREE.Vector3) => void;
  dispose: () => void;
}

/**
 * Pure Road Environment Architecture
 * - Solid black ground road lane strip (height = 16, width = 42) at y = 0 (#07080A)
 * - Zero procedural cave blocks (cave.glb loaded via CaveAssetManager)
 */
export function createMineEnvironment(): MineEnvironmentSystem {
  const group = new THREE.Group();

  // =========================================================================
  // 1. SLEEK COMPACT SOLID BLACK ROAD SURFACE & BASE (height = 16, width = 42)
  // =========================================================================
  const solidBlackBaseMat = new THREE.MeshStandardMaterial({
    color: "#07080A", // Solid deep black road & base
    roughness: 0.95,
    metalness: 0.05,
  });

  const solidBlackBase = new THREE.Mesh(
    new THREE.BoxGeometry(600, 16, 42),
    solidBlackBaseMat
  );
  solidBlackBase.position.set(0, -8, 0); // Top surface sits precisely at y = 0
  solidBlackBase.receiveShadow = false;
  group.add(solidBlackBase);

  const updateDust = () => {};

  const dispose = () => {
    solidBlackBaseMat.dispose();
  };

  return { group, updateDust, dispose };
}
