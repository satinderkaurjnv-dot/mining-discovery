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
function createTireTreadTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Deep Charcoal Black Rubber
  ctx.fillStyle = "#07080a";
  ctx.fillRect(0, 0, 1024, 512);

  // Bold Industrial Chevron Rubber Lugs
  ctx.strokeStyle = "#2c313c";
  ctx.lineWidth = 28;
  ctx.lineCap = "round";

  for (let x = 0; x < 1024; x += 64) {
    // Chevron Left Lug
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x + 36, 240);
    ctx.stroke();

    // Chevron Right Lug
    ctx.beginPath();
    ctx.moveTo(x, 472);
    ctx.lineTo(x + 36, 272);
    ctx.stroke();

    // Deep Tread Shadow Channel
    ctx.fillStyle = "#020304";
    ctx.fillRect(x + 30, 246, 28, 20);

    // Tread Lug Surface Grip Bars
    ctx.fillStyle = "#3a414e";
    ctx.fillRect(x + 4, 16, 24, 24);
    ctx.fillRect(x + 4, 472, 24, 24);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 1);
  return tex;
}

function createDumpBedBlackGoldTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 1. Heavy Industrial Charcoal Carbon Black Base
  ctx.fillStyle = "#121418";
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Bold Caterpillar Gold Side Panels & Structural Ribs
  ctx.fillStyle = "#F2A900";
  // Golden top canopy band
  ctx.fillRect(0, 0, 1024, 220);

  // Golden side body panels
  ctx.fillRect(60, 260, 904, 380);

  // Deep black inner contrast panel
  ctx.fillStyle = "#161920";
  ctx.fillRect(100, 300, 824, 300);

  // Golden diagonal hazard accent bars
  ctx.strokeStyle = "#F2A900";
  ctx.lineWidth = 18;
  for (let x = 120; x < 900; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, 300);
    ctx.lineTo(x + 60, 600);
    ctx.stroke();
  }

  // Golden lower structural beam
  ctx.fillStyle = "#E5A108";
  ctx.fillRect(40, 720, 944, 140);

  // Black reinforcement bolt plates
  ctx.fillStyle = "#0A0B0E";
  ctx.fillRect(80, 750, 864, 80);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export class MiningTruckAssetManager {
  private truckGroup: THREE.Group = new THREE.Group();
  private wheels: THREE.Object3D[] = [];
  private headlights: THREE.Light[];
  private dumpBed?: THREE.Object3D;
  private tireTexture: THREE.CanvasTexture | null = null;
  private dumpBedTexture: THREE.CanvasTexture | null = null;
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
    loader.register(() => ({
      name: "KHR_materials_pbrSpecularGlossiness",
      getMaterialType: () => THREE.MeshStandardMaterial,
      extendMaterialParams: () => Promise.resolve(),
    }));
    
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
          model.rotation.y = Math.PI; // Front cab & steering face FORWARD TOWARDS CAVE (+X), dump bed / bowl is on the BACKSIDE (-X)
          model.castShadow = false;
          model.receiveShadow = false;

          console.log("[Mining Truck] GLB loaded successfully from:", path);

          if (!this.tireTexture) {
            this.tireTexture = createTireTreadTexture();
          }
          if (!this.dumpBedTexture) {
            this.dumpBedTexture = createDumpBedBlackGoldTexture();
          }

          const blackTireMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#050506"), // Deep Pure Black Rubber for All 4 Wheel Hubs & Tires
            map: this.tireTexture,
            bumpMap: this.tireTexture,
            bumpScale: 0.08,
            metalness: 0.0,
            roughness: 0.95,
          });

          const chromeMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#E0E5E8"),
            metalness: 1.0,
            roughness: 0.10,
          });

          const cylinderMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#BFC7CE"),
            metalness: 0.95,
            roughness: 0.16,
          });

          const glassMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#122536"),
            metalness: 0.65,
            roughness: 0.08,
            transparent: true,
            opacity: 0.75,
          });

          const chassisMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#17191C"),
            metalness: 0.75,
            roughness: 0.38,
          });

          // Two-Tone Black and Golden Dump Bed Bowl Material
          const dumpBedMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#FFFFFF"),
            map: this.dumpBedTexture,
            bumpMap: this.dumpBedTexture,
            bumpScale: 0.05,
            metalness: 0.65,
            roughness: 0.35,
          });

          const goldBodyMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#D58A18"),
            metalness: 0.55,
            roughness: 0.30,
          });

          const classifyTriangle = (cx: number, cy: number, cz: number): "outerTire" | "innerHub" | "body" => {
            if (cz > 12.4 || cz < -0.5) return "body";
            if (cx > -5.5 && cx < 0.5) return "body";
            const dFront = Math.sqrt((cy - 9.65) ** 2 + (cz - 6.07) ** 2);
            const dRear = Math.sqrt((cy + 14.58) ** 2 + (cz - 6.07) ** 2);
            const r = Math.min(dFront, dRear);
            if (r > 6.35) return "body";
            if (r > 3.25) return "outerTire";
            return "innerHub";
          };

          const meshesToProcess: THREE.Mesh[] = [];
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              meshesToProcess.push(child);
            }
          });

          meshesToProcess.forEach((child) => {
            const meshName = child.name.toLowerCase();

            let targetBodyMat = goldBodyMat;
            if (
              meshName.includes("glass") ||
              meshName.includes("window") ||
              meshName.includes("cab") ||
              child.name === "Object_19"
            ) {
              targetBodyMat = glassMat;
            } else if (
              meshName.includes("rod") ||
              meshName.includes("chrome") ||
              child.name === "Object_0" ||
              child.name === "Object_1"
            ) {
              targetBodyMat = chromeMat;
            } else if (
              meshName.includes("cylinder") ||
              meshName.includes("piston") ||
              child.name === "Object_2"
            ) {
              targetBodyMat = cylinderMat;
            } else if (
              meshName.includes("bed") ||
              meshName.includes("dump") ||
              child.name === "Object_5" ||
              child.name === "Object_11" ||
              child.name === "Object_13"
            ) {
              targetBodyMat = dumpBedMat;
            } else if (
              meshName.includes("chassis") ||
              meshName.includes("frame") ||
              meshName.includes("step") ||
              meshName.includes("ladder") ||
              child.name === "Object_32" ||
              child.name === "Object_33" ||
              child.name === "Object_34" ||
              child.name === "Object_35" ||
              child.name === "Object_36" ||
              child.name === "Object_37" ||
              child.name === "Object_38" ||
              child.name === "Object_39" ||
              child.name === "Object_40" ||
              child.name === "Object_41" ||
              child.name === "Object_42" ||
              child.name === "Object_43" ||
              child.name === "Object_44"
            ) {
              targetBodyMat = chassisMat;
            }

            const nonIndexed = child.geometry.toNonIndexed();
            const pos = nonIndexed.attributes.position;
            const norm = nonIndexed.attributes.normal;
            const uv = nonIndexed.attributes.uv;

            const outerTirePos: number[] = [];
            const outerTireNorm: number[] = [];
            const outerTireUV: number[] = [];

            const innerHubPos: number[] = [];
            const innerHubNorm: number[] = [];
            const innerHubUV: number[] = [];

            const bodyPos: number[] = [];
            const bodyNorm: number[] = [];
            const bodyUV: number[] = [];

            for (let i = 0; i < pos.count; i += 3) {
              const x0 = pos.getX(i), y0 = pos.getY(i), z0 = pos.getZ(i);
              const x1 = pos.getX(i + 1), y1 = pos.getY(i + 1), z1 = pos.getZ(i + 1);
              const x2 = pos.getX(i + 2), y2 = pos.getY(i + 2), z2 = pos.getZ(i + 2);

              const cx = (x0 + x1 + x2) / 3;
              const cy = (y0 + y1 + y2) / 3;
              const cz = (z0 + z1 + z2) / 3;

              const partType = classifyTriangle(cx, cy, cz);

              if (partType === "outerTire") {
                for (let j = 0; j < 3; j++) {
                  outerTirePos.push(pos.getX(i + j), pos.getY(i + j), pos.getZ(i + j));
                  if (norm) outerTireNorm.push(norm.getX(i + j), norm.getY(i + j), norm.getZ(i + j));
                  if (uv) outerTireUV.push(uv.getX(i + j), uv.getY(i + j));
                }
              } else if (partType === "innerHub") {
                for (let j = 0; j < 3; j++) {
                  innerHubPos.push(pos.getX(i + j), pos.getY(i + j), pos.getZ(i + j));
                  if (norm) innerHubNorm.push(norm.getX(i + j), norm.getY(i + j), norm.getZ(i + j));
                  if (uv) innerHubUV.push(uv.getX(i + j), uv.getY(i + j));
                }
              } else {
                for (let j = 0; j < 3; j++) {
                  bodyPos.push(pos.getX(i + j), pos.getY(i + j), pos.getZ(i + j));
                  if (norm) bodyNorm.push(norm.getX(i + j), norm.getY(i + j), norm.getZ(i + j));
                  if (uv) bodyUV.push(uv.getX(i + j), uv.getY(i + j));
                }
              }
            }

            if (bodyPos.length > 0) {
              const bodyGeom = new THREE.BufferGeometry();
              bodyGeom.setAttribute("position", new THREE.Float32BufferAttribute(bodyPos, 3));
              if (bodyNorm.length > 0) bodyGeom.setAttribute("normal", new THREE.Float32BufferAttribute(bodyNorm, 3));
              if (bodyUV.length > 0) bodyGeom.setAttribute("uv", new THREE.Float32BufferAttribute(bodyUV, 2));
              child.geometry.dispose();
              child.geometry = bodyGeom;
              child.material = targetBodyMat;
            } else if (outerTirePos.length > 0) {
              const tireGeom = new THREE.BufferGeometry();
              tireGeom.setAttribute("position", new THREE.Float32BufferAttribute(outerTirePos, 3));
              if (outerTireNorm.length > 0) tireGeom.setAttribute("normal", new THREE.Float32BufferAttribute(outerTireNorm, 3));
              if (outerTireUV.length > 0) tireGeom.setAttribute("uv", new THREE.Float32BufferAttribute(outerTireUV, 2));
              child.geometry.dispose();
              child.geometry = tireGeom;
              child.material = blackTireMat;
              outerTirePos.length = 0;
            } else if (innerHubPos.length > 0) {
              const hubGeom = new THREE.BufferGeometry();
              hubGeom.setAttribute("position", new THREE.Float32BufferAttribute(innerHubPos, 3));
              if (innerHubNorm.length > 0) hubGeom.setAttribute("normal", new THREE.Float32BufferAttribute(innerHubNorm, 3));
              if (innerHubUV.length > 0) hubGeom.setAttribute("uv", new THREE.Float32BufferAttribute(innerHubUV, 2));
              child.geometry.dispose();
              child.geometry = hubGeom;
              child.material = goldBodyMat;
              innerHubPos.length = 0;
            }

            if (outerTirePos.length > 0) {
              const tireGeom = new THREE.BufferGeometry();
              tireGeom.setAttribute("position", new THREE.Float32BufferAttribute(outerTirePos, 3));
              if (outerTireNorm.length > 0) tireGeom.setAttribute("normal", new THREE.Float32BufferAttribute(outerTireNorm, 3));
              if (outerTireUV.length > 0) tireGeom.setAttribute("uv", new THREE.Float32BufferAttribute(outerTireUV, 2));
              const tireMesh = new THREE.Mesh(tireGeom, blackTireMat);
              tireMesh.name = child.name + "_OuterTire";
              child.parent?.add(tireMesh);
            }

            if (innerHubPos.length > 0) {
              const hubGeom = new THREE.BufferGeometry();
              hubGeom.setAttribute("position", new THREE.Float32BufferAttribute(innerHubPos, 3));
              if (innerHubNorm.length > 0) hubGeom.setAttribute("normal", new THREE.Float32BufferAttribute(innerHubNorm, 3));
              if (innerHubUV.length > 0) hubGeom.setAttribute("uv", new THREE.Float32BufferAttribute(innerHubUV, 2));
              const hubMesh = new THREE.Mesh(hubGeom, goldBodyMat);
              hubMesh.name = child.name + "_InnerGoldenHub";
              child.parent?.add(hubMesh);
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

  public updateWheelRotation(_distance: number) {
    // 100% stationary upper body and tires - zero vertex/mesh displacement
  }
}
