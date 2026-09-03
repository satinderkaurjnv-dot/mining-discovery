import * as THREE from "three";

export interface TruckMeshGroup extends THREE.Group {
  userData: {
    wheels: THREE.Group[];
    headlights: THREE.Light[];
    loader: THREE.Group;
    haulTruck: THREE.Group;
    aircraft: THREE.Group;
    rotors: THREE.Group[];
    boomGroup: THREE.Group;
    bucketGroup: THREE.Group;
    goldOreGroup: THREE.Group;
    frontChassis: THREE.Group;
    dumpBed: THREE.Group;
  };
}

/**
 * Photorealistic 3D Heavy Industrial Mining System
 * Features a 3D CAT 797F-class Heavy Haul Truck with 360° rotational capability,
 * an LHD Mining Loader, and an Industrial Cargo Aircraft.
 */
export function createMiningTruck(): TruckMeshGroup {
  const root = new THREE.Group() as TruckMeshGroup;

  const wheels: THREE.Group[] = [];
  const rotors: THREE.Group[] = [];
  const headlights: THREE.Light[] = [];

  // =========================================================================
  // AUTHENTIC INDUSTRIAL PBR MATERIALS
  // =========================================================================
  const catEnamelMat = new THREE.MeshStandardMaterial({
    color: "#C4841D", // Authentic CAT Industrial Ochre Yellow
    roughness: 0.38,
    metalness: 0.16,
  });

  const castSteelMat = new THREE.MeshStandardMaterial({
    color: "#1B1E24", // Heavy cast manganese frame steel
    roughness: 0.65,
    metalness: 0.85,
  });

  const polishedChromeMat = new THREE.MeshStandardMaterial({
    color: "#E2E8F0", // Precision ground hydraulic rams
    roughness: 0.04,
    metalness: 0.98,
  });

  const tireRubberMat = new THREE.MeshStandardMaterial({
    color: "#131518", // Vulcanized L-5 mining rubber
    roughness: 0.94,
    metalness: 0.04,
  });

  const hubSteelMat = new THREE.MeshStandardMaterial({
    color: "#282D36",
    roughness: 0.5,
    metalness: 0.7,
  });

  const cabGlassMat = new THREE.MeshStandardMaterial({
    color: "#0B1320",
    roughness: 0.08,
    metalness: 0.92,
    transparent: true,
    opacity: 0.84,
  });

  const quartzRockMat = new THREE.MeshStandardMaterial({
    color: "#423D35", // Dark mineralized quartz host rock
    roughness: 0.92,
    metalness: 0.08,
    flatShading: true,
  });

  const crystallineGoldMat = new THREE.MeshStandardMaterial({
    color: "#F5BA13", // 24K Native gold mineral inclusions
    emissive: "#D48806",
    emissiveIntensity: 0.65,
    metalness: 0.95,
    roughness: 0.16,
  });

  const aircraftMetalMat = new THREE.MeshStandardMaterial({
    color: "#2A303C", // Weathered titanium aircraft skin
    roughness: 0.35,
    metalness: 0.82,
  });

  const stripeYellowMat = new THREE.MeshStandardMaterial({
    color: "#D97706",
    roughness: 0.4,
    metalness: 0.2,
  });

  // Helper for 3D mining tire creation with tread lugs
  function createTire(radius: number, width: number, lugCount = 14) {
    const wGroup = new THREE.Group();
    const tireBaseGeom = new THREE.CylinderGeometry(radius, radius, width, 24);
    tireBaseGeom.rotateZ(Math.PI / 2);
    const tireBase = new THREE.Mesh(tireBaseGeom, tireRubberMat);
    tireBase.castShadow = true;
    wGroup.add(tireBase);

    for (let i = 0; i < lugCount; i++) {
      const angle = (i / lugCount) * Math.PI * 2;
      const lugGeom = new THREE.BoxGeometry(width - 0.04, 0.07, 0.14);
      const lug = new THREE.Mesh(lugGeom, tireRubberMat);
      lug.position.set(0, Math.cos(angle) * (radius + 0.02), Math.sin(angle) * (radius + 0.02));
      lug.rotation.x = -angle;
      wGroup.add(lug);
    }

    const hubGeom = new THREE.CylinderGeometry(radius * 0.45, radius * 0.45, width + 0.06, 16);
    hubGeom.rotateZ(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeom, hubSteelMat);
    wGroup.add(hub);

    return wGroup;
  }

  // =========================================================================
  // 1. HEAVY RIGID HAUL TRUCK (CAT 797F CLASS - 360° 3D MODEL)
  // =========================================================================
  const haulTruck = new THREE.Group();
  root.add(haulTruck);

  // Chassis Frame
  const chassisGeom = new THREE.BoxGeometry(2.4, 1.1, 5.2);
  const chassis = new THREE.Mesh(chassisGeom, castSteelMat);
  chassis.position.set(0, 1.1, 0);
  chassis.castShadow = true;
  haulTruck.add(chassis);

  // Front Radiator & Bumper
  const bumperGeom = new THREE.BoxGeometry(2.6, 0.6, 0.6);
  const bumper = new THREE.Mesh(bumperGeom, castSteelMat);
  bumper.position.set(0, 0.7, 2.7);
  haulTruck.add(bumper);

  // High-mounted Operator Cabin (Left Offset)
  const cabGroup = new THREE.Group();
  cabGroup.position.set(-0.75, 2.2, 1.8);
  haulTruck.add(cabGroup);

  const cabBody = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.1, 1.2), catEnamelMat);
  cabGroup.add(cabBody);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.55, 0.04), cabGlassMat);
  windshield.position.set(0, 0.15, 0.61);
  cabGroup.add(windshield);

  // Heavy Dump Bed (Carrying Ore)
  const dumpBed = new THREE.Group();
  dumpBed.position.set(0, 1.7, -0.6);
  haulTruck.add(dumpBed);

  const bedFloor = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 4.4), castSteelMat);
  bedFloor.position.set(0, 0, 0);
  const bedWallL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.4, 4.4), catEnamelMat);
  bedWallL.position.set(-1.3, 0.7, 0);
  const bedWallR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.4, 4.4), catEnamelMat);
  bedWallR.position.set(1.3, 0.7, 0);
  const bedFront = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 0.2), catEnamelMat);
  bedFront.position.set(0, 0.9, 2.1);
  dumpBed.add(bedFloor, bedWallL, bedWallR, bedFront);

  // Chrome Hydraulic Dump Hoist Rams
  const hoistRamL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 12), polishedChromeMat);
  hoistRamL.position.set(-0.8, 1.3, 0.4);
  const hoistRamR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 12), polishedChromeMat);
  hoistRamR.position.set(0.8, 1.3, 0.4);
  haulTruck.add(hoistRamL, hoistRamR);

  // Raw Gold-Bearing Quartz Boulders in Dump Bed
  const goldOreGroup = new THREE.Group();
  goldOreGroup.position.set(0, 0.4, 0);
  dumpBed.add(goldOreGroup);

  for (let i = 0; i < 22; i++) {
    const rockGeom = new THREE.DodecahedronGeometry(0.26 + (i % 5) * 0.07, 1);
    const pos = rockGeom.attributes.position;
    for (let v = 0; v < pos.count; v++) {
      pos.setXYZ(
        v,
        pos.getX(v) * (0.85 + Math.sin(v * 3) * 0.18),
        pos.getY(v) * (0.85 + Math.cos(v * 4) * 0.18),
        pos.getZ(v) * (0.85 + Math.sin(v * 5) * 0.18)
      );
    }
    rockGeom.computeVertexNormals();

    const isGoldVein = i % 2 === 0;
    const rockMesh = new THREE.Mesh(rockGeom, isGoldVein ? crystallineGoldMat : quartzRockMat);
    rockMesh.position.set(
      (Math.sin(i * 1.5) * 0.9),
      Math.abs(Math.cos(i * 1.9)) * 0.4,
      (Math.cos(i * 1.2) * 1.6)
    );
    rockMesh.rotation.set(i * 0.3, i * 0.5, i * 0.7);
    rockMesh.castShadow = true;
    goldOreGroup.add(rockMesh);
  }

  // 6 Mining Wheels (Front single pair, Rear tandem pairs)
  const W_R = 0.78;
  const W_W = 0.64;

  const wFL = createTire(W_R, W_W);
  wFL.position.set(-1.45, W_R, 1.8);
  const wFR = createTire(W_R, W_W);
  wFR.position.set(1.45, W_R, 1.8);

  const wRL1 = createTire(W_R, W_W);
  wRL1.position.set(-1.45, W_R, -1.0);
  const wRR1 = createTire(W_R, W_W);
  wRR1.position.set(1.45, W_R, -1.0);

  const wRL2 = createTire(W_R, W_W);
  wRL2.position.set(-1.45, W_R, -2.4);
  const wRR2 = createTire(W_R, W_W);
  wRR2.position.set(1.45, W_R, -2.4);

  haulTruck.add(wFL, wFR, wRL1, wRR1, wRL2, wRR2);
  wheels.push(wFL, wFR, wRL1, wRR1, wRL2, wRR2);

  // Industrial Headlights
  const headSpotL = new THREE.SpotLight(0xfff8e8, 4.5, 45, Math.PI / 4.2, 0.3, 1.2);
  headSpotL.position.set(-0.9, 0.8, 2.8);
  headSpotL.target.position.set(-0.9, 0, 20);
  const headSpotR = new THREE.SpotLight(0xfff8e8, 4.5, 45, Math.PI / 4.2, 0.3, 1.2);
  headSpotR.position.set(0.9, 0.8, 2.8);
  headSpotR.target.position.set(0.9, 0, 20);

  haulTruck.add(headSpotL, headSpotL.target, headSpotR, headSpotR.target);
  headlights.push(headSpotL, headSpotR);

  // =========================================================================
  // 2. UNDERGROUND LHD LOADER (EXTRACTION MACHINERY)
  // =========================================================================
  const loader = new THREE.Group();
  loader.position.set(0, 0, -40); // Stationed at deep extraction reef
  root.add(loader);

  const loaderBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.95, 3.2), catEnamelMat);
  loaderBody.position.set(0, 0.9, 0);
  loader.add(loaderBody);

  const boomGroup = new THREE.Group();
  boomGroup.position.set(0, 0.8, 1.2);
  loader.add(boomGroup);

  const boomArmL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 3.0), catEnamelMat);
  boomArmL.position.set(-0.9, 0, 1.5);
  const boomArmR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 3.0), catEnamelMat);
  boomArmR.position.set(0.9, 0, 1.5);
  boomGroup.add(boomArmL, boomArmR);

  const bucketGroup = new THREE.Group();
  bucketGroup.position.set(0, 0, 3.0);
  boomGroup.add(bucketGroup);

  const bucketMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 1.4), castSteelMat);
  bucketMesh.position.set(0, 0.45, 0.7);
  bucketGroup.add(bucketMesh);

  const frontChassis = new THREE.Group();
  loader.add(frontChassis);

  // =========================================================================
  // 3. HEAVY INDUSTRIAL CARGO TRANSPORT AIRCRAFT
  // =========================================================================
  const aircraft = new THREE.Group();
  aircraft.position.set(0, 32, 0);
  root.add(aircraft);

  // Fuselage Body
  const fuseGeom = new THREE.CylinderGeometry(1.6, 1.9, 9.5, 16);
  fuseGeom.rotateX(Math.PI / 2);
  const fuselage = new THREE.Mesh(fuseGeom, aircraftMetalMat);
  fuselage.castShadow = true;
  aircraft.add(fuselage);

  // Cockpit Nose Cone & Stripe
  const noseGeom = new THREE.ConeGeometry(1.6, 2.2, 16);
  noseGeom.rotateX(-Math.PI / 2);
  const nose = new THREE.Mesh(noseGeom, stripeYellowMat);
  nose.position.set(0, 0, 5.85);
  aircraft.add(nose);

  // Main Wings
  const wingGeom = new THREE.BoxGeometry(16.0, 0.22, 2.4);
  const wings = new THREE.Mesh(wingGeom, aircraftMetalMat);
  wings.position.set(0, 0.6, 0.5);
  aircraft.add(wings);

  // Twin Turboprop Engines & Propellers
  for (let side of [-4.2, 4.2]) {
    const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2.6, 12), castSteelMat);
    nacelle.rotateX(Math.PI / 2);
    nacelle.position.set(side, 0.3, 1.2);
    aircraft.add(nacelle);

    const propGroup = new THREE.Group();
    propGroup.position.set(side, 0.3, 2.55);

    const propBladeGeom = new THREE.BoxGeometry(0.18, 0.04, 2.6);
    const propBlade = new THREE.Mesh(propBladeGeom, castSteelMat);
    propGroup.add(propBlade);

    aircraft.add(propGroup);
    rotors.push(propGroup);
  }

  // Tail Vertical Stabilizer
  const tailGeom = new THREE.BoxGeometry(0.2, 2.4, 1.8);
  const tail = new THREE.Mesh(tailGeom, stripeYellowMat);
  tail.position.set(0, 1.8, -4.2);
  tail.rotation.x = -0.3;
  aircraft.add(tail);

  // Underside Mineral Dispenser Bay
  const dispenser = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 2.0), castSteelMat);
  dispenser.position.set(0, -1.1, -0.5);
  aircraft.add(dispenser);

  root.userData = {
    wheels,
    rotors,
    headlights,
    loader,
    haulTruck,
    aircraft,
    boomGroup,
    bucketGroup,
    goldOreGroup,
    frontChassis,
    dumpBed,
  };

  return root;
}


