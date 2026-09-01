import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export interface LoadedMiningTruck {
  group: THREE.Group;
  wheels: THREE.Object3D[];
  headlights: THREE.Light[];
  dumpBed?: THREE.Object3D;
  isLoaded: boolean;
}

/**
 * GLTF/GLB Photorealistic Caterpillar CAT 797F Mining Truck Asset Architecture
 * Loads `public/assets/mining/caterpillar_797f_mining_truck.glb` or `public/assets/mining/mining-truck.glb`
 * Applies permanent PBR materials (Caterpillar Industrial Yellow, Pure Black Rubber Tires, Dark Steel Chassis, Chrome Hydraulics)
 * Disables sub-mesh pivot rotations to eliminate rotating black shape artifacts.
 */
export class MiningTruckAssetManager {
  private truckGroup: THREE.Group = new THREE.Group();
  private wheels: THREE.Object3D[] = [];
  private headlights: THREE.Light[];
  private dumpBed?: THREE.Object3D;
  public isLoaded: boolean = false;

  constructor() {
    this.truckGroup.name = "MiningTruckRoot";
    this.headlights = [];
  }

  public getGroup(): THREE.Group {
    return this.truckGroup;
  }

  public load(
    scene: THREE.Scene,
    onSuccess?: (truck: LoadedMiningTruck) => void,
    onError?: (err: Error) => void
  ) {
    const loader = new GLTFLoader();
    
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
    loader.setDRACOLoader(dracoLoader);

    const assetPath = "/assets/mining/caterpillar_797f_mining_truck.glb";
    const fallbackPath = "/assets/mining/mining-truck.glb";

    const loadFile = (path: string) => {
      loader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(0.28, 0.28, 0.28);
          model.castShadow = false;
          model.receiveShadow = false;

          console.log("[Mining Truck] GLB loaded successfully from:", path);

          let meshCount = 0;

          // Traverse meshes and apply permanent multi-material PBR separation
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              meshCount++;

              const origMat = child.material;
              const hasMap = !!(origMat && origMat.map);

              if (hasMap && origMat.map) {
                origMat.map.colorSpace = THREE.SRGBColorSpace;
                origMat.map.needsUpdate = true;
              }

              const meshName = child.name.toLowerCase();
              const matName = (origMat && origMat.name) ? origMat.name.toLowerCase() : "";

              const isOuterTireTread =
                meshName.includes("tire") ||
                meshName.includes("wheel") ||
                meshName.includes("rubber") ||
                matName.includes("tire") ||
                matName.includes("rubber") ||
                child.name === "Object_20" ||
                child.name === "Object_21" ||
                child.name === "Object_22" ||
                child.name === "Object_23" ||
                child.name === "Object_24" ||
                child.name === "Object_28" ||
                child.name === "Object_29";

              const isRimOrHub =
                meshName.includes("rim") ||
                meshName.includes("hub") ||
                matName.includes("rim") ||
                matName.includes("hub");

              const isHydraulicRod =
                meshName.includes("rod") ||
                meshName.includes("chrome") ||
                matName.includes("rod") ||
                matName.includes("chrome") ||
                child.name === "Object_0" ||
                child.name === "Object_1";

              const isHydraulicCylinder =
                meshName.includes("cylinder") ||
                meshName.includes("hydraulic") ||
                meshName.includes("piston") ||
                matName.includes("cylinder") ||
                matName.includes("hydraulic") ||
                child.name === "Object_2" ||
                child.name === "Object_3";

              const isCabinGlass =
                meshName.includes("glass") ||
                meshName.includes("window") ||
                meshName.includes("cab") ||
                matName.includes("glass") ||
                matName.includes("window") ||
                child.name === "Object_19";

              const isDarkChassis =
                meshName.includes("chassis") ||
                meshName.includes("frame") ||
                meshName.includes("grille") ||
                meshName.includes("step") ||
                meshName.includes("ladder") ||
                meshName.includes("black") ||
                matName.includes("chassis") ||
                matName.includes("frame") ||
                matName.includes("black") ||
                child.name === "Object_30" ||
                child.name === "Object_31" ||
                child.name === "Object_32" ||
                child.name === "Object_33" ||
                child.name === "Object_34" ||
                child.name === "Object_35" ||
                child.name === "Object_36" ||
                child.name === "Object_37" ||
                child.name === "Object_38" ||
                child.name === "Object_39";

              const isDumpBed =
                meshName.includes("bed") ||
                meshName.includes("dump") ||
                matName.includes("bed") ||
                matName.includes("dump") ||
                child.name === "Object_5" ||
                child.name === "Object_10" ||
                child.name === "Object_11" ||
                child.name === "Object_12" ||
                child.name === "Object_13" ||
                child.name === "Object_25" ||
                child.name === "Object_26" ||
                child.name === "Object_27";

              // 1. PURE BLACK TIRES (#000000)
              if (isOuterTireTread) {
                child.material = new THREE.MeshStandardMaterial({
                  color: new THREE.Color("#000000"), // Pure Black
                  metalness: 0.0,
                  roughness: 0.95,
                  map: hasMap ? origMat.map : null,
                });
              }
              // 2. RIMS / HUBS (#424850)
              else if (isRimOrHub) {
                child.material = new THREE.MeshStandardMaterial({
                  color: new THREE.Color("#424850"),
                  metalness: 0.88,
                  roughness: 0.22,
                });
              }
              // 3. HYDRAULIC RODS (BRIGHT CHROME #E0E5E8)
              else if (isHydraulicRod) {
                child.material = new THREE.MeshStandardMaterial({
                  color: new THREE.Color("#E0E5E8"),
                  metalness: 1.0,
                  roughness: 0.10,
                });
              }
              // 4. HYDRAULIC CYLINDERS (#BFC7CE)
              else if (isHydraulicCylinder) {
                child.material = new THREE.MeshStandardMaterial({
                  color: new THREE.Color("#BFC7CE"),
                  metalness: 0.95,
                  roughness: 0.16,
                });
              }
              // 5. CABIN GLASS (#122536)
              else if (isCabinGlass) {
                child.material = new THREE.MeshStandardMaterial({
                  color: new THREE.Color("#122536"),
                  metalness: 0.65,
                  roughness: 0.08,
                  transparent: true,
                  opacity: 0.75,
                });
              }
              // 6. DARK CHASSIS / FRAME / GRILLE / STEPS (#17191C)
              else if (isDarkChassis) {
                child.material = new THREE.MeshStandardMaterial({
                  color: new THREE.Color("#17191C"),
                  metalness: 0.75,
                  roughness: 0.38,
                });
              }
              // 7. DUMP BED (#C47D13)
              else if (isDumpBed) {
                child.material = new THREE.MeshStandardMaterial({
                  color: new THREE.Color("#C47D13"),
                  metalness: 0.58,
                  roughness: 0.42,
                  map: hasMap ? origMat.map : null,
                });
                this.dumpBed = child;
              }
              // 8. MAIN TRUCK BODY (CATERPILLAR INDUSTRIAL YELLOW #D58A18)
              else {
                child.material = new THREE.MeshStandardMaterial({
                  color: new THREE.Color("#D58A18"),
                  metalness: 0.55,
                  roughness: 0.30,
                  map: hasMap ? origMat.map : null,
                });
              }
            }
          });

          const headlightL = new THREE.SpotLight(0xFFF4D6, 14.0, 52, Math.PI / 6, 0.4);
          headlightL.position.set(-1.8, 1.6, 6.4);
          headlightL.target.position.set(-1.8, 0, 30);
          model.add(headlightL);
          model.add(headlightL.target);
          this.headlights.push(headlightL);

          const headlightR = new THREE.SpotLight(0xFFF4D6, 14.0, 52, Math.PI / 6, 0.4);
          headlightR.position.set(1.8, 1.6, 6.4);
          headlightR.target.position.set(1.8, 0, 30);
          model.add(headlightR);
          model.add(headlightR.target);
          this.headlights.push(headlightR);

          this.truckGroup.add(model);
          this.isLoaded = true;

          onSuccess?.({
            group: this.truckGroup,
            wheels: this.wheels,
            headlights: this.headlights,
            dumpBed: this.dumpBed,
            isLoaded: true,
          });
        },
        undefined,
        (err) => {
          if (path === assetPath) {
            loadFile(fallbackPath);
          } else {
            console.warn("Mining truck GLB asset missing:", err);
            onError?.(err as Error);
          }
        }
      );
    };

    loadFile(assetPath);
  }

  public updateWheelRotation(distance: number) {
    // Kept empty to prevent sub-mesh rotation around global pivots
  }
}
