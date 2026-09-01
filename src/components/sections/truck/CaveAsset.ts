import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/**
 * GLTF/GLB Photorealistic Mine Cave Tunnel Asset Architecture
 * Loads `public/assets/mining/cave.glb` via GLTFLoader configured with MeshoptDecoder & DRACOLoader
 * Features 3D procedural black stone/boulder clusters framing the outer entrance arch (x = -15 to 36)
 * with complete erasure of interior clipping stone boulders inside the cave tunnel (media_1788267701567.png fix).
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
      loader.setMeshoptDecoder(MeshoptDecoder);

      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
      loader.setDRACOLoader(dracoLoader);

      loader.load(
        "/assets/mining/cave.glb",
        (gltf) => {
          console.log("CAVE GLB LOADED SUCCESSFULLY", gltf);

          const model = gltf.scene;

          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.visible = true;
              child.castShadow = false;
              child.receiveShadow = false;

              if (child.material) {
                const origMat = child.material;
                origMat.side = THREE.DoubleSide; // DoubleSide rendering for complete cavern wall visibility
                
                if (origMat.color) {
                  origMat.color.set("#181B1F");
                }
                if (origMat.map) {
                  origMat.map.colorSpace = THREE.SRGBColorSpace;
                  origMat.map.needsUpdate = true;
                }
                origMat.roughness = 0.95;
                origMat.metalness = 0.05;
              }
            }
          });

          // Scale 2.2 forms an 11.5-unit tall, 70-unit long cavern portal
          model.scale.set(2.2, 2.2, 2.2);
          model.position.set(36.0, -0.4, 0.0); // Cavern portal entrance at x = 36.0
          model.rotation.y = 0; // Tunnel mouth faces approaching truck

          // --- 3D PROCEDURAL BLACK STONE BOULDER CLUSTERS (OUTER ENTRANCE ARCH ONLY) ---
          const stoneMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#101215"),
            roughness: 0.95,
            metalness: 0.05,
            flatShading: true, // Faceted 3D rock boulder look
          });

          const stoneGroup = new THREE.Group();
          stoneGroup.name = "BlackStoneBoulders";

          const geo1 = new THREE.DodecahedronGeometry(1, 1);
          const geo2 = new THREE.IcosahedronGeometry(1, 0);

          let pseudoSeed = 1337;
          const random = () => {
            pseudoSeed = (pseudoSeed * 9301 + 49297) % 233280;
            return pseudoSeed / 233280;
          };

          // 1. EARLY ENTRANCE MOUNTAIN CLIFF FACE BOULDERS (x = -15 -> 32, z = -45 -> +45, y = 0 -> 35)
          // Outer entrance cliff boulders framing the cavern approach
          for (let i = 0; i < 120; i++) {
            const px = -15.0 + random() * 47.0;
            const py = random() * 32.0;
            const pz = (random() - 0.5) * 85.0;

            if (px < 36.0 && Math.abs(pz) < 11.0 && py < 11.0) {
              continue;
            }

            const scale = 3.5 + random() * 6.5;
            const mesh = new THREE.Mesh(random() > 0.5 ? geo1 : geo2, stoneMat);
            mesh.position.set(px, py, pz);
            mesh.scale.set(scale, scale * (0.8 + random() * 0.5), scale);
            mesh.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
            stoneGroup.add(mesh);
          }

          // 2. Entrance Arch Outer Frame Boulders (around x = 36, z = ±(14 -> 32), y = 12 -> 25)
          // Outer arch boulders framing the portal mouth
          for (let i = 0; i < 50; i++) {
            const angle = (i / 50) * Math.PI;
            const radius = 14.0 + random() * 5.0;
            const px = 36.0 + (random() - 0.5) * 6.0;
            const py = Math.sin(angle) * radius;
            const pz = Math.cos(angle) * radius * 1.8;

            const scale = 2.5 + random() * 4.5;
            const mesh = new THREE.Mesh(random() > 0.5 ? geo1 : geo2, stoneMat);
            mesh.position.set(px, py, pz);
            mesh.scale.set(scale, scale * (0.8 + random() * 0.5), scale);
            mesh.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
            stoneGroup.add(mesh);
          }

          // NOTE: Interior cavern tunnel boulders (Section 3) ERASED completely (media_1788267701567.png fix)

          this.caveGroup.add(stoneGroup);

          // Soft Balanced Cavern Illumination
          const caveSun = new THREE.DirectionalLight("#FFF8EE", 1.1);
          caveSun.position.set(30, 25, 20);
          this.caveGroup.add(caveSun);

          const caveAmbient = new THREE.AmbientLight("#E6ECF5", 0.85);
          this.caveGroup.add(caveAmbient);

          // Warm industrial interior spotlights along deep cavern tunnel drift
          const entranceLight = new THREE.PointLight(0xFFA500, 3.5, 45);
          entranceLight.position.set(36.0, 5.5, 0.0);
          this.caveGroup.add(entranceLight);

          const interiorLight1 = new THREE.PointLight(0xFF8C00, 3.0, 60);
          interiorLight1.position.set(52.0, 5.0, 0.0);
          this.caveGroup.add(interiorLight1);

          const interiorLight2 = new THREE.PointLight(0xFF7F00, 2.8, 75);
          interiorLight2.position.set(68.0, 5.0, 0.0);
          this.caveGroup.add(interiorLight2);

          const interiorLight3 = new THREE.PointLight(0xFF7300, 2.5, 90);
          interiorLight3.position.set(84.0, 5.0, 0.0);
          this.caveGroup.add(interiorLight3);

          this.caveGroup.add(model);
          this.isLoaded = true;
          console.log("[Cave Asset] Loaded with complete erasure of interior clipping stones!");
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
