import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface HelicopterAsset {
  group: THREE.Group;
  update: (delta: number) => void;
  setPosition: (x: number, y: number, z: number) => void;
  setRotation: (x: number, y: number, z: number) => void;
  setVisible: (visible: boolean) => void;
  getPosition: () => THREE.Vector3;
}

/**
 * Loads `public/assets/mining/helicopter.glb`, normalizes its scale and center,
 * sets up spinning rotor animation, and returns a controlled HelicopterAsset interface.
 */
export function loadHelicopterAsset(
  scene: THREE.Scene,
  onLoaded?: (asset: HelicopterAsset) => void,
  onError?: (err: Error) => void
): void {
  const loader = new GLTFLoader();

  loader.load(
    "/assets/mining/helicopter.glb",
    (gltf) => {
      const model = gltf.scene;

      // Ensure all meshes cast/receive shadows and have rich materials
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          // If material exists, enhance metallic and roughness for aviation luster
          if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m) => {
              if (m instanceof THREE.MeshStandardMaterial) {
                m.metalness = Math.max(m.metalness, 0.4);
                m.roughness = Math.min(m.roughness, 0.45);
                m.envMapIntensity = 1.2;
              }
            });
          }
        }
      });

      // Wrapper group for all position / rotation transforms
      const wrapper = new THREE.Group();
      wrapper.name = "HelicopterWrapper";

      // Compute bounding box and normalize
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // Target helicopter length in scene units (~16 units, clear and imposing aerial scale)
      const targetLength = 16.0;
      const scaleFactor = targetLength / Math.max(size.x, 1);
      model.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Center the model inside the wrapper
      model.position.set(-center.x * scaleFactor, -center.y * scaleFactor, -center.z * scaleFactor);
      wrapper.add(model);

      // Setup separate spinning rotor system
      // Meshes Object_2 and Object_3 represent the rotor blades & hub
      const rotorMesh2 = model.getObjectByName("Object_2");
      const rotorMesh3 = model.getObjectByName("Object_3");

      // Semi-transparent rotor blur disc for high-speed flight realism
      const rotorBlurGeom = new THREE.CylinderGeometry(7.6, 7.6, 0.06, 32);
      const rotorBlurMat = new THREE.MeshBasicMaterial({
        color: 0x22262B,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      });
      const rotorBlurDisc = new THREE.Mesh(rotorBlurGeom, rotorBlurMat);
      // Place blur disc at the rotor mast elevation (approx +2.4 above center)
      rotorBlurDisc.position.set(0, 2.35, 0);
      wrapper.add(rotorBlurDisc);

      wrapper.visible = false;
      scene.add(wrapper);

      let rotorAngle = 0;

      const update = (delta: number) => {
        // Spin main rotor blades rapidly
        rotorAngle += delta * 38.0;
        if (rotorMesh2) {
          rotorMesh2.rotation.z = rotorAngle;
        }
        if (rotorMesh3) {
          rotorMesh3.rotation.z = rotorAngle;
        }

        // Subtly modulate rotor blur disc opacity with aerodynamic speed
        rotorBlurDisc.rotation.y += delta * 45.0;
        rotorBlurMat.opacity = 0.28 + Math.sin(rotorAngle * 2) * 0.08;
      };

      const setPosition = (x: number, y: number, z: number) => {
        wrapper.position.set(x, y, z);
      };

      const setRotation = (x: number, y: number, z: number) => {
        wrapper.rotation.set(x, y, z);
      };

      const setVisible = (visible: boolean) => {
        wrapper.visible = visible;
      };

      const getPosition = () => {
        return wrapper.position;
      };

      const asset: HelicopterAsset = {
        group: wrapper,
        update,
        setPosition,
        setRotation,
        setVisible,
        getPosition,
      };

      onLoaded?.(asset);
    },
    undefined,
    (error) => {
      console.warn("Helicopter GLB asset load issue at /assets/mining/helicopter.glb:", error);
      onError?.(error as Error);
    }
  );
}
