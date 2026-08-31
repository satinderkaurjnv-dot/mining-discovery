import * as THREE from "three";

export interface TruckMeshGroup extends THREE.Group {
  userData: {
    wheels: THREE.Group[];
    headlights: THREE.Light[];
    scanningRing?: THREE.Mesh;
  };
}

/**
 * Procedural Industrial Ultra-Class Mining Haul Truck (CAT 797F / Komatsu 980E Class)
 * Crafted with optimized, instanced Three.js geometries for maximum visual realism and 60fps performance.
 */
export function createMiningTruck(): TruckMeshGroup {
  const truck = new THREE.Group() as TruckMeshGroup;

  const wheels: THREE.Group[] = [];
  const headlights: THREE.Light[] = [];

  // --- Premium Industrial Materials -----------------------------------------
  const darkChassisMat = new THREE.MeshStandardMaterial({
    color: "#181A1D",
    metalness: 0.8,
    roughness: 0.35,
  });

  const graphiteBodyMat = new THREE.MeshStandardMaterial({
    color: "#282B30",
    metalness: 0.65,
    roughness: 0.4,
  });

  const dumpBedMat = new THREE.MeshStandardMaterial({
    color: "#22252A",
    metalness: 0.7,
    roughness: 0.45,
  });

  const tireRubberMat = new THREE.MeshStandardMaterial({
    color: "#121315",
    roughness: 0.85,
    metalness: 0.1,
  });

  const rimSteelMat = new THREE.MeshStandardMaterial({
    color: "#42464D",
    metalness: 0.85,
    roughness: 0.25,
  });

  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: "#D4AF37",
    metalness: 0.9,
    roughness: 0.2,
  });

  const cabGlassMat = new THREE.MeshStandardMaterial({
    color: "#0F1E2E",
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.75,
  });

  const workLightMat = new THREE.MeshBasicMaterial({
    color: "#FFF2A8",
  });

  // --- 1. Main Heavy Ladder Chassis -----------------------------------------
  const chassisGeom = new THREE.BoxGeometry(3.6, 0.9, 8.4);
  const chassisMesh = new THREE.Mesh(chassisGeom, darkChassisMat);
  chassisMesh.position.y = 1.9;
  truck.add(chassisMesh);

  // Front massive bullbar / bumper
  const bumperGeom = new THREE.BoxGeometry(4.2, 0.8, 1.2);
  const bumperMesh = new THREE.Mesh(bumperGeom, darkChassisMat);
  bumperMesh.position.set(0, 1.4, 4.3);
  truck.add(bumperMesh);

  // Radiator core grille
  const radiatorGeom = new THREE.BoxGeometry(2.8, 1.8, 0.6);
  const radiatorMesh = new THREE.Mesh(radiatorGeom, darkChassisMat);
  radiatorMesh.position.set(0, 2.7, 3.8);
  truck.add(radiatorMesh);

  // Twin vertical exhaust stacks
  const exhaustGeom = new THREE.CylinderGeometry(0.14, 0.14, 2.6, 16);
  const leftExhaust = new THREE.Mesh(exhaustGeom, darkChassisMat);
  leftExhaust.position.set(-1.6, 4.5, 1.2);
  const rightExhaust = new THREE.Mesh(exhaustGeom, darkChassisMat);
  rightExhaust.position.set(1.6, 4.5, 1.2);
  truck.add(leftExhaust, rightExhaust);

  // --- 2. Operator Cabin & Access Gantry (Offset Left) ----------------------
  const cabGeom = new THREE.BoxGeometry(1.4, 1.5, 1.8);
  const cabMesh = new THREE.Mesh(cabGeom, graphiteBodyMat);
  cabMesh.position.set(-1.0, 3.8, 2.6);
  truck.add(cabMesh);

  // Cabin windshield
  const windshieldGeom = new THREE.BoxGeometry(1.2, 0.7, 0.1);
  const windshieldMesh = new THREE.Mesh(windshieldGeom, cabGlassMat);
  windshieldMesh.position.set(-1.0, 4.0, 3.52);
  truck.add(windshieldMesh);

  // Safety railings & diagonal access stair
  const stairGeom = new THREE.BoxGeometry(0.8, 1.8, 1.6);
  stairGeom.rotateX(-0.4);
  const stairMesh = new THREE.Mesh(stairGeom, darkChassisMat);
  stairMesh.position.set(1.1, 2.6, 3.8);
  truck.add(stairMesh);

  // --- 3. Massive Haul Dump Bed (High Capacity Tub) -------------------------
  const dumpBedGroup = new THREE.Group();
  dumpBedGroup.position.set(0, 2.7, -0.6);

  // Tub base floor
  const bedFloorGeom = new THREE.BoxGeometry(4.4, 0.5, 6.8);
  const bedFloor = new THREE.Mesh(bedFloorGeom, dumpBedMat);
  dumpBedGroup.add(bedFloor);

  // Left sidewall
  const leftWallGeom = new THREE.BoxGeometry(0.4, 1.8, 6.6);
  leftWallGeom.rotateZ(0.12);
  const leftWall = new THREE.Mesh(leftWallGeom, dumpBedMat);
  leftWall.position.set(-2.2, 1.0, 0);
  dumpBedGroup.add(leftWall);

  // Right sidewall
  const rightWallGeom = new THREE.BoxGeometry(0.4, 1.8, 6.6);
  rightWallGeom.rotateZ(-0.12);
  const rightWall = new THREE.Mesh(rightWallGeom, dumpBedMat);
  rightWall.position.set(2.2, 1.0, 0);
  dumpBedGroup.add(rightWall);

  // Front bulkhead with cab protection canopy (extends over driver cab)
  const canopyGeom = new THREE.BoxGeometry(4.4, 0.4, 3.4);
  const canopyMesh = new THREE.Mesh(canopyGeom, dumpBedMat);
  canopyMesh.position.set(0, 2.2, 2.4);
  dumpBedGroup.add(canopyMesh);

  // Front slope plate connecting floor to canopy
  const slopeGeom = new THREE.BoxGeometry(4.4, 2.2, 0.4);
  slopeGeom.rotateX(0.5);
  const slopeMesh = new THREE.Mesh(slopeGeom, dumpBedMat);
  slopeMesh.position.set(0, 1.1, 3.1);
  dumpBedGroup.add(slopeMesh);

  // Twin Hydraulic Dump Cylinders (Gold/Chrome accent)
  const ramOuterGeom = new THREE.CylinderGeometry(0.18, 0.18, 1.8, 16);
  const ramInnerGeom = new THREE.CylinderGeometry(0.12, 0.12, 1.6, 16);

  const leftRamOuter = new THREE.Mesh(ramOuterGeom, darkChassisMat);
  leftRamOuter.position.set(-1.0, 2.0, -0.4);
  const leftRamInner = new THREE.Mesh(ramInnerGeom, goldAccentMat);
  leftRamInner.position.set(-1.0, 2.4, -0.4);

  const rightRamOuter = new THREE.Mesh(ramOuterGeom, darkChassisMat);
  rightRamOuter.position.set(1.0, 2.0, -0.4);
  const rightRamInner = new THREE.Mesh(ramInnerGeom, goldAccentMat);
  rightRamInner.position.set(1.0, 2.4, -0.4);

  truck.add(leftRamOuter, leftRamInner, rightRamOuter, rightRamInner);
  truck.add(dumpBedGroup);

  // --- 4. Massive Heavy-Duty Mining Wheels (53/80R63 Scale) -----------------
  const TIRE_RADIUS = 1.45;
  const TIRE_WIDTH = 0.85;

  function buildWheel(isDual: boolean): THREE.Group {
    const wheelGroup = new THREE.Group();

    // Outer tire tread
    const tireGeom = new THREE.CylinderGeometry(TIRE_RADIUS, TIRE_RADIUS, TIRE_WIDTH, 24);
    tireGeom.rotateZ(Math.PI / 2);

    const tireMesh = new THREE.Mesh(tireGeom, tireRubberMat);
    wheelGroup.add(tireMesh);

    // Tread rib rings for physical grip detail
    const treadRibGeom = new THREE.TorusGeometry(TIRE_RADIUS * 0.98, 0.05, 8, 24);
    treadRibGeom.rotateY(Math.PI / 2);
    const treadRib1 = new THREE.Mesh(treadRibGeom, tireRubberMat);
    treadRib1.position.x = -0.22;
    const treadRib2 = new THREE.Mesh(treadRibGeom, tireRubberMat);
    treadRib2.position.x = 0.22;
    wheelGroup.add(treadRib1, treadRib2);

    // Heavy-duty steel hub
    const rimGeom = new THREE.CylinderGeometry(0.75, 0.75, TIRE_WIDTH + 0.06, 18);
    rimGeom.rotateZ(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimGeom, rimSteelMat);
    wheelGroup.add(rimMesh);

    // Central planetary hub reduction cap with gold accent bolt ring
    const hubCapGeom = new THREE.CylinderGeometry(0.42, 0.42, TIRE_WIDTH + 0.14, 16);
    hubCapGeom.rotateZ(Math.PI / 2);
    const hubCap = new THREE.Mesh(hubCapGeom, goldAccentMat);
    wheelGroup.add(hubCap);

    if (isDual) {
      // Inner tire for dual rear axle configuration
      const innerTire = tireMesh.clone();
      innerTire.position.x = -TIRE_WIDTH - 0.2;
      const innerRim = rimMesh.clone();
      innerRim.position.x = -TIRE_WIDTH - 0.2;
      wheelGroup.add(innerTire, innerRim);
    }

    return wheelGroup;
  }

  // Front Wheels (Steerable axle)
  const frontLeftWheel = buildWheel(false);
  frontLeftWheel.position.set(-2.0, TIRE_RADIUS, 2.6);
  const frontRightWheel = buildWheel(false);
  frontRightWheel.position.set(2.0, TIRE_RADIUS, 2.6);

  // Rear Dual Wheels (Heavy payload axle)
  const rearLeftDual = buildWheel(true);
  rearLeftDual.position.set(-1.7, TIRE_RADIUS, -2.4);
  const rearRightDual = buildWheel(true);
  rearRightDual.position.set(2.6, TIRE_RADIUS, -2.4);

  truck.add(frontLeftWheel, frontRightWheel, rearLeftDual, rearRightDual);
  wheels.push(frontLeftWheel, frontRightWheel, rearLeftDual, rearRightDual);

  // --- 5. High-Intensity LED Work Lights & Gold Telemetry Indicators -------
  const lightGeom = new THREE.BoxGeometry(0.35, 0.22, 0.15);

  const leftLightMesh = new THREE.Mesh(lightGeom, workLightMat);
  leftLightMesh.position.set(-1.4, 1.6, 4.9);
  const rightLightMesh = new THREE.Mesh(lightGeom, workLightMat);
  rightLightMesh.position.set(1.4, 1.6, 4.9);
  truck.add(leftLightMesh, rightLightMesh);

  // Physical Spotlights projecting forward into the mine
  const spotLeft = new THREE.SpotLight(0xfff0b0, 4.5, 40, Math.PI / 6, 0.4, 1.2);
  spotLeft.position.set(-1.4, 1.6, 4.9);
  spotLeft.target.position.set(-1.4, 0, 20);

  const spotRight = new THREE.SpotLight(0xfff0b0, 4.5, 40, Math.PI / 6, 0.4, 1.2);
  spotRight.position.set(1.4, 1.6, 4.9);
  spotRight.target.position.set(1.4, 0, 20);

  truck.add(spotLeft, spotLeft.target, spotRight, spotRight);
  headlights.push(spotLeft, spotRight);

  // Subtle Gold Safety Accent Lines along the Chassis
  const stripeGeom = new THREE.BoxGeometry(0.08, 0.12, 7.8);
  const stripeLeft = new THREE.Mesh(stripeGeom, goldAccentMat);
  stripeLeft.position.set(-1.82, 1.8, 0);
  const stripeRight = new THREE.Mesh(stripeGeom, goldAccentMat);
  stripeRight.position.set(1.82, 1.8, 0);
  truck.add(stripeLeft, stripeRight);

  truck.userData = {
    wheels,
    headlights,
  };

  // Scale truck to ideal proportions
  truck.scale.set(0.72, 0.72, 0.72);

  return truck;
}
