import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Underground Mining Wheel Loader Asset Pipeline
 * Loads `public/assets/mining/loader.glb` via GLTFLoader
 * Applies distinct Caterpillar industrial PBR materials:
 * - Pure Black Rubber Tires & Dark Chassis (#050506)
 * - Bright Chrome Hydraulics (#DCE3E8)
 * - Tinted Cabin Glass (#102235)
 * - Bright Golden Caterpillar Body & Bucket (#F2A900)
 * Rotates model (rotation.y = -Math.PI / 2) so bucket (face) points RIGHT (+X).
 */
export function loadMiningLoaderAsset(
  scene: THREE.Scene,
  onLoaded?: (group: THREE.Group) => void,
  onError?: (err: Error) => void
) {
  const loader = new GLTFLoader();
  loader.load(
    "/assets/mining/loader.glb",
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(1.4, 1.4, 1.4);
      model.rotation.y = Math.PI / 2; // Steering cabin & front bowl face directly TOWARDS THE RIGHT (+X)
      model.castShadow = true;
      model.receiveShadow = true;

      let meshCount = 0;

      const blackTireMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#050506"), // Deep Pure Black Rubber
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
              matName.includes("rubber")
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

      // --- GLOWING GOLD ORE PAYLOAD IN BUCKET BED ---------------------------
      const goldMat = new THREE.MeshStandardMaterial({
        color: "#FFD700",
        emissive: "#D48806",
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.2,
      });

      const goldPayloadGroup = new THREE.Group();
      goldPayloadGroup.name = "GoldPayloadGroup";
      const goldGeom = new THREE.DodecahedronGeometry(0.25, 1);

      for (let i = 0; i < 28; i++) {
        const lump = new THREE.Mesh(goldGeom, goldMat);
        lump.position.set(
          (Math.random() - 0.5) * 1.8,
          0.8 + Math.random() * 0.4,
          1.6 + (Math.random() - 0.5) * 1.0
        );
        lump.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          0
        );
        lump.scale.setScalar(0.7 + Math.random() * 0.6);
        goldPayloadGroup.add(lump);
      }
      model.add(goldPayloadGroup);

      console.log("[Mining Loader] GLB loaded with front bucket (face) pointing RIGHT (+X)!");

      scene.add(model);
      onLoaded?.(model);
    },
    undefined,
    (error) => {
      console.warn("Loader GLB asset missing at public/assets/mining/loader.glb:", error);
      onError?.(error as Error);
    }
  );
}
