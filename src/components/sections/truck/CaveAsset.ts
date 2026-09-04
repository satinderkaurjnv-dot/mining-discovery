import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/**
 * Creates a procedural Canvas2D texture rendering dark brown subterranean granite
 * featuring bright glowing 24K gold vein lines and glowing gold mineral specks/dots.
 */
function createGoldMineRockTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // 1. Dark Subterranean Granite Base
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, "#120F0D"); // Deep Underground Granite
    grad.addColorStop(0.5, "#261D17"); // Rich Brown Cavern Rock
    grad.addColorStop(1, "#0D0A08");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Add Natural Rock Speckles / Grain
    for (let i = 0; i < 1200; i++) {
      ctx.fillStyle = Math.random() < 0.5 ? "rgba(38, 29, 23, 0.45)" : "rgba(10, 8, 6, 0.55)";
      ctx.fillRect(
        Math.random() * 1024,
        Math.random() * 1024,
        Math.random() * 5 + 1,
        Math.random() * 5 + 1
      );
    }

    // 3. Draw Bright Glowing 24K Gold Vein Lines Across Cavern Walls
    ctx.strokeStyle = "#FFD700"; // Pure 24K Gold Yellow
    ctx.shadowColor = "#FFB700";
    ctx.shadowBlur = 16;

    // Main Gold Vein Line 1
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(40, 120);
    ctx.bezierCurveTo(240, 400, 600, 320, 980, 680);
    ctx.stroke();

    // Main Gold Vein Line 2
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(120, 880);
    ctx.bezierCurveTo(360, 580, 680, 840, 900, 160);
    ctx.stroke();

    // Branching Gold Vein Striations
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#FFE066";
    ctx.beginPath();
    ctx.moveTo(320, 320);
    ctx.lineTo(480, 120);
    ctx.moveTo(600, 520);
    ctx.lineTo(800, 800);
    ctx.moveTo(220, 640);
    ctx.lineTo(420, 920);
    ctx.stroke();

    // 4. Draw 300 Glowing 24K Gold Ore Dots / Mineral Specks Embedded On Rock Surface
    ctx.fillStyle = "#FFE066";
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 10;
    for (let s = 0; s < 300; s++) {
      const rx = Math.random() * 1024;
      const ry = Math.random() * 1024;
      const size = Math.random() * 4 + 2;
      ctx.fillRect(rx, ry, size, size);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.needsUpdate = true;
  return texture;
}

export interface LoadedCave {
  group: THREE.Group;
  isLoaded: boolean;
}

/**
 * GLTF/GLB Photorealistic Mine Cave Tunnel Asset Architecture
 * Loads `public/assets/mining/cave.glb` via GLTFLoader configured with MeshoptDecoder & DRACOLoader
 * Features 24K glowing gold vein lines and sparkling gold dots mapped directly onto interior cavern wall materials.
 */
export class CaveAssetManager {
  private caveGroup: THREE.Group = new THREE.Group();
  public isLoaded: boolean = false;

  constructor() {
    this.caveGroup.name = "CaveRoot";
  }

  public getGroup(): THREE.Group {
    return this.caveGroup;
  }

