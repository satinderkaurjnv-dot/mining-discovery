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
/**
 * Generates an alpha texture across the road width (UV.x) so both outer edges
 * feather smoothly into 0 opacity, eliminating hard cutoff lines against the page.
 */
function createRoadAlphaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0.00, "rgba(255, 255, 255, 0)");
    grad.addColorStop(0.18, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.82, "rgba(255, 255, 255, 1)");
    grad.addColorStop(1.00, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 16);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

export function createMineEnvironment(): MineEnvironmentSystem {
  const group = new THREE.Group();

  // Refined industrial haul road material with feathered lateral alpha edges
  const roadMat = new THREE.MeshStandardMaterial({
    color: "#1E2430",
    roughness: 0.92,
    metalness: 0.08,
    side: THREE.DoubleSide,
    transparent: true,
    alphaMap: createRoadAlphaTexture(),
    depthWrite: false,
  });

  // =========================================================================
  // 1. PROCEDURAL CONTINUOUS CLEAN ROAD RIBBON (ZERO SEAMS, ZERO LINES)
  // =========================================================================
  const vertices: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  const roadHalfWidth = 7.5; // Total width = 15.0 units

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

  // Segment 1: Horizontal continuous road from approach straight into turn (x: -80 -> 140, z: 0)
  const horizSteps = 80;
  for (let i = 0; i <= horizSteps; i++) {
    const t = i / horizSteps;
    const x = -80.0 + t * 220.0;
    const pos = new THREE.Vector3(x, 0, 0);
    const tangent = new THREE.Vector3(1, 0, 0);
    addRibbonPoint(pos, tangent, t * 18);
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
  // 1b. DASHED ROAD STRIPES & ROADSIDE POSTS (Giving clear visual speed)
  // =========================================================================
  const stripeMat = new THREE.MeshBasicMaterial({
    color: 0xf8fafc,
    transparent: true,
    opacity: 0.90,
    depthWrite: false,
  });

  const stripeGeom = new THREE.PlaneGeometry(0.5, 4.2);
  stripeGeom.rotateX(-Math.PI / 2);

  // Dashed centerline stripes along vertical highway (z = 45 -> 580)
  for (let z = 45; z <= 580; z += 9) {
    const stripe = new THREE.Mesh(stripeGeom, stripeMat);
    stripe.position.set(185.0, 0.02, z);
    group.add(stripe);
  }

  // Roadside industrial mileposts along the edges
  const postGeom = new THREE.BoxGeometry(0.35, 1.6, 0.35);
  const postMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Amber/Gold industrial reflector post
    metalness: 0.4,
    roughness: 0.3,
  });

  for (let z = 50; z <= 580; z += 22) {
    const leftPost = new THREE.Mesh(postGeom, postMat);
    leftPost.position.set(175.2, 0.8, z);
    group.add(leftPost);

    const rightPost = new THREE.Mesh(postGeom, postMat);
    rightPost.position.set(194.8, 0.8, z);
    group.add(rightPost);
  }

  const updateRoadWidth = (_sp: number) => {};
  const updateDust = () => {};

  const dispose = () => {
    roadMat.dispose();
    roadGeom.dispose();
  };

  return { group, updateRoadWidth, updateDust, dispose };
}
