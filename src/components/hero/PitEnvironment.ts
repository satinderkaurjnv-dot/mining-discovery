import * as THREE from "three";

export interface PitEnvironment {
  group: THREE.Group;
  dispose: () => void;
}

const ROAD_LEN = 220;
const ROAD_W = 18;

// ─── Materials ───────────────────────────────────────────────────────────────
const roadMat = new THREE.MeshStandardMaterial({
  color: "#1C1E22",
  roughness: 0.95,
  metalness: 0.06,
});
const benchRockMat = new THREE.MeshStandardMaterial({
  color: "#181B20",
  roughness: 0.97,
  metalness: 0.04,
});
const gravel = new THREE.MeshStandardMaterial({
  color: "#2A2D33",
  roughness: 0.98,
  metalness: 0.02,
});
const mountainMat = new THREE.MeshBasicMaterial({ color: "#0E1015" });
const distantTruckMat = new THREE.MeshBasicMaterial({ color: "#1A1D22" });
const excavatorMat = new THREE.MeshBasicMaterial({ color: "#161820" });
const mineLightMat = new THREE.MeshBasicMaterial({ color: "#FFF5A8" });

function disposeAll(...targets: THREE.BufferGeometry[]) {
  targets.forEach((g) => g.dispose());
}

export function createPitEnvironment(): PitEnvironment {
  const group = new THREE.Group();
  const geoms: THREE.BufferGeometry[] = [];

  function track(g: THREE.BufferGeometry) {
    geoms.push(g);
    return g;
  }

  // ── 1. Haul Road (curved, natural undulation) ────────────────────────────
  const roadGeom = track(new THREE.PlaneGeometry(ROAD_W, ROAD_LEN, 24, 80));
  roadGeom.rotateX(-Math.PI / 2);

  // Subtle surface undulation to break up the flat plane
  const pos = roadGeom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, Math.sin(z * 0.055) * 0.22 + Math.cos(x * 0.22) * 0.14);
  }
  roadGeom.computeVertexNormals();
  group.add(new THREE.Mesh(roadGeom, roadMat));

  // Road edge gravel berms
  for (const bx of [-ROAD_W / 2 - 0.5, ROAD_W / 2 + 0.5]) {
    const bg = track(new THREE.CylinderGeometry(0.72, 0.96, ROAD_LEN, 10));
    bg.rotateX(Math.PI / 2);
    const bm = new THREE.Mesh(bg, gravel);
    bm.position.set(bx, 0.38, 0);
    group.add(bm);
  }

  // ── 2. Cave Walls — Extremely Thick Left & Right Sides ────────────────────
  // Walls must extend far beyond screen edges to look like solid cave rock
  const CAVE_WALL_W = 600;   // enormous — goes well off-screen on each side
  const CAVE_WALL_H = 130;   // very tall — above any camera angle
  const CAVE_WALL_DEPTH = ROAD_LEN * 1.4;

  // Right wall — enormous solid rock mass
  const rightWallG = track(new THREE.BoxGeometry(CAVE_WALL_W, CAVE_WALL_H, CAVE_WALL_DEPTH));
  const rightWall = new THREE.Mesh(rightWallG, benchRockMat);
  rightWall.position.set(ROAD_W / 2 + CAVE_WALL_W / 2, CAVE_WALL_H / 2 - 22, 0);
  group.add(rightWall);

  // Left wall — enormous solid rock mass
  const leftWallG = track(new THREE.BoxGeometry(CAVE_WALL_W, CAVE_WALL_H, CAVE_WALL_DEPTH));
  const leftWall = new THREE.Mesh(leftWallG, benchRockMat);
  leftWall.position.set(-(ROAD_W / 2 + CAVE_WALL_W / 2), CAVE_WALL_H / 2 - 22, 0);
  group.add(leftWall);

  // ── 2b. Cave Ceiling — thick slab pressing down close to truck ────────────
  const CEIL_THICKNESS = 80;
  const CEIL_WIDTH = ROAD_W + CAVE_WALL_W * 2 + 40;
  const ceilG = track(new THREE.BoxGeometry(CEIL_WIDTH, CEIL_THICKNESS, CAVE_WALL_DEPTH));
  const ceilMesh = new THREE.Mesh(ceilG, benchRockMat);
  // Bottom of ceiling sits at y=10 — just above cab height
  ceilMesh.position.set(0, 10 + CEIL_THICKNESS / 2, 0);
  group.add(ceilMesh);

  // ── 2b2. Arch overhang wedges — angled inward at the tunnel mouth ─────────
  const lArchG = track(new THREE.BoxGeometry(24, 38, CAVE_WALL_DEPTH));
  const lArchM = new THREE.Mesh(lArchG, benchRockMat);
  lArchM.rotation.z = 0.38;
  lArchM.position.set(-(ROAD_W / 2) - 6, 2, 0);
  group.add(lArchM);

  const rArchG = track(new THREE.BoxGeometry(24, 38, CAVE_WALL_DEPTH));
  const rArchM = new THREE.Mesh(rArchG, benchRockMat);
  rArchM.rotation.z = -0.38;
  rArchM.position.set(ROAD_W / 2 + 6, 2, 0);
  group.add(rArchM);

  // ── 2c. Inner cave face — irregular rocky surface chunks ─────────────────
  // Right wall inner face bumps
  for (let i = 0; i < 28; i++) {
    const w = 6 + Math.random() * 14;
    const h = 5 + Math.random() * 18;
    const d = 4 + Math.random() * 10;
    const g = track(new THREE.BoxGeometry(w, h, d));
    const m = new THREE.Mesh(g, benchRockMat);
    m.position.set(
      ROAD_W / 2 + 2 + Math.random() * 10,
      -2 + Math.random() * 28,
      (Math.random() - 0.5) * ROAD_LEN * 0.9
    );
    m.rotation.set(Math.random() * 0.3, Math.random() * 0.5, Math.random() * 0.3);
    group.add(m);
  }

  // Left wall inner face bumps
  for (let i = 0; i < 28; i++) {
    const w = 6 + Math.random() * 14;
    const h = 5 + Math.random() * 18;
    const d = 4 + Math.random() * 10;
    const g = track(new THREE.BoxGeometry(w, h, d));
    const m = new THREE.Mesh(g, benchRockMat);
    m.position.set(
      -(ROAD_W / 2 + 2 + Math.random() * 10),
      -2 + Math.random() * 28,
      (Math.random() - 0.5) * ROAD_LEN * 0.9
    );
    m.rotation.set(Math.random() * 0.3, Math.random() * 0.5, Math.random() * 0.3);
    group.add(m);
  }

  // ── 2d. Stalactite-like ceiling overhangs ────────────────────────────────
  for (let i = 0; i < 22; i++) {
    const dropH = 4 + Math.random() * 14;
    const dropW = 3 + Math.random() * 8;
    const sg = track(new THREE.ConeGeometry(dropW * 0.5, dropH, 5 + Math.floor(Math.random() * 3)));
    const sm = new THREE.Mesh(sg, benchRockMat);
    sm.rotation.x = Math.PI; // point downward
    sm.rotation.y = Math.random() * Math.PI;
    sm.position.set(
      (Math.random() - 0.5) * (ROAD_W * 0.8),
      CAVE_WALL_H - 14 - dropH * 0.5 - 1,
      (Math.random() - 0.5) * ROAD_LEN * 0.85
    );
    group.add(sm);
  }

  // ── 2e. Rock rubble / ground chunks along edges ──────────────────────────
  for (let i = 0; i < 36; i++) {
    const size = 1.8 + Math.random() * 4;
    const chunk = track(new THREE.BoxGeometry(size, size * 0.6, size * 0.9));
    const cm = new THREE.Mesh(chunk, benchRockMat);
    const side = Math.random() > 0.5 ? 1 : -1;
    cm.position.set(
      side * (ROAD_W / 2 + 1.5 + Math.random() * 8),
      -0.3 + Math.random() * 1.8,
      (Math.random() - 0.5) * ROAD_LEN * 0.9
    );
    cm.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.4);
    group.add(cm);
  }

  // ── 3. Haul Road Lane Markings ───────────────────────────────────────────
  for (let i = 0; i < 20; i++) {
    const markGeom = track(new THREE.PlaneGeometry(0.25, 4.5));
    markGeom.rotateX(-Math.PI / 2);
    const mark = new THREE.Mesh(
      markGeom,
      new THREE.MeshBasicMaterial({ color: "#35383D", transparent: true, opacity: 0.5 })
    );
    mark.position.set(0, 0.02, -ROAD_LEN / 2 + i * (ROAD_LEN / 20));
    group.add(mark);
  }

  // ── 4. Mountain Backdrop Silhouettes ─────────────────────────────────────
  for (let m = 0; m < 7; m++) {
    const h = 30 + Math.random() * 22;
    const mg = track(new THREE.ConeGeometry(18 + Math.random() * 14, h, 7));
    const mm = new THREE.Mesh(mg, mountainMat);
    const side = Math.random() > 0.5 ? 1 : -1;
    mm.position.set(
      side * (75 + Math.random() * 30),
      h / 2 - 4,
      (Math.random() - 0.5) * ROAD_LEN * 1.1
    );
    mm.scale.x = 1.1 + Math.random() * 0.45;
    group.add(mm);
  }

  // ── 5. Distant Silhouetted Equipment ─────────────────────────────────────
  // Rope shovel / excavator silhouette (simplified blocky shapes)
  function addExcavator(x: number, z: number) {
    const base = track(new THREE.BoxGeometry(8, 5, 7));
    const baseMesh = new THREE.Mesh(base, excavatorMat);
    baseMesh.position.set(x, 0, z);
    group.add(baseMesh);

    const boom = track(new THREE.BoxGeometry(1.2, 0.8, 14));
    const boomMesh = new THREE.Mesh(boom, excavatorMat);
    boomMesh.rotation.x = 0.65;
    boomMesh.position.set(x, 6, z - 4);
    group.add(boomMesh);

    const cab = track(new THREE.BoxGeometry(3.5, 4, 4.5));
    const cabMesh = new THREE.Mesh(cab, excavatorMat);
    cabMesh.position.set(x + 2, 4.5, z);
    group.add(cabMesh);
  }
  addExcavator(-40, -60);
  addExcavator(52, 40);

  // Distant haul trucks (silhouettes)
  function addDistantTruck(x: number, z: number) {
    const body = track(new THREE.BoxGeometry(4, 3.5, 6.5));
    const bodyMesh = new THREE.Mesh(body, distantTruckMat);
    bodyMesh.position.set(x, 2, z);
    group.add(bodyMesh);

    // Wheels (boxes, distant)
    for (const [wx, wz] of [[-2, 1.5], [2, 1.5], [-2, -1.5], [2, -1.5]]) {
      const wg = track(new THREE.BoxGeometry(1.2, 1.2, 1.4));
      const wm = new THREE.Mesh(wg, distantTruckMat);
      wm.position.set(x + wx, 0.6, z + wz);
      group.add(wm);
    }
  }
  addDistantTruck(-30, 55);
  addDistantTruck(28, -80);
  addDistantTruck(-45, 15);

  // ── 6. Mine Work-Lights on Posts ─────────────────────────────────────────
  for (let i = 0; i < 8; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const postZ = -ROAD_LEN / 2 + i * (ROAD_LEN / 8) + 12;

    // Post
    const postGeom = track(new THREE.CylinderGeometry(0.12, 0.12, 7, 8));
    const post = new THREE.Mesh(postGeom, benchRockMat);
    post.position.set(side * (ROAD_W / 2 + 1.6), 3.5, postZ);
    group.add(post);

    // Light head
    const headGeom = track(new THREE.SphereGeometry(0.28, 8, 6));
    const head = new THREE.Mesh(headGeom, mineLightMat);
    head.position.set(side * (ROAD_W / 2 + 1.6), 7.3, postZ);
    group.add(head);

    // Point light
    const pl = new THREE.PointLight(0xfff5d0, 0.55, 22, 2);
    pl.position.copy(head.position);
    group.add(pl);
  }

  // ── 7. Pit Base Floor (below camera view, gives depth) ───────────────────
  const pitFloorGeom = track(new THREE.PlaneGeometry(320, 320));
  pitFloorGeom.rotateX(-Math.PI / 2);
  const pitFloor = new THREE.Mesh(pitFloorGeom, benchRockMat);
  pitFloor.position.y = -34;
  group.add(pitFloor);

  return {
    group,
    dispose: () => disposeAll(...geoms),
  };
}