  public async load(
    scene: THREE.Scene,
    onSuccess?: (group: THREE.Group) => void,
    onError?: (err: Error) => void
  ) {
    console.log("Loading cave:", "/assets/mining/cave.glb");

    try {
      if (MeshoptDecoder && (MeshoptDecoder as any).ready) {
        await (MeshoptDecoder as any).ready;
      }

      const loader = new GLTFLoader();
      loader.register(() => ({
        name: "KHR_materials_pbrSpecularGlossiness",
        getMaterialType: () => THREE.MeshStandardMaterial,
        extendMaterialParams: () => Promise.resolve(),
      }));
      loader.setMeshoptDecoder(MeshoptDecoder);

      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
      loader.setDRACOLoader(dracoLoader);

      const goldVeinedCavernTexture = createGoldMineRockTexture();

      loader.load(
        "/assets/mining/cave.glb",
        (gltf) => {
          console.log("CAVE GLB LOADED SUCCESSFULLY", gltf);

          const model = gltf.scene;

          // Traverse cavern meshes and apply glowing 24K gold vein and speck texture directly to rock walls
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.visible = true;
              child.castShadow = false;
              child.receiveShadow = false;

              if (child.material) {
                const origMat = child.material;
                origMat.side = THREE.DoubleSide; // DoubleSide rendering for complete cavern wall visibility
                
                origMat.map = goldVeinedCavernTexture;
                origMat.emissiveMap = goldVeinedCavernTexture;
                origMat.emissive = new THREE.Color("#D49400"); // Glowing 24K Gold Emissive
                origMat.emissiveIntensity = 2.2;
                origMat.roughness = 0.85;
                origMat.metalness = 0.25;
              }
            }
          });

          // Scale 3.0 forms an enlarged 15-unit tall, 95-unit long cavern portal
          model.scale.set(3.0, 3.0, 3.0);
          model.position.set(36.0, -0.4, 0.0); // Cavern portal entrance at x = 36.0
          model.rotation.y = 0; // Tunnel mouth faces approaching truck

          // --- 3D PROCEDURAL NATURAL SUBTERRANEAN ROCK BOULDERS & MOUNTAIN CLIFF FACE ---
          // Retaining full authentic cave stones framing the portal entrance and mountain flank
          const stoneMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#181513"), // Rich dark subterranean granite
            roughness: 0.94,
            metalness: 0.10,
            flatShading: true,
          });

          const stoneGroup = new THREE.Group();
          stoneGroup.name = "CavernRockBoulders";

          const geo1 = new THREE.DodecahedronGeometry(1, 1);
          const geo2 = new THREE.IcosahedronGeometry(1, 0);

          let pseudoSeed = 1337;
          const random = () => {
            pseudoSeed = (pseudoSeed * 9301 + 49297) % 233280;
            return pseudoSeed / 233280;
          };

          // 1. Natural Entrance Arch Boulder Frame (Covering the cavern mouth at x ≈ -9.7)
          // Surrounds the opening so there is zero straight vertical slice or partition
          for (let i = 0; i < 70; i++) {
            const angle = (i / 70) * Math.PI;
            const radius = 11.2 + random() * 4.8;
            const px = -9.7 + (random() - 0.5) * 8.0;
            const py = Math.sin(angle) * radius;
            const pz = Math.cos(angle) * radius * 1.35;

            const scale = 2.8 + random() * 4.6;
            const mesh = new THREE.Mesh(random() > 0.5 ? geo1 : geo2, stoneMat);
            mesh.position.set(px, py, pz);
            mesh.scale.set(scale, scale * (0.8 + random() * 0.5), scale);
            mesh.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
            stoneGroup.add(mesh);
          }

          // 2. Mountain Cliff Face & Flank Boulders (Naturally cascading rock face)
          // Blends the portal seamlessly into the background with rugged organic contours
          for (let i = 0; i < 90; i++) {
            const px = -18.0 + random() * 32.0;
            const py = random() * 26.0;
            const isNearSide = random() > 0.5;
            const pz = isNearSide ? (9.5 + random() * 20.0) : -(9.5 + random() * 20.0);

            // Keep clear of truck drive path along the haul road
            if (px < -8.0 && py < 9.0 && Math.abs(pz) < 9.5) {
              continue;
            }

            const scale = 3.2 + random() * 5.8;
            const mesh = new THREE.Mesh(random() > 0.5 ? geo1 : geo2, stoneMat);
            mesh.position.set(px, py, pz);
            mesh.scale.set(scale, scale * (0.85 + random() * 0.4), scale);
            mesh.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
            stoneGroup.add(mesh);
          }

          // 3. Interior Drift Rock Outcrops along tunnel walls
          for (let i = 0; i < 40; i++) {
            const px = 6.0 + random() * 60.0;
            const py = random() * 11.0;
            const pz = (random() > 0.5 ? 1 : -1) * (8.2 + random() * 3.5);

            const scale = 2.0 + random() * 3.4;
            const mesh = new THREE.Mesh(random() > 0.5 ? geo1 : geo2, stoneMat);
            mesh.position.set(px, py, pz);
            mesh.scale.set(scale, scale, scale);
            mesh.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
            stoneGroup.add(mesh);
          }

          this.caveGroup.add(stoneGroup);

          // Soft Balanced Cavern Illumination
          const caveSun = new THREE.DirectionalLight("#FFF8EE", 1.1);
          caveSun.position.set(10, 28, 20);
          this.caveGroup.add(caveSun);

          const caveAmbient = new THREE.AmbientLight("#E6ECF5", 0.85);
          this.caveGroup.add(caveAmbient);

          // Warm golden industrial interior spotlights across full cavern tunnel drift
          // Portal Entrance Arch Light (x = -9.7)
          const entranceLight = new THREE.PointLight(0xFFB700, 4.8, 55);
          entranceLight.position.set(-9.7, 6.0, 0.0);
          this.caveGroup.add(entranceLight);

          // Deep Cavern Drift Lights
          const interiorLight1 = new THREE.PointLight(0xFF9900, 4.2, 65);
          interiorLight1.position.set(12.0, 5.5, 0.0);
          this.caveGroup.add(interiorLight1);

          const interiorLight2 = new THREE.PointLight(0xFF8800, 4.0, 75);
          interiorLight2.position.set(32.0, 5.5, 0.0);
          this.caveGroup.add(interiorLight2);

          const interiorLight3 = new THREE.PointLight(0xFF8800, 3.8, 85);
          interiorLight3.position.set(52.0, 5.0, 0.0);
          this.caveGroup.add(interiorLight3);

          const interiorLight4 = new THREE.PointLight(0xFF7700, 3.5, 95);
          interiorLight4.position.set(70.0, 5.0, 0.0);
          this.caveGroup.add(interiorLight4);

          this.caveGroup.add(model);
          this.isLoaded = true;
          console.log("[Cave Asset] Loaded with 24K gold vein lines and gold specks mapped directly onto cave rock walls!");
          onSuccess?.(this.caveGroup);
        },
        undefined,
        (err) => {
          console.error("Error loading cave GLB:", err);
          onError?.(err as Error);
        }
      );
    } catch (e) {
      console.error("Exception loading cave GLB:", e);
      onError?.(e as Error);
    }
  }
}
