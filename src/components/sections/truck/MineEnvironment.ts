import * as THREE from "three";

export interface MineEnvironmentSystem {
  group: THREE.Group;
  updateRoadWidth: (sp: number) => void;
  updateDust: (delta: number, intensity: number, truckPos: THREE.Vector3) => void;
  dispose: () => void;
}

/**
 * Clean Minimal Procedural Highway System
 * - Single seamless procedural highway ribbon (width = 16)
 * - Concentric circular arc corner with radius R = 45
 * - Clean solid dark asphalt surface without road lines
 * - Cave base strictly constrained to x <= 40 (zero overlap with loader road)
 */
export function createMineEnvironment(): MineEnvironmentSystem {
  const group = new THREE.Group();

  // Dark charcoal asphalt material matching reference
  const roadMat = new THREE.MeshStandardMaterial({
    color: "#0E1116",
    roughness: 0.95,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  // Solid black base for Phase 1 & 2 cave transit (ends at x = 40)
  const caveRoadBase = new THREE.Mesh(
    new THREE.BoxGeometry(440, 30, 80),
    roadMat
  );
  caveRoadBase.position.set(-180, -15, 0);
  caveRoadBase.receiveShadow = false;
  group.add(caveRoadBase);

  // =========================================================================
  // 1. PROCEDURAL CONTINUOUS CLEAN ROAD RIBBON (ZERO SEAMS, ZERO LINES)
  // =========================================================================
  const vertices: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  const roadHalfWidth = 8.0; // Total width = 16.0 units

  const addRibbonPoint = (pos: THREE.Vector3, tangent: THREE.Vector3, u: number) => {
    // Normal vector perpendicular to tangent on X-Z plane
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    
    // Left vertex
    const leftX = pos.x - normal.x * roadHalfWidth;
    const leftZ = pos.z - normal.z * roadHalfWidth;
    vertices.push(leftX, 0.01, leftZ);
    uvs.push(0, u);

    // Right vertex
    const rightX = pos.x + normal.x * roadHalfWidth;
    const rightZ = pos.z + normal.z * roadHalfWidth;
    vertices.push(rightX, 0.01, rightZ);
    uvs.push(1, u);
  };

  let pointCount = 0;

  // Segment 1: Horizontal straight highway (x: 40 -> 140, z: 0)
  const horizSteps = 60;
  for (let i = 0; i <= horizSteps; i++) {
    const t = i / horizSteps;
    const x = 40.0 + t * 100.0;
    const pos = new THREE.Vector3(x, 0, 0);
    const tangent = new THREE.Vector3(1, 0, 0);
    addRibbonPoint(pos, tangent, t * 10);
    pointCount++;
  }

  // Segment 2: 90-Degree Circular Turn Arc (Center at x=140, z=45, Radius R=45)
  const arcSteps = 48;
  const radius = 45.0;
  for (let i = 1; i <= arcSteps; i++) {
    const t = i / arcSteps;
    const angle = (t * Math.PI) / 2; // 0 to 90 deg

    const x = 140.0 + radius * Math.sin(angle);
    const z = 45.0 - radius * Math.cos(angle);
    const tangent = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).normalize();

    const pos = new THREE.Vector3(x, 0, z);
    addRibbonPoint(pos, tangent, 10 + t * 10);
    pointCount++;
  }

  // Segment 3: Long vertical straight highway down the screen (x: 185, z: 45 -> 580)
  const vertSteps = 160;
  for (let i = 1; i <= vertSteps; i++) {
    const t = i / vertSteps;
    const z = 45.0 + t * 535.0;
    const pos = new THREE.Vector3(185.0, 0, z);
    const tangent = new THREE.Vector3(0, 0, 1);
    addRibbonPoint(pos, tangent, 20 + t * 40);
    pointCount++;
  }

  // Build triangle indices for ribbon quad strip
  for (let i = 0; i < pointCount - 1; i++) {
    const p1 = i * 2;
    const p2 = i * 2 + 1;
    const p3 = (i + 1) * 2;
    const p4 = (i + 1) * 2 + 1;

    indices.push(p1, p2, p3);
    indices.push(p2, p4, p3);
  }

  const roadGeom = new THREE.BufferGeometry();
  roadGeom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  roadGeom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  roadGeom.setIndex(indices);
  roadGeom.computeVertexNormals();

  const roadMesh = new THREE.Mesh(roadGeom, roadMat);
  roadMesh.receiveShadow = false;
  group.add(roadMesh);

  // =========================================================================
  // 2. 3 ROADSIDE MINING TYPOGRAPHY MILESTONES (Passing by sequentially)
  // =========================================================================
  const roadsideTextures: THREE.CanvasTexture[] = [];
  const roadsideMaterials: THREE.MeshBasicMaterial[] = [];
  const roadsideGeoms: THREE.PlaneGeometry[] = [];

  const createRoadsideSign = (line1: string, line2: string, subtitle: string, posZ: number) => {
    if (typeof document === "undefined") return;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, 1024, 512);
    
    // Subtitle badge
    ctx.fillStyle = "#B8860B";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(subtitle.toUpperCase(), 40, 100);

    // Main giant industrial headlines
    ctx.fillStyle = "#0F172A";
    ctx.font = "900 76px sans-serif";
    ctx.fillText(line1.toUpperCase(), 40, 200);
    ctx.fillText(line2.toUpperCase(), 40, 290);

    // Subtle accent line
    ctx.fillStyle = "#CBD5E1";
    ctx.fillRect(40, 330, 360, 6);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    roadsideTextures.push(texture);

    const signMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    roadsideMaterials.push(signMat);

    const signGeom = new THREE.PlaneGeometry(28, 14);
    roadsideGeoms.push(signGeom);

    const signMesh = new THREE.Mesh(signGeom, signMat);
    signMesh.rotation.x = -Math.PI / 2;
    signMesh.position.set(146, 0.03, posZ);
    group.add(signMesh);
  };

  // Milestone 1 (sp ~ 0.86)
  createRoadsideSign("EXTRACTION", "AT EVERY SEAM", "MILESTONE 01 // PRECISION TRAMMING", 120);
  // Milestone 2 (sp ~ 0.92)
  createRoadsideSign("AUTONOMOUS", "FLEET DISPATCH", "MILESTONE 02 // HAULAGE LOGISTICS", 280);
  // Milestone 3 (sp ~ 0.97)
  createRoadsideSign("SUSTAINABLE", "MINE OF FUTURE", "MILESTONE 03 // ZERO EMISSIONS", 440);

  const updateRoadWidth = (_sp: number) => {};
  const updateDust = () => {};

  const dispose = () => {
    roadMat.dispose();
    roadGeom.dispose();
    roadsideTextures.forEach((t) => t.dispose());
    roadsideMaterials.forEach((m) => m.dispose());
    roadsideGeoms.forEach((g) => g.dispose());
  };

  return { group, updateRoadWidth, updateDust, dispose };
}
