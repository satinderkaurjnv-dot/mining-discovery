import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

function createTireTreadTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#07080a";
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = "#282c35";
  ctx.lineWidth = 16;
  ctx.lineCap = "round";

  for (let y = 0; y < 512; y += 32) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(235, y + 20);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(482, y);
    ctx.lineTo(277, y + 20);
    ctx.stroke();

    ctx.fillStyle = "#020304";
    ctx.fillRect(240, y, 32, 32);

    ctx.fillStyle = "#1b1d24";
    ctx.fillRect(8, y + 4, 22, 20);
    ctx.fillRect(482, y + 4, 22, 20);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 6);
  return tex;
}

/**
 * Underground Mining Wheel Loader Asset Pipeline
 * Loads `public/assets/mining/loader.glb` via GLTFLoader
 * Applies distinct Caterpillar industrial PBR materials:
 * - Pure Black Rubber Tires with surface color motion (#050506)
 * - Bright Chrome Hydraulics (#DCE3E8)
 * - Tinted Cabin Glass (#102235)
 * - Bright Golden Caterpillar Body & Bucket (#F2A900)
 */
export function loadMiningLoaderAsset(
  scene: THREE.Scene,
  onLoaded?: (group: THREE.Group, updateWheelRotation?: (distance: number) => void) => void,
  onError?: (err: Error) => void
) {
  const loader = new GLTFLoader();
  loader.register(() => ({
    name: "KHR_materials_pbrSpecularGlossiness",
    getMaterialType: () => THREE.MeshStandardMaterial,
    extendMaterialParams: () => Promise.resolve(),
  }));
  loader.load(
    "/assets/mining/loader.glb",
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(1.4, 1.4, 1.4);
      model.rotation.set(0, 0, 0);
      model.castShadow = true;
      model.receiveShadow = true;

      let meshCount = 0;
      const loaderTireTex = createTireTreadTexture();

      const blackTireMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#050506"),
        map: loaderTireTex,
        bumpMap: loaderTireTex,
        bumpScale: 0.08,
        metalness: 0.0,
        roughness: 0.95,
      });

      const chromeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#DCE3E8"), // Bright Chrome Steel
        metalness: 0.95,
        roughness: 0.15,
      });

      const glassMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#102235"), // Cabin Glass
        metalness: 0.80,
        roughness: 0.10,
        transparent: true,
        opacity: 0.70,
      });

      const goldBodyMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#F2A900"), // Bright Golden Caterpillar Yellow
        metalness: 0.55,
        roughness: 0.32,
      });

      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshCount++;
          child.castShadow = true;
          child.receiveShadow = true;

          const origMat = child.material;

          const processMat = (m: THREE.Material): THREE.Material => {
            const matName = m.name ? m.name.toLowerCase() : "";

            // 1. PURE BLACK RUBBER TIRES & DARK CHASSIS
            if (
              matName.includes("black") ||
              matName.includes("darkgray") ||
              matName.includes("969696") ||
              matName.includes("color_007") ||
              matName.includes("material_10") ||
              matName.includes("material_16") ||
              matName.includes("default_materia1") ||
              matName.includes("tire") ||
              matName.includes("wheel") ||
              matName.includes("rubber") ||
              child.name === "Object_26" ||
              child.name === "Object_38"
            ) {
              return blackTireMat;
            }
            // 2. CHROME HYDRAULICS & ALUMINUM
            else if (
              matName.includes("aluminium") ||
              matName.includes("steel") ||
              matName.includes("chrome")
            ) {
              return chromeMat;
            }
            // 3. CABIN GLASS
            else if (
              matName.includes("azure") ||
              matName.includes("cyan") ||
              matName.includes("glass") ||
              matName.includes("window") ||
              matName.includes("material_19") ||
              matName.includes("material_26")
            ) {
              return glassMat;
            }
            // 4. BRIGHT GOLDEN CATERPILLAR BODY & BUCKET (Color_C02, material_23, material_24)
            else {
              return goldBodyMat;
            }
          };

          if (Array.isArray(origMat)) {
            child.material = origMat.map(processMat);
          } else if (origMat) {
            child.material = processMat(origMat);
          }
        }
      });

      const updateWheelRotation = (distance: number) => {
        if (!distance || !loaderTireTex) return;
        // Move tyre tread surface texture rapidly on scroll for vivid rolling motion
        loaderTireTex.offset.y += distance * 0.85;
      };

      // Geometrically center the loader mesh so its origin is at the exact chassis centerline
      const wrapper = new THREE.Group();
      wrapper.name = "MiningLoaderWrapper";

      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      
      model.position.set(-center.x, -box.min.y, -center.z);
      wrapper.add(model);

      scene.add(wrapper);
      onLoaded?.(wrapper, updateWheelRotation);
    },
    undefined,
    (error) => {
      console.warn("Loader GLB asset missing at public/assets/mining/loader.glb:", error);
      onError?.(error as Error);
    }
  );
}
