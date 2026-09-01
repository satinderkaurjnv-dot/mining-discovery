import * as THREE from "three";

export interface HaulTruck {
  group: THREE.Group;
  wheels: THREE.Group[];
  headlightSpots: THREE.SpotLight[];
  cabBeacon: THREE.PointLight;
  animateSuspension: (time: number, speed: number) => void;
}

// ─── Shared Materials ────────────────────────────────────────────────────────

const MAT = {
  chassisDark: new THREE.MeshStandardMaterial({
    color: "#1A1C1F",
    metalness: 0.82,
    roughness: 0.38,
    envMapIntensity: 0.6,
  }),
  bodyGraphite: new THREE.MeshStandardMaterial({
    color: "#252A30",
    metalness: 0.7,
    roughness: 0.42,
  }),
  dumpBed: new THREE.MeshStandardMaterial({
    color: "#1E2228",
    metalness: 0.72,
    roughness: 0.48,
  }),
  tireRubber: new THREE.MeshStandardMaterial({
    color: "#0E1012",
    roughness: 0.88,
    metalness: 0.08,
  }),
  rimSteel: new THREE.MeshStandardMaterial({
    color: "#3C4148",
    metalness: 0.88,
    roughness: 0.22,
  }),
  goldAccent: new THREE.MeshStandardMaterial({
    color: "#C9A227",
    metalness: 0.9,
    roughness: 0.18,
    emissive: "#6B520B",
    emissiveIntensity: 0.25,
  }),
  glass: new THREE.MeshStandardMaterial({
    color: "#0A1828",
    metalness: 0.9,
    roughness: 0.08,
    transparent: true,
    opacity: 0.72,
  }),
  ledLight: new THREE.MeshBasicMaterial({ color: "#FFF0B0" }),
  warningAmber: new THREE.MeshBasicMaterial({ color: "#FF8C00" }),
};

// ─── Wheel Builder ────────────────────────────────────────────────────────────

const TIRE_R = 1.55;
const TIRE_W = 0.92;

function buildWheel(dual: boolean): THREE.Group {
  const g = new THREE.Group();

  function tire(offsetX = 0) {
    const t = new THREE.Group();
    t.position.x = offsetX;

    // Main tyre body
    const tireGeom = new THREE.CylinderGeometry(TIRE_R, TIRE_R, TIRE_W, 28);
    tireGeom.rotateZ(Math.PI / 2);
    t.add(new THREE.Mesh(tireGeom, MAT.tireRubber));

    // Shoulder ribs × 3
    for (let i = -1; i <= 1; i++) {
      const ribGeom = new THREE.TorusGeometry(TIRE_R * 0.975, 0.058, 7, 28);
      ribGeom.rotateY(Math.PI / 2);
      const rib = new THREE.Mesh(ribGeom, MAT.tireRubber);
      rib.position.x = (i * TIRE_W) / 3.2;
      t.add(rib);
    }

    // Lugs (8 blocks per tyre)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const lug = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.14, TIRE_W * 0.7),
        MAT.tireRubber
      );
      lug.rotation.x = angle;
      lug.position.set(offsetX, Math.cos(angle) * TIRE_R * 0.99, Math.sin(angle) * TIRE_R * 0.99);
      g.add(lug);
    }

    // Planetary hub + rim
    const rimGeom = new THREE.CylinderGeometry(0.8, 0.8, TIRE_W + 0.06, 20);
    rimGeom.rotateZ(Math.PI / 2);
    t.add(new THREE.Mesh(rimGeom, MAT.rimSteel));

    const hubGeom = new THREE.CylinderGeometry(0.44, 0.44, TIRE_W + 0.18, 18);
    hubGeom.rotateZ(Math.PI / 2);
    t.add(new THREE.Mesh(hubGeom, MAT.goldAccent));

    // Hub bolts
    for (let b = 0; b < 10; b++) {
      const angle = (b / 10) * Math.PI * 2;
      const bolt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, TIRE_W + 0.22, 6),
        MAT.rimSteel
      );
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(0, Math.cos(angle) * 0.62, Math.sin(angle) * 0.62);
      t.add(bolt);
    }

    return t;
  }

  g.add(tire(0));
  if (dual) g.add(tire(-TIRE_W - 0.15));
  return g;
}

