import * as THREE from "three";

export interface GeologicalScannerResult {
  group: THREE.Group;
  updateScan: (
    delta: number,
    progress: number,
    truckPos: THREE.Vector3,
    isScanning: boolean,
    isDiscovered: boolean
  ) => void;
  dispose: () => void;
}

/**
 * 3D Subsurface Geological Strata, Scanning LiDAR beam, and Gold Discovery Pulse.
 */
export function createGeologicalScanner(): GeologicalScannerResult {
  const group = new THREE.Group();

  // --- Materials ------------------------------------------------------------
  const scanLaserMat = new THREE.MeshBasicMaterial({
    color: "#FFDF78",
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const scanBeamLineMat = new THREE.LineBasicMaterial({
    color: "#FFEAA7",
    transparent: true,
    opacity: 0.0,
    linewidth: 2,
  });

  const strataSurfaceMat = new THREE.MeshStandardMaterial({
    color: "#28303B",
    roughness: 0.9,
    transparent: true,
    opacity: 0.85,
  });

  const strataBedrockMat = new THREE.MeshStandardMaterial({
    color: "#1E2530",
    roughness: 0.95,
    transparent: true,
    opacity: 0.85,
  });

  const strataOreMat = new THREE.MeshStandardMaterial({
    color: "#161D27",
    roughness: 0.85,
    transparent: true,
    opacity: 0.85,
  });

  const goldVeinMat = new THREE.MeshStandardMaterial({
    color: "#D4AF37",
    emissive: "#855800",
    emissiveIntensity: 0.2,
    metalness: 0.9,
    roughness: 0.2,
    transparent: true,
    opacity: 0.95,
  });

  const goldPulseRingMat = new THREE.MeshBasicMaterial({
    color: "#FFDF78",
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // --- 1. Subsurface Cross-Section Strata Box -------------------------------
  // Sits along the road cut wall (-X side) so the camera can see into the earth
  const strataWidth = 1.2;
  const strataLength = 80;

  // Layer 1: Surface Alluvium (0 to -2.0m)
  const l1Geom = new THREE.BoxGeometry(strataWidth, 2.0, strataLength);
  const l1Mesh = new THREE.Mesh(l1Geom, strataSurfaceMat);
  l1Mesh.position.set(-8.5, -1.0, 0);

  // Layer 2: Host Andesite Bedrock (-2.0m to -5.5m)
  const l2Geom = new THREE.BoxGeometry(strataWidth, 3.5, strataLength);
  const l2Mesh = new THREE.Mesh(l2Geom, strataBedrockMat);
  l2Mesh.position.set(-8.5, -3.75, 0);

  // Layer 3: Brecciated Sulfide Ore Body (-5.5m to -9.0m)
  const l3Geom = new THREE.BoxGeometry(strataWidth, 3.5, strataLength);
  const l3Mesh = new THREE.Mesh(l3Geom, strataOreMat);
  l3Mesh.position.set(-8.5, -7.25, 0);

  // Layer 4: Bonanza Gold Vein Seam (-9.0m to -12.0m)
  const l4Geom = new THREE.BoxGeometry(strataWidth * 1.05, 3.0, strataLength * 0.4);
  const l4Mesh = new THREE.Mesh(l4Geom, goldVeinMat);
  l4Mesh.position.set(-8.5, -10.5, 5.0); // centered near discovery trigger zone

  group.add(l1Mesh, l2Mesh, l3Mesh, l4Mesh);

  // --- 2. LiDAR Scanning Beam Fan / Sheet -----------------------------------
  // A projected fan of light stretching from the truck down into the strata
  const scanFanGeom = new THREE.ConeGeometry(7.0, 11.0, 16, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
  scanFanGeom.rotateX(Math.PI);
  const scanFanMesh = new THREE.Mesh(scanFanGeom, scanLaserMat);
  scanFanMesh.position.set(-3.0, 0.5, 0);
  group.add(scanFanMesh);

  // Ground scanning grid line
  const scanLineGeom = new THREE.BufferGeometry();
  const scanLinePts = new Float32Array([-12, 0, 0, 4, 0, 0]);
  scanLineGeom.setAttribute("position", new THREE.BufferAttribute(scanLinePts, 3));
  const scanLineMesh = new THREE.Line(scanLineGeom, scanBeamLineMat);
  group.add(scanLineMesh);

  // --- 3. Discovery Expanding Pulse Rings -----------------------------------
  const pulseGeom = new THREE.RingGeometry(0.5, 0.85, 32);
  pulseGeom.rotateX(-Math.PI / 2);

  const pulseRing1 = new THREE.Mesh(pulseGeom, goldPulseRingMat);
  pulseRing1.position.set(-8.5, -10.5, 5.0);
  const pulseRing2 = new THREE.Mesh(pulseGeom, goldPulseRingMat.clone());
  pulseRing2.position.set(-8.5, -10.5, 5.0);
  group.add(pulseRing1, pulseRing2);

  let pulseTimer = 0;

  // --- Dynamic Update Hook --------------------------------------------------
  const updateScan = (
    delta: number,
    progress: number,
    truckPos: THREE.Vector3,
    isScanning: boolean,
    isDiscovered: boolean
  ) => {
    // 1. Position scan beam at the truck
    scanFanMesh.position.set(truckPos.x, truckPos.y + 1.2, truckPos.z);
    scanLineMesh.position.set(truckPos.x, 0.05, truckPos.z);

    // 2. Animate LiDAR fan rotation / sweep
    if (isScanning) {
      scanLaserMat.opacity = THREE.MathUtils.lerp(scanLaserMat.opacity, 0.45, delta * 5);
      scanBeamLineMat.opacity = THREE.MathUtils.lerp(scanBeamLineMat.opacity, 0.9, delta * 5);
      scanFanMesh.rotation.z = Math.sin(Date.now() * 0.006) * 0.15;
    } else {
      scanLaserMat.opacity = THREE.MathUtils.lerp(scanLaserMat.opacity, 0.0, delta * 6);
      scanBeamLineMat.opacity = THREE.MathUtils.lerp(scanBeamLineMat.opacity, 0.0, delta * 6);
    }

    // 3. Discovery Gold Seam Luminescence & Expanding Rings
    if (isDiscovered) {
      goldVeinMat.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.008) * 0.35;
      pulseTimer += delta * 1.8;

      const p1 = (pulseTimer % 1.0);
      pulseRing1.scale.set(1 + p1 * 5, 1 + p1 * 5, 1);
      (pulseRing1.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - p1) * 0.7);

      const p2 = ((pulseTimer + 0.5) % 1.0);
      pulseRing2.scale.set(1 + p2 * 5, 1 + p2 * 5, 1);
      (pulseRing2.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - p2) * 0.7);
    } else {
      goldVeinMat.emissiveIntensity = THREE.MathUtils.lerp(goldVeinMat.emissiveIntensity, 0.1, delta * 4);
      (pulseRing1.material as THREE.MeshBasicMaterial).opacity = 0;
      (pulseRing2.material as THREE.MeshBasicMaterial).opacity = 0;
    }
  };

  const dispose = () => {
    l1Geom.dispose();
    l2Geom.dispose();
    l3Geom.dispose();
    l4Geom.dispose();
    strataSurfaceMat.dispose();
    strataBedrockMat.dispose();
    strataOreMat.dispose();
    goldVeinMat.dispose();
    scanLaserMat.dispose();
    scanBeamLineMat.dispose();
    scanFanGeom.dispose();
    scanLineGeom.dispose();
    pulseGeom.dispose();
    goldPulseRingMat.dispose();
  };

  return {
    group,
    updateScan,
    dispose,
  };
}