// ─── Main Truck Builder ───────────────────────────────────────────────────────

export function createHaulTruck(): HaulTruck {
  const group = new THREE.Group();
  const wheels: THREE.Group[] = [];
  const headlightSpots: THREE.SpotLight[] = [];

  // ── 1. Main Chassis Frame ──────────────────────────────────────────────────
  const chassis = new THREE.Group();
  group.add(chassis);

  // Primary ladder frame rails
  for (const sx of [-1.0, 1.0]) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.52, 9.2),
      MAT.chassisDark
    );
    rail.position.set(sx * 1.42, 2.2, 0);
    chassis.add(rail);
  }

  // Cross-members
  for (let cz = -3.8; cz <= 3.8; cz += 1.9) {
    const xmem = new THREE.Mesh(
      new THREE.BoxGeometry(2.88, 0.28, 0.22),
      MAT.chassisDark
    );
    xmem.position.set(0, 2.14, cz);
    chassis.add(xmem);
  }

  // Front box (engine / rad bay)
  const frontBox = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 2.4, 2.6),
    MAT.chassisDark
  );
  frontBox.position.set(0, 2.8, 4.0);
  chassis.add(frontBox);

  // Radiator grille insert
  const grille = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.6, 0.2),
    MAT.bodyGraphite
  );
  grille.position.set(0, 2.8, 5.32);
  chassis.add(grille);

  // Grille horizontal slats
  for (let gs = -3; gs <= 3; gs++) {
    const slat = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.06, 0.06),
      MAT.rimSteel
    );
    slat.position.set(0, 2.8 + gs * 0.22, 5.44);
    chassis.add(slat);
  }

  // Front bumper / push bar
  const bumper = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.52, 0.42),
    MAT.chassisDark
  );
  bumper.position.set(0, 1.62, 5.2);
  chassis.add(bumper);

  // Dual exhaust stacks
  for (const sx of [-1.2, 1.2]) {
    const stack = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 3.2, 12),
      MAT.chassisDark
    );
    stack.position.set(sx, 4.9, 2.4);
    chassis.add(stack);

    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.12, 0.22, 12),
      MAT.rimSteel
    );
    cap.position.set(sx, 6.55, 2.4);
    chassis.add(cap);
  }

  // ── 2. Operator Cabin (offset left) ──────────────────────────────────────
  const cabin = new THREE.Group();
  cabin.position.set(-1.05, 4.1, 3.0);
  chassis.add(cabin);

  // Main cab shell
  const cabShell = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.75, 2.0), MAT.bodyGraphite);
  cabShell.position.set(0, 0, 0);
  cabin.add(cabShell);

  // Windshield
  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 0.82, 0.08),
    MAT.glass
  );
  windshield.position.set(0, 0.2, 1.05);
  cabin.add(windshield);

  // Side window
  const sideWin = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.6, 0.9),
    MAT.glass
  );
  sideWin.position.set(-0.78, 0.18, 0.3);
  cabin.add(sideWin);

  // Roof beacon / amber strobe
  const beaconGeom = new THREE.SphereGeometry(0.14, 12, 8);
  const beacon = new THREE.Mesh(beaconGeom, MAT.warningAmber);
  beacon.position.set(0, 1.06, 0);
  cabin.add(beacon);

  // Access ladder (simplified)
  for (let r = 0; r < 5; r++) {
    const rung = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.06, 0.08),
      MAT.rimSteel
    );
    rung.position.set(0.9, -0.6 + r * 0.32, 0.7);
    cabin.add(rung);
  }

  // Safety rail
  const rail = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.06, 1.2),
    MAT.goldAccent
  );
  rail.position.set(0.78, 0.92, 0.3);
  cabin.add(rail);

  // ── 3. Dump Bed ──────────────────────────────────────────────────────────
  const bed = new THREE.Group();
  bed.position.set(0, 3.0, -0.5);
  group.add(bed);

  // Floor plate
  const bedFloor = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.42, 7.4), MAT.dumpBed);
  bedFloor.position.set(0, 0, 0);
  bed.add(bedFloor);

  // Left wall
  const lwGeom = new THREE.BoxGeometry(0.32, 1.9, 7.2);
  lwGeom.rotateZ(-0.09);
  const lw = new THREE.Mesh(lwGeom, MAT.dumpBed);
  lw.position.set(-2.3, 1.05, 0);
  bed.add(lw);

  // Right wall
  const rwGeom = new THREE.BoxGeometry(0.32, 1.9, 7.2);
  rwGeom.rotateZ(0.09);
  const rw = new THREE.Mesh(rwGeom, MAT.dumpBed);
  rw.position.set(2.3, 1.05, 0);
  bed.add(rw);

  // Front bulkhead / cab guard canopy
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 0.32, 3.2),
    MAT.dumpBed
  );
  canopy.position.set(0, 2.4, 2.6);
  bed.add(canopy);

  // Front slope
  const slopeGeom = new THREE.BoxGeometry(4.6, 2.6, 0.32);
  slopeGeom.rotateX(0.52);
  const slope = new THREE.Mesh(slopeGeom, MAT.dumpBed);
  slope.position.set(0, 1.3, 3.4);
  bed.add(slope);

  // Gold accent stripe along bed top rails
  for (const sx of [-2.32, 2.32]) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.1, 7.0),
      MAT.goldAccent
    );
    stripe.position.set(sx, 1.98, 0);
    bed.add(stripe);
  }

  // Hydraulic rams (twin)
  for (const sx of [-0.9, 0.9]) {
    const outer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 2.2, 14),
      MAT.chassisDark
    );
    outer.position.set(sx, 2.2, -0.4);
    group.add(outer);

    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 1.9, 14),
      MAT.goldAccent
    );
    inner.position.set(sx, 2.7, -0.4);
    group.add(inner);
  }

  // ── 4. Wheels ─────────────────────────────────────────────────────────────
  const WHEEL_Y = TIRE_R;

  const wheelPositions: [number, number, boolean][] = [
    // [x, z, isDual]
    [-2.1, 3.0, false],  // front-left (steer)
    [2.1, 3.0, false],   // front-right (steer)
    [-1.85, -2.2, true], // rear-left dual
    [2.6, -2.2, true],   // rear-right dual
  ];

  for (const [wx, wz, dual] of wheelPositions) {
    const w = buildWheel(dual);
    w.position.set(wx, WHEEL_Y, wz);
    group.add(w);
    wheels.push(w);
  }

  // ── 5. LED Work Lights ─────────────────────────────────────────────────────
  const lightPositions: [number, number][] = [[-1.3, 5.35], [1.3, 5.35]];

  for (const [lx, lz] of lightPositions) {
    // Light housing
    const housing = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.24, 0.18),
      MAT.chassisDark
    );
    housing.position.set(lx, 1.8, lz);
    chassis.add(housing);

    // LED element
    const led = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.16, 0.05),
      MAT.ledLight
    );
    led.position.set(lx, 1.8, lz + 0.1);
    chassis.add(led);

    // Spotlight
    const spot = new THREE.SpotLight(0xfff2c0, 6.0, 55, Math.PI / 7, 0.35, 1.4);
    spot.position.set(lx, 1.8, lz);
    spot.target.position.set(lx * 0.5, -1.5, lz + 28);
    group.add(spot, spot.target);
    headlightSpots.push(spot);
  }

  // Gold safety side-marker strips on chassis
  for (const sx of [-1.62, 1.62]) {
    const sideStripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.12, 8.6),
      MAT.goldAccent
    );
    sideStripe.position.set(sx, 2.16, 0);
    chassis.add(sideStripe);
  }

  // ── 6. Beacon Point Light ─────────────────────────────────────────────────
  const cabBeacon = new THREE.PointLight(0xff8800, 0.8, 8, 2);
  cabBeacon.position.set(-1.05, 6.8, 3.0);
  group.add(cabBeacon);

  // ── Suspension Animation ──────────────────────────────────────────────────
  const animateSuspension = (time: number, speed: number) => {
    if (speed < 0.05) return;
    const amplitude = Math.min(speed * 0.045, 0.06);
    const bob = Math.sin(time * 18) * amplitude;
    chassis.position.y = bob;
    bed.position.y = 3.0 + bob * 0.6;
    cabBeacon.position.y = 6.8 + bob;
    cabBeacon.intensity = 0.6 + Math.abs(Math.sin(time * 4)) * 0.6;
  };

  // Scale to scene
  group.scale.setScalar(0.68);

  return { group, wheels, headlightSpots, cabBeacon, animateSuspension };
}
